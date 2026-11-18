# loop report: g-0007 monetization mechanics

- **Item ID**: g-0007
- **Acceptance**: g-0007 monetization mechanics — write docs/monetization.md (the operator runbook: stripe link → handle → ledger line within a day; scan → niche email → report within 48h) and review the page for conversion gaps
- **Date**: 2026-11-18

## what was prepared and why
- Created `docs/monetization.md`: product table, per-product fulfillment runbooks with SLAs (sponsor <24h, scan <48h, steer-vote monthly, sprint 1 week), refund rule, and an honest conversion-gap review of /earn.
- Top gap found: no proof artifact — buyers can't see what a scan/sprint looks like. Recommended fix links each card to a real example post (zero cost, highest leverage).
- Ledger receipt not appended: this round produced no spend event worth a line beyond the same unmetered note as g-0004 — see remaining work.

## human steps remaining
- Review and merge PR for branch `growth/g-0007-earn-mechanics`.
- Optionally implement gap #1 (link /earn cards to example artifacts) — a small code change, flagged not done to keep this item docs-only per acceptance.

## remaining work / gaps
- **Gaps**: Stripe link handling assumes the operator sees payments via email; if volume grows, a webhook → ledger automation replaces the manual step.
- **Decisions**: Deliberately no urgency/email-capture gimmicks — noted as non-gaps with rationale.
