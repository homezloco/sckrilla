import { env } from "cloudflare:workers";
import { adminKeyOk } from "../../../../lib/admin";
import type { DayStats } from "../../../../lib/analytics";

export const dynamic = "force-dynamic";

const EMPTY: DayStats = {
  total: 0,
  js: {},
  bot: {},
  pv: {},
  ref: {},
  ua: {},
  dev: {},
  cc: {},
  uniq: {},
};

interface AnalyticsEnv {
  ANALYTICS_KV?: {
    get(key: string): Promise<string | null>;
  };
}

function top(obj: Record<string, number>, n = 10): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
}

/** Last `days` of rollup docs merged into one aggregate view. */
export async function GET(request: Request) {
  if (!adminKeyOk(request))
    return Response.json({ error: "unauthorized" }, { status: 401 });

  const kv = (env as unknown as AnalyticsEnv).ANALYTICS_KV;
  if (!kv) return Response.json({ error: "analytics not bound" }, { status: 503 });

  const days = Math.min(
    Number(new URL(request.url).searchParams.get("days")) || 7,
    30,
  );
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - i * 86_400_000);
    return d.toISOString().slice(0, 10);
  });

  const docs = await Promise.all(
    dates.map(async (d) => ({
      date: d,
      stats: JSON.parse((await kv.get(`stats:${d}`)) ?? "null") as DayStats | null,
    })),
  );

  const merged = { ...EMPTY, js: { yes: 0, no: 0 }, bot: { yes: 0, no: 0 } };
  const pv: Record<string, number> = {};
  const ref: Record<string, number> = {};
  const ua: Record<string, number> = {};
  const dev: Record<string, number> = {};
  const cc: Record<string, number> = {};
  const uniq = new Set<string>();
  const byDay: { date: string; views: number; uniques: number; bots: number }[] = [];

  for (const { date, stats } of docs) {
    const s = stats ?? EMPTY;
    byDay.push({
      date,
      views: s.total ?? 0,
      uniques: Object.keys(s.uniq ?? {}).length,
      bots: s.bot?.yes ?? 0,
    });
    merged.total += s.total ?? 0;
    merged.js.yes += s.js?.yes ?? 0;
    merged.js.no += s.js?.no ?? 0;
    merged.bot.yes += s.bot?.yes ?? 0;
    merged.bot.no += s.bot?.no ?? 0;
    for (const [k, v] of Object.entries(s.pv ?? {})) pv[k] = (pv[k] ?? 0) + v;
    for (const [k, v] of Object.entries(s.ref ?? {})) ref[k] = (ref[k] ?? 0) + v;
    for (const [k, v] of Object.entries(s.ua ?? {})) ua[k] = (ua[k] ?? 0) + v;
    for (const [k, v] of Object.entries(s.dev ?? {})) dev[k] = (dev[k] ?? 0) + v;
    for (const [k, v] of Object.entries(s.cc ?? {})) cc[k] = (cc[k] ?? 0) + v;
    for (const k of Object.keys(s.uniq ?? {})) uniq.add(k);
  }

  return Response.json({
    days,
    totals: {
      views: merged.total,
      uniques: uniq.size,
      jsRan: merged.js.yes,
      bots: merged.bot.yes,
      humans: merged.bot.no,
    },
    byDay: byDay.reverse(),
    paths: top(pv),
    referrers: top(ref),
    browsers: top(ua),
    devices: top(dev, 5),
    countries: top(cc),
  });
}
