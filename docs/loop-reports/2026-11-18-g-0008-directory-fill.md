# Item Acceptance & Loop Report: g-0008 directory expansion

## Acceptance Criteria
- **Task**: Expand `/tools` surface in `data/tools.json` toward the g-0003 niche site outline architecture.
- **Requirements**: Append entries for tools targeted by the matrix, including "vs" entries (`kind: "vs"`). No fake affiliate URLs (`status` set to `parked` or `na` only). Branch `growth/g-0008-directory-fill`.

## What Was Done & Why
- Updated `data/tools.json` with 6 new entries:
  1. `cline` (`kind: "tool"`, `category: "open-source"`, `affiliate.status: "na"`)
  2. `roo-code` (`kind: "tool"`, `category: "open-source"`, `affiliate.status: "na"`)
  3. `bolt-new` (`kind: "tool"`, `category: "autonomous-agent"`, `affiliate.status: "parked"`)
  4. `v0-by-vercel` (`kind: "tool"`, `category: "autonomous-agent"`, `affiliate.status: "na"`)
  5. `cursor-vs-windsurf` (`kind: "vs"`, `category: "ai-ide"`, `affiliate.status: "na"`)
  6. `devin-vs-github-copilot` (`kind: "vs"`, `category: "autonomous-agent"`, `affiliate.status: "na"`)
- Completed missing pricing/fit fields for existing entry `junie`.
- Initialized `growth/assets/sckrilla-kit.md` with canonical boilerplate descriptions for sckrilla asset kit.

## External Steps / Human Hand-off
- None required for directory expansion.
- Operator can review new entries or use `/admin` to toggle deal links as affiliate partnerships land.

## Gaps, Decisions & Diminishing Returns
- Real Gaps: Additional "vs" comparison pages and tool alternatives can be expanded continuously as new AI agent tools launch.
- Decisions: None required.
- Diminishing Returns: Adding dozens of low-traffic niche tools before initial SEO indexing and traffic validation.

---

## round 2 (operator session, same branch)

- Stacked +11 tools across 4 new categories the matrix targets: `terminal-cli` (claude-code, codex-cli, gemini-cli, opencode), `code-review` (coderabbit, greptile, graphite), `agent-framework` (crewai, langgraph), `eval` (promptfoo, braintrust). 19 → 30 entries.
- Extended `CATEGORY_LABELS` for the new categories — every one has ≥2 entries so category hubs and compare pages auto-generate (~30 new pairs).
- Statuses stay honest: 10 `na`, 1 `parked` (coderabbit — referral program exists, unverified). Zero fake affiliate urls.
- Fixed a ledger hazard: the loop's branch predated today's ledger backfill — merged it would have deleted 6 lines. This commit carries the union.
