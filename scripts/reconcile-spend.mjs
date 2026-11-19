#!/usr/bin/env node
/**
 * reconcile-spend.mjs — keep the public ledger's spend total honest.
 *
 * LiveGraph meters every run (usageTotal.estimatedCostUsd). The ledger's
 * spendUsd lines are written by humans/agents and drift — this script sums
 * the meter across all graph runs, compares it to the ledger total, and
 * appends one 'spend' reconciliation line for the delta when drift >= $0.01.
 * Idempotent: zero drift → no line, no commit.
 *
 * Usage: LIVEGRAPH_API_KEY=lgk_… node scripts/reconcile-spend.mjs [--dry-run]
 */

const GRAPH_ID = "c99dec17-cee3-41a8-b1a7-f193237ad912";
const API = process.env.LIVEGRAPH_API_URL ?? "https://api.livegraph.ai";
const KEY = process.env.LIVEGRAPH_API_KEY;
const LEDGER = new URL("../data/ledger.jsonl", import.meta.url);
const DRY = process.argv.includes("--dry-run");
const DRIFT_MIN = 0.01;
const PAGE = 100;

if (!KEY) {
  console.error("LIVEGRAPH_API_KEY unset");
  process.exit(1);
}

const hdrs = { "X-Api-Key": KEY };

async function runIds() {
  const ids = [];
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(
      `${API}/graphs/${GRAPH_ID}/runs?limit=${PAGE}&offset=${offset}`,
      { headers: hdrs },
    );
    if (!res.ok) throw new Error(`list runs: ${res.status}`);
    const page = await res.json();
    const list = Array.isArray(page) ? page : page.runs ?? [];
    ids.push(...list.map((r) => r.id));
    if (list.length < PAGE) break;
  }
  return ids;
}

async function metered() {
  const ids = await runIds();
  let total = 0;
  let missing = 0;
  // modest parallelism — the API is small, be polite
  for (let i = 0; i < ids.length; i += 8) {
    const batch = await Promise.all(
      ids.slice(i, i + 8).map(async (id) => {
        const res = await fetch(`${API}/runs/${id}`, { headers: hdrs });
        if (!res.ok) return null;
        return res.json();
      }),
    );
    for (const r of batch) {
      if (!r) { missing++; continue; }
      total += r.usageTotal?.estimatedCostUsd ?? 0;
    }
  }
  return { total, runs: ids.length, missing };
}

function ledgerTotals(lines) {
  let spend = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      spend += JSON.parse(line).spendUsd ?? 0;
    } catch { /* malformed line — skip */ }
  }
  return spend;
}

const fs = await import("node:fs");
const text = fs.readFileSync(LEDGER, "utf8");
const booked = ledgerTotals(text.split("\n"));
const { total, runs, missing } = await metered();
const drift = total - booked;

console.log(
  `meter: $${total.toFixed(4)} across ${runs} runs` +
  (missing ? ` (${missing} unfetchable)` : "") +
  ` | books: $${booked.toFixed(4)} | drift: $${drift.toFixed(4)}`,
);

if (Math.abs(drift) < DRIFT_MIN) {
  console.log("in sync — nothing to write");
  process.exit(0);
}

const line = {
  ts: new Date().toISOString(),
  kind: "spend",
  node: "system",
  summary:
    `auto-reconcile: livegraph meter says $${total.toFixed(2)} across ${runs}` +
    ` runs; books were $${(booked).toFixed(2)} — delta $${drift.toFixed(2)}` +
    ` appended${missing ? ` (${missing} runs unfetchable)` : ""}. the meter is the source of truth.`,
  spendUsd: Number(drift.toFixed(4)),
  earnUsd: 0,
};

if (DRY) {
  console.log("dry-run — would append:", JSON.stringify(line));
  process.exit(0);
}

fs.appendFileSync(LEDGER, JSON.stringify(line) + "\n");
console.log("appended reconciliation line:", line.summary);
