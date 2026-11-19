import { adminKeyOk } from "../../../../lib/admin";
import { getTools } from "../../../../lib/tools";
import { getLedger, totals } from "../../../../lib/ledger";

export const dynamic = "force-dynamic";

/** Aggregated operator view — everything the console shows behind the key. */
export async function GET(request: Request) {
  if (!adminKeyOk(request))
    return Response.json({ error: "unauthorized" }, { status: 401 });

  const [tools, ledger] = await Promise.all([getTools(), getLedger()]);

  let runs: unknown = null;
  let runCount: number | null = null;
  const lgKey = process.env.LIVEGRAPH_API_KEY;
  if (lgKey) {
    try {
      const base = "https://api.livegraph.ai/graphs/c99dec17-cee3-41a8-b1a7-f193237ad912/runs";
      const hdrs = { "X-Api-Key": lgKey };
      const res = await fetch(`${base}?limit=10`, {
        headers: hdrs,
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = (await res.json()) as
          | { id: string; status: string; createdAt?: string }[]
          | { runs: { id: string; status: string; createdAt?: string }[] };
        const list = Array.isArray(data) ? data : data.runs;
        runs = list.map((r) => ({
          id: r.id.slice(0, 8),
          status: r.status,
          at: r.createdAt,
        }));
      }
      runCount = 0;
      for (let offset = 0; offset < 2000; offset += 100) {
        const r = await fetch(`${base}?limit=100&offset=${offset}`, {
          headers: hdrs,
          signal: AbortSignal.timeout(5000),
        });
        if (!r.ok) { runCount = null; break; }
        const d = (await r.json()) as unknown[] | { runs: unknown[] };
        const page = Array.isArray(d) ? d : d.runs;
        runCount += page.length;
        if (page.length < 100) break;
      }
    } catch {
      runs = null;
      runCount = null;
    }
  }

  let queue: { open: string[] } | null = null;
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/homezloco/sckrilla/main/GROWTH.md",
      { signal: AbortSignal.timeout(5000), headers: { "User-Agent": "sckrilla-admin" } },
    );
    if (res.ok) {
      const md = await res.text();
      queue = {
        open: md
          .split("\n")
          .filter((l) => l.startsWith("- [ ]"))
          .map((l) => l.slice(6, 12).trim()),
      };
    }
  } catch {
    queue = null;
  }

  return Response.json({
    tools: tools.map((t) => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      status: t.affiliate.status,
      url: t.affiliate.url,
      program: t.affiliate.program ?? "",
      applyUrl: t.affiliate.applyUrl ?? "",
      ours: t.ours ?? false,
    })),
    ledger: totals(ledger),
    runs,
    runCount,
    queue,
  });
}
