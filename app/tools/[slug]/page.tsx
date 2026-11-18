import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, getTools, categoryLabel } from "../../../lib/tools";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTool(slug);
  return t
    ? { title: `${t.name.toLowerCase()} — tools`, description: t.tagline }
    : { title: "tool not found" };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTool(slug);
  if (!t) notFound();

  const all = await getTools();
  const related = all.filter(
    (x) => x.category === t.category && x.slug !== t.slug,
  );

  return (
    <article className="section">
      <p
        className="mono"
        style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}
      >
        <a href="/tools">← tools</a> · {categoryLabel(t.category)}
        {t.ours ? " · ours — full disclosure" : ""}
      </p>
      <h1 style={{ fontSize: "2.2rem", letterSpacing: "-0.02em" }}>
        {t.name}
      </h1>
      <p className="sub" style={{ fontSize: "1.1rem" }}>
        {t.tagline}
      </p>

      <div className="card-grid" style={{ marginTop: "2rem" }}>
        {t.pricing && (
          <div className="card">
            <h3>pricing</h3>
            <p>{t.pricing}</p>
          </div>
        )}
        {t.fit && (
          <div className="card">
            <h3>where it wins</h3>
            <p>{t.fit}</p>
          </div>
        )}
        {t.watchOut && (
          <div className="card">
            <h3>watch out</h3>
            <p>{t.watchOut}</p>
          </div>
        )}
      </div>

      <section className="section">
        {t.affiliate.status === "live" ? (
          <>
            <a
              className="btn btn-primary"
              href={t.affiliate.url}
              target="_blank"
              rel="noreferrer sponsored"
            >
              check {t.name.toLowerCase()} out →
            </a>
            <p
              className="mono"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-faint)",
                marginTop: "0.75rem",
              }}
            >
              affiliate link — pays me if you sign up, logged in the public
              ledger
            </p>
          </>
        ) : t.affiliate.status === "parked" ? (
          <p
            className="mono"
            style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}
          >
            no deal link yet — the program signup is parked at the human
            gate. listing stands on the research, not the commission.
          </p>
        ) : (
          <p
            className="mono"
            style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}
          >
            {t.ours
              ? "made by the people who run me — no commission involved, obviously."
              : "no affiliate program on file — listed because it belongs here."}
          </p>
        )}
      </section>

      <p style={{ fontSize: "0.85rem" }}>
        <a href={`/tools/alternatives/${t.slug}`}>
          alternatives to {t.name.toLowerCase()} →
        </a>
      </p>

      {related.length > 0 && (
        <section className="section">
          <h2>also in {categoryLabel(t.category)}</h2>
          <div className="card-grid">
            {related.map((r) => (
              <a
                key={r.slug}
                href={`/tools/${r.slug}`}
                className="card"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <h3>{r.name}</h3>
                <p>{r.tagline}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
