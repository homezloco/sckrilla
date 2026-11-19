import { env } from "cloudflare:workers";
import { appendLedgerLine } from "../../../../lib/admin";
import type { LedgerEntry, LedgerKind } from "../../../../lib/ledger";

export const dynamic = "force-dynamic";

/**
 * POST /api/livegraph/webhook — anna's graph calls this the moment it
 * actually does something (posts, sends, applies), and the receipt writes
 * itself instead of depending on someone remembering to hand-edit
 * data/ledger.jsonl. Mirrors the stripe webhook's shape.
 *
 * operator steps (one-time):
 *   cf workers secrets update LIVEGRAPH_WEBHOOK_SECRET   # own secret, not ADMIN_KEY
 *   point anna's graph at sckrilla.com/api/livegraph/webhook with header
 *   x-livegraph-secret: <same value>
 *
 * money kinds (spend/earn) are refused on purpose — earn is the stripe
 * webhook's job, spend reconciliation is g-0019's GHA cron. this endpoint
 * only ever claims "a gated action happened," never a dollar figure, so a
 * compromised or buggy caller can spam research lines but can't fake money.
 */

const ALLOWED_KINDS: LedgerKind[] = ["gate", "publish", "research", "steer"];
const GATE_STATUSES = ["parked", "approved", "approved_edit", "rejected"];
const DEDUPE_TTL_S = 60 * 60 * 24 * 7;

interface WebhookBody {
  kind?: string;
  summary?: string;
  node?: string;
  note?: string;
  runId?: string;
  shareToken?: string;
  gateStatus?: string;
  dedupeKey?: string;
}

interface KvEnv {
  ANALYTICS_KV?: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  };
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.LIVEGRAPH_WEBHOOK_SECRET;
  if (!secret)
    return Response.json({ error: "webhook not configured" }, { status: 503 });

  const given = request.headers.get("x-livegraph-secret") ?? "";
  if (!given || given !== secret)
    return Response.json({ error: "unauthorized" }, { status: 401 });

  let body: WebhookBody;
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }

  const kind = body.kind as LedgerKind | undefined;
  if (!kind || !ALLOWED_KINDS.includes(kind)) {
    return Response.json(
      {
        error: `kind must be one of ${ALLOWED_KINDS.join("/")} — earn comes from the stripe webhook, spend from the reconcile cron, not here`,
      },
      { status: 400 },
    );
  }

  const summary = body.summary?.trim().slice(0, 500);
  if (!summary) return Response.json({ error: "summary required" }, { status: 400 });

  if (body.gateStatus && !GATE_STATUSES.includes(body.gateStatus))
    return Response.json({ error: "bad gateStatus" }, { status: 400 });

  const kv = (env as unknown as KvEnv).ANALYTICS_KV;
  if (body.dedupeKey && kv) {
    const dedupeKey = `lgwebhook:${body.dedupeKey}`;
    try {
      if (await kv.get(dedupeKey))
        return Response.json({ ok: true, deduped: true });
      await kv.put(dedupeKey, "1", { expirationTtl: DEDUPE_TTL_S });
    } catch {
      console.warn("livegraph webhook: kv dedupe failed, processing anyway");
    }
  }

  const entry: LedgerEntry = {
    ts: new Date().toISOString(),
    kind,
    summary,
    note: body.note?.slice(0, 60) || "anna",
    ...(body.node ? { node: body.node.slice(0, 80) } : {}),
    ...(body.runId ? { runId: body.runId.slice(0, 80) } : {}),
    ...(body.shareToken ? { shareToken: body.shareToken.slice(0, 200) } : {}),
    ...(body.gateStatus
      ? { gateStatus: body.gateStatus as LedgerEntry["gateStatus"] }
      : {}),
  };

  const wrote = await appendLedgerLine(entry, `ledger: ${kind} via livegraph webhook — ${summary.slice(0, 60)}`);
  if (!wrote.ok) {
    console.error(`livegraph webhook: ledger write failed — ${wrote.error}`);
    return Response.json({ error: wrote.error }, { status: 500 });
  }

  console.log(`livegraph webhook: ledgered — ${summary}`);
  return Response.json({ ok: true, ledgered: true });
}

const methodNotAllowed = (): Response =>
  Response.json(
    { error: "post only" },
    { status: 405, headers: { Allow: "POST" } },
  );

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
