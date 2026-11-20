# Marketing

The marketing doctrine for this repository. `## Constitution` is
fleet-wide — copied verbatim into every repo's MARKETING.md; do not edit
it in place, change it at the canonical source and re-copy. `## Project
tuning` is this repo's own, filled in against the live product surface.

## Constitution

This section is the fleet marketing constitution — identical in every
repository's MARKETING.md. If it needs to change, change it at the
source and re-copy it everywhere; never fork it in place.

### Verify before drafting

Every claim cites the product's live surface — the README, positioning
docs, the deployed site, `llms.txt`/`agents.txt`, or the code itself —
pulled in the same session that drafts it. Never infer capabilities
from the repo name, a sibling project, a prior draft, or conversation
memory. Exact identifiers — tool names, REST paths, query params, plan
names, prices — are checked character-for-character against the code,
never approximated from what a feature sounds like it does. The most
expensive marketing bug is a category error: a confident, well-written
package about the wrong product. A name can lie; the live surface
can't.

### Three buckets

Every claim is *verified shipped*, *roadmap/unverified* (marked as such
or cut), or *held*. A package whose premise depends on an unverified
capability parks rather than ships plausible copy. Status recaps and
summary tables are product-facts surfaces — they carry the same
verification discipline as the drafts themselves. When memory and the
record disagree, the record wins.

### Never stage a demo

No staged output passed off as live, no templated run presented as a
real one, no speed-up without a visible timer, no screenshot of
something that wasn't actually run, no "live" claim for anything that
wasn't executed. If the flagship claim hasn't been run for real, the
launch waits. Public copy is a promise surface.

### One story spent once

The strongest asset — the flagship clip, the killer stat, the signature
case study — is spent once per launch beat, not dribbled across every
channel. Beats are separated deliberately in time so the story lands
with force where it's spent. Directory listings and profile pages are
cheap backlinks, not a launch.

### Honesty over polish

For a technical audience, gaps said aloud sell better than polish. When
asked about a missing capability, say so — the admission is credibility.
Say what the product is *not* as clearly as what it is. Check a
community's self-promotion rules before posting in it.

### The asset ladder — a sequence, not a pile

Assets form a ladder; each rung has one job and one asset class. An
asset that tries to carry three claims carries none.

| Rung | Job | Typical assets |
|---|---|---|
| Hook | Stop the scroll: one mechanism in seconds | a short clip, one striking image |
| Try | Turn attention into hands-on use | a no-signup demo, a free tier, a live tool |
| Believe | Prove it shipped real things | case studies, receipts, real usage |
| Trust | Prove it's safe to rely on | the security, permissions, and failure-mode story — in text |
| Pay | Close | a checkout that has actually charged a real buyer |

The hook is never the catalog: breadth is proven by the Try and Believe
rungs, not by stuffing every capability into one asset. Map each asset
to the rung it serves and the channel that rung belongs in.

### The funnel is measured, never narrated

landing → signup → activation → paid — watched through real analytics
only. Instrument what exists, report what the instrumentation captured,
and never invent numbers, per-channel splits, or properties the tracker
doesn't record. A funnel leak is a decision item, not a copy problem.

### Proof gates before launch posts

Proof first, blast after: a launch post waits on its gates being real —
the demo works for a fresh visitor, the claim was actually run, the
checkout actually charged. Channels are ordered by deadline pressure
and leverage, not glamour, and each gets the asset that fits its rung.

## Project tuning

Verified 2026-11-20 against the repo (README.md, GROWTH.md,
`data/ledger.jsonl`, `content/findings/`) and the live site.

- **Positioning** — Sckrilla is an autonomous money agent that earns in
  public: it hunts niches, drafts sites, and chases affiliate deals on
  LiveGraph — with open books. Every action appends to a public ledger
  (`data/ledger.jsonl`), every run embeds as a live LiveGraph canvas,
  and every outbound email, affiliate signup, or dollar spent parks at
  a human approval gate ($10/day token cap). It is NOT a revenue
  promise, NOT a trading bot, and NOT a finished product — it's a
  running experiment whose receipts are the content, and it doubles as
  LiveGraph's own proof-by-dogfood. The counter to "unsupervised agent
  makes money" threads: real token spend vs. real earnings, gate
  verdicts included.
- **Audience** — the technical crowd (HN-adjacent) that's skeptical of
  "AI agent makes money" claims and wants receipts, not promises.
- **Channel priority** —
  1. The site itself is the artifact — findings posts + the public
     ledger are the content; keep them honest and current.
  2. Affiliate/deal outreach kits (prepared, never auto-sent — a human
     ships them, per the repo's own contract).
  3. Niche pSEO content from the findings pipeline.
  4. Directory submit kits queued in GROWTH.md (BetaList g-0022,
     SaaSHub g-0020, listing verification g-0024).
- **Current asset/proof-gate status** — live at https://sckrilla.com
  (verified responding 2026-11-20). Shipped: the public ledger,
  findings posts with run embeds, the approval-gate mechanics. Hard
  rule from the repo's own contract: never claim revenue the ledger
  can't show — earnings copy is verified only against
  `data/ledger.jsonl`. Not verified: any affiliate deal closed or
  revenue earned unless the ledger records it.
