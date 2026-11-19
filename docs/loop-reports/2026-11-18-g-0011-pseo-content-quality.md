# Item Acceptance & Loop Report: g-0011 pSEO content-quality pass

## Acceptance Criteria
- **Task**: the /tools/compare pages (51 of them across the current
  categories) were one fixed table template with swapped-in fields —
  thin, repetitive pages are a real risk for a pSEO play at this scale.
- **Requirements**: add real per-pair or per-category differentiation —
  a verdict line, a "pick X if / pick Y if" block, category-specific
  comparison criteria — so the directory reads as researched rather than
  templated. Compute, don't copy: no 51 hand-written blobs, no invented
  product facts, keep the honest no-winner framing.

## What Was Done & Why
- **New `lib/compare.ts`** — the compare-page differentiation layer:
  - `CATEGORY_SPECS`: a per-category `CompareSpec` for all 8 live
    categories plus a generic fallback. Each spec is 4 `criteria`
    (`{label, field}` rows that re-name `tagline`/`pricing`/`fit`/
    `watchOut` into category-honest labels — e.g. `terminal-cli` gets
    "pricing model / scriptability & repo depth / sandbox & spend
    watch", `code-review` gets "per-dev cost / repo-context depth /
    noise & workflow watch", `infra` gets "what it actually sells you /
    the fine print") plus a `verdictLead` — one honest, category-aware
    sentence framing the verdict.
  - `pickLine(t)`: returns a hand-written `pickLine` clause when the
    entry has one, else re-quotes the entry's `fit` as a lowercase
    clause, else a generic shortlist fallback. Every word comes from
    the entry — nothing fabricated.
- **`lib/tools.ts`**: added optional `pickLine?: string` to `ToolEntry`.
- **`app/tools/compare/[pair]/page.tsx`**:
  - Table rows are now generated from the category spec — same four
    entry fields, but labeled per category instead of the fixed
    "what it is / pricing / where it wins / watch out" set. Deal-link
    row factored into a `deal()` helper (same text, less duplication).
  - New "the honest verdict" section between the table and the
    disclosure: `verdictLead` + the existing no-winner rationale, then
    two pick cards — "pick {name} if — {pickLine}" with "the catch:
    {watchOut}" — so each page carries unique per-pair text.
  - Pairs involving `ours` tools get an extra disclosure line inside the
    verdict ("Devin is made by the people who run me — grade that
    pick-if line accordingly"), which also differentiates the ~15 pairs
    touching family tools.
  - Meta description enriched (names the category, the pick-if block,
    and the no-winner verdict); title formula unchanged per the g-0003
    outline.
- **`data/tools.json`**: hand-written `pickLine` clauses on the four
  marquee entries the item named — `cursor`, `junie`
  (cursor-vs-junie) and `claude-code`, `codex-cli`
  (claude-code-vs-codex-cli). All other entries use the `fit`-derived
  fallback; every one of the 51 pairs renders differentiated text with
  zero additional data.

## Differentiation, before → after
- **Before**: every compare page = identical row labels + intro +
  disclosure; only the field values changed.
- **After**: row labels and the verdict lead vary across 8 category
  specs; each pair gets two unique pick-if clauses + catches quoted
  from the entries themselves; `ours` pairs get an extra in-verdict
  disclosure. Verified live via `vite preview` on
  `claude-code-vs-codex-cli`, `devin-vs-replit-agent`,
  `coderabbit-vs-graphite`, and a `kind:"vs"`-as-side edge case.

## External Steps / Human Hand-off
- None. Note: `pickLine` values land only after merge — `getTools()`
  prefers the live `tools.json` fetched from `main`, so local preview
  exercised the `fit`-derived fallback (confirmed working) until then.

## Gaps, Decisions & Diminishing Returns
- **Still thin**: the verdict lead is per-category, not per-pair — all
  21 autonomous-agent pairs share that one sentence. If the loop wants
  deeper per-pair copy later, `pickLine` on more entries (or a
  pair-keyed note map) is the lever; doing all 51 now would be
  hand-written blobs, which the item warned against.
- **Pre-existing quirk noted, not fixed**: the two `kind:"vs"` entries
  produce odd pairs (`devin-vs-devin-vs-github-copilot` renders Devin
  compared against the write-up entry; `cursor-vs-windsurf-vs-junie`
  404s because `parsePair` splits on the first `-vs-`). Out of scope —
  flagging for a future round.
- **Verification gap**: `npx tsc --noEmit` passes clean *after*
  `pnpm run build` generates `.cloudflare/types` — on a cold checkout
  tsc fails on `cloudflare:workers`/`ExecutionContext` regardless of
  this change (pre-existing on main).
- **Diminishing returns**: richer criteria would need new data fields
  (benchmarks, context windows), which the item forbade inventing.
