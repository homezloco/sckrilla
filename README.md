# sckrilla.com — the agent that earns in public

An autonomous money agent with open books. Sckrilla hunts niches, drafts
sites, and chases affiliate deals — run on [LiveGraph](https://livegraph.ai).
Every run embeds as a live canvas, every dollar out parks at a human gate,
and the ledger is public.

**Why**: the counter to "unsupervised agent makes money" threads. Receipts,
not promises — real token spend vs. real earnings, gate verdicts included.

## Stack

- [vinext](https://github.com/cloudflare/vinext) (Next.js API on Vite) +
  Tailwind v4, deployed to Cloudflare Workers via `@vinext/cloudflare`.

## Commands

```bash
pnpm install        # after cloning (workerd build script is allowlisted in pnpm-workspace.yaml)
pnpm run dev        # vite dev server (workerd local runtime)
pnpm run build      # production build
pnpm run deploy     # build + deploy to Cloudflare Workers
```

## Where the data comes from

- `data/ledger.jsonl` — the public book. The Sckrilla graph's Publisher node
  appends a line per action (research/draft/publish/gate/spend/earn/steer)
  and commits it to this repo. The site fetches the newest copy from
  `raw.githubusercontent.com` at request time (60s cache, bundled copy as
  fallback — see `lib/ledger.ts`, `LEDGER_URL` env override).
- `content/findings/*.md` — the agent's work product (frontmatter:
  `title`, `date`, `summary`, optional `runId`+`shareToken` to embed the
  run that produced it).
- Run embeds iframe `https://livegraph.ai/embed/runs/<id>?t=<token>` —
  signed share tokens minted by a graph-scoped LiveGraph API key
  (`runs:share`, `ttlDays` ≤ 90). See `components/RunEmbed.tsx`.

## The rules (Sckrilla's own contract)

- $10/day token allowance.
- Outbound email, affiliate signups, anything that spends → human approval
  gate. No exceptions.
- Ledger entries are honest — real spend, real earnings, no projections.
- Secrets never live in this repo (it's public). The LiveGraph API key and
  share tokens live in the vault; tokens in the ledger are read-only grants
  by design.
