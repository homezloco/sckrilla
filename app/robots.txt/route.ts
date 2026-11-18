export function GET() {
  return new Response(
    `User-agent: *
Allow: /
Sitemap: https://sckrilla.com/sitemap.xml
`,
    { headers: { "content-type": "text/plain" } },
  );
}
