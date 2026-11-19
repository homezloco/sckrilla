# GROWTH.md — the sckrilla work queue

the loop works this file top to bottom, one item per round, branch per item.
rules it lives under: prepare-don't-send (every external action is a kit a
human ships), public receipts (ledger + findings get updated same commit),
$10/day ceiling, scrappy honest voice. never claim revenue the ledger
can't show. never commit secrets — this repo is public.

## open

- [x] g-0001 pick the first niche — a findings post at content/findings/ naming one niche worth a pSEO run, why it wins, and the search terms to target — branch growth/g-0001-first-niche — #1
- [x] g-0002 first real ledger entry — update data/ledger.jsonl with the g-0001 round's actual spend from the run, scrappy commentary, zero revenue claimed — branch growth/g-0002-ledger-entry — #2
- [x] g-0003 niche site outline — a findings post with the page map + title tags for the g-0001 niche directory, honest about what's unproven — branch growth/g-0003-niche-outline — #3
- [x] g-0004 affiliate/deal scan — research post naming affiliate programs that fit the niche, commission terms, and signup requirements — branch growth/g-0004-affiliate-scan — #4
- [x] g-0005 outreach kit — a prepared (NOT sent) outreach email + target list for the best-fit affiliate program from g-0004, filed under growth/kits/ — a human sends it (ends-needs-human) — branch growth/g-0005-outreach-kit — #5
- [x] g-0006 mogul counterpost draft — findings post contrasting our public ledger + gates with black-box "my agent earns" claims, linked receipts — branch growth/g-0006-counterpost — #6
- [x] g-0007 monetization mechanics — the /earn page exists; write docs/monetization.md (the operator runbook: stripe link → handle → ledger line within a day; scan → niche email → report within 48h) and review the page for conversion gaps — branch growth/g-0007-earn-mechanics — #7
- [x] g-0008 directory expansion — the /tools surface exists (data/tools.json, remote-fetched); grow it toward the g-0003 outline: append entries for tools the matrix targets (vs-page entries via kind "vs" welcome) — no fake affiliate urls, parked or na only — branch growth/g-0008-directory-fill — #8
- [x] g-0009 stripe link cleanup — fixed in the stripe dashboard: "commission a sprint" now has a $99 USD price (new payment link, custom fields for handle + sprint brief, confirmation message matching the other tiers), old CAD link deactivated and its price archived; the duplicate "sponsor a day" link (unwired, no code referenced it) deactivated too — branch growth/g-0009-stripe-cleanup — #9
- [ ] g-0012 send the outreach kit — kit is prepared at growth/kits/2026-11-18-custom-deal-outreach.md; work the checklist: re-verify each target's program status (they decay), personalize per target, send from a real-domain address, log each send + reply as ledger lines — a human does the actual sending (ends-needs-human) — branch growth/g-0012-send-outreach
- [ ] g-0013 ship the counterpost — the essay is live at /findings/2026-11-18-mogul-counterpost and the X package is prepped at growth/kits/2026-11-18-x-launch.md; remaining: refresh the quoted spend figure off /ledger, post from the launch account, log the post as a ledger publish line — a human posts it (ends-needs-human) — branch growth/g-0013-ship-counterpost
- [ ] g-0014 findings RSS/Atom feed — emit a real feed (findings + ledger receipts) so people and agents can subscribe; the monetization review flagged "no low-commitment follow step" — a feed is the honest version of email capture. link it in the footer/nav + add the <link rel="alternate"> tag — branch growth/g-0014-findings-feed
- [ ] g-0015 /tools search + filter — 34 entries and growing; add a client-side filter box (name/category/status) so the directory is usable at scale — zero new deps, small diff — branch growth/g-0015-tools-search
- [x] g-0010 stripe → ledger webhook — right now every `earn` line depends on a human noticing a stripe notification and hand-editing data/ledger.jsonl (see docs/monetization.md's runbook); add a webhook endpoint (checkout.session.completed / invoice.paid on the four payment links) that appends the `earn` entry itself via the same GitHub Contents API path lib/admin.ts already uses — "receipts or it didn't happen" shouldn't depend on someone remembering — branch growth/g-0010-stripe-ledger-webhook — #10
- [x] g-0011 pSEO content-quality pass — the /tools/compare pages (51 of them across the current categories) are one fixed table template with swapped-in fields; thin, repetitive pages are a real risk for a pSEO play at this scale — add real per-pair or per-category differentiation (a verdict line, a "pick X if / pick Y if", category-specific comparison criteria) so the directory reads as researched rather than templated — branch growth/g-0011-pseo-content-quality — #11

## done

- g-0001 pick the first niche — #1
- g-0002 first real ledger entry — #2
- g-0003 niche site outline — #3
- g-0008 directory expansion — #8
- g-0004 affiliate/deal scan — #4
- g-0005 outreach kit — #5
- g-0006 mogul counterpost draft — #6
- g-0007 monetization mechanics — #7
- g-0010 stripe→ledger webhook — #10
- g-0011 pSEO content-quality pass — #11
- g-0009 stripe link cleanup — #9

## shipped outside the queue

landed straight on main — no g-00XX item, no branch, no PR. real and live,
just not run through the loop. noted here so the queue stays honest about
what's actually built, instead of a future round re-proposing it:

- `/earn` — all four payment tiers wired and live: sponsor-a-day ($10),
  niche scan ($29), join the crew ($20/mo), commission a sprint ($99).
  the sprint link's rough edges are g-0009.
- `/admin` — key-gated operator console (ledger view, tool-directory
  editor, analytics, affiliate link flipping), writing straight to
  `data/tools.json` via the GitHub Contents API.
- `/tools` — the pSEO directory surface itself, plus the first 13 entries
  (1 live affiliate link, 5 parked, 7 marked n/a — no fake urls).
- first-party analytics: kv rollup, client beacon, bot filtering, source
  attribution.

the ledger had gone quiet for all of it until this catch-up round — see
`data/ledger.jsonl` for the backfilled entries. going forward, if any of
this needs real work, give it a g-00XX item instead of quietly patching it
off-queue again.
