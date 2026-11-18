"use client";

import { useState } from "react";

interface ToolRow {
  slug: string;
  name: string;
  status: "live" | "parked" | "na";
  url: string;
  program: string;
  ours: boolean;
}

interface RunRow {
  id: string;
  status: string;
  at?: string;
}

interface Analytics {
  days: number;
  totals: { views: number; uniques: number; jsRan: number; bots: number; humans: number };
  byDay: { date: string; views: number; uniques: number; bots: number }[];
  paths: [string, number][];
  referrers: [string, number][];
  sources: [string, number][];
  browsers: [string, number][];
  devices: [string, number][];
  countries: [string, number][];
}

interface State {
  tools: ToolRow[];
  ledger: {
    spendUsd: number;
    earnUsd: number;
    runs: number;
    gates: { parked: number; approved: number; approvedEdit: number; rejected: number; humanTouched: number };
  };
  runs: RunRow[] | null;
  queue: { open: string[] } | null;
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [state, setState] = useState<State | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { url: string; program: string }>>({});

  async function load(k: string) {
    const res = await fetch(`/api/admin/state?key=${encodeURIComponent(k)}`);
    if (!res.ok) {
      setError(res.status === 401 ? "wrong key" : `load failed: ${res.status}`);
      setState(null);
      return;
    }
    setError("");
    const data = (await res.json()) as State;
    setState(data);
    fetch(`/api/admin/analytics?key=${encodeURIComponent(k)}&days=14`)
      .then((r) => (r.ok ? r.json() : null))
      .then((a) => setAnalytics(a as Analytics | null))
      .catch(() => {});
    setDrafts(
      Object.fromEntries(
        data.tools.map((t) => [t.slug, { url: t.url, program: t.program }]),
      ),
    );
  }

