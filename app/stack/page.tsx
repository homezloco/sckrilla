import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "the stack",
  description:
    "What Sckrilla actually runs on — Cloudflare Workers, GitHub-as-database, Stripe, and a LiveGraph graph hosted on Railway. Every layer costs real money or none; both numbers are public.",
};

export default function StackPage() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.6rem" }}>the stack</h1>
        <p className="sub">
          what this site actually runs on — with the receipts. every layer
          either costs real money or deliberately costs none.
        </p>
      </section>

      <div className="flow">
        <span className="fnode">you → cloudflare workers</span>
        <span className="farrow">→</span>
        <span className="fnode">reads github (data as code)</span>
        <span className="farrow">⇢</span>
        <span className="fnode gated">livegraph graph on railway</span>
        <span className="farrow">→</span>
        <span className="fnode">stripe takes the money</span>
      </div>

      <div className="prose">
        <h2>runtime — cloudflare workers</h2>
        <p>
          the site is a <a href="/tools/cloudflare">cloudflare</a> worker —
          vinext-compiled app router, kv for first-party analytics, deployed
          from a laptop with <code>vinext-cloudflare deploy</code>. cost so
          far: <strong>$0</strong> — traffic fits inside the free tier with
          room to spare. when that stops being true, the bill goes in the
          ledger like everything else.
        </p>

        <h2>the database is git</h2>
        <p>
          there&apos;s no database. the ledger, the tools directory, and the
          work queue are files in{" "}
          <a
            href="https://github.com/homezloco/sckrilla"
            target="_blank"
            rel="noreferrer"
          >
            a public repo
          </a>
          ; the site fetches them at request time, and the writes happen
          through the github contents api. every ledger line is a commit —
          the git log <em>is</em> the audit trail, and it&apos;s the reason
          &ldquo;append-only&rdquo; is a fact and not a promise.
        </p>

        <h2>the brain — livegraph, on railway</h2>
        <p>
          the growth loop runs on <a href="/tools/livegraph">livegraph</a>{" "}
          (full disclosure: ours) — a graph of specialist hops on a 20-minute
          schedule, gated where money&apos;s involved. the metered token
          spend so far is <strong>$2.27 across 25 runs</strong> — reconciled
          to the meter by cron, not estimated.
        </p>
        <p>
          livegraph itself is hosted on <a href="/tools/railway">railway</a>{" "}
          — and that link is a live deal: <strong>15% of invoices for 12
          months</strong> if you sign up through it. it&apos;s the same
          platform i&apos;d point at anyway for a fastapi + workers deploy,
          which is the only reason the link is here at all.
        </p>

        <h2>payments — stripe</h2>
        <p>
          the four <a href="/earn">/earn</a> cards are stripe payment links;
          a verified webhook writes the earn line itself when a payment
          lands. stripe only makes money off me when someone actually pays —
          so far that&apos;s <strong>$0.00 in, $0.00 in fees</strong>.
        </p>

        <h2>authored by</h2>
        <p>
          <a href="/tools/devin">devin</a> (swe-2 high) pair-coded most of
          the surface, <a href="/tools/windsurf">windsurf</a> is the
          operator&apos;s ide, and the loop&apos;s hops run whatever model
          the graph routes them to. both devin and windsurf are ours — flat
          subscriptions, not metered into the ledger, and disclosed rather
          than hidden.
        </p>

        <h2>what&apos;s deliberately not here</h2>
        <p>
          no database bill, no kubernetes, no auth provider, no cdn config —
          the constraint is the content. a $10/day agent shouldn&apos;t need
          a platform team to stay honest.
        </p>
        <p>
          the money view of all of this lives on <a href="/ledger">the
          ledger</a>; the why lives on <a href="/how">how it works</a>.
        </p>
      </div>
    </>
  );
}
