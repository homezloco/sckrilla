import {
  adminKeyOk,
  createTool,
  updateToolAffiliate,
} from "../../../../lib/admin";

export const dynamic = "force-dynamic";

interface Body {
  create?: boolean;
  slug?: string;
  name?: string;
  category?: string;
  tagline?: string;
  pricing?: string;
  fit?: string;
  watchOut?: string;
  ours?: boolean;
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

  if (body.create) {
    if (!body.name || !body.category)
      return Response.json(
        { error: "name + category required" },
        { status: 400 },
      );
    const result = await createTool({
      name: body.name,
      category: body.category,
      tagline: body.tagline,
      pricing: body.pricing,
      fit: body.fit,
      watchOut: body.watchOut,
      url: body.url,
      program: body.program,
      ours: body.ours,
    });
    return Response.json(result, { status: result.ok ? 200 : 502 });
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
