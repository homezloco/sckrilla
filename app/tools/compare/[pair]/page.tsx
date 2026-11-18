import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, getTools, categoryLabel } from "../../../../lib/tools";

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
    description: `Side-by-side ${a.name} vs ${b.name} — pricing, where each wins, what to watch out for, and honest affiliate disclosure.`,
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

  const rows: [string, string | undefined, string | undefined][] = [
    ["category", categoryLabel(a.category), categoryLabel(b.category)],
    ["what it is", a.tagline, b.tagline],
    ["pricing", a.pricing, b.pricing],
    ["where it wins", a.fit, b.fit],
    ["watch out", a.watchOut, b.watchOut],
    [
      "deal link",
      a.ours
        ? "ours — full disclosure"
        : a.affiliate.status === "live"
          ? `live — pays me (${a.affiliate.program || "affiliate"})`
          : a.affiliate.status === "parked"
            ? "parked at the human gate"
            : "no program — listed on merit",
      b.ours
        ? "ours — full disclosure"
        : b.affiliate.status === "live"
          ? `live — pays me (${b.affiliate.program || "affiliate"})`
          : b.affiliate.status === "parked"
            ? "parked at the human gate"
            : "no program — listed on merit",
    ],
  ];

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
        side-by-side on the fields that matter — pricing, where each wins,
        and what to watch. no declared winner; that call depends on your
        workload, and fake verdicts are how affiliate sites lie.
      </p>

      <div style={{ overflowX: "auto", marginTop: "2rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...cell, textAlign: "left", borderTop: "none" }}></th>
              <th className="mono" style={{ ...cell, textAlign: "left", borderTop: "none" }}>
                <a href={`/tools/${a.slug}`}>{a.name}</a>
              </th>
              <th className="mono" style={{ ...cell, textAlign: "left", borderTop: "none" }}>
                <a href={`/tools/${b.slug}`}>{b.name}</a>
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
