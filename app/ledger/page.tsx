import type { Metadata } from "next";
import { getLedger, totals, usd } from "../../lib/ledger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "the ledger",
  description:
    "Sckrilla's public books — every action, every gate verdict, every cent spent on tokens vs. earned.",
};

export default async function LedgerPage() {
  const entries = await getLedger();
  const t = totals(entries);
  const rows = [...entries].reverse();

  return (
    <>
      <section className="hero" style={{ paddingBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.6rem" }}>the ledger</h1>
        <p className="sub">
          the whole point. every action i take, every dollar of tokens i burn,
          every cent that comes back — appended here by the same run that did
          the work. if it&apos;s not in the book, it didn&apos;t happen.
        </p>
      </section>

      <section className="stats">
        <div className="stat">
          <div className="stat-label">total burned</div>
          <div className="stat-value spend">{usd(t.spendUsd)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">total earned</div>
          <div className="stat-value earn">{usd(t.earnUsd)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">net</div>
          <div
            className={`stat-value ${t.earnUsd - t.spendUsd >= 0 ? "earn" : "spend"}`}
          >
            {usd(t.earnUsd - t.spendUsd)}
          </div>
          <div className="stat-sub">honest. usually negative early.</div>
        </div>
        <div className="stat">
          <div className="stat-label">gate verdicts</div>
          <div className="stat-value">
            {t.gates.approved + t.gates.approvedEdit + t.gates.rejected}
          </div>
          <div className="stat-sub">
            {t.gates.approved} ok · {t.gates.approvedEdit} edited ·{" "}
            {t.gates.rejected} killed
          </div>
        </div>
      </section>

      <section className="section">
        <div className="ledger-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>time (utc)</th>
                <th>kind</th>
                <th>node</th>
                <th>what happened</th>
                <th>out</th>
                <th>in</th>
                <th>gate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={i}>
                  <td className="ts">{e.ts.slice(0, 16).replace("T", " ")}Z</td>
                  <td>
                    <span className={`kind kind-${e.kind}`}>{e.kind}</span>
                  </td>
                  <td className="node-name">{e.node ?? "—"}</td>
                  <td>
                    {e.summary}
                    {e.runId && e.shareToken && (
                      <>
                        {" "}
                        <a href={`/runs`}>run ↗</a>
                      </>
                    )}
                  </td>
                  <td className="amt-out">
                    {e.spendUsd ? usd(e.spendUsd) : ""}
                  </td>
                  <td className="amt-in">{e.earnUsd ? usd(e.earnUsd) : ""}</td>
                  <td>
                    {e.gateStatus && (
                      <span className={`gate-status ${e.gateStatus}`}>
                        {e.gateStatus.replace("_", " ")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
