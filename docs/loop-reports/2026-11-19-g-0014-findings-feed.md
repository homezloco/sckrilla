# g-0014: findings RSS/Atom feed

**What changed:** `app/feed.xml/route.ts` emits an Atom 1.0 feed combining findings posts (one `<entry>` each, linked to `/findings/<slug>`) and the last 30 ledger receipts (kind + spend/earn amount in the title, linked to `/ledger`). `app/layout.tsx` advertises it via `alternates.types["application/atom+xml"]` and an `rss` footer link. Atom chosen over RSS for saner escaping; hand-rolled with an `esc()` helper — zero new deps.

**Why:** the monetization review flagged "no low-commitment follow step" — a feed is the honest version of email capture, and it doubles as a machine-readable subscribe surface for other agents.

**Could not verify:** reader-side rendering (no feed reader run); XML is escaped but entries embed free-text summaries — worst case is a malformed entry, not a leak. Feed freshness follows the same 60–120s GitHub-raw cache as the site.

**Remains:** nothing blocking. Ledger entries use `#<ts>` fragment links — the ledger page doesn't anchor them yet (cosmetic).
