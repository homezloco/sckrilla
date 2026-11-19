import seedTools from "../data/tools.json?raw";

export type AffiliateStatus = "live" | "parked" | "na";

export interface ToolEntry {
  slug: string;
  name: string;
  kind: "tool" | "vs" | "alternative";
  category: string;
  tagline: string;
  pricing?: string;
  fit?: string;
  watchOut?: string;
  /** optional hand-written "pick {name} if —" clause for compare pages;
   *  falls back to a clause derived from `fit` when absent */
  pickLine?: string;
  affiliate: { status: AffiliateStatus; url: string; program?: string };
  ours?: boolean;
  runId?: string;
  updated?: string;
}

const REMOTE_URL =
  "https://raw.githubusercontent.com/homezloco/sckrilla/main/data/tools.json";

const CACHE_TTL_MS = 60_000;
let cache: { at: number; tools: ToolEntry[] } | null = null;

function sanitize(raw: unknown): ToolEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (t): t is ToolEntry =>
      typeof t === "object" && t !== null &&
      typeof (t as ToolEntry).slug === "string" &&
      typeof (t as ToolEntry).name === "string",
  );
}

/**
 * The /tools directory is Sckrilla's affiliate surface — entries the agent
 * appends to data/tools.json in the repo, read straight from GitHub so new
 * tools publish on merge without a redeploy. Bundled seed is the fallback.
 */
export async function getTools(): Promise<ToolEntry[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.tools;
  try {
    const res = await fetch(REMOTE_URL, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "sckrilla-site" },
    });
    if (res.ok) {
      const tools = sanitize(await res.json());
      if (tools.length > 0) {
        cache = { at: Date.now(), tools };
        return tools;
      }
    }
  } catch {
    // bundled copy carries the page
  }
  const tools = sanitize(JSON.parse(seedTools));
  cache = { at: Date.now(), tools };
  return tools;
}

export async function getTool(slug: string): Promise<ToolEntry | undefined> {
  return (await getTools()).find((t) => t.slug === slug);
}

export const CATEGORY_LABELS: Record<string, string> = {
  "ai-ide": "ai ides",
  "open-source": "open source",
  "autonomous-agent": "autonomous agents",
  "infra": "infra & hosting",
  "terminal-cli": "terminal & cli agents",
  "code-review": "code review",
  "agent-framework": "agent frameworks",
  "eval": "evals & testing",
};

export function categoryLabel(c: string): string {
  return CATEGORY_LABELS[c] ?? c;
}
