import { adminKeyOk, updateToolAffiliate } from "../../../../lib/admin";

export const dynamic = "force-dynamic";

interface Body {
  slug?: string;
  url?: string;
  status?: "live" | "parked" | "na";
  program?: string;
}

export async function POST(request: Request) {
  if (!adminKeyOk(request))
    return Response.json({ error: "unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.slug || !body.status || !["live", "parked", "na"].includes(body.status))
    return Response.json({ error: "slug + valid status required" }, { status: 400 });
  if (body.status === "live" && !body.url)
    return Response.json({ error: "live status needs a url" }, { status: 400 });

  const result = await updateToolAffiliate(
    body.slug,
    body.url ?? "",
    body.status,
    body.program,
  );
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
