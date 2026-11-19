# affiliate programs — where they actually live

honest map for the ai-dev-tools niche. most of these companies do NOT run
public affiliate programs — that's g-0004's scan, with g-0005's outreach
kit (growth/kits/2026-11-18-custom-deal-outreach.md) turning the best fit
into a prepared, not-yet-sent pitch: the deals get asked for, not found
on a marketplace.

## programs that exist today

| company | program | where | pays |
| --- | --- | --- | --- |
| Spaceship | affiliate | Impact via spaceship.com/affiliate-program | 25% domains / 50% hosting, cash |
| Render | affiliate | PartnerStack | cash |
| JetBrains | ~~affiliate~~ discontinued — Content Creators Program applied for, declined 2026-11-18 | jetbrains.com/community/content-creators | free licenses, not cash — gated on 2,000 subscribers, which we don't have |
| Replit | referral | replit.com referrals | credits |
| Railway | referral | railway.com account → referrals | credits toward your bill |
| DigitalOcean | referral | do.co referral | $25 credit per activated referral |
| Hostinger / Namecheap / etc | affiliate | Impact, ShareASale, CJ | cash — adjacent niche (hosting), only if the directory expands there |

## networks worth a seat

- **PartnerStack** — the B2B SaaS affiliate network; most serious devtool
  programs that exist live here. free to join as a partner.
- **Impact.com** — marketplace with SaaS + hosting programs.
- **ShareASale / CJ / Awin** — broader consumer/SaaS inventory.

## the honest reality

Cursor, Copilot, Aider, Continue: no public affiliate program (Cursor's
credit-referral closed July 2026 over fraud). the money path for the
flagship tools is a custom deal — which is exactly what the outreach kit
queue item (g-0005) drafts and the human sends. that's the gate doing its
job: agent prepares, human ships.

JetBrains' Content Creators Program replied 2026-11-18: declined, minimum
2,000 subscribers to support a channel, reapply once past that. not a
rejection of the pitch, a size gate — worth a retry once there's an
audience to point at.

Windsurf is family — Cognition acquired it July 2025 and it's rebranding
to Devin Desktop. it sits in the "ours" bucket next to Devin and
LiveGraph: no affiliate link, just disclosure.

Replit is the one self-serve link today: replit.com/refer pays $20 in
credits (not cash) per converted referral — you need a Core account to
unlock earned credits.

## wiring a link (operator runbook)

1. get the tracked url from the program's dashboard (PartnerStack link,
   referral url, whatever they issue).
2. open https://sckrilla.com/admin, enter the admin key.
3. paste the url + program name on the tool's row → **go live**.
4. the worker commits `data/tools.json` to main — the directory shows the
   live link within ~60s, and the commit is the audit trail.
5. when commissions land, append an `earn` line to `data/ledger.jsonl` —
   the books only count what's real.

## worker secrets (set once)

```
cf workers secrets update ADMIN_KEY               # any strong string — the console key
cf workers secrets update GITHUB_ADMIN_TOKEN      # PAT with contents:write on homezloco/sckrilla
cf workers secrets update LIVEGRAPH_API_KEY       # optional — powers the recent-runs card
cf workers secrets update LIVEGRAPH_WEBHOOK_SECRET # optional — lets anna's graph self-log
                                                    # ledger receipts via /api/livegraph/webhook
                                                    # (its own secret, not ADMIN_KEY)
```

a fine-grained PAT scoped to this one repo is the right token; the repo is
public, so the blast radius is only "can commit to a public repo" — but
scope it anyway.

## verified program pages (2026-11-19 sweep)

the admin console now links straight to signup pages via `affiliate.applyUrl`.
what the sweep actually found — every claim below was checked against the
vendor's own page or a dated verification:

| tool | verdict | signup page |
|---|---|---|
| DigitalOcean | real — CJ network, 10% recurring for 12 months, cash | digitalocean.com/affiliates |
| Railway | real — 15% of invoices for 12 months, no approval needed (link lives in the workspace dashboard) | docs.railway.com/community/affiliate-program |
| bolt.new | real — launched 2026-07 via Cello, 15% of subscription capped at $50/referral | bolt.new/platform/referral |
| CodeRabbit | real — Dub-hosted, $30 per lead | partners.dub.co/coderabbit |
| v0 by Vercel | dead — Dub partner page 404s, confirmed 2026-11-19 (the 2026-10 404 sighting was right; the program's gone) | — |
| Spaceship | real — Impact, 25% default / up to 50% by category | spaceship.com/affiliate-program |
| Replit | real — referral, $20 credits both sides (credits, never cash) | replit.com/refer |
| JetBrains/Junie | real — content creators program, free licenses not cash, needs ~2k followers | jetbrains.com/community/content-creators |
| Warp | real but swag — referral pays themes/gift cards, no cash | docs.warp.dev/.../refer-a-friend |
| Cursor | dead — referral program officially closed 2026-07-23 (confirmed by Cursor staff on their forum). custom-deal path only. | — |
| Render | dead — referral program request explicitly closed Oct 2024; render.com/affiliate 404s. (the earlier "partnerstack — application in flight" note was wrong and has been corrected) | — |
| GitHub Copilot | none — B2B channel only, verified Aug 2026 | — |
| Resend | none — /affiliates and /partners both 404, verified Jul 2026 | — |
| Aider, Continue, Cline, Roo, OpenCode | none — open source | — |
| Claude Code, Codex CLI, Gemini CLI | none — big-co, no programs | — |
| Greptile, Graphite | none verified — only unverified third-party listings exist | — |
| CrewAI | none — the marketplace rev-share is for template authors, not referrers | — |
| LangGraph | none — LangChain Partner Network is enterprise consulting | — |
| Cloudflare | na — partner network is agency/reseller track, not a signup link | — |

the cash programs worth applying to first: DigitalOcean (CJ), Railway
(instant — link's already in the dashboard), CodeRabbit (Dub), bolt.new
(Cello). four applications, ~25 min total — v0's program is dead, dropped
from the list.
