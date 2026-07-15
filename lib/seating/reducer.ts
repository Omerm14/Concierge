import type { SeatingArrangement } from "../guests/types";

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

function seatedCount(
  arrangement: SeatingArrangement,
  tableId: string,
  excludeGuestId: string,
): number {
  let count = 0;
  for (const [guestId, assignedTableId] of Object.entries(arrangement.assignments)) {
    if (assignedTableId === tableId && guestId !== excludeGuestId) count++;
  }
  return count;
}

/**
 * Pure reducer for the seating board: assigns a guest to a table (covers
 * both a fresh assign from the unassigned tray and moving an already-seated
 * guest to a different table — both are just overwriting the guestId→tableId
 * entry), unassigns a guest back to the tray, and rejects a drop that would
 * put a table over capacity without mutating the arrangement.
 */
export function seatingReducer(
  arrangement: SeatingArrangement,
  action: SeatingAction,
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

  if (seatedCount(arrangement, tableId, guestId) >= table.capacity) {
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
