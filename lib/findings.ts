import { marked } from "marked";

export interface Finding {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  html: string;
  runId?: string;
  shareToken?: string;
}

interface Frontmatter {
  title?: string;
  date?: string;
  summary?: string;
  runId?: string;
  shareToken?: string;
}

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Frontmatter = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim() as keyof Frontmatter;
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    meta[key] = value;
  }
  return { meta, body: m[2] };
}

function toFinding(slug: string, raw: string): Finding {
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    summary: meta.summary ?? "",
    body,
    html: marked.parse(body, { async: false }),
    runId: meta.runId,
    shareToken: meta.shareToken,
  };
}

const bundled = import.meta.glob("../content/findings/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function bundledFindings(): Map<string, Finding> {
  const out = new Map<string, Finding>();
  for (const [path, raw] of Object.entries(bundled)) {
    const slug = path.replace(/^.*\//, "").replace(/\.md$/, "");
    out.set(slug, toFinding(slug, raw));
  }
  return out;
}

const LIST_URL =
  "https://api.github.com/repos/homezloco/sckrilla/contents/content/findings";
const RAW_BASE =
  "https://raw.githubusercontent.com/homezloco/sckrilla/main/content/findings";

const CACHE_TTL_MS = 120_000;
let cache: { at: number; findings: Finding[] } | null = null;

/**
 * Findings are Sckrilla's work product — markdown the Publisher node commits
 * to content/findings/. Like the ledger, the site reads the newest copies
 * straight from GitHub so agent merges show up without a redeploy; the
 * bundled glob is the fallback for local dev / a cold repo / rate limits.
 */
export async function getFindings(): Promise<Finding[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.findings;
  const bySlug = bundledFindings();
  try {
    const res = await fetch(LIST_URL, {
      signal: AbortSignal.timeout(5000),
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "sckrilla-site",
      },
    });
    if (res.ok) {
      const files = (await res.json()) as { name?: string }[];
      const names = files
        .map((f) => f.name)
        .filter((n): n is string => typeof n === "string" && n.endsWith(".md"));
      const raws = await Promise.all(
        names.map(async (n) => {
          try {
            const r = await fetch(`${RAW_BASE}/${n}`, {
              signal: AbortSignal.timeout(5000),
            });
            return r.ok ? { n, raw: await r.text() } : null;
          } catch {
            return null;
          }
        }),
      );
      for (const r of raws) {
        if (!r) continue;
        const slug = r.n.replace(/\.md$/, "");
        bySlug.set(slug, toFinding(slug, r.raw));
      }
    }
  } catch {
    // bundled copy carries the page
  }
  const findings = [...bySlug.values()].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  cache = { at: Date.now(), findings };
  return findings;
}

export async function getFinding(slug: string): Promise<Finding | undefined> {
  return (await getFindings()).find((f) => f.slug === slug);
}
