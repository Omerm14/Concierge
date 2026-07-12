import type { Guest, SeatingArrangement, Table } from "@/lib/guests/types";
import { unseatedConfirmed } from "@/lib/roster/totals";

/**
 * Venue-View-specific rendering shape, not a roster stat — grouping guests
 * by their assigned table is presentation, so it lives here rather than in
 * lib/roster (which owns cross-screen aggregate numbers, see CON-22/CON-28).
 */
export interface TableGroup {
  table: Table;
  guests: Guest[];
}

function byFullName(a: Guest, b: Guest): number {
  return a.fullName.localeCompare(b.fullName);
}

/** Every table in arrangement order, each carrying its assigned guests (any RSVP status) — a read-only mirror of the seating chart. */
export function tableLayout(guests: Guest[], arrangement: SeatingArrangement): TableGroup[] {
  const guestsById = new Map(guests.map((guest) => [guest.id, guest]));

  return arrangement.tables.map((table) => {
    const seated: Guest[] = [];
    for (const [guestId, tableId] of Object.entries(arrangement.assignments)) {
      if (tableId !== table.id) continue;
      const guest = guestsById.get(guestId);
      if (guest) seated.push(guest);
    }
    return { table, guests: seated };
  });
}

/**
 * Kitchen/door check-in list: confirmed guests only, alphabetical within
 * each table, in arrangement order. Confirmed guests with no table
 * assignment are surfaced separately — never silently dropped.
 */
export function checkInList(
  guests: Guest[],
  arrangement: SeatingArrangement,
): { byTable: TableGroup[]; unseated: Guest[] } {
  const confirmed = guests.filter((guest) => guest.rsvpStatus === "yes");
  const byTable = tableLayout(confirmed, arrangement).map(({ table, guests: tableGuests }) => ({
    table,
    guests: [...tableGuests].sort(byFullName),
  }));
  const unseated = unseatedConfirmed(guests, arrangement).sort(byFullName);

  return { byTable, unseated };
}