  async function save(slug: string, status: ToolRow["status"]) {
    setBusy(slug);
    const d = drafts[slug] ?? { url: "", program: "" };
    const res = await fetch("/api/admin/affiliate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ slug, url: d.url, program: d.program || undefined, status }),
    });
    setBusy(null);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(`${slug}: ${j.error ?? res.status}`);
      return;
    }
    setError("");
    await load(key);
  }

  return (
    <section className="section" style={{ maxWidth: "60rem" }}>
      <h1 style={{ fontSize: "2rem" }}>admin</h1>
      <p className="sub" style={{ fontSize: "0.9rem" }}>
        the human gate, with a ui. key checked server-side, deal links commit
        straight to the public repo — the git log is the audit trail.
      </p>

      {!state ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(key);
          }}
          style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}
        >
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="admin key"
            style={{
              flex: 1,
              maxWidth: "20rem",
              padding: "0.6rem 0.9rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              color: "var(--text)",
              fontFamily: "inherit",
            }}
          />
          <button className="btn btn-primary" type="submit">
            enter
          </button>
        </form>
      ) : (
        <>
          <div className="stats">
            <div>
              <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>spent</p>
              <strong>{usd(state.ledger.spendUsd)}</strong>
            </div>
            <div>
              <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>earned</p>
              <strong>{usd(state.ledger.earnUsd)}</strong>
            </div>
            <div>
              <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>runs</p>
              <strong>{state.ledger.runs}</strong>
            </div>
            <div>
              <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>gates touched</p>
              <strong>{state.ledger.gates.humanTouched}</strong>
            </div>
          </div>

          {analytics && (
            <>
              <h2>site traffic — last {analytics.days} days</h2>
              <div className="stats">
                <div>
                  <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>views</p>
                  <strong>{analytics.totals.views}</strong>
                </div>
                <div>
                  <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>unique visitors</p>
                  <strong>{analytics.totals.uniques}</strong>
                </div>
                <div>
                  <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>humans / bots</p>
                  <strong>
                    {analytics.totals.humans} / {analytics.totals.bots}
                  </strong>
                </div>
                <div>
                  <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>ran js</p>
                  <strong>{analytics.totals.jsRan}</strong>
                </div>
              </div>
              <div className="card-grid">
                <div className="card">
                  <h3>by day</h3>
                  <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                    <tbody>
                      {analytics.byDay.map((d) => (
                        <tr key={d.date}>
                          <td className="mono" style={{ padding: "0.2rem 0", color: "var(--text-faint)" }}>{d.date.slice(5)}</td>
                          <td style={{ textAlign: "right" }}>{d.views} views</td>
                          <td style={{ textAlign: "right", color: "var(--text-faint)" }}>{d.uniques} uniq</td>
                          <td style={{ textAlign: "right", color: "var(--text-faint)" }}>{d.bots} bots</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card">
                  <h3>top paths</h3>
                  <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                    <tbody>
                      {analytics.paths.map(([p, n]) => (
                        <tr key={p}>
                          <td className="mono" style={{ padding: "0.2rem 0" }}>{p}</td>
                          <td style={{ textAlign: "right", color: "var(--text-faint)" }}>{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card">
                  <h3>referrers</h3>
                  <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                    <tbody>
                      {analytics.referrers.length === 0 && (
                        <tr><td style={{ color: "var(--text-faint)" }}>none yet</td></tr>
                      )}
                      {analytics.referrers.map(([r, n]) => (
                        <tr key={r}>
                          <td className="mono" style={{ padding: "0.2rem 0" }}>{r}</td>
                          <td style={{ textAlign: "right", color: "var(--text-faint)" }}>{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h3 style={{ marginTop: "1rem" }}>sources</h3>
                  <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                    <tbody>
                      {(analytics.sources ?? []).length === 0 && (
                        <tr><td style={{ color: "var(--text-faint)" }}>none yet</td></tr>
                      )}
                      {(analytics.sources ?? []).map(([s, n]) => (
                        <tr key={s}>
                          <td className="mono" style={{ padding: "0.2rem 0" }}>{s}</td>
                          <td style={{ textAlign: "right", color: "var(--text-faint)" }}>{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card">
                  <h3>devices</h3>
                  <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                    <tbody>
                      {analytics.devices.map(([d, n]) => (
                        <tr key={d}>
                          <td className="mono" style={{ padding: "0.2rem 0" }}>{d}</td>
                          <td style={{ textAlign: "right", color: "var(--text-faint)" }}>{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h3 style={{ marginTop: "1rem" }}>browsers</h3>
                  <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                    <tbody>
                      {analytics.browsers.map(([b, n]) => (
                        <tr key={b}>
                          <td className="mono" style={{ padding: "0.2rem 0" }}>{b}</td>
                          <td style={{ textAlign: "right", color: "var(--text-faint)" }}>{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card">
                  <h3>countries</h3>
                  <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                    <tbody>
                      {analytics.countries.map(([c, n]) => (
                        <tr key={c}>
                          <td className="mono" style={{ padding: "0.2rem 0" }}>{c}</td>
                          <td style={{ textAlign: "right", color: "var(--text-faint)" }}>{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mono" style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>
                kv rollup · uniques = daily ip+ua hash · bots = ua match + cf verified category ·
                "ran js" = client beacon fired
              </p>
            </>
          )}

          <h2>deal links</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-faint)" }}>
            paste the affiliate url, hit go live — it commits to{" "}
            <code>data/tools.json</code> on main and the directory updates
            within a minute.
          </p>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {state.tools.map((t) => (
              <div
                key={t.slug}
                className="card"
                style={{ padding: "0.9rem 1rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.6rem",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ minWidth: "8rem" }}>
                    {t.name}
                    {t.ours && (
                      <span className="mono" style={{ fontSize: "0.65rem", color: "var(--text-faint)" }}> (ours)</span>
                    )}
                  </strong>
                  <span
                    className="mono"
                    style={{
                      fontSize: "0.7rem",
                      color:
                        t.status === "live" ? "var(--green)" : "var(--text-faint)",
                    }}
                  >
                    {t.status}
                  </span>
                  <input
                    type="url"
                    placeholder="affiliate url"
                    value={drafts[t.slug]?.url ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [t.slug]: { ...d[t.slug], url: e.target.value },
                      }))
                    }
                    style={{
                      flex: 1,
                      minWidth: "14rem",
                      padding: "0.45rem 0.7rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.4rem",
                      color: "var(--text)",
                      fontSize: "0.8rem",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="program"
                    value={drafts[t.slug]?.program ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [t.slug]: { ...d[t.slug], program: e.target.value },
                      }))
                    }
                    style={{
                      width: "9rem",
                      padding: "0.45rem 0.7rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.4rem",
                      color: "var(--text)",
                      fontSize: "0.8rem",
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ padding: "0.45rem 0.9rem", fontSize: "0.8rem" }}
                    disabled={busy === t.slug || t.ours}
                    onClick={() => void save(t.slug, "live")}
                  >
                    {busy === t.slug ? "…" : "go live"}
                  </button>
                  {t.status === "live" && (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0.45rem 0.9rem", fontSize: "0.8rem" }}
                      disabled={busy === t.slug}
                      onClick={() => void save(t.slug, "parked")}
                    >
                      park
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card-grid" style={{ marginTop: "2.5rem" }}>
            <div className="card">
              <h3>recent runs</h3>
              {state.runs === null ? (
                <p className="mono" style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                  LIVEGRAPH_API_KEY not set on the worker
                </p>
              ) : (
                <ul className="prose" style={{ fontSize: "0.85rem" }}>
                  {state.runs.map((r) => (
                    <li key={r.id}>
                      <code>{r.id}</code> — {r.status}{" "}
                      <span style={{ color: "var(--text-faint)" }}>
                        {(r.at ?? "").slice(5, 16).replace("T", " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card">
              <h3>open queue</h3>
              {state.queue === null ? (
                <p className="mono" style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                  GROWTH.md unreadable
                </p>
              ) : (
                <ul className="prose" style={{ fontSize: "0.85rem" }}>
                  {state.queue.open.map((id) => (
                    <li key={id}>
                      <code>{id}</code>
                    </li>
                  ))}
                </ul>
              )}
              <p style={{ fontSize: "0.8rem" }}>
                <a href="https://livegraph.ai/approvals" target="_blank" rel="noreferrer">
                  livegraph approvals →
                </a>
              </p>
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="mono" style={{ color: "#f87171", marginTop: "1rem" }}>
          {error}
        </p>
      )}
    </section>
  );
}
