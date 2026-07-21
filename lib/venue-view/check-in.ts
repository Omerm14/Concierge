import type { Guest, SeatingArrangement, Table } from "@/lib/guests/types";
import { unseatedConfirmed } from "@/lib/roster/totals";

/**
 * A guest that may have gone through the CON-9 RSVP reducer. Mirrors
 * lib/roster/totals.ts's RosterGuest — confirmed plus-ones live on
 * `plusOnes`, never the `plusOnesAllowed` ceiling.
 */
export type RosterGuest = Guest & { plusOnes?: number };

/**
 * Venue-View-specific rendering shape, not a roster stat — grouping guests
 * by their assigned table is presentation, so it lives here rather than in
 * lib/roster (which owns cross-screen aggregate numbers, see CON-22/CON-28).
 */
export interface TableGroup {
  table: Table;
  guests: RosterGuest[];
}

function byFullName(a: Guest, b: Guest): number {
  return a.fullName.localeCompare(b.fullName);
}

/** Every table in arrangement order, each carrying its assigned guests (any RSVP status) — a read-only mirror of the seating chart. */
export function tableLayout(guests: RosterGuest[], arrangement: SeatingArrangement): TableGroup[] {
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
  guests: RosterGuest[],
  arrangement: SeatingArrangement,
): { byTable: TableGroup[]; unseated: RosterGuest[] } {
  const confirmed = guests.filter((guest) => guest.rsvpStatus === "yes");
  const byTable = tableLayout(confirmed, arrangement).map(({ table, guests: tableGuests }) => ({
    table,
    guests: [...tableGuests].sort(byFullName),
  }));
  // unseatedConfirmed only filters `guests` — every RosterGuest field
  // (including plusOnes) survives, so this cast just restores the type.
  const unseated = (unseatedConfirmed(guests, arrangement) as RosterGuest[]).sort(byFullName);

  return { byTable, unseated };
}
