/**
 * Stripe → ledger plumbing for app/api/stripe/webhook/route.ts.
 *
 * Two honest constraints shaped this file:
 *  - the stripe npm package's signature check is node-crypto based and
 *    won't run on workerd, so verification lives here on Web Crypto;
 *  - `session.payment_link` in a webhook payload is the plink_ api id,
 *    not the buy.stripe.com url slug — so the product match falls back
 *    to what the payload always carries: mode + amount + currency.
 *
 * Nothing reads env at import time; every secret is optional.
 */

import { EARN_LINKS } from "./earn-links";
import type { LedgerEntry } from "./ledger";

const enc = new TextEncoder();

/* ------------------------------------------------------------------ */
/* signature verification (Web Crypto, no stripe package)              */
/* ------------------------------------------------------------------ */

const TOLERANCE_S = 300; // stripe's own replay window: 5 minutes

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** constant-time compare — a mismatch must cost the same as a match. */
function timingSafeEqual(a: string, b: string): boolean {
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

/**
 * Verify a `Stripe-Signature` header (`t=<ts>,v1=<sig>[,v1=<sig>]`)
 * against the raw body. Returns { ok:false } with a 400-safe reason.
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowS = Math.floor(Date.now() / 1000),
): Promise<{ ok: boolean; error?: string }> {
  if (!header) return { ok: false, error: "missing stripe-signature" };
  let ts = 0;
  const sigs: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.split("=", 2);
    if (k === "t") ts = Number(v);
    if (k === "v1" && v) sigs.push(v);
  }
  if (!ts || sigs.length === 0)
    return { ok: false, error: "malformed stripe-signature" };
  if (Math.abs(nowS - ts) > TOLERANCE_S)
    return { ok: false, error: "stale signature" };

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = hex(
    await crypto.subtle.sign("HMAC", key, enc.encode(`${ts}.${rawBody}`)),
  );
  for (const s of sigs) {
    if (timingSafeEqual(s.toLowerCase(), expected)) return { ok: true };
  }
  return { ok: false, error: "signature mismatch" };
}

/* ------------------------------------------------------------------ */
/* product mapping — the four links on /earn                           */
/* ------------------------------------------------------------------ */

export type ProductSlug = "sponsor-a-day" | "niche-scan" | "crew" | "sprint";

export interface Product {
  slug: ProductSlug;
  /** path segment of the buy.stripe.com url in lib/earn-links.ts */
  linkId: string;
  mode: "payment" | "subscription";
  amountCents: number;
  currency: string;
}

/** derived from lib/earn-links.ts — one source, so a link swap can't desync the matcher. */
export const PRODUCTS: Product[] = EARN_LINKS.map((l) => ({
  slug: l.slug,
  linkId: l.url.split("/").pop() ?? "",
  mode: l.mode,
  amountCents: l.amountCents,
  currency: l.currency,
}));

interface StripeSession {
  id?: string;
  mode?: string;
  payment_link?: string | null;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
}

interface StripeInvoice {
  id?: string;
  billing_reason?: string;
  subscription?: string | null;
  amount_paid?: number | null;
  currency?: string | null;
}

export interface StripeEvent {
  id?: string;
  type?: string;
  data?: { object?: Record<string, unknown> };
}

/**
 * Which /earn product a checkout session paid for. Tries the payment
 * link first (slug or plink_ id match — kept for whichever stripe puts
 * in the field), then falls back to mode+amount+currency, which is what
 * the payload reliably carries. Amounts are unique today; if a price
 * ever collides this returns null and the event lands as "ignored".
 */
export function productForSession(s: StripeSession): Product | null {
  const link = typeof s.payment_link === "string" ? s.payment_link : "";
  const byLink = PRODUCTS.find((p) => link !== "" && link.includes(p.linkId));
  if (byLink) return byLink;
  // mode+amount first, currency only as tiebreak — g-0009's sprint link
  // swap changes the billed currency, and the matcher must not go blind
  // the day it happens. the earn entry records the session's real
  // currency regardless.
  const currency = (s.currency ?? "").toLowerCase();
  const byAmount = PRODUCTS.filter(
    (p) => p.mode === s.mode && p.amountCents === s.amount_total,
  );
  if (byAmount.length === 1) return byAmount[0];
  const byCurrency = byAmount.filter((p) => p.currency === currency);
  return byCurrency.length === 1 ? byCurrency[0] : null;
}

/* ------------------------------------------------------------------ */
/* event → ledger entry                                                */
/* ------------------------------------------------------------------ */

/**
 * pinned estimate for the CAD sprint link — the summary says it's
 * approximate in the same breath. honesty over precision.
 */
const CAD_TO_USD = 0.72;

function toUsd(amountCents: number, currency: string): number {
  const amt = amountCents / 100;
  if (currency === "cad") return Math.round(amt * CAD_TO_USD * 100) / 100;
  return amt;
}

function describeMoney(amountCents: number, currency: string): string {
  const amt = amountCents / 100;
  if (currency === "usd") return `$${amt}`;
  const face = `${currency.toUpperCase()}$${amt % 1 === 0 ? amt : amt.toFixed(2)}`;
  return `${face} ≈ $${toUsd(amountCents, currency)} (${currency}, pinned rate — honest, not precise)`;
}

function earnEntry(
  product: Product,
  opts: { amountCents: number; currency: string; stripeSessionId: string; renewal?: boolean },
): LedgerEntry {
  const currency = opts.currency.toLowerCase();
  const money = describeMoney(opts.amountCents, currency);
  const summaries: Record<ProductSlug, string> = {
    "sponsor-a-day": `sponsor-a-day landed: ${money} via stripe webhook — an earn line no human typed`,
    "niche-scan": `niche scan commissioned: ${money} via stripe webhook — the 48h clock is running`,
    crew: opts.renewal
      ? `crew renewal: ${money} via stripe webhook — the recurring column works`
      : `crew member joined: ${money} via stripe webhook — steer vote unlocked`,
    sprint: `sprint booked: ${money} via stripe webhook — human scopes it before the clock starts`,
  };
  return {
    ts: new Date().toISOString(),
    kind: "earn",
    node: "system",
    summary: summaries[product.slug],
    earnUsd: toUsd(opts.amountCents, currency),
    stripeSessionId: opts.stripeSessionId,
    note: `stripe: ${product.slug}`,
  };
}

export type WebhookOutcome =
  | { kind: "earn"; entry: LedgerEntry }
  | { kind: "ignored"; reason: string };

/**
 * checkout.session.completed → one-shots (sponsor/scan/sprint) and the
 * first crew payment. invoice.paid → crew renewals only — the first
 * subscription invoice (billing_reason subscription_create) is already
 * ledgered by the session event, so counting it here would double-book.
 * Anything unrecognized returns "ignored": 200 for stripe, nothing for
 * the books.
 */
export function entryForEvent(event: StripeEvent): WebhookOutcome {
  const obj = event.data?.object ?? {};

  if (event.type === "checkout.session.completed") {
    const s = obj as unknown as StripeSession;
    const amount = s.amount_total ?? 0;
    if (s.payment_status === "unpaid" || amount <= 0)
      return {
        kind: "ignored",
        reason: `session not a payment (${s.payment_status ?? "?"}, total ${amount})`,
      };
    const product = productForSession(s);
    if (!product)
      return {
        kind: "ignored",
        reason: `unknown payment_link ${String(s.payment_link)}`,
      };
    return {
      kind: "earn",
      entry: earnEntry(product, {
        amountCents: amount,
        currency: s.currency ?? product.currency,
        stripeSessionId: s.id ?? event.id ?? "unknown",
      }),
    };
  }

  if (event.type === "invoice.paid") {
    const inv = obj as unknown as StripeInvoice;
    if (!inv.subscription || inv.billing_reason !== "subscription_cycle")
      return {
        kind: "ignored",
        reason: `invoice ${inv.billing_reason ?? "?"} — only crew renewals ledger here`,
      };
    const amount = inv.amount_paid ?? 0;
    if (amount <= 0) return { kind: "ignored", reason: "zero-amount invoice" };
    const crew = PRODUCTS.find((p) => p.slug === "crew");
    if (!crew) return { kind: "ignored", reason: "crew product missing" };
    return {
      kind: "earn",
      entry: earnEntry(crew, {
        amountCents: amount,
        currency: inv.currency ?? "usd",
        stripeSessionId: inv.id ?? event.id ?? "unknown",
        renewal: true,
      }),
    };
  }

  return { kind: "ignored", reason: `unhandled event ${event.type ?? "?"}` };
}
