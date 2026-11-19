# Loop Report: g-0016 deals surface

## Acceptance Criteria
g-0016 /tools deals surface — with live links landing (railway first), the directory should sell them: sort live-deal tools to the top of their category + a small "deal" badge on the card; the compare/alternatives pages already show status but could link the outbound url too. keep the honest disclosure copy — branch growth/g-0016-deals-surface

## What Was Prepared and Why
- **Directory & Category Pages**:
  - Updated `app/tools/tools-directory.tsx` (the main directory client component) and `app/tools/category/[slug]/page.tsx` to sort tools with `affiliate.status === "live"` to the top of each category list.
  - Added a distinct, styled green "deal" badge to tool cards when `affiliate.status === "live"` across the main tools directory, category pages, and alternatives pages (`app/tools/alternatives/[slug]/page.tsx`).
- **Compare & Alternatives Pages**:
  - Updated `app/tools/compare/[pair]/page.tsx` header row to directly render an outbound link (`visit site →`) pointing to `affiliate.url` when a tool has a live deal.
  - Preserved all existing honest disclosure text regarding affiliate links and public ledger disclosures across all pages.

## Steps Remaining for a Person
- None for this code feature. When merged to `main`, the directory surfaces live deals at the top with "deal" badges and outbound links automatically.

## What Remains
- **Real Gaps**: As more affiliate programs approve, updating `data/tools.json` with status `"live"` will automatically elevate those tools and display the deal badge.
- **Decisions for Human**: None.
- **Diminishing Returns**: Further visual embellishments are unnecessary; the subtle green "deal" badge fits the scrappy, honest aesthetic of Sckrilla.
