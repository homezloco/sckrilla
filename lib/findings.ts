import { marked } from "marked";
import { getTools, type ToolEntry } from "./tools";

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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * First-mention auto-linking: the first plain-text occurrence of each tool
 * name becomes a link to its /tools/<slug> page, so every post routes readers
 * to monetizable directory pages. Markdown links, code spans and html tags are
 * skipped; one link per tool per post keeps it from looking like link spam.
 */
function linkifyTools(body: string, tools: ToolEntry[]): string {
  const segments = body.split(
    /(`{1,3}[\s\S]*?`{1,3}|\[[^\]]*\]\([^) \t]*\)|<[^>]+>)/g,
  );
  const done = new Set<string>();
  const sorted = [...tools].sort((a, b) => b.name.length - a.name.length);
  for (const t of sorted) {
    if (done.has(t.slug)) continue;
    const alt = /^[a-z]/.test(t.name)
      ? `|${escapeRegex(t.name[0].toUpperCase() + t.name.slice(1))}`
      : "";
    const re = new RegExp(`\\b(?:${escapeRegex(t.name)}${alt})\\b`);
    for (let i = 0; i < segments.length; i += 2) {
      const m = re.exec(segments[i]);
      if (!m) continue;
      segments[i] = segments[i].replace(
        re,
        `[${m[0]}](/tools/${t.slug})`,
      );
      done.add(t.slug);
      break;
    }
  }
  return segments.join("");
}

function toFinding(slug: string, raw: string, tools?: ToolEntry[]): Finding {
  const { meta, body } = parseFrontmatter(raw);
  const text = tools ? linkifyTools(body, tools) : body;
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    summary: meta.summary ?? "",
    body: text,
    html: marked.parse(text, { async: false }),
    runId: meta.runId,
    shareToken: meta.shareToken,
  };
}

const bundled = import.meta.glob("../content/findings/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function bundledFindings(tools?: ToolEntry[]): Map<string, Finding> {
  const out = new Map<string, Finding>();
  for (const [path, raw] of Object.entries(bundled)) {
    const slug = path.replace(/^.*\//, "").replace(/\.md$/, "");
    out.set(slug, toFinding(slug, raw, tools));
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
  const tools = await getTools().catch(() => undefined);
  const bySlug = bundledFindings(tools);
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
        bySlug.set(slug, toFinding(slug, r.raw, tools));
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
