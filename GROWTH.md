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
- [x] g-0012 send the outreach kit — delivered 2 of 4: cursor (clean) and coderabbit (bounced the guessed partnerships@ address, resent to the verified support@coderabbit.ai from their own contact page). continue bounced too but isn't a retry — continue.dev now redirects to an acquisition notice, it's folded into cursor, no separate target left. github/copilot was their enterprise channel-partner program, not an affiliate track — no fit — branch growth/g-0012-send-outreach — #12
- [-] g-0013 ship the counterpost (ends-needs-human) (ends-needs-human) — dropped: Already done
- [x] g-0014 findings RSS/Atom feed — emit a real feed (findings + ledger receipts) so people and agents can subscribe; the monetization review flagged "no low-commitment follow step" — a feed is the honest version of email capture. link it in the footer/nav + add the <link rel="alternate"> tag — branch growth/g-0014-findings-feed
- [x] g-0015 /tools search + filter — 34 entries and growing; add a client-side filter box (name/category/status) so the directory is usable at scale — zero new deps, small diff — branch growth/g-0015-tools-search
- [x] g-0010 stripe → ledger webhook — right now every `earn` line depends on a human noticing a stripe notification and hand-editing data/ledger.jsonl (see docs/monetization.md's runbook); add a webhook endpoint (checkout.session.completed / invoice.paid on the four payment links) that appends the `earn` entry itself via the same GitHub Contents API path lib/admin.ts already uses — "receipts or it didn't happen" shouldn't depend on someone remembering — branch growth/g-0010-stripe-ledger-webhook — #10
- [x] g-0011 pSEO content-quality pass — the /tools/compare pages (51 of them across the current categories) are one fixed table template with swapped-in fields; thin, repetitive pages are a real risk for a pSEO play at this scale — add real per-pair or per-category differentiation (a verdict line, a "pick X if / pick Y if", category-specific comparison criteria) so the directory reads as researched rather than templated — branch growth/g-0011-pseo-content-quality — #11
- [!] g-0021 prepare the product hunt submission kit (directory) (ends-needs-human) (ends-needs-human) — DECIDED 2026-11-20: Yes — asked: DECIDED 2026-11-20: yes — asked: acceptance is a growth/ledger/ receipt and growth/kits/ file containing title, tagline, description, maker commentary, and asset specs ending in account-creation and posting steps a human still has to do (ends-needs-human) — #18 — NEEDS HUMAN: the item declares a human step remains — #18 — NEEDS HUMAN: the item declares a human step remains — #18 — NEEDS HUMAN: the item declares a human step remains
- [!] g-0022 prepare the betalist submission kit (directory) (ends-needs-human) — DECIDED 2026-11-20: YES — asked: acceptance is a growth/ledger/ receipt and growth/kits/ file with site description, founder quote, and asset references ending in account-creation and posting steps a human still has to do (ends-needs-human) — #19 — NEEDS HUMAN: the item declares a human step remains — #19 — NEEDS HUMAN: the item declares a human step remains
- [x] g-0023 prepare the launch screenshots asset kit (assets) — acceptance is updated high-resolution application screenshots stored under growth/assets/ for /tools, /earn, and /findings along with an asset catalog file
- [x] g-0024 verify the custom deal outreach status (backlinks) — acceptance is a growth/ledger/ receipt recording the listing_verify verdict for outreach responses and updated affiliate status — #20
- [ ] g-0020 prepare the saashub submission kit (directory) — acceptance is a growth/ledger/ receipt and growth/kits/ file containing category tags, product summary, and feature bullet points ending in account-creation and posting steps a human still has to do (ends-needs-human)
- [ ] g-0025 verify the product hunt listing is live (directory) — acceptance is a growth/ledger/ receipt recording the listing_verify verdict for Product Hunt and updating directory status
- [ ] g-0026 verify the betalist listing is live (directory) — acceptance is a growth/ledger/ receipt recording the listing_verify verdict for BetaList and updating directory status
- [ ] g-0027 prepare the alternativeTo submission kit (directory) — acceptance is a growth/ledger/ receipt and growth/kits/ file containing application description, category mappings, and alternative tools list ending in account-creation and posting steps a human still has to do (ends-needs-human)
- [ ] g-0028 prepare the startup base submission kit (directory) — acceptance is a growth/ledger/ receipt and growth/kits/ file containing startup pitch, maker bio, and link profiles ending in account-creation and posting steps a human still has to do (ends-needs-human)
- [ ] g-0029 verify the saashub listing is live (directory) — acceptance is a growth/ledger/ receipt recording the listing_verify verdict for SaaSHub once submitted


- [x] g-0016 /tools deals surface — with live links landing (railway first), the directory should sell them: sort live-deal tools to the top of their category + a small "deal" badge on the card; the compare/alternatives pages already show status but could link the outbound url too. keep the honest disclosure copy — branch growth/g-0016-deals-surface
- [x] g-0017 /stack page — "the stack this site runs on": cloudflare workers, github, stripe, livegraph, devin — each tool page linked, each live deal disclosed. classic affiliate surface ("uses" page) with the receipts twist: every entry cites the actual service powering the site — branch growth/g-0017-stack-page
- [x] g-0018 findings → tool-page crosslinks — every findings post mentions tools by name in prose but doesn't link them; wire slug-mentions to /tools/<slug> links so readers land on monetizable pages — small diff, compounds with every future post — branch growth/g-0018-findings-crosslinks


- [x] g-0019 ledger spend auto-reconcile — the books drifted $2 off the meter in <24h (manual spendUsd lines vs livegraph usageTotal). script: pull /graphs/<id>/runs via X-Api-Key, sum usageTotal.estimatedCostUsd, append a 'spend' reconciliation line when it diverges from ledger totals — wire as a GHA cron using a repo secret — branch growth/g-0019-spend-reconcile

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
- g-0012 send the outreach kit — #12
- g-0014 findings RSS/Atom feed
- g-0015 /tools search + filter
- g-0018 findings → tool-page crosslinks

## shipped outside the queue

landed straight on main — no g-00XX item, no branch, no PR. real and live,
just not run through the loop. noted here so the queue stays honest about
what's actually built, instead of a future round re-proposing it:

- `/earn` — all four payment tiers wired and live: sponsor-a-day ($10),
  niche scan ($29), join the crew ($20/mo), commission a sprint ($99,
  USD since g-0009).
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
