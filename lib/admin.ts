import type { LedgerEntry } from "./ledger";
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
const LEDGER_PATH = "data/ledger.jsonl";

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

/** utf-8 safe — the ledger has em-dashes, plain btoa/atob would mangle them. */
function toBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * The generic Contents API pair everything on this file rides: read a file
 * on main, write it back with its sha. The commit itself is the audit trail
 * on a public repo.
 */
async function readContents(
  token: string,
  path: string,
): Promise<{ content: string; sha: string } | { error: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}?ref=main`,
    { headers: ghHeaders(token) },
  );
  if (!res.ok) return { error: `github read ${res.status}` };
  const file = (await res.json()) as ContentsResponse;
  return { content: fromBase64(file.content), sha: file.sha };
}

async function writeContents(
  token: string,
  path: string,
  content: string,
  sha: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: ghHeaders(token),
      body: JSON.stringify({
        message,
        content: toBase64(content),
        sha,
        branch: "main",
      }),
    },
  );
  if (!res.ok) return { ok: false, error: `github write ${res.status}` };
  return { ok: true };
}

async function readTools(
  token: string,
): Promise<{ tools: ToolEntry[]; sha: string } | { error: string }> {
  const got = await readContents(token, TOOLS_PATH);
  if ("error" in got) return got;
  return { tools: JSON.parse(got.content) as ToolEntry[], sha: got.sha };
}

/**
 * The human gate, with a UI: writes data/tools.json straight to main via
 * the Contents API. A person flipping a deal link IS the gate — no PR,
 * the commit itself is the audit trail on a public repo.
 */
function writeTools(
  token: string,
  sha: string,
  tools: ToolEntry[],
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  return writeContents(
    token,
    TOOLS_PATH,
    JSON.stringify(tools, null, 2) + "\n",
    sha,
    message,
  );
}

/**
 * The books writing themselves: append one JSONL line to data/ledger.jsonl
 * on main. One retry on the sha race (two earn events landing at once)
 * before giving up honest — the caller's 500 is what pulls Stripe's retry.
 */
export async function appendLedgerLine(
  line: LedgerEntry,
  commitMessage = "ledger: earn via stripe webhook",
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) return { ok: false, error: "GITHUB_ADMIN_TOKEN not set" };

  const encoded = JSON.stringify(line);
  for (let attempt = 0; attempt < 2; attempt++) {
    const got = await readContents(token, LEDGER_PATH);
    if ("error" in got) return { ok: false, error: got.error };
    const body = got.content.endsWith("\n")
      ? got.content + encoded + "\n"
      : got.content + "\n" + encoded + "\n";
    const res = await writeContents(
      token,
      LEDGER_PATH,
      body,
      got.sha,
      commitMessage,
    );
    if (res.ok) return res;
    // the sha only moves under a concurrent write — anything else is real
    if (!/409|422/.test(res.error ?? "")) return res;
  }
  return { ok: false, error: "github write conflict" };
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
