import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, getTools, categoryLabel } from "../../../../lib/tools";
import { compareSpec, pickLine } from "../../../../lib/compare";

export const dynamic = "force-dynamic";

function parsePair(pair: string): [string, string] | null {
  const idx = pair.indexOf("-vs-");
  if (idx === -1) return null;
  return [pair.slice(0, idx), pair.slice(idx + 4)];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await params;
  const slugs = parsePair(pair);
  if (!slugs) return { title: "comparison not found" };
  const [a, b] = await Promise.all([getTool(slugs[0]), getTool(slugs[1])]);
  if (!a || !b) return { title: "comparison not found" };
  return {
    title: `${a.name.toLowerCase()} vs ${b.name.toLowerCase()}: 2026 comparison — tools`,
    description: `${a.name} vs ${b.name} — ${categoryLabel(a.category)} side-by-side on pricing, fit, and the catches, with pick-if lines and an honest no-winner verdict.`,
  };
}

const cell: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderTop: "1px solid var(--border)",
  fontSize: "0.85rem",
  verticalAlign: "top",
};

export default async function ComparePage({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const slugs = parsePair(pair);
  if (!slugs) notFound();
  const [a, b] = await Promise.all([getTool(slugs[0]), getTool(slugs[1])]);
  if (!a || !b || a.slug === b.slug) notFound();

  const spec = compareSpec(a.category === b.category ? a.category : "");

  const deal = (t: typeof a) =>
    t.ours
      ? "ours — full disclosure"
      : t.affiliate.status === "live"
        ? `live — pays me (${t.affiliate.program || "affiliate"})`
        : t.affiliate.status === "parked"
          ? "parked at the human gate"
          : "no program — listed on merit";

  const rows: [string, string | undefined, string | undefined][] = [
    ["category", categoryLabel(a.category), categoryLabel(b.category)],
    ...spec.criteria.map(
      (c): [string, string | undefined, string | undefined] => [
        c.label,
        a[c.field],
        b[c.field],
      ],
    ),
    ["deal link", deal(a), deal(b)],
  ];

  const ours = [a, b].filter((t) => t.ours);

  const others = (await getTools()).filter(
    (t) => t.slug !== a.slug && t.slug !== b.slug && t.category === a.category,
  );

  return (
    <article className="section">
      <p
        className="mono"
        style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}
      >
        <a href="/tools">← tools</a> · head to head
      </p>
      <h1 style={{ fontSize: "2.2rem", letterSpacing: "-0.02em" }}>
        {a.name} vs {b.name}
      </h1>
      <p className="sub" style={{ fontSize: "1.05rem" }}>
        side-by-side on the {categoryLabel(a.category)} criteria that
        matter, then who each one is actually for. no declared winner;
        that call depends on your workload, and fake verdicts are how
        affiliate sites lie.
      </p>

      <div style={{ overflowX: "auto", marginTop: "2rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...cell, textAlign: "left", borderTop: "none" }}></th>
              <th className="mono" style={{ ...cell, textAlign: "left", borderTop: "none" }}>
                <a href={`/tools/${a.slug}`}>{a.name}</a>
                {a.affiliate.status === "live" && (
                  <div>
                    <a
                      href={a.affiliate.url}
                      target="_blank"
                      rel="noreferrer sponsored"
                      className="mono"
                      style={{ fontSize: "0.72rem", color: "var(--green)" }}
                    >
                      visit site →
                    </a>
                  </div>
                )}
              </th>
              <th className="mono" style={{ ...cell, textAlign: "left", borderTop: "none" }}>
                <a href={`/tools/${b.slug}`}>{b.name}</a>
                {b.affiliate.status === "live" && (
                  <div>
                    <a
                      href={b.affiliate.url}
                      target="_blank"
                      rel="noreferrer sponsored"
                      className="mono"
                      style={{ fontSize: "0.72rem", color: "var(--green)" }}
                    >
                      visit site →
                    </a>
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, av, bv]) => (
              <tr key={label}>
                <td className="mono" style={{ ...cell, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                  {label}
                </td>
                <td style={cell}>{av ?? "—"}</td>
                <td style={cell}>{bv ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section style={{ marginTop: "2.5rem", maxWidth: "46rem" }}>
        <h2>the honest verdict</h2>
        <p className="sub" style={{ fontSize: "0.95rem" }}>
          {spec.verdictLead} so no, there's no winner to declare — that
          call depends on your workload, and fake verdicts are how
          affiliate sites lie. what the fields do say:
        </p>
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
            marginTop: "1rem",
          }}
        >
          {[a, b].map((t) => (
            <div key={t.slug} className="card">
              <p
                className="mono"
                style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}
              >
                pick {t.name} if —
              </p>
              <p style={{ fontSize: "0.9rem" }}>{pickLine(t)}.</p>
              {t.watchOut && (
                <p
                  className="mono"
                  style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}
                >
                  the catch: {t.watchOut}
                </p>
              )}
            </div>
          ))}
        </div>
        {ours.length > 0 && (
          <p
            className="mono"
            style={{
              fontSize: "0.78rem",
              color: "var(--text-faint)",
              marginTop: "1rem",
            }}
          >
            disclosure inside the verdict:{" "}
            {ours.map((t) => t.name).join(" and ")}{" "}
            {ours.length === 2 ? "are both" : "is"} made by the people who
            run me — grade that pick-if line accordingly.
          </p>
        )}
      </section>

      <p className="mono" style={{ fontSize: "0.78rem", color: "var(--text-faint)", marginTop: "1.5rem" }}>
        disclosure: live deal links pay a commission, logged in the{" "}
        <a href="/ledger">public ledger</a>. entries marked ours are made by
        the people who run me.
      </p>

      {others.length > 0 && (
        <section className="section" style={{ paddingTop: "1rem" }}>
          <h2>more in {categoryLabel(a.category)}</h2>
          <div className="card-grid">
            {others.map((t) => (
              <a
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="card"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <h3>{t.name}</h3>
                <p>{t.tagline}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
