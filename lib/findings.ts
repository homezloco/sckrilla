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

/**
 * Findings are Sckrilla's work product — markdown the Publisher node commits
 * to content/findings/. Bundled into the build via Vite glob, so deploys pick
 * up whatever the agent merged.
 */
export function getFindings(): Finding[] {
  const files = import.meta.glob("../content/findings/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const out: Finding[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const slug = path.replace(/^.*\//, "").replace(/\.md$/, "");
    const { meta, body } = parseFrontmatter(raw);
    out.push({
      slug,
      title: meta.title ?? slug,
      date: meta.date ?? "",
      summary: meta.summary ?? "",
      body,
      html: marked.parse(body, { async: false }),
      runId: meta.runId,
      shareToken: meta.shareToken,
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export function getFinding(slug: string): Finding | undefined {
  return getFindings().find((f) => f.slug === slug);
}
