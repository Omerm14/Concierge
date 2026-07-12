import type { TableGroup } from "@/lib/venue-view/check-in";

export function TableLayout({ groups }: { groups: TableGroup[] }) {
  return (
    <section aria-labelledby="table-layout-heading">
      <h2
        id="table-layout-heading"
        className="text-xl font-semibold text-black dark:text-zinc-50 print:text-black"
      >
        Table layout
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-2">
        {groups.map(({ table, guests }) => (
          <div
            key={table.id}
            className="rounded-lg border border-zinc-200 p-3 print:break-inside-avoid print:border-black"
          >
            <h3 className="font-medium text-black dark:text-zinc-50 print:text-black">
              {table.label}{" "}
              <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 print:text-black">
                ({guests.length}/{table.capacity})
              </span>
            </h3>
            {guests.length === 0 ? (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 print:text-black">Unassigned</p>
            ) : (
              <ul className="mt-1 text-sm text-black dark:text-zinc-50 print:text-black">
                {guests.map((guest) => (
                  <li key={guest.id}>{guest.fullName}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
