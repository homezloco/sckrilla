# g-0010 — stripe → ledger webhook

the earn column used to depend on a human noticing a stripe email and
hand-editing `data/ledger.jsonl`. now the books write themselves.

## what changed

- `app/api/stripe/webhook/route.ts` (new) — `POST` only. verifies the
  `Stripe-Signature` header, parses the event, dedupes by event id in
  `ANALYTICS_KV` (`stripe:<event_id>`, 7-day TTL — stripe retries for ~3
  days), maps the payment to a product, and appends an `earn` line to the
  ledger. non-POST methods return 405 with `Allow: POST`.
- `lib/stripe-webhook.ts` (new) — all the stripe-shaped logic, kept out of
  the route so it stays unit-testable:
  - **signature verification on Web Crypto** — parse `t`/`v1` from the
    header, HMAC-SHA256 of `t.rawBody` keyed by `STRIPE_WEBHOOK_SECRET`,
    constant-time compare, 5-minute timestamp tolerance. the `stripe` npm
    package's verification is node-crypto based and doesn't run on
    workerd; the package is not added.
  - **product map** — the four buy.stripe.com url slugs from
    `app/earn/page.tsx` plus each product's mode/amount/currency.
  - **`entryForEvent`** — `checkout.session.completed` → earn for
    one-shots (sponsor/scan/sprint) and the first crew payment;
    `invoice.paid` → earn for crew renewals only
    (`billing_reason === "subscription_cycle"`, because the first
    subscription invoice is already ledgered by the session event —
    counting it again would double-book). unknown payment links and
    unhandled event types → ignored with a logged reason (200, no write,
    so stripe stops retrying).
- `lib/admin.ts` — extracted generic `readContents`/`writeContents` github
  contents-api helpers (utf-8 safe base64 — the old `btoa`/`atob` path
  would have mangled the ledger's em-dashes) and added exported
  `appendLedgerLine()`, which appends one JSONL line to
  `data/ledger.jsonl` on main with one retry on the sha race. tools.json
  writes now ride the same helpers — same api path, no fork.
- `lib/ledger.ts` — `LedgerEntry` gains optional `stripeSessionId` for
  dedupe/audit.
- `docs/monetization.md` — runbook updated: the webhook writes the `earn`
  line now; the human steps that remain are fulfillment, not bookkeeping.

## decisions worth knowing

- **`session.payment_link` is a `plink_` api id, not the url slug** — so
  the product match falls back to mode + amount + currency, which the
  payload always carries. amounts are unique across the four links today;
  if a price ever collides the event lands as "ignored" rather than
  guessing wrong.
- **cad sprint**: recorded as `earnUsd` 99 × 0.72 ≈ $71.28 with
  `CAD$99 ≈ $71.28 (cad, pinned rate — honest, not precise)` in the
  summary. the conversion rate is a constant, labeled as such.
- **no buyer PII in the ledger** — only the product, the amount, and the
  stripe session/invoice id. handles stay a fulfillment-time detail.
- **dedupe is best-effort**: KV unavailable → warn and process anyway (the
  `stripeSessionId` field is the audit fallback); ledger write fails →
  500 before the dedupe key is set, so stripe's retry still gets through.
- secrets: nothing is read at import time. `STRIPE_WEBHOOK_SECRET` unset →
  503 `webhook not configured`. `GITHUB_ADMIN_TOKEN` unset → 500 with the
  error surfaced, never a fake 200.

## verified

- `npx tsc --noEmit` clean (after `cf workers types` regenerated
  `.cloudflare/types`, same as any fresh checkout).
- `pnpm run build` passes; `/api/stripe/webhook` in the route table.
- 24-check smoke test of the module logic (valid/forged/stale/multi-v1
  signatures against real HMAC output, all four products, crew renewal vs
  signup, unpaid sessions, unknown links, non-payment events) — all pass.

## could not verify

- a live signed delivery from stripe — needs the secret bound and a real
  checkout. signature math was validated against node:crypto HMAC output,
  which is the same construction stripe documents.
- whether the deployed worker's kv dedupe behaves identically in prod
  (same binding the analytics rollup already uses, so low risk).

## human steps remaining

1. `cf workers secrets update STRIPE_WEBHOOK_SECRET` — the `whsec_…`
   signing secret stripe shows when the endpoint is created.
2. stripe dashboard → developers → webhooks → add endpoint
   `https://sckrilla.com/api/stripe/webhook`, events
   `checkout.session.completed` + `invoice.paid`.
3. `GITHUB_ADMIN_TOKEN` must already be bound (the admin console uses it);
   if it isn't, webhook writes 500 until it is.
4. send a test event from the dashboard — first `earn` line the books
   wrote themselves should land in `data/ledger.jsonl` within seconds.
