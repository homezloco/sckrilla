import { ToolEntry, categoryLabel } from "./tools";

/**
 * Compare-page differentiation. The /tools/compare route renders every
 * same-category pair; this module is what keeps ~51 pages from reading as
 * one template with the names swapped. Everything here is derived from
 * fields already on the entries — labels get smarter per category, but no
 * product facts are invented.
 */

export type CompareField = "tagline" | "pricing" | "fit" | "watchOut";

export interface CompareCriterion {
  /** category-honest name for the row */
  label: string;
  /** the ToolEntry field the row is populated from */
  field: CompareField;
}

export interface CompareSpec {
  criteria: CompareCriterion[];
  /** one honest, category-aware sentence under the verdict heading */
  verdictLead: string;
}

const CATEGORY_SPECS: Record<string, CompareSpec> = {
  "ai-ide": {
    criteria: [
      { label: "the pitch", field: "tagline" },
      { label: "seat price", field: "pricing" },
      { label: "completion & agent engine", field: "fit" },
      { label: "limits & lock-in watch", field: "watchOut" },
    ],
    verdictLead:
      "ai ides are daily drivers — you feel completion quality hourly, so the fit line matters more than the feature list.",
  },
  "open-source": {
    criteria: [
      { label: "the pitch", field: "tagline" },
      { label: "license & real cost", field: "pricing" },
      { label: "where it earns its keep", field: "fit" },
      { label: "assembly-required watch", field: "watchOut" },
    ],
    verdictLead:
      "open source means free code, not free usage — the real price is your model bill and your config time.",
  },
  "autonomous-agent": {
    criteria: [
      { label: "what it sells you", field: "tagline" },
      { label: "usage cost", field: "pricing" },
      { label: "what it takes off your plate", field: "fit" },
      { label: "platform & trust watch", field: "watchOut" },
    ],
    verdictLead:
      "delegation tools trade keystrokes for trust — the question is how much supervision you want to keep, not which logo wins.",
  },
  infra: {
    criteria: [
      { label: "what it actually sells you", field: "tagline" },
      { label: "what it costs", field: "pricing" },
      { label: "where it earns the bill", field: "fit" },
      { label: "the fine print", field: "watchOut" },
    ],
    verdictLead:
      "infra choices are sticky — boring and understood beats clever and surprising.",
  },
  "terminal-cli": {
    criteria: [
      { label: "the pitch", field: "tagline" },
      { label: "pricing model", field: "pricing" },
      { label: "scriptability & repo depth", field: "fit" },
      { label: "sandbox & spend watch", field: "watchOut" },
    ],
    verdictLead:
      "terminal agents all read your repo and run commands — the real differences are whose model bill you pay and how much rope the sandbox gives them.",
  },
  "code-review": {
    criteria: [
      { label: "the pitch", field: "tagline" },
      { label: "per-dev cost", field: "pricing" },
      { label: "repo-context depth", field: "fit" },
      { label: "noise & workflow watch", field: "watchOut" },
    ],
    verdictLead:
      "review bots live or die on signal-to-noise — the winner is whichever one your team doesn't mute.",
  },
  "agent-framework": {
    criteria: [
      { label: "the metaphor it sells", field: "tagline" },
      { label: "license & platform cost", field: "pricing" },
      { label: "where it fits in a stack", field: "fit" },
      { label: "production watch", field: "watchOut" },
    ],
    verdictLead:
      "frameworks are architectures, not features — pick the abstraction you won't outgrow, because switching costs compound.",
  },
  eval: {
    criteria: [
      { label: "what it checks", field: "tagline" },
      { label: "cost model", field: "pricing" },
      { label: "where it earns its keep", field: "fit" },
      { label: "the trap", field: "watchOut" },
    ],
    verdictLead:
      "an eval tool only grades the rubric you write — the pick is whichever harness your team will actually run in ci.",
  },
};

const GENERIC_SPEC: CompareSpec = {
  criteria: [
    { label: "what it is", field: "tagline" },
    { label: "pricing", field: "pricing" },
    { label: "where it wins", field: "fit" },
    { label: "watch out", field: "watchOut" },
  ],
  verdictLead:
    "same category on paper doesn't mean same job in practice.",
};

export function compareSpec(category: string): CompareSpec {
  return CATEGORY_SPECS[category] ?? GENERIC_SPEC;
}

/** declaw a field into a lowercase clause — strip the period, drop the cap. */
function clause(s: string | undefined): string | undefined {
  const t = s?.trim().replace(/[.\s]+$/, "");
  return t ? t.charAt(0).toLowerCase() + t.slice(1) : undefined;
}

/**
 * The "pick {name} if —" line. A hand-written `pickLine` on the entry wins
 * when present; otherwise the fit field is re-quoted as a clause. Either
 * way the words come from the entry itself — never fabricated.
 */
export function pickLine(t: ToolEntry): string {
  const own = clause(t.pickLine);
  if (own) return own;
  return (
    clause(t.fit) ??
    `it made the ${categoryLabel(t.category)} shortlist — the rows above are the full picture`
  );
}
