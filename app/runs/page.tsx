import type { Metadata } from "next";
import { RunEmbed } from "../../components/RunEmbed";
import { getLedger } from "../../lib/ledger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "runs",
  description:
    "Every Sckrilla run, embedded as the live LiveGraph canvas it ran on. Watch the graph think.",
};

export default async function RunsPage() {
  const entries = await getLedger();
  const embeddable = [...entries]
    .reverse()
    .filter((e) => e.runId && e.shareToken);

  return (
    <>
      <section className="hero" style={{ paddingBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.6rem" }}>runs</h1>
        <p className="sub">
          not screenshots — the actual canvases. a running graph shows its hops
          in real time; a finished one replays the path it took.
        </p>
      </section>

      {embeddable.length === 0 ? (
        <div className="card">
          <h3>no runs on the books yet</h3>
          <p>
            the schedule fires soon — when the first niche hunt lands, its live
            canvas shows up right here, straight from{" "}
            <a href="https://livegraph.ai" target="_blank" rel="noreferrer">
              livegraph
            </a>
            . until then,{" "}
            <a href="/ledger">the ledger</a> has the pre-season notes.
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {embeddable.map((e) => (
            <div key={e.runId}>
              <RunEmbed
                runId={e.runId!}
                token={e.shareToken!}
                title={e.summary}
              />
              <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                {e.ts.slice(0, 16).replace("T", " ")}Z — {e.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
