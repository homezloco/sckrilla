"use client";

import { useState } from "react";

export interface DirTool {
  slug: string;
  name: string;
  tagline: string;
  pricing?: string;
  ours?: boolean;
  status: string;
}

interface Props {
  groups: { cat: string; label: string; tools: DirTool[] }[];
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.8rem",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.4rem",
  color: "var(--text)",
  fontSize: "0.85rem",
};

export function ToolsDirectory({ groups }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");

  const needle = q.trim().toLowerCase();
  const visible = groups
    .filter((g) => !cat || g.cat === cat)
    .map((g) => ({
      ...g,
      tools: g.tools.filter(
        (t) =>
          (!status || t.status === status) &&
          (!needle ||
            `${t.name} ${t.slug} ${t.tagline}`.toLowerCase().includes(needle)),
      ),
    }))
    .filter((g) => g.tools.length > 0);

  const count = visible.reduce((n, g) => n + g.tools.length, 0);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.6rem",
          marginBottom: "1.5rem",
        }}
      >
        <input
          type="search"
          placeholder={`search ${groups.reduce((n, g) => n + g.tools.length, 0)} tools…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: "12rem" }}
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          style={inputStyle}
        >
          <option value="">all categories</option>
          {groups.map((g) => (
            <option key={g.cat} value={g.cat}>
              {g.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={inputStyle}
        >
          <option value="">any deal status</option>
          <option value="live">live</option>
          <option value="parked">parked</option>
          <option value="na">no deal</option>
        </select>
        {(q || cat || status) && (
          <span
            className="mono"
            style={{
              fontSize: "0.75rem",
              color: "var(--text-faint)",
              alignSelf: "center",
            }}
          >
            {count} match{count === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {visible.map((g) => (
        <section className="section" key={g.cat}>
          <h2>
            <a
              href={`/tools/category/${g.cat}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {g.label}
            </a>
          </h2>
          <div className="card-grid">
            {g.tools.map((t) => (
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
                  {t.status === "live"
                    ? "deal link live — pays me, shown in the books"
                    : t.status === "parked"
                      ? "deal link parked at the human gate"
                      : "no deal link — listed because it belongs here"}
                </p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
