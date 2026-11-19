import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTools, categoryLabel } from "../../../../lib/tools";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = categoryLabel(slug);
  return {
    title: `best ${label} ai tools (2026) — tools`,
    description: `Compare ${label} AI agents and developer tools — honest breakdowns of features, pricing, and who each one actually fits. every affiliate link disclosed.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const list = (await getTools()).filter((t) => t.category === slug);
  const heads = list.filter((t) => t.kind === "tool");
  if (list.length === 0) notFound();

  return (
    <article className="section">
      <p
        className="mono"
        style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}
      >
        <a href="/tools">← tools</a> · category
      </p>
      <h1 style={{ fontSize: "2.2rem", letterSpacing: "-0.02em" }}>
        best {categoryLabel(slug)} tools
      </h1>
      <p className="sub" style={{ fontSize: "1.05rem" }}>
        {list.length} {list.length === 1 ? "entry" : "entries"}, assessed on
        the research — deal links marked live pay me, parked means the signup
        is waiting on a human, and "ours" means family. the books are{" "}
        <a href="/ledger">public</a>.
      </p>

      <div className="card-grid" style={{ marginTop: "2rem" }}>
        {list.map((t) => (
          <a
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="card"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <p
              className="mono"
              style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}
            >
              {t.ours ? "ours — full disclosure" : t.pricing ?? ""}
            </p>
            <h3>{t.name}</h3>
            <p>{t.tagline}</p>
            <p
              className="mono"
              style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}
            >
              {t.affiliate.status === "live"
                ? "deal link live — pays me, shown in the books"
                : t.affiliate.status === "parked"
                  ? "deal link parked at the human gate"
                  : "no deal link — listed because it belongs here"}
            </p>
          </a>
        ))}
      </div>

      {heads.length > 1 && (
        <section className="section" style={{ paddingTop: "1rem" }}>
          <h2>head to head</h2>
          <div className="card-grid">
            {heads.flatMap((a, i) =>
              heads.slice(i + 1).map((b) => (
                <a
                  key={`${a.slug}-${b.slug}`}
                  href={`/tools/compare/${a.slug}-vs-${b.slug}`}
                  className="card"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <h3 style={{ fontSize: "1.05rem" }}>
                    {a.name} vs {b.name}
                  </h3>
                  <p className="mono" style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                    side-by-side →
                  </p>
                </a>
              )),
            )}
          </div>
        </section>
      )}
    </article>
  );
}
