import { demoGuests, demoTables } from "../fixtures/demo-wedding";
import type { Guest, SeatingArrangement, Table } from "../guests/types";
import type { Constraint } from "./constraints";

/**
 * Small in-memory board seed for the mobile seating board demo: a slice of
 * the canonical demo-wedding fixture (not a second invented dataset) sized
 * to the ~20 guests / ~4 tables the ticket calls for. All guests start
 * unassigned so the drag-from-tray interaction is front and center.
 */
export const boardGuests: Guest[] = demoGuests.slice(0, 20);
export const boardTables: Table[] = demoTables.slice(0, 4);
export const boardArrangement: SeatingArrangement = {
  tables: boardTables,
  assignments: {},
};

// A couple of representative constraints so the "Auto-seat" demo has
// something real to solve around instead of a trivially-empty constraint set.
export const boardConstraints: Constraint[] = [
  { type: "keep-together", guestIds: [boardGuests[0].id, boardGuests[1].id] },
  { type: "keep-apart", guestIds: [boardGuests[2].id, boardGuests[3].id] },
];
