import { describe, expect, it } from "vitest";
import { autoSeat } from "../../../lib/seating/autoseat";
import { evaluateConstraints, type Constraint } from "../../../lib/seating/constraints";
import { buildSeatCost } from "../../../lib/seating/occupancy";
import type { Guest, Table } from "../../../lib/guests/types";

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

function makeGuests(count: number, sideFor: (i: number) => Guest["side"]): Guest[] {
  return Array.from({ length: count }, (_, i) =>
    makeGuest({ id: `g${i + 1}`, side: sideFor(i) }),
  );
}

const SIDES: Guest["side"][] = ["bride", "groom", "both", "other"];

describe("autoSeat", () => {
  const guests = makeGuests(20, (i) => SIDES[i % SIDES.length]);
  const tables: Table[] = [
    { id: "t1", label: "Table 1", capacity: 6 },
    { id: "t2", label: "Table 2", capacity: 6 },
    { id: "t3", label: "Table 3", capacity: 6 },
    { id: "t4", label: "Table 4", capacity: 6 },
  ];
  const constraints: Constraint[] = [
    { type: "capacity" },
    { type: "keep-together", guestIds: ["g1", "g2", "g3"] },
    { type: "keep-apart", guestIds: ["g4", "g5"] },
    { type: "must-sit-at", guestId: "g6", tableId: "t1" },
  ];

  it("seats ~20 guests across 4 tables with zero hard-constraint violations", () => {
    const result = autoSeat(guests, tables, constraints);
    const evaluation = evaluateConstraints(result.arrangement, constraints, guests);
    expect(evaluation.hardViolations).toBe(0);
    expect(result.unseated).toEqual([]);
    expect(Object.keys(result.arrangement.assignments)).toHaveLength(20);
  });

  it("never co-seats a keep-apart pair; co-seats a keep-together group whenever capacity allows", () => {
    const result = autoSeat(guests, tables, constraints);
    expect(result.arrangement.assignments.g4).not.toBe(result.arrangement.assignments.g5);

    const together = new Set([
      result.arrangement.assignments.g1,
      result.arrangement.assignments.g2,
      result.arrangement.assignments.g3,
    ]);
    expect(together.size).toBe(1);
  });

  it("honors must-sit-at when capacity allows", () => {
    const result = autoSeat(guests, tables, constraints);
    expect(result.arrangement.assignments.g6).toBe("t1");
  });

  it("never exceeds table capacity", () => {
    const result = autoSeat(guests, tables, constraints);
    const seatedPerTable = new Map<string, number>();
    for (const tableId of Object.values(result.arrangement.assignments)) {
      seatedPerTable.set(tableId, (seatedPerTable.get(tableId) ?? 0) + 1);
    }
    for (const table of tables) {
      expect(seatedPerTable.get(table.id) ?? 0).toBeLessThanOrEqual(table.capacity);
    }
  });

  it("puts overflow guests in unseated[] and never exceeds capacity when guests > total capacity", () => {
    const manyGuests = makeGuests(25, (i) => SIDES[i % SIDES.length]);
    const smallTables: Table[] = [
      { id: "t1", label: "Table 1", capacity: 5 },
      { id: "t2", label: "Table 2", capacity: 5 },
      { id: "t3", label: "Table 3", capacity: 5 },
      { id: "t4", label: "Table 4", capacity: 5 },
    ];
    const result = autoSeat(manyGuests, smallTables, [{ type: "capacity" }]);

    expect(result.unseated).toHaveLength(5);
    const seatedIds = new Set(Object.keys(result.arrangement.assignments));
    expect(seatedIds.size).toBe(20);
    for (const id of result.unseated) expect(seatedIds.has(id)).toBe(false);

    const seatedPerTable = new Map<string, number>();
    for (const tableId of Object.values(result.arrangement.assignments)) {
      seatedPerTable.set(tableId, (seatedPerTable.get(tableId) ?? 0) + 1);
    }
    for (const table of smallTables) {
      expect(seatedPerTable.get(table.id) ?? 0).toBeLessThanOrEqual(table.capacity);
    }
  });

  it("is deterministic: same inputs and seed produce an identical arrangement across runs", () => {
    const first = autoSeat(guests, tables, constraints, { seed: 7 });
    const second = autoSeat(guests, tables, constraints, { seed: 7 });
    expect(second.arrangement).toEqual(first.arrangement);
    expect(second.unseated).toEqual(first.unseated);
    expect(second.score).toBe(first.score);
  });

  it("local search never produces a lower score than the greedy seed", () => {
    const seedOnly = autoSeat(guests, tables, constraints, { maxSwapIterations: 0 });
    const improved = autoSeat(guests, tables, constraints, { maxSwapIterations: 300 });
    expect(improved.score).toBeGreaterThanOrEqual(seedOnly.score);
  });
});

describe("autoSeat with confirmed plus-ones (seat-cost)", () => {
  it("never produces a table whose seat-cost sum exceeds capacity, even when half the guests bring a confirmed plus-one", () => {
    const guestsWithPlusOnes = Array.from({ length: 12 }, (_, i) =>
      i % 2 === 0
        ? { ...makeGuest({ id: `g${i + 1}` }), plusOnes: 1 }
        : makeGuest({ id: `g${i + 1}` }),
    );
    const smallTables: Table[] = [
      { id: "t1", label: "Table 1", capacity: 4 },
      { id: "t2", label: "Table 2", capacity: 4 },
      { id: "t3", label: "Table 3", capacity: 4 },
      { id: "t4", label: "Table 4", capacity: 4 },
    ];

    const result = autoSeat(guestsWithPlusOnes, smallTables, [{ type: "capacity" }]);
    const seatCost = buildSeatCost(guestsWithPlusOnes);

    const seatsByTable = new Map<string, number>();
    for (const [guestId, tableId] of Object.entries(result.arrangement.assignments)) {
      seatsByTable.set(tableId, (seatsByTable.get(tableId) ?? 0) + seatCost(guestId));
    }
    for (const table of smallTables) {
      expect(seatsByTable.get(table.id) ?? 0).toBeLessThanOrEqual(table.capacity);
    }

    const evaluation = evaluateConstraints(
      result.arrangement,
      [{ type: "capacity" }],
      guestsWithPlusOnes,
      seatCost,
    );
    expect(evaluation.hardViolations).toBe(0);
  });
});
