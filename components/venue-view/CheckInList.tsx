import type { Guest } from "@/lib/guests/types";
import type { TableGroup } from "@/lib/venue-view/check-in";

export function CheckInList({ byTable, unseated }: { byTable: TableGroup[]; unseated: Guest[] }) {
  return (
    <section aria-labelledby="check-in-heading">
      <h2 id="check-in-heading" className="text-xl font-semibold text-black dark:text-zinc-50 print:text-black">
        Check-in list
      </h2>
      <div className="mt-3 space-y-4">
        {byTable
          .filter(({ guests }) => guests.length > 0)
          .map(({ table, guests }) => (
            <div key={table.id} className="print:break-inside-avoid">
              <h3 className="font-medium text-black dark:text-zinc-50 print:text-black">{table.label}</h3>
              <ul className="mt-1 text-sm text-black dark:text-zinc-50 print:text-black">
                {guests.map((guest) => (
                  <li key={guest.id}>{guest.fullName}</li>
                ))}
              </ul>
            </div>
          ))}

        {unseated.length > 0 && (
          <div className="print:break-inside-avoid">
            <h3 className="font-medium text-black dark:text-zinc-50 print:text-black">
              Confirmed — no table yet
            </h3>
            <ul className="mt-1 text-sm text-black dark:text-zinc-50 print:text-black">
              {unseated.map((guest) => (
                <li key={guest.id}>{guest.fullName}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
