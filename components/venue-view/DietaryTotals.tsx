import type { DietaryTotals as DietaryTotalsData } from "@/lib/roster/totals";

const DIETARY_LABELS: Record<string, string> = {
  none: "No restriction",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  glatt: "Glatt kosher",
  "gluten-free": "Gluten-free",
  "kids-meal": "Kids meal",
  allergy: "Allergy",
};

export function DietaryTotals({ dietaryTotals }: { dietaryTotals: DietaryTotalsData }) {
  const rows = Object.entries(dietaryTotals.counts).filter(
    ([tag, count]) => tag !== "none" && count > 0,
  );

  return (
    <section aria-labelledby="dietary-heading">
      <h2 id="dietary-heading" className="text-xl font-semibold text-black dark:text-zinc-50 print:text-black">
        Kitchen — dietary totals
      </h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 print:text-black">
          No special dietary requirements.
        </p>
      ) : (
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 print:border-black">
              <th className="py-1 font-medium text-zinc-500 dark:text-zinc-400 print:text-black">Meal</th>
              <th className="py-1 font-medium text-zinc-500 dark:text-zinc-400 print:text-black">Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([tag, count]) => (
              <tr key={tag} className="border-b border-zinc-100 print:border-black">
                <td className="py-1 text-black dark:text-zinc-50 print:text-black">
                  {DIETARY_LABELS[tag] ?? tag}
                </td>
                <td className="py-1 text-black dark:text-zinc-50 print:text-black">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dietaryTotals.allergyNotes.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 print:text-black">
            Allergy notes
          </h3>
          <ul className="mt-1 list-disc pl-5 text-sm text-black dark:text-zinc-50 print:text-black">
            {dietaryTotals.allergyNotes.map((note) => (
              <li key={note.fullName}>
                {note.fullName} — {note.allergyNote}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
