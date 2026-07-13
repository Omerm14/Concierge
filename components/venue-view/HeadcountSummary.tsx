import type { Headcount, ResponseBreakdown } from "@/lib/roster/totals";

export function HeadcountSummary({
  headcount,
  responseBreakdown,
}: {
  headcount: Headcount;
  responseBreakdown: ResponseBreakdown;
}) {
  const stats = [
    { label: "Confirmed", value: responseBreakdown.yes },
    { label: "Pending", value: responseBreakdown.pending },
    { label: "Declined", value: responseBreakdown.no },
    { label: "Maybe", value: responseBreakdown.maybe },
  ];

  return (
    <section aria-labelledby="headcount-heading">
      <h2 id="headcount-heading" className="text-xl font-semibold text-black dark:text-zinc-50 print:text-black">
        Headcount
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-zinc-200 p-3 print:border-black">
            <dt className="text-sm text-zinc-500 dark:text-zinc-400 print:text-black">{stat.label}</dt>
            <dd className="text-2xl font-semibold text-black dark:text-zinc-50 print:text-black">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 print:text-black">
        Max attending (confirmed + plus-ones): {headcount.maxAttending}
      </p>
    </section>
  );
}
