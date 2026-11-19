# anna's runbook — 2026-11-19

everything the human gate owes the machine, in one file. work top to bottom;
nothing here needs code access. log each completed action in
`data/ledger.jsonl` (format at the bottom) — receipts or it didn't happen.

access you'll need: an email account you can send from (real domain ideally —
a `@sckrilla.com` address if one exists, otherwise your normal address),
an X account, and the sckrilla admin key for `/admin`.

---

## A. send the 4 outreach emails (~15 min)

full drafts live in `growth/ledger/2026-11-19-custom-deal-outreach.md` —
copy them verbatim or tweak the greeting. in order of expected value:

1. **Cursor** → `hi@cursor.com`
   subject: `a publisher your dead referral program was built for`
   the strongest pitch — it answers the exact fraud problem that killed
   their referral program. full body is in the ledger file, section 1.
2. **CodeRabbit** → `partnerships@coderabbit.ai`
   subject: `custom referral / review placement on sckrilla.com`
   note: they also run a self-serve program at partners.dub.co/coderabbit —
   applying there (task B) may make this email unnecessary; your call.
3. **Continue** → `partnerships@continue.dev`
   subject: `sckrilla.com directory listing & partner integration`
4. **GitHub** → partner program portal at partner.github.com
   longest shot, lowest cost — one form.

after each send, append a ledger line (see bottom) so the books show the
outreach happened.

## B. apply to the 5 cash programs (~30 min)

each has an `apply →` link in `/admin` next to the tool's row. expected
payout terms are already verified and noted there:

- **Railway** — instant, no approval. sign in → workspace → refer → copy
  link → paste it in `/admin` → go live. 15% of invoices for 12 months.
  easiest win on the board — do this first.
- **CodeRabbit** — partners.dub.co/coderabbit. $30 per lead, Dub-hosted.
- **bolt.new** — bolt.new/platform/referral. Cello, up to $50/referral.
- **DigitalOcean** — digitalocean.com/affiliates. CJ network, 10%
  recurring for 12 months — the best terms on the board.
- **v0** — partners.dub.co/v0. $5/lead + 30% for 6 months. (one tracker
  saw this page 404 in october — if it's dead for you too, mark the tool
  `na` in `/admin` and move on.)
- **Spaceship** — spaceship.com/affiliate-program. Impact, 25–50% — you
  already applied; this is just waiting on their email.

when an approval/link lands: `/admin` → paste the tracked url → `go live`.
it commits to `data/tools.json` on main and the directory updates within
a minute — the git log is the audit trail.

## C. post the counterpost (~10 min)

package: `growth/kits/2026-11-18-x-launch.md`. the essay is live at
`sckrilla.com/findings/2026-11-18-mogul-counterpost`.

numbers as of now: **$0.18 spent, $0.00 earned** — refresh off `/ledger`
right before posting; the post only works because the figure is checkable.

two things changed since the kit was written — fold them in if you want:

- the feed exists: a closing line like `or subscribe to the receipts —
  sckrilla.com/feed.xml` gives followers the low-commitment option.
- devin credit is now public on /how — if anyone asks "which agent",
  the honest answer is two: a livegraph graph on a schedule, plus devin
  (swe-2 high) doing direct rounds on the operator's pro account. that
  answer is in the post's favor, not against it.

post → then log a `publish` ledger line (see bottom). if you thread it,
the 4-post variant in the kit is ready as-is.

## D. stripe webhook (~5 min — needs shane)

this one can't be delegated: it needs the cloudflare login.

1. stripe dashboard → developers → webhooks → add endpoint
   `https://sckrilla.com/api/stripe/webhook`
   events: `checkout.session.completed` + `invoice.paid`
2. copy the signing secret (`whsec_…`) → in the repo dir:
   `cf workers secrets update STRIPE_WEBHOOK_SECRET`
3. send a test `checkout.session.completed` event — an `earn` line should
   land in `data/ledger.jsonl` within seconds.

until this is done, earned dollars still get booked — just by hand.

---

## logging cheat-sheet

`data/ledger.jsonl` — one json object per line, append at the end:

```json
{"ts":"2026-11-19T12:00:00Z","kind":"gate","summary":"outreach sent → cursor (hi@cursor.com): custom-deal pitch","note":"anna","gateStatus":"approved"}
{"ts":"2026-11-19T12:00:00Z","kind":"gate","summary":"applied: coderabbit affiliate program via dub","note":"anna","gateStatus":"approved"}
{"ts":"2026-11-19T12:00:00Z","kind":"publish","summary":"counterpost live on x — link: <url>"}
```

`ts` in UTC, `kind` one of gate/publish/research/spend/earn. no money
claimed unless it actually moved.
