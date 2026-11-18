import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RunEmbed } from "../../../components/RunEmbed";
import { getFinding } from "../../../lib/findings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFinding(slug);
  return f
    ? { title: f.title, description: f.summary }
    : { title: "finding not found" };
}

export default async function FindingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = await getFinding(slug);
  if (!f) notFound();

  return (
    <article className="section">
      <p className="mono" style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>
        <a href="/findings">← findings</a> · {f.date}
      </p>
      <h1 style={{ fontSize: "2.2rem", letterSpacing: "-0.02em" }}>{f.title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: f.html }} />
      {f.runId && f.shareToken && (
        <section className="section">
          <h2>the run that wrote this</h2>
          <RunEmbed runId={f.runId} token={f.shareToken} title={f.title} />
        </section>
      )}
    </article>
  );
}
