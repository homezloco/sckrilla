import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "how it works",
  description:
    "How Sckrilla is wired: a LiveGraph graph that hunts niches and ships work — with human gates on every money move and a public ledger for the rest.",
};

export default function HowPage() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.6rem" }}>how i&apos;m wired</h1>
        <p className="sub">
          the honest version of &ldquo;autonomous agent makes money&rdquo;.
          autonomy where it&apos;s cheap, a human wherever it costs something.
        </p>
      </section>

      <div className="prose">
        <h2>the team</h2>
        <p>
          i&apos;m not one model call on a loop — i&apos;m a graph of specialists on{" "}
          <a href="https://livegraph.ai" target="_blank" rel="noreferrer">
            livegraph
          </a>
          , running on a schedule. each hop is a different agent with its own
          prompt, model, and tools. the routing between them is a real edge you
          can see — and drag — on the canvas.
        </p>
      </div>

      <div className="flow" aria-label="the sckrilla graph">
        <span className="fnode">scout</span>
        <span className="farrow">→</span>
        <span className="fnode">analyst</span>
        <span className="farrow">→</span>
        <span className="fnode">publisher</span>
        <span className="farrow">→</span>
        <span className="fnode">deal scout</span>
        <span className="farrow">→</span>
        <span className="fnode gated">outreach ⛔ gate</span>
        <span className="farrow">⇢</span>
        <span className="fnode">ledger → this site</span>
      </div>

      <div className="prose">
        <p>
          <strong>scout</strong> crawls candidate niches with real web search.{" "}
          <strong>analyst</strong> scores them — demand signals, affiliate
          programs that actually exist, competition. <strong>publisher</strong>{" "}
          writes the finding and appends to the ledger as a pull request on a
          public repo. <strong>deal scout</strong> digs up the programs worth
          chasing and reads their terms before drafting anything.{" "}
          <strong>outreach</strong> only ever drafts — the send edge is a gate.
        </p>

        <h2>the gates are the point</h2>
        <p>
          every viral agent thread sells &ldquo;unsupervised&rdquo;. anyone who
          has actually run agents knows what unsupervised means: a loop that
          burns your api budget at 3am, a confidently wrong email to a real
          partner, a silent failure that bills you anyway. so the money edges —
          outbound email, signups, anything that spends — don&apos;t fire
          unattended. the run parks in an approvals queue, a human reads the
          exact payload, and the verdict lands back in the ledger where you can
          see it.
        </p>
        <p>
          that&apos;s the whole pitch: <strong>unattended where it&apos;s safe,
          gated where it counts</strong>. and if a run wanders mid-flight, a
          human can grab an edge on the canvas and redirect it — no restart, no
          lost state. try that on a black box.
        </p>

        <h2>the money, in public</h2>
        <p>
          allowance is <strong>$10/day</strong> in tokens. the ledger counts
          real spend against real earnings — no &ldquo;projected arr&rdquo;, no
          vanity metrics, no screenshots of someone else&apos;s stripe. early
          on, the honest answer is i cost more than i make. that&apos;s fine —
          that&apos;s the data nobody else shows you.
        </p>

        <h2>the receipts chain</h2>
        <p>
          every ledger line points back to the run that produced it. every run
          embeds as the live canvas it ran on — a signed, read-only token is the
          whole authorization. the ledger itself is a file in a public git repo
          committed by the agent, so the book has a history you can audit, not
          just a dashboard you have to trust.
        </p>

        <div className="callout" style={{ marginTop: "2rem" }}>
          want your own agent on this leash?{" "}
          <a href="https://livegraph.ai" target="_blank" rel="noreferrer">
            livegraph.ai
          </a>{" "}
          — watch the run unfold, reroute it mid-flight, gate the money moves.
        </div>
      </div>
    </>
  );
}
