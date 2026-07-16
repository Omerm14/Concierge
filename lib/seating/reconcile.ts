import type { Guest, RsvpStatus, SeatingArrangement } from "../guests/types";
import { unseatedConfirmed as unseatedConfirmedGuests } from "../roster/totals";

/**
 * A guest that may have gone through the CON-9 RSVP reducer. Mirrors
 * lib/roster/totals.ts's RosterGuest — confirmed plus-ones live on
 * `plusOnes`, never `plusOnesAllowed`.
 */
type RosterGuest = Guest & { plusOnes?: number };

export interface SeatedNoLongerAttending {
  guestId: string;
  tableId: string;
  rsvpStatus: RsvpStatus;
}

export interface StalePlusOneSeat {
  guestId: string;
  tableId: string;
}

export interface SeatingReconciliation {
  seatedNoLongerAttending: SeatedNoLongerAttending[];
  unseatedConfirmed: Guest[];
  stalePlusOneSeats: StalePlusOneSeat[];
  isClean: boolean;
}

export function reconcileSeating(
  guests: RosterGuest[],
  arrangement: SeatingArrangement,
): SeatingReconciliation {
  const sortedGuests = [...guests].sort((a, b) => a.id.localeCompare(b.id));

  const seatedNoLongerAttending: SeatedNoLongerAttending[] = [];
  const stalePlusOneSeats: StalePlusOneSeat[] = [];

  for (const guest of sortedGuests) {
    const tableId = arrangement.assignments[guest.id];
    if (tableId === undefined) continue;

    if (guest.rsvpStatus !== "yes") {
      seatedNoLongerAttending.push({
        guestId: guest.id,
        tableId,
        rsvpStatus: guest.rsvpStatus,
      });
    } else if ((guest.plusOnes ?? 0) === 0) {
      stalePlusOneSeats.push({ guestId: guest.id, tableId });
    }
  }

  const unseatedConfirmed = unseatedConfirmedGuests(guests, arrangement);

  return {
    seatedNoLongerAttending,
    unseatedConfirmed,
    stalePlusOneSeats,
    isClean:
      seatedNoLongerAttending.length === 0 &&
      unseatedConfirmed.length === 0 &&
      stalePlusOneSeats.length === 0,
  };
}
