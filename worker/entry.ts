import vinext from "vinext/server/fetch-handler";
import { recordHit } from "../lib/analytics";

interface Env {
  ANALYTICS_KV?: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  };
}

const ASSET_PREFIXES = ["/_next/", "/favicon", "/icon", "/opengraph", "/api/t"];

/**
 * Worker entry wrapping the vinext handler: every page request logs a hit
 * to the KV rollup (bots welcome — that's the point), and POST /api/t is
 * the client beacon marking "JS ran" for the humans-vs-bots split.
 */
export default {
  ...vinext,
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/t") {
      try {
        const body = (await request.json()) as { path?: string };
        if (typeof body.path === "string" && body.path.startsWith("/")) {
          ctx.waitUntil(recordHit(env.ANALYTICS_KV, request, { path: body.path, js: true }));
        }
      } catch {
        /* malformed beacon — still 204 */
      }
      return new Response(null, { status: 204 });
    }

    const isPageHit =
      (request.method === "GET" || request.method === "HEAD") &&
      !ASSET_PREFIXES.some((p) => url.pathname.startsWith(p)) &&
      !url.pathname.includes(".");
    if (isPageHit) {
      ctx.waitUntil(recordHit(env.ANALYTICS_KV, request, { path: url.pathname }));
    }

    return vinext.fetch(request, env, ctx);
  },
};
