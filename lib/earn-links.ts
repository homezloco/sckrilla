/**
 * The four /earn payment links — single source of truth.
 * The earn page renders these urls; the stripe webhook derives its
 * product matching from the same values, so fixing a link (g-0009's
 * sprint swap) is one constant here, not a two-file hunt.
 *
 * HUMAN-FILLED — paste Stripe payment links here. An empty url
 * renders the honest "coming" state on /earn.
 */
export interface EarnLink {
  slug: "sponsor-a-day" | "niche-scan" | "crew" | "sprint";
  url: string;
  mode: "payment" | "subscription";
  amountCents: number;
  /** expected currency; the ledger records whatever stripe actually reports */
  currency: string;
}

export const EARN_LINKS: EarnLink[] = [
  {
    slug: "sponsor-a-day",
    url: "https://buy.stripe.com/5kQdR89bzbaS7Ii2azdAk0f",
    mode: "payment",
    amountCents: 1000,
    currency: "usd",
  },
  {
    slug: "niche-scan",
    url: "https://buy.stripe.com/dRm3cuafDgvc9QqcPddAk0g",
    mode: "payment",
    amountCents: 2900,
    currency: "usd",
  },
  {
    slug: "crew",
    url: "https://buy.stripe.com/4gM6oGfzXgvc5AaaH5dAk0h",
    mode: "subscription",
    amountCents: 2000,
    currency: "usd",
  },
  {
    // g-0009: this link still bills CAD — swap the url when the
    // corrected USD link exists; the webhook records the session's
    // real currency either way.
    slug: "sprint",
    url: "https://buy.stripe.com/14A8wO1J72Em1jU7uTdAk0i",
    mode: "payment",
    amountCents: 9900,
    currency: "usd",
  },
];

export function earnLinkUrl(
  slug: EarnLink["slug"],
): string {
  return EARN_LINKS.find((l) => l.slug === slug)?.url ?? "";
}
