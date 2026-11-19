import { env } from "cloudflare:workers";
import { adminKeyOk } from "../../../../lib/admin";
import { getTools, type ToolEntry } from "../../../../lib/tools";
import { getLedger, totals } from "../../../../lib/ledger";
import type { DayStats } from "../../../../lib/analytics";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/conversion-summary — pre-digested funnel findings, not raw
 * state. Built so an external caller (a LiveGraph graph run, for example)
 * gets one clean read instead of re-deriving this from /api/admin/state.
 *
 * Scope, honestly: every number here is pulled live from this site's own
 * KV/ledger/tools data. It does NOT re-verify that an affiliate apply link
 * actually renders a working signup page (that needs a browser, the same
 * way the gamma/jasper bugs were only caught by screenshotting) and it does
 * NOT judge distribution strategy — it flags mechanical inconsistencies in
 * data that's already here, and leaves judgment to whoever reads this.
 */

interface KvEnv {
  ANALYTICS_KV?: { get(key: string): Promise<string | null> };
}

interface Finding {
  category: "traffic" | "monetization" | "ledger" | "queue";
  severity: "info" | "watch" | "concern";
  summary: string;
  evidence: string;
}

const DEAD_PROGRAM_RE = /\bdead\b|discontinued|closed|no longer|404|redirects? to (the )?legal|folded into/i;

function day(offset: number): string {
  return new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
}

async function readTraffic(kv: KvEnv["ANALYTICS_KV"], days: number) {
  const empty = { totalHits: 0, jsConfirmed: 0, botSelfIdentified: 0, nonBotUaHits: 0, uniqueVisitors: 0, distinctReferrers: 0 };
  if (!kv) return empty;

  let totalHits = 0;
  let jsConfirmed = 0;
  let botYes = 0;
  let botNo = 0;
  const uniq = new Set<string>();
  const referrers = new Set<string>();

  for (let i = 0; i < days; i++) {
    const raw = await kv.get(`stats:${day(i)}`);
    if (!raw) continue;
    let s: DayStats;
    try {
      s = JSON.parse(raw) as DayStats;
    } catch {
      continue;
    }
    totalHits += s.total ?? 0;
    jsConfirmed += s.js?.yes ?? 0;
    botYes += s.bot?.yes ?? 0;
    botNo += s.bot?.no ?? 0;
    for (const k of Object.keys(s.uniq ?? {})) uniq.add(k);
    for (const k of Object.keys(s.ref ?? {})) referrers.add(k);
  }

  return {
    totalHits,
    jsConfirmed,
    botSelfIdentified: botYes,
    nonBotUaHits: botNo,
    uniqueVisitors: uniq.size,
    distinctReferrers: referrers.size,
  };
}

function checkToolMismatches(tools: ToolEntry[]) {
  const mismatches: { slug: string; name: string; issue: string; evidence: string }[] = [];
  for (const t of tools) {
    const program = t.affiliate.program ?? "";
    if (t.affiliate.status === "parked" && DEAD_PROGRAM_RE.test(program)) {
      mismatches.push({
        slug: t.slug,
        name: t.name,
        issue: "status is parked but program note reads as dead/closed",
        evidence: program.slice(0, 160),
      });
    }
    if (t.affiliate.status === "live" && !t.affiliate.url) {
      mismatches.push({
        slug: t.slug,
        name: t.name,
        issue: "status is live but affiliate.url is empty",
        evidence: "no url on a live-status entry",
      });
    }
    if (t.affiliate.status === "na" && !program && !t.ours) {
      mismatches.push({
        slug: t.slug,
        name: t.name,
        issue: "na with no program note — unresearched gap, not a confirmed non-fit",
        evidence: "affiliate.program is empty and ours is not set",
      });
    }
  }
  return mismatches;
}

async function readQueue() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/homezloco/sckrilla/main/GROWTH.md",
      { signal: AbortSignal.timeout(5000), headers: { "User-Agent": "sckrilla-admin" } },
    );
    if (!res.ok) return null;
    const md = await res.text();
    const lines = md.split("\n");
    return {
      openItems: lines.filter((l) => l.startsWith("- [ ]")).length,
      doneItems: lines.filter((l) => l.startsWith("- [x]")).length,
      flaggedItems: lines
        .filter((l) => l.startsWith("- [!]"))
        .map((l) => l.slice(6, 160).trim()),
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  if (!adminKeyOk(request))
    return Response.json({ error: "unauthorized" }, { status: 401 });

  const days = Math.min(
    Number(new URL(request.url).searchParams.get("days")) || 7,
    30,
  );

  const kv = (env as unknown as KvEnv).ANALYTICS_KV;
  const [traffic, tools, ledgerEntries, queue] = await Promise.all([
    readTraffic(kv, days),
    getTools(),
    getLedger(),
    readQueue(),
  ]);

  const live = tools.filter((t) => t.affiliate.status === "live").length;
  const parked = tools.filter((t) => t.affiliate.status === "parked").length;
  const na = tools.filter((t) => t.affiliate.status === "na").length;
  const statusMismatches = checkToolMismatches(tools);
  const ledgerTotals = totals(ledgerEntries);

  const findings: Finding[] = [];

  if (traffic.totalHits > 0) {
    const confirmedRatio = traffic.jsConfirmed / traffic.totalHits;
    if (confirmedRatio < 0.05) {
      findings.push({
        category: "traffic",
        severity: "concern",
        summary: "almost none of the recent hits are confirmed as a real browser rendering the page",
        evidence: `js beacon fired ${traffic.jsConfirmed} times against ${traffic.totalHits} total hits over ${days}d`,
      });
    }
  } else {
    findings.push({
      category: "traffic",
      severity: "info",
      summary: "no traffic data in this window",
      evidence: `0 hits recorded over the last ${days}d`,
    });
  }

  if (traffic.distinctReferrers <= 2) {
    findings.push({
      category: "traffic",
      severity: "watch",
      summary: "almost no distinct inbound referrers — little real external distribution landing yet",
      evidence: `${traffic.distinctReferrers} distinct referrer host(s) over ${days}d`,
    });
  }

  for (const m of statusMismatches) {
    findings.push({
      category: "monetization",
      severity: "concern",
      summary: `${m.name} (${m.slug}): ${m.issue}`,
      evidence: m.evidence,
    });
  }

  if (ledgerTotals.earnUsd === 0 && ledgerTotals.spendUsd > 0) {
    findings.push({
      category: "ledger",
      severity: "info",
      summary: "spend is booked, no revenue booked yet",
      evidence: `spendUsd=${ledgerTotals.spendUsd.toFixed(2)} earnUsd=0`,
    });
  }

  if (queue?.flaggedItems.length) {
    findings.push({
      category: "queue",
      severity: "watch",
      summary: `${queue.flaggedItems.length} queue item(s) explicitly flagged needs-human/unresolved`,
      evidence: queue.flaggedItems.join(" | "),
    });
  }

  return Response.json({
    generatedAt: new Date().toISOString(),
    window: { days },
    traffic,
    monetization: { toolsTotal: tools.length, live, parked, na, statusMismatches },
    ledger: ledgerTotals,
    queue,
    findings,
    scope:
      "automated checks only — traffic volume/confirmation, affiliate status/program-text consistency, ledger totals, queue hygiene. does not verify that an apply link renders a real signup page (needs a browser) and does not judge distribution strategy.",
  });
}

const methodNotAllowed = (): Response =>
  Response.json({ error: "get only" }, { status: 405, headers: { Allow: "GET" } });

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
