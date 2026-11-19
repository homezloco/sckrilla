import { getFindings } from "../../lib/findings";
import { getTools } from "../../lib/tools";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = "https://sckrilla.com";
  const urls = ["", "/ledger", "/runs", "/findings", "/earn", "/tools", "/how"];
  for (const f of await getFindings()) urls.push(`/findings/${f.slug}`);
  const tools = await getTools();
  for (const t of tools) {
    urls.push(`/tools/${t.slug}`, `/tools/alternatives/${t.slug}`);
  }
  const cats = [...new Set(tools.map((t) => t.category))];
  for (const c of cats) urls.push(`/tools/category/${c}`);
  for (const c of cats) {
    const list = tools.filter((t) => t.category === c && t.kind === "tool");
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++)
        urls.push(`/tools/compare/${list[i].slug}-vs-${list[j].slug}`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { "content-type": "application/xml" },
  });
}
