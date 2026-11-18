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

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "sckrilla-admin",
  };
}

async function readTools(
  token: string,
): Promise<{ tools: ToolEntry[]; sha: string } | { error: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${TOOLS_PATH}?ref=main`,
    { headers: ghHeaders(token) },
  );
  if (!res.ok) return { error: `github read ${res.status}` };
  const file = (await res.json()) as ContentsResponse;
  const tools = JSON.parse(
    atob(file.content.replace(/\n/g, "")),
  ) as ToolEntry[];
  return { tools, sha: file.sha };
}

/**
 * The human gate, with a UI: writes data/tools.json straight to main via
 * the Contents API. A person flipping a deal link IS the gate — no PR,
 * the commit itself is the audit trail on a public repo.
 */
async function writeTools(
  token: string,
  sha: string,
  tools: ToolEntry[],
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${TOOLS_PATH}`,
    {
      method: "PUT",
      headers: ghHeaders(token),
      body: JSON.stringify({
        message,
        content: btoa(JSON.stringify(tools, null, 2) + "\n"),
        sha,
        branch: "main",
      }),
    },
  );
  if (!res.ok) return { ok: false, error: `github write ${res.status}` };
  return { ok: true };
}

export async function updateToolAffiliate(
  slug: string,
  url: string,
  status: ToolEntry["affiliate"]["status"],
  program?: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) return { ok: false, error: "GITHUB_ADMIN_TOKEN not set" };

  const got = await readTools(token);
  if ("error" in got) return { ok: false, error: got.error };
  const { tools, sha } = got;

  const idx = tools.findIndex((t) => t.slug === slug);
  if (idx === -1) return { ok: false, error: `no tool ${slug}` };
  tools[idx].affiliate = {
    status,
    url,
    ...(program ? { program } : {}),
  };
  tools[idx].updated = new Date().toISOString().slice(0, 10);

  return writeTools(
    token,
    sha,
    tools,
    `admin: ${slug} affiliate ${status}${program ? ` (${program})` : ""}`,
  );
}

export interface NewToolInput {
  name: string;
  category: string;
  tagline?: string;
  pricing?: string;
  fit?: string;
  watchOut?: string;
  url?: string;
  program?: string;
  ours?: boolean;
}

/** Create a directory entry — slug derived from name, deduped with -2/-3. */
export async function createTool(
  input: NewToolInput,
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) return { ok: false, error: "GITHUB_ADMIN_TOKEN not set" };

  const got = await readTools(token);
  if ("error" in got) return { ok: false, error: got.error };
  const { tools, sha } = got;

  const base = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!base) return { ok: false, error: "bad name" };
  let slug = base;
  for (let n = 2; tools.some((t) => t.slug === slug); n++)
    slug = `${base}-${n}`;

  const status = input.ours ? "na" : input.url ? "live" : "parked";
  tools.push({
    slug,
    name: input.name,
    kind: "tool",
    category: input.category,
    tagline: input.tagline || input.name,
    ...(input.pricing ? { pricing: input.pricing } : {}),
    ...(input.fit ? { fit: input.fit } : {}),
    ...(input.watchOut ? { watchOut: input.watchOut } : {}),
    affiliate: {
      status,
      url: input.url ?? "",
      ...(input.program ? { program: input.program } : {}),
    },
    ...(input.ours ? { ours: true } : {}),
    updated: new Date().toISOString().slice(0, 10),
  });

  const res = await writeTools(
    token,
    sha,
    tools,
    `admin: add ${slug}${input.url ? " (affiliate live)" : ""}`,
  );
  return { ...res, slug };
}
