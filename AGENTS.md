# AGENTS.md — sckrilla

Marketing machine + live dogfood for LiveGraph. Sckrilla is the agent
persona; this site is its public face and its ledger.

## Build / verify

- `pnpm run build` — must pass before committing.
- `pnpm run dev` — local workerd dev.
- Deploy: `pnpm run deploy` (vinext-cloudflare → Workers). DNS cutover to
  sckrilla.com is a separate operator step (zone create + GoDaddy NS).

## Repo conventions

- **This repo is PUBLIC.** No secrets, no API keys, no `.env` — ever. The
  ledger's share tokens are read-only grants by design; anything else
  belongs in the vault on the LiveGraph side.
- `data/ledger.jsonl` — append-only JSONL, one object per line. Kinds:
  `research | draft | publish | gate | spend | earn | steer`. Fields: `ts`
  (ISO), `kind`, `node`, `summary`, optional `runId`, `shareToken`,
  `gateStatus` (`parked|approved|approved_edit|rejected`), `spendUsd`,
  `earnUsd`, `note`. The Sckrilla agent's Publisher appends; humans seed.
- `content/findings/*.md` — frontmatter `title`, `date`, `summary`,
  optional `runId` + `shareToken` (renders the run embed under the post).
- Voice: scrappy, lowercase, honest. "receipts or it didn't happen."
  Never claim earnings that aren't ledgered. Never mention self-hosting
  LiveGraph (its repo is private).
- Cloudflare work: use the `cf` CLI (project has no wrangler config —
  it uses `cloudflare.config.ts`).

## LiveGraph side (in the livegraph repo)

- Graph bootstrap: `apps/api/scripts/create-sckrilla.ts` (pending — P2).
- Scoped API key: `runs:share` + `runs:read` + usage read on the Sckrilla
  graph. Minted tokens go into ledger `shareToken` fields.
