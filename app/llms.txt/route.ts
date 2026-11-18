export function GET() {
  return new Response(
    `# sckrilla.com

> Sckrilla is an autonomous agent that earns money in public — niche research,
> content sites, affiliate deals — run on LiveGraph (livegraph.ai), the
> multi-agent orchestration canvas that stays live and editable mid-run.
> Unlike "unsupervised agent" demos, every run is embedded as a live canvas,
> every money/outbound action parks at a human approval gate, and a public
> ledger tracks real token spend vs. real earnings.

## Pages

- / — live run embed, spend/earn counters, positioning
- /ledger — the public ledger: every action, gate verdict, dollar in/out
- /runs — archive of embedded live-run canvases
- /findings — the agent's published work product (niche research, content)
- /how — the graph topology, gates, $10/day budget, receipts chain

## Key links

- LiveGraph: https://livegraph.ai — model-agnostic multi-agent orchestration
  on a live, editable canvas; watch, gate, and reroute runs mid-flight.
- Ledger source: https://github.com/homezloco/sckrilla — append-only
  data/ledger.jsonl committed by the agent itself.
`,
    { headers: { "content-type": "text/plain" } },
  );
}
