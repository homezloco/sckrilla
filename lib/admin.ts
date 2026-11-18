import type { ToolEntry } from "./tools";

/** Worker secrets — set via `cf workers secrets update <name>`. */
export function adminKeyOk(request: Request): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return false;
  const url = new URL(request.url);
  const given =
    url.searchParams.get("key") ?? request.headers.get("x-admin-key") ?? "";
  return given.length > 0 && given === expected;
}

const REPO = "homezloco/sckrilla";
const TOOLS_PATH = "data/tools.json";

interface ContentsResponse {
  sha: string;
  content: string;
}

/**
 * The human gate, with a UI: writes data/tools.json straight to main via
 * the Contents API. A person flipping a deal link IS the gate — no PR,
 * the commit itself is the audit trail on a public repo.
 */
export async function updateToolAffiliate(
  slug: string,
  url: string,
  status: ToolEntry["affiliate"]["status"],
  program?: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) return { ok: false, error: "GITHUB_ADMIN_TOKEN not set" };

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "sckrilla-admin",
  };
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${TOOLS_PATH}?ref=main`,
    { headers },
  );
  if (!getRes.ok)
    return { ok: false, error: `github read ${getRes.status}` };
  const file = (await getRes.json()) as ContentsResponse;
  const tools = JSON.parse(
    atob(file.content.replace(/\n/g, "")),
  ) as ToolEntry[];

  const idx = tools.findIndex((t) => t.slug === slug);
  if (idx === -1) return { ok: false, error: `no tool ${slug}` };
  tools[idx].affiliate = {
    status,
    url,
    ...(program ? { program } : {}),
  };
  tools[idx].updated = new Date().toISOString().slice(0, 10);

  const putRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${TOOLS_PATH}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `admin: ${slug} affiliate ${status}${program ? ` (${program})` : ""}`,
        content: btoa(JSON.stringify(tools, null, 2) + "\n"),
        sha: file.sha,
        branch: "main",
      }),
    },
  );
  if (!putRes.ok)
    return { ok: false, error: `github write ${putRes.status}` };
  return { ok: true };
}
