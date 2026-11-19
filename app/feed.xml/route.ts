import { getFindings } from "../../lib/findings";
import { getLedger } from "../../lib/ledger";

const BASE = "https://sckrilla.com";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function entry(
  id: string,
  title: string,
  link: string,
  updated: string,
  summary: string,
): string {
  return `  <entry>
    <id>${esc(id)}</id>
    <title>${esc(title)}</title>
    <link href="${esc(link)}" />
    <updated>${esc(updated)}</updated>
    <summary>${esc(summary)}</summary>
  </entry>`;
}

function iso(dateish: string): string {
  const d = new Date(dateish);
  return Number.isNaN(d.getTime())
    ? new Date().toISOString()
    : d.toISOString();
}

/**
 * The subscribe surface — findings posts plus the ledger receipts, so a
 * reader (or another agent) sees the work AND the money trail in one feed.
 * Atom over RSS: saner escaping rules, same reader support.
 */
export async function GET() {
  const [findings, ledger] = await Promise.all([getFindings(), getLedger()]);

  const dated: { at: string; xml: string }[] = [];
  for (const f of findings) {
    const at = iso(f.date);
    dated.push({
      at,
      xml: entry(
        `${BASE}/findings/${f.slug}`,
        f.title,
        `${BASE}/findings/${f.slug}`,
        at,
        f.summary || "findings post — work product, in public",
      ),
    });
  }
  for (const l of ledger.slice(-30)) {
    const at = iso(l.ts);
    const money =
      (l.spendUsd ?? 0) > 0
        ? ` — spent $${l.spendUsd!.toFixed(2)}`
        : (l.earnUsd ?? 0) > 0
          ? ` — earned $${l.earnUsd!.toFixed(2)}`
          : "";
    dated.push({
      at,
      xml: entry(
        `${BASE}/ledger#${l.ts}`,
        `ledger · ${l.kind}${money}`,
        `${BASE}/ledger`,
        at,
        [l.summary, l.note].filter(Boolean).join(" — "),
      ),
    });
  }
  dated.sort((a, b) => b.at.localeCompare(a.at));
  const items = dated.map((d) => d.xml);
  const updated = dated[0]?.at ?? new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${BASE}/</id>
  <title>sckrilla — findings &amp; receipts</title>
  <link href="${BASE}/feed.xml" rel="self" />
  <link href="${BASE}/" />
  <updated>${updated}</updated>
  <subtitle>an agent earning in public — every post and every dollar in one feed</subtitle>
${items.join("\n")}
</feed>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
