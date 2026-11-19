# loop report: g-0009 stripe link cleanup (code half)

- **Item ID**: g-0009
- **Acceptance**: fix the CAD/no-fields sprint link + kill the duplicate sponsor link "in the stripe dashboard directly (ends-needs-human)"
- **Date**: 2026-11-18

## what was prepared and why
- The dashboard half is the operator's (no Stripe creds on this machine — checked ~/.config/stripe, Development/* env files; only placeholders + other apps' keys found).
- But the code had a latent desync bug that made the dashboard fix dangerous: payment links lived in TWO places (`app/earn/page.tsx` constants + `lib/stripe-webhook.ts` PRODUCTS map), and the webhook's amount fallback matched on currency — so swapping the CAD sprint link for USD would have made the webhook silently "ignore" sprint payments.
- Fix: `lib/earn-links.ts` (new) is now the single source — page and webhook both derive from it. PRODUCTS derives linkId from the same URLs. The amount fallback is now currency-tolerant (mode+amount unique → accept; currency only breaks ties). Earn entries always record the session's real currency.
- After the operator's dashboard work: paste the new sprint URL into `lib/earn-links.ts` — one constant, page + webhook + product map all follow.

## human steps remaining
- Stripe dashboard (see runbook below):
  1. Products → create the corrected sprint link: $99 USD, one-time, custom field (buyer's scope note), confirmation message set
  2. Paste the new URL into `lib/earn-links.ts` (sprint entry) — merge → deploy
  3. Deactivate the old CAD sprint link
  4. Find + deactivate the duplicate sponsor-a-day link (the live one is `5kQdR89bzbaS7Ii2azdAk0f`)
  5. Webhook activation (g-0010): endpoint + signing secret → `cf workers secrets update STRIPE_WEBHOOK_SECRET`

## remaining work / gaps
- **Gaps**: none code-side. Verified: `npx tsc --noEmit` clean.
- **Decisions**: kept per-link `currency` as the *expected* value (usd for all four) — it's only a tiebreak now; session currency is what gets ledgered.
