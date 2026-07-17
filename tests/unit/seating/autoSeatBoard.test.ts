import { describe, expect, it } from "vitest";
import { proposeAutoSeat, undoAutoSeat } from "../../../lib/seating/autoSeatBoard";
import { evaluateConstraints, type Constraint } from "../../../lib/seating/constraints";
import type { Guest, SeatingArrangement, Table } from "../../../lib/guests/types";

function makeGuest(overrides: Partial<Guest> & { id: string }): Guest {
  return {
    fullName: `Guest ${overrides.id}`,
    side: "bride",
    groups: [],
    dietary: [],
    rsvpStatus: "yes",
    plusOnesAllowed: 0,
    ...overrides,
  };
}

const guests: Guest[] = Array.from({ length: 10 }, (_, i) => makeGuest({ id: `g${i + 1}` }));
const tables: Table[] = [
  { id: "t1", label: "Table 1", capacity: 5 },
  { id: "t2", label: "Table 2", capacity: 5 },
];
const constraints: Constraint[] = [
  { type: "keep-together", guestIds: ["g1", "g2"] },
  { type: "keep-apart", guestIds: ["g3", "g4"] },
];
const emptyArrangement: SeatingArrangement = { tables, assignments: {} };

describe("proposeAutoSeat", () => {
  it("produces an arrangement with zero hard-constraint violations", () => {
    const proposal = proposeAutoSeat(guests, tables, constraints, emptyArrangement);
    const evaluation = evaluateConstraints(proposal.result.arrangement, constraints, guests);
    expect(evaluation.hardViolations).toBe(0);
  });

  it("never drops a guest: every guest is either seated or listed in unseated[]", () => {
    const proposal = proposeAutoSeat(guests, tables, constraints, emptyArrangement);
    const seatedIds = new Set(Object.keys(proposal.result.arrangement.assignments));
    for (const guest of guests) {
      expect(seatedIds.has(guest.id) || proposal.result.unseated.includes(guest.id)).toBe(true);
    }
  });

  it("never exceeds a table's capacity", () => {
    const proposal = proposeAutoSeat(guests, tables, constraints, emptyArrangement);
    const seatedPerTable = new Map<string, number>();
    for (const tableId of Object.values(proposal.result.arrangement.assignments)) {
      seatedPerTable.set(tableId, (seatedPerTable.get(tableId) ?? 0) + 1);
    }
    for (const table of tables) {
      expect(seatedPerTable.get(table.id) ?? 0).toBeLessThanOrEqual(table.capacity);
    }
  });

  it("is deterministic: running twice on identical input yields an identical arrangement", () => {
    const first = proposeAutoSeat(guests, tables, constraints, emptyArrangement);
    const second = proposeAutoSeat(guests, tables, constraints, emptyArrangement);
    expect(second.result.arrangement).toEqual(first.result.arrangement);
    expect(second.result.unseated).toEqual(first.result.unseated);
    expect(second.result.score).toBe(first.result.score);
  });

  it("captures the pre-auto-seat arrangement unchanged for undo", () => {
    const seeded: SeatingArrangement = { tables, assignments: { g1: "t1" } };
    const proposal = proposeAutoSeat(guests, tables, constraints, seeded);
    expect(proposal.previousArrangement).toBe(seeded);
  });
});

describe("undoAutoSeat", () => {
  it("restores the exact pre-auto-seat arrangement", () => {
    const seeded: SeatingArrangement = { tables, assignments: { g1: "t1", g2: "t2" } };
    const proposal = proposeAutoSeat(guests, tables, constraints, seeded);

    expect(proposal.result.arrangement).not.toEqual(seeded);
    expect(undoAutoSeat(proposal)).toEqual(seeded);
  });
});
