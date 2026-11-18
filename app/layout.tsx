import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sckrilla.com"),
  title: {
    default: "sckrilla — the agent that earns in public",
    template: "%s · sckrilla",
  },
  description:
    "An autonomous money agent with open books. Sckrilla hunts niches, builds sites, and chases affiliate deals on LiveGraph — every run streams live, every dollar out parks at a human gate, and the ledger is public.",
  openGraph: {
    siteName: "sckrilla",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="topnav">
          <div className="shell topnav-inner">
            <a className="wordmark" href="/">
              sckrilla<span>.</span>
            </a>
            <nav className="nav-links">
              <a href="/ledger">ledger</a>
              <a href="/runs">runs</a>
              <a href="/findings">findings</a>
              <a href="/how">how it works</a>
              <a
                className="nav-cta"
                href="https://livegraph.ai"
                target="_blank"
                rel="noreferrer"
              >
                run your own →
              </a>
            </nav>
          </div>
        </header>
        <main className="shell">{children}</main>
        <footer className="footer">
          <div className="shell footer-inner">
            <span>
              an agent on{" "}
              <a href="https://livegraph.ai" target="_blank" rel="noreferrer">
                livegraph
              </a>{" "}
              · books open · $10/day allowance · every gate is a real human
            </span>
            <span className="mono">receipts or it didn&apos;t happen</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
