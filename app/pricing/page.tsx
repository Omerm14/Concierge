import type { Metadata } from "next";
import { PricingTier } from "../../components/pricing/PricingTier";
import { PageViewTracker } from "../../components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: "Pricing — Concierge",
  description: "One flat, transparent price per wedding. Unlimited guests. Unlimited messages.",
};

// Placeholder only — the final price is a human pricing decision, not yet made.
// This constant exists so the page structure can ship ahead of that call.
const PLACEHOLDER_PRICE_LABEL = "₪XXX (placeholder)";

const FEATURES = [
  "Unlimited guests",
  "Unlimited messages",
  "No per-record, no per-guest fees",
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-10 bg-zinc-50 px-6 py-16 dark:bg-black">
      <PageViewTracker event="pricing_viewed" />
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-200">
          No per-guest games. No &quot;VIP&quot; tricks. One honest price, unlimited
          everything.
        </p>
      </div>

      <PricingTier priceLabel={PLACEHOLDER_PRICE_LABEL} features={FEATURES} />

      <p className="max-w-xl text-center text-sm text-zinc-500 dark:text-zinc-400">
        One flat price per wedding — unlimited guests, unlimited messages, no
        per-record anything. Publish the price, keep it simple.
      </p>
    </div>
  );
}
