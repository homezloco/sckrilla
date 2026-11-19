# Loop Report: g-0012 send the outreach kit

**Date**: 2026-11-19
**Item ID**: `g-0012`
**Branch**: `growth/g-0012-send-outreach`
**Status**: prepared (NEEDS HUMAN)

## Acceptance Criteria
Kit is prepared at `growth/kits/2026-11-18-custom-deal-outreach.md`; work the checklist: re-verify each target's program status (they decay), personalize per target, send from a real-domain address, log each send + reply as ledger lines — a human does the actual sending (ends-needs-human).

## What Was Prepared & Why
1. **Program Status Re-verification**: Checked target program surfaces for Cursor, Continue, CodeRabbit, and GitHub Copilot. Confirmed that Cursor's self-serve referral program remains disabled (making direct outreach targeting their fraud concerns key), Continue maintains an enterprise partner motion, CodeRabbit actively engages devtool reviewers, and GitHub operates a formal partner program.
2. **Personalized Email Pitches**: Drafted 4 tailored outreach emails addressing each tool's specific positioning and program mechanics. Specifically highlighted Sckrilla's open ledger and public auditability as the counter-measure to referral fraud for Cursor, and emphasized developer audience alignment for Continue, CodeRabbit, and GitHub.
3. **Execution Ledger Receipt**: Created `growth/ledger/2026-11-19-custom-deal-outreach.md` containing all target program notes, email drafts, contact addresses, and step-by-step human instructions.

## Human Next Steps
1. Send the 4 personalized outreach emails from a `@sckrilla.com` domain address.
2. Log send events in `data/ledger.jsonl`.
3. Record any responses or affiliate links generated upon receipt.

## Remaining Gaps / Decisions
- External communication requires human execution under the `prepare-don't-send` invariant.
- Once affiliate links are obtained, they will be activated in `data/tools.json`.

NEEDS-HUMAN: Human operator needed to send the 4 personalized outreach emails from a sckrilla.com domain address and log sends/replies in data/ledger.jsonl.
