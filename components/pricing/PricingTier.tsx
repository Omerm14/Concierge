interface PricingTierProps {
  priceLabel: string;
  features: string[];
}

export function PricingTier({ priceLabel, features }: PricingTierProps) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        One plan
      </p>
      <p className="mt-2 text-4xl font-bold text-black dark:text-zinc-50">
        {priceLabel}
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        per wedding, one time
      </p>
      <ul className="mt-6 space-y-3 text-base text-zinc-700 dark:text-zinc-200">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span aria-hidden="true">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href="#"
        className="mt-8 block w-full rounded-full bg-black py-3 text-center font-medium text-white dark:bg-zinc-50 dark:text-black"
      >
        Get started
      </a>
    </div>
  );
}
