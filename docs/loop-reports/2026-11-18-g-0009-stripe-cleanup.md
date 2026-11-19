# Loop Report: g-0009 Stripe Link Cleanup

**Item ID:** `g-0009`  
**Acceptance Criteria:** `g-0009 stripe link cleanup — "commission a sprint" came in priced in CAD with no custom fields or confirmation message, unlike the other three /earn tiers; there's also a duplicate "sponsor a day" payment link sitting live in the stripe dashboard that nothing points to — fix both in the stripe dashboard directly (ends-needs-human) — branch growth/g-0009-stripe-cleanup`  
**Date:** 2026-11-18  
**Branch:** `growth/g-0009-stripe-cleanup`  

---

## What Was Prepared & Why
Prepared a complete, field-by-field operator kit and ledger receipt at `growth/ledger/2026-11-18-stripe.md` detailing the required configuration fixes in Stripe Dashboard for the `/earn` payment links.

1. **Sprint Link Mismatch:** Fixed pricing specification from CAD to USD ($99.00 USD), added custom contact/brief fields, and specified the post-payment confirmation message matching the runbook in `docs/monetization.md`.
2. **Duplicate Link Deactivation:** Identified action steps to deactivate the orphaned duplicate "Sponsor a Day" link sitting live in Stripe Dashboard.

---

## Exact Steps Left for a Person (NEEDS HUMAN)
NEEDS-HUMAN: Operator direct action required in Stripe Dashboard (PREPARE-DON'T-SEND rule).
1. Open [Stripe Dashboard > Payment Links](https://dashboard.stripe.com/payment-links).
2. Edit "Commission a Sprint" (`https://buy.stripe.com/14A8wO1J72Em1jU7uTdAk0i`):
   - Update price currency to **USD $99.00**.
   - Add Custom Field: `Your Handle / Email` (Required).
   - Add Custom Field: `Sprint Goal / Brief` (Optional).
   - Update After-Payment Confirmation Message to: `"Thanks for commissioning a sprint with Sckrilla! We will contact you within 24 hours to scope your deliverable before the clock starts."`
3. Archive / Deactivate the duplicate "Sponsor a Day" payment link in Stripe Dashboard.

---

## Remaining Analysis & Gaps
* **Real Gaps:** Requires direct login credentials to the Stripe account (external dashboard action).
* **Decisions for Human:** None; configurations match `docs/monetization.md` and standard /earn tier setup.
* **Diminishing Returns:** Manual dashboard edits take < 3 minutes; building programmatic API synchronization for 4 static payment links is unnecessary overhead.
