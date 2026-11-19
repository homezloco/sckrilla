import seedLedger from "../data/ledger.jsonl?raw";

export type LedgerKind =
  | "research"
  | "draft"
  | "publish"
  | "gate"
  | "spend"
  | "earn"
  | "steer";

export interface LedgerEntry {
  ts: string;
  kind: LedgerKind;
  node?: string;
  summary: string;
  runId?: string;
  shareToken?: string;
  gateStatus?: "parked" | "approved" | "approved_edit" | "rejected";
  spendUsd?: number;
  earnUsd?: number;
  note?: string;
  /** stripe session/invoice id on earn lines written by /api/stripe/webhook — dedupe + audit trail */
  stripeSessionId?: string;
}

const REMOTE_URL =
  process.env.LEDGER_URL ??
  "https://raw.githubusercontent.com/homezloco/sckrilla/main/data/ledger.jsonl";

const CACHE_TTL_MS = 60_000;
let cache: { at: number; entries: LedgerEntry[] } | null = null;

function parse(raw: string): LedgerEntry[] {
  const out: LedgerEntry[] = [];
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      out.push(JSON.parse(t) as LedgerEntry);
    } catch {
      // skip malformed line rather than killing the page
    }
  }
  return out;
}

/**
 * The ledger is the public book. Sckrilla's Publisher node appends lines to
 * data/ledger.jsonl in the repo; the site reads the newest copy straight from
 * GitHub so agent commits show up without a redeploy. Bundled seed is the
 * fallback for local dev / a cold repo.
 */
export async function getLedger(): Promise<LedgerEntry[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.entries;
  try {
    const res = await fetch(REMOTE_URL, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const entries = parse(await res.text());
      if (entries.length > 0) {
        cache = { at: Date.now(), entries };
        return entries;
      }
    }
  } catch {
    // fall through to the bundled copy
  }
  const entries = parse(seedLedger);
  cache = { at: Date.now(), entries };
  return entries;
}

export interface LedgerTotals {
  spendUsd: number;
  earnUsd: number;
  runs: number;
  gates: { parked: number; approved: number; approvedEdit: number; rejected: number; humanTouched: number };
}

export function totals(entries: LedgerEntry[]): LedgerTotals {
  const gates = { parked: 0, approved: 0, approvedEdit: 0, rejected: 0, humanTouched: 0 };
  let spendUsd = 0;
  let earnUsd = 0;
  const runIds = new Set<string>();
  for (const e of entries) {
    spendUsd += e.spendUsd ?? 0;
    earnUsd += e.earnUsd ?? 0;
    if (e.runId) runIds.add(e.runId);
    if (e.gateStatus === "parked") gates.parked++;
    if (e.gateStatus === "approved") {
      gates.approved++;
      gates.humanTouched++;
    }
    if (e.gateStatus === "approved_edit") {
      gates.approvedEdit++;
      gates.humanTouched++;
    }
    if (e.gateStatus === "rejected") {
      gates.rejected++;
      gates.humanTouched++;
    }
  }
  return { spendUsd, earnUsd, runs: runIds.size, gates };
}

export function usd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
