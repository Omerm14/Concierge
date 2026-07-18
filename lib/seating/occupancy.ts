import type { Guest } from "../guests/types";

/**
 * A guest that may carry a confirmed-plus-ones count from the CON-9 RSVP
 * reducer. Mirrors lib/roster/totals.ts's RosterGuest — confirmed plus-ones
 * live on `plusOnes`, never the `plusOnesAllowed` ceiling.
 */
export type RosterGuest = Guest & { plusOnes?: number };

/** guestId -> seats occupied. Unknown ids default to 1 (no plus-one data). */
export type SeatCost = (guestId: string) => number;

/**
 * Builds the shared seat-cost primitive: a guest occupies 1 + their confirmed
 * plus-ones. Any guest-id not present in `guests` (including plain
 * `SeatingArrangement`-only callers with no RSVP data) costs 1 seat.
 */
export function buildSeatCost(guests: RosterGuest[]): SeatCost {
  const costs = new Map(
    guests.map((guest) => [guest.id, 1 + (guest.plusOnes ?? 0)]),
  );
  return (guestId: string) => costs.get(guestId) ?? 1;
}
