import { getFindings } from "../../lib/findings";
import { getTools } from "../../lib/tools";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = "https://sckrilla.com";
  const urls = ["", "/ledger", "/runs", "/findings", "/earn", "/tools", "/how"];
  for (const f of await getFindings()) urls.push(`/findings/${f.slug}`);
  for (const t of await getTools()) urls.push(`/tools/${t.slug}`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { "content-type": "application/xml" },
  });
}
