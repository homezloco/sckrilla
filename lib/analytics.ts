/**
 * First-party traffic analytics — KV rollup, no cookies, no PII beyond a
 * daily-rotating ip+ua hash for unique counts. Two write paths:
 *   1. worker/entry.ts logs every page hit server-side (bots included)
 *   2. /api/t beacon POST marks "JS ran" — the human signal
 * Reads aggregate per-day docs in app/api/admin/analytics/route.ts.
 *
 * Accuracy note: counters are read-modify-write, so concurrent hits can
 * lose increments — analytics-grade, not accounting-grade, which is the
 * right trade at this site's traffic.
 */

export interface DayStats {
  total: number;
  js: Record<string, number>;
  bot: Record<string, number>;
  pv: Record<string, number>;
  ref: Record<string, number>;
  src: Record<string, number>;
  ua: Record<string, number>;
  dev: Record<string, number>;
  cc: Record<string, number>;
  uniq: Record<string, true>;
}

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternal|discordbot|telegrambot|gptbot|claudebot|perplexity|ahrefs|semrush|headless|lighthouse|uptime|pingdom|wget|curl|python-requests|go-http|scrapy/i;

export function uaFamily(ua: string): string {
  const u = ua.toLowerCase();
  if (BOT_RE.test(u)) return "bot";
  if (u.includes("edg")) return "edge";
  if (u.includes("chrome")) return "chrome";
  if (u.includes("safari") && !u.includes("chrome")) return "safari";
  if (u.includes("firefox")) return "firefox";
  return "other";
}

export function deviceType(ua: string): string {
  const u = ua.toLowerCase();
  if (BOT_RE.test(u)) return "bot";
  if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(u)) return "mobile";
  if (/ipad|tablet|android(?!.*mobile)/.test(u)) return "tablet";
  return "desktop";
}

export function isBot(ua: string, verifiedCategory?: string): boolean {
  return Boolean(verifiedCategory) || BOT_RE.test(ua);
}

function day(): string {
  return new Date().toISOString().slice(0, 10);
}

function bump(obj: Record<string, number>, key: string) {
  obj[key] = (obj[key] ?? 0) + 1;
}

function fnv(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

interface KvLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export async function recordHit(
  kv: KvLike | undefined,
  request: Request,
  extras: { path: string; js?: boolean },
): Promise<void> {
  if (!kv) return;
  try {
    const ua = request.headers.get("user-agent") ?? "";
    const ref = request.headers.get("referer") ?? "";
    const cf = (request as unknown as { cf?: { country?: string; verifiedBotCategory?: string } }).cf ?? {};
    let refHost = "";
    try {
      refHost = ref ? new URL(ref).host : "";
    } catch {
      /* bad ref header */
    }
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for") ??
      "";

    const reqUrl = new URL(request.url);
    const extRef =
      refHost && refHost !== reqUrl.host ? refHost.slice(0, 80) : "";
    const utm = (reqUrl.searchParams.get("utm_source") ?? "").slice(0, 60);

    const key = `stats:${day()}`;
    const doc: DayStats = JSON.parse(
      (await kv.get(key)) ??
        '{"total":0,"js":{},"bot":{},"pv":{},"ref":{},"src":{},"ua":{},"dev":{},"cc":{},"uniq":{}}',
    );
    doc.src ??= {};
    if (extras.js) {
      // beacon — the JS-ran signal only; the page GET already counted the view
      bump(doc.js, "yes");
    } else {
      doc.total++;
      bump(doc.js, "no");
      bump(doc.bot, isBot(ua, cf.verifiedBotCategory) ? "yes" : "no");
      bump(doc.pv, extras.path.slice(0, 120));
      if (extRef) bump(doc.ref, extRef);
      const source = utm || extRef;
      if (source) bump(doc.src, source);
      bump(doc.ua, uaFamily(ua));
      bump(doc.dev, deviceType(ua));
      bump(doc.cc, cf.country ?? "??");
    }
    if (Object.keys(doc.uniq).length < 5000)
      doc.uniq[fnv(`${ip}|${ua}|${key}`)] = true;

    await kv.put(key, JSON.stringify(doc), { expirationTtl: 60 * 60 * 24 * 40 });
  } catch {
    /* analytics must never break the request */
  }
}
