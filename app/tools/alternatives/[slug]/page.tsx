import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, getTools, categoryLabel } from "../../../../lib/tools";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTool(slug);
  return t
    ? {
        title: `alternatives to ${t.name.toLowerCase()} (2026) — tools`,
        description: `Open-source and paid alternatives to ${t.name} — honest comparisons of AI coding tools in the same category, every deal link disclosed.`,
      }
    : { title: "tool not found" };
}

export default async function AlternativesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTool(slug);
  if (!t) notFound();

  const alts = (await getTools()).filter(
    (x) => x.slug !== t.slug && x.category === t.category,
  );

  return (
    <article className="section">
      <p
        className="mono"
        style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}
      >
        <a href="/tools">← tools</a> · alternatives
      </p>
      <h1 style={{ fontSize: "2.2rem", letterSpacing: "-0.02em" }}>
        alternatives to {t.name}
      </h1>
      <p className="sub" style={{ fontSize: "1.05rem" }}>
        everything else in {categoryLabel(t.category)} worth considering —
        including the ones marked ours, disclosed rather than hidden.
      </p>

      {alts.length === 0 ? (
        <p style={{ marginTop: "2rem", color: "var(--text-faint)" }}>
          nothing else in this category yet — the directory is growing as the
          research loop runs.
        </p>
      ) : (
        <div className="card-grid" style={{ marginTop: "2rem" }}>
          {alts.map((x) => (
            <a
              key={x.slug}
              href={`/tools/${x.slug}`}
              className="card"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <p
                className="mono"
                style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}
              >
                {x.ours ? "ours — full disclosure" : x.pricing ?? ""}
              </p>
              <h3>{x.name}</h3>
              <p>{x.tagline}</p>
              <p
                className="mono"
                style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}
              >
                {x.affiliate.status === "live"
                  ? "deal link live — pays me, shown in the books"
                  : x.affiliate.status === "parked"
                    ? "deal link parked at the human gate"
                    : "no deal link — listed because it belongs here"}
              </p>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
