import type { SeatingArrangement } from "../guests/types";
import type { SeatCost } from "./occupancy";

export type SeatingAction =
  | { type: "assign"; guestId: string; tableId: string }
  | { type: "unassign"; guestId: string };

export interface SeatingRejection {
  guestId: string;
  tableId: string;
  reason: "capacity";
}

export interface SeatingReducerResult {
  arrangement: SeatingArrangement;
  rejection?: SeatingRejection;
}

function seatedSeats(
  arrangement: SeatingArrangement,
  tableId: string,
  excludeGuestId: string,
  seatCost?: SeatCost,
): number {
  let seats = 0;
  for (const [guestId, assignedTableId] of Object.entries(arrangement.assignments)) {
    if (assignedTableId === tableId && guestId !== excludeGuestId) {
      seats += seatCost ? seatCost(guestId) : 1;
    }
  }
  return seats;
}

/**
 * Pure reducer for the seating board: assigns a guest to a table (covers
 * both a fresh assign from the unassigned tray and moving an already-seated
 * guest to a different table — both are just overwriting the guestId→tableId
 * entry), unassigns a guest back to the tray, and rejects a drop that would
 * put a table over capacity without mutating the arrangement. `seatCost`
 * (guestId -> seats, default 1) lets a confirmed plus-one occupy more than
 * one seat; omit it for the original one-guest-one-seat behavior.
 */
export function seatingReducer(
  arrangement: SeatingArrangement,
  action: SeatingAction,
  seatCost?: SeatCost,
): SeatingReducerResult {
  if (action.type === "unassign") {
    if (!(action.guestId in arrangement.assignments)) {
      return { arrangement };
    }
    const assignments = { ...arrangement.assignments };
    delete assignments[action.guestId];
    return { arrangement: { tables: arrangement.tables, assignments } };
  }

  const { guestId, tableId } = action;
  const table = arrangement.tables.find((t) => t.id === tableId);
  if (!table) {
    return { arrangement };
  }

  const guestSeats = seatCost ? seatCost(guestId) : 1;
  if (seatedSeats(arrangement, tableId, guestId, seatCost) + guestSeats > table.capacity) {
    return {
      arrangement,
      rejection: { guestId, tableId, reason: "capacity" },
    };
  }

  return {
    arrangement: {
      tables: arrangement.tables,
      assignments: { ...arrangement.assignments, [guestId]: tableId },
    },
  };
}
