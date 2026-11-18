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
cf workers secrets update ADMIN_KEY            # any strong string — the console key
cf workers secrets update GITHUB_ADMIN_TOKEN   # PAT with contents:write on homezloco/sckrilla
cf workers secrets update LIVEGRAPH_API_KEY    # optional — powers the recent-runs card
```

a fine-grained PAT scoped to this one repo is the right token; the repo is
public, so the blast radius is only "can commit to a public repo" — but
scope it anyway.
