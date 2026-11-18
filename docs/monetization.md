# monetization runbook — how a dollar becomes a ledger line

the operator's manual for /earn. every product on that page is a stripe
payment link → a human fulfillment step → a public ledger entry. nothing
fulfills itself; that's the deal we sell.

## the four products

| card | price | stripe link (in `app/earn/page.tsx`) | what the buyer gets |
|---|---|---|---|
| sponsor a day | $10 one-shot | `SPONSOR_DAY_URL` | one full day of the token budget on their dime; their name + the day's output in the ledger |
| join the crew | $20/mo | `CREW_URL` | handle on the crew roll permanently + one steer vote per month (a queue item a human approves) |
| niche scan | $29/scan | `NICHE_SCAN_URL` | a findings-grade research drop on the niche they name — query matrix, competition read, honest verdict |
| sprint | $99/sprint | `SPRINT_URL` | a bigger artifact — directory outline, competitive deep-dive, or outreach kit pointed at their product. human-scoped first |

## fulfillment runbook

### sponsor a day — within 24h of the stripe ping

1. stripe emails/notifies → check the payment
2. append the ledger earn line: kind `earn`, `earnUsd: 10`, `note: "@handle sponsored a day"`
3. next scheduled loop round runs on their dime — the day's findings post
   names the sponsor
4. the crew roll on /earn picks them up automatically (it reads the ledger —
   no list to maintain)

### niche scan — within 48h

1. confirm the niche the buyer named (stripe collect-field or reply email)
2. run the scan round: query matrix, SERP/competition read, verdict
3. publish as a findings post — or deliver privately if they asked
4. ledger: `earn` $29 + a `research` line noting the scan's own token spend
   (the honest cost-of-goods)
5. refund if 48h blows — the rules on the page promise it; the promise is
   the product

### crew steer vote — monthly per subscriber

1. subscriber proposes a queue item in whatever channel they used
2. human gate reviews: fits the niche, legal, ~one round of work
3. approved → append to GROWTH.md with `(community-steer)` in the title
4. declined → reply with why; the vote rolls, doesn't burn

### sprint — within a week

1. human scopes with the buyer BEFORE the clock starts (what artifact, what
   done means)
2. run it as 1-3 queue rounds, deliver the artifact + a private summary
3. ledger: `earn` $99 + spend lines for the rounds
4. never book a second sprint while one is open — one deep queue, no
   fake throughput

## conversion gaps in /earn (honest review)

what's working: the ladder is honest, prices are sane, the "rules" section
pre-answers the scam question, payment links are live not parked.

the gaps, ranked:

1. **no proof artifact.** a buyer can't see what a scan or sprint looks
   like before paying. fix: link each card to a real example — the scan
   card → a findings post, the sprint card → the g-0003 outline. highest
   leverage, zero cost.
2. **empty crew roll reads dead.** `sponsors.length > 0` hides the section
   entirely pre-first-sponsor — fine, but the card could say "crew roll
   starts with you" so the empty state is a pitch not a void.
3. **no urgency — deliberately.** fake countdowns are mogul moves. the
   honest version: sponsor-a-day has natural scarcity ("one day at a
   time — i can't run two budgets"). could surface queue depth.
4. **no email capture.** someone not ready to pay has no lower-commitment
   step. fix: an rss/atom feed or a "get the findings" list — though a
   list is another system to run honestly.
5. **steer-vote mechanics are vague.** "one steer vote a month" — voted
   how? channel? the runbook above defines it; the page doesn't. a buyer
   shouldn't have to guess what they're buying.

non-gaps on purpose: no popups, no fake testimonials, no "as seen on"
of places we weren't seen on.
