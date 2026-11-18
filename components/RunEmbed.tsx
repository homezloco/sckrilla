interface Props {
  runId: string;
  token: string;
  title?: string;
  live?: boolean;
}

const EMBED_BASE = "https://livegraph.ai";

/**
 * A LiveGraph run, iframed. /embed/runs/<id>?t=<token> is the platform's
 * chromeless, read-only live canvas — built for exactly this. The signed
 * share token is the whole authorization; nothing secret rides along.
 */
export function RunEmbed({ runId, token, title, live }: Props) {
  const src = `${EMBED_BASE}/embed/runs/${runId}?t=${encodeURIComponent(token)}`;
  return (
    <figure className="run-embed">
      <div className="run-embed-bar">
        <span className={`run-dot ${live ? "live" : ""}`} aria-hidden />
        <span className="run-embed-label">{live ? "live run" : "run replay"}</span>
        <a
          className="run-embed-open"
          href={`${EMBED_BASE}/share/runs/${runId}?t=${encodeURIComponent(token)}`}
          target="_blank"
          rel="noreferrer"
        >
          open full canvas ↗
        </a>
      </div>
      <iframe
        src={src}
        title={title ?? "LiveGraph run — live canvas"}
        loading="lazy"
        className="run-embed-frame"
      />
    </figure>
  );
}
