import { env } from "cloudflare:workers";
import { appendLedgerLine } from "../../../../lib/admin";
import {
  entryForEvent,
  verifyStripeSignature,
  type StripeEvent,
} from "../../../../lib/stripe-webhook";

export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook — stripe signs, the books write themselves.
 *
 * operator steps (one-time, in the runbook):
 *   cf workers secrets update STRIPE_WEBHOOK_SECRET   # whsec_… from stripe
 *   stripe dashboard → webhook endpoint → sckrilla.com/api/stripe/webhook
 *     events: checkout.session.completed, invoice.paid
 *
 * dedupe rides the same ANALYTICS_KV binding the hit counter uses; if KV
 * or a secret is missing the route degrades loudly (503 / logged 200),
 * never crashes, never fakes a receipt.
 */

interface StripeKvEnv {
  ANALYTICS_KV?: {
    get(key: string): Promise<string | null>;
    put(
      key: string,
      value: string,
      opts?: { expirationTtl?: number },
    ): Promise<void>;
  };
}

/** stripe retries a failed delivery for ~3 days; the dedupe key outlives that. */
const DEDUPE_TTL_S = 60 * 60 * 24 * 7;

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    return Response.json({ error: "webhook not configured" }, { status: 503 });

  const raw = await request.text();
  const sig = request.headers.get("stripe-signature");
  const check = await verifyStripeSignature(raw, sig, secret);
  if (!check.ok)
    return Response.json({ error: check.error }, { status: 400 });

  let event: StripeEvent;
  try {
    event = JSON.parse(raw) as StripeEvent;
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }

  // dedupe — stripe retries, the ledger must not. KV down → log and
  // process anyway; the stripeSessionId field is the audit fallback.
  const kv = (env as unknown as StripeKvEnv).ANALYTICS_KV;
  const dedupeKey = `stripe:${event.id ?? "unknown"}`;
  if (kv) {
    try {
      if (await kv.get(dedupeKey))
        return Response.json({ ok: true, deduped: true });
    } catch {
      console.warn("stripe webhook: kv dedupe read failed, processing anyway");
    }
  } else {
    console.warn("stripe webhook: ANALYTICS_KV not bound, no dedupe");
  }

  const outcome = entryForEvent(event);
  if (outcome.kind === "ignored") {
    console.log(`stripe webhook: ignored — ${outcome.reason}`);
    await markProcessed(kv, dedupeKey);
    return Response.json({ ok: true, ignored: outcome.reason });
  }

  const wrote = await appendLedgerLine(
    outcome.entry,
    `ledger: ${outcome.entry.summary?.split("—")[0].trim() ?? "earn"} via stripe webhook`,
  );
  if (!wrote.ok) {
    // 500 is what pulls stripe's retry — dedupe stays unset on purpose
    console.error(`stripe webhook: ledger write failed — ${wrote.error}`);
    return Response.json({ error: wrote.error }, { status: 500 });
  }

  await markProcessed(kv, dedupeKey);
  console.log(`stripe webhook: ledgered — ${outcome.entry.summary}`);
  return Response.json({ ok: true, ledgered: true });
}

async function markProcessed(
  kv: StripeKvEnv["ANALYTICS_KV"],
  key: string,
): Promise<void> {
  if (!kv) return;
  try {
    await kv.put(key, "1", { expirationTtl: DEDUPE_TTL_S });
  } catch {
    console.warn("stripe webhook: kv dedupe write failed");
  }
}

const methodNotAllowed = (): Response =>
  Response.json(
    { error: "post only" },
    { status: 405, headers: { Allow: "POST" } },
  );

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
