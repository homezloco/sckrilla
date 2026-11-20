# Loop Report: g-0021 prepare the product hunt submission kit

**Item ID**: `g-0021`  
**Acceptance Criteria**: A `growth/ledger/` receipt and `growth/kits/` file containing title, tagline, description, maker commentary, and asset specs ending in NEEDS HUMAN account steps.

---

## What Was Prepared & Why

- Created Product Hunt launch kit at `growth/kits/2026-11-19-product-hunt.md` containing canonical product details (name, tagline, description, topic tags), maker commentary for post-launch engagement, and exact image asset specifications (240x240 thumbnail, 1270x760 gallery images).
- Created directory submission ledger receipt at `growth/ledger/2026-11-19-product-hunt.md` logging the field mapping and `prepared` status.
- Followed prepare-don't-send policy: external registration and posting are deferred to the human operator.

---

## Exact Steps Left for a Person (NEEDS HUMAN)

1. Log into Product Hunt with a personal maker account.
2. Open `https://www.producthunt.com/posts/new`.
3. Fill form using fields in `growth/kits/2026-11-19-product-hunt.md`.
4. Upload thumbnail (`240x240`) and gallery screenshots (`1270x760`).
5. Publish post (ideally at 00:01 PST) and immediately paste the maker commentary in the comment section.
6. Record Product Hunt post URL in `growth/ledger/2026-11-19-product-hunt.md`.

---

## What Remains

- **Real gaps**: Screenshots need to be rendered/captured at 1270x760 by human operator prior to upload. The 240x240 logo also doesn't exist yet — `growth/assets/logo.png` was only ever a placeholder path in `growth/assets/sckrilla-kit.md`, not a real file; `app/icon.svg` or `public/og-card.png` are the nearest starting points to crop from. Also flagged and fixed: the maker-commentary draft had a hardcoded "$0.18 spend / $0.00 revenue" line that's already stale (ledger total is $2.19 spend as of the g-0019 reconcile) — replaced with an instruction to pull the live figure from /ledger at post time, same rule the x-launch kit already follows.
- **Decisions for human**: Pick launch timing (immediate vs. scheduled for 00:01 PST on a Tuesday/Wednesday).
- **Diminishing returns**: Automation of Product Hunt submission form bypasses human authentication and anti-spam gates; manual posting guarantees proper maker status.
