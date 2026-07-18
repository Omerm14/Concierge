import { describe, expect, it } from "vitest";
import { seatingReducer } from "../../../lib/seating/reducer";
import { buildSeatCost } from "../../../lib/seating/occupancy";
import type { Guest, SeatingArrangement } from "../../../lib/guests/types";

function arrangement(assignments: Record<string, string> = {}): SeatingArrangement {
  return {
    tables: [
      { id: "table-01", label: "Table 1", capacity: 2 },
      { id: "table-02", label: "Table 2", capacity: 1 },
    ],
    assignments,
  };
}

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

describe("seatingReducer", () => {
  it("assigns an unseated guest to a table", () => {
    const result = seatingReducer(arrangement(), { type: "assign", guestId: "g1", tableId: "table-01" });
    expect(result.arrangement.assignments).toEqual({ g1: "table-01" });
    expect(result.rejection).toBeUndefined();
  });

  it("moves an already-seated guest to a different table", () => {
    const result = seatingReducer(arrangement({ g1: "table-01" }), {
      type: "assign",
      guestId: "g1",
      tableId: "table-02",
    });
    expect(result.arrangement.assignments).toEqual({ g1: "table-02" });
  });

  it("unassigns a seated guest back to the tray", () => {
    const result = seatingReducer(arrangement({ g1: "table-01" }), {
      type: "unassign",
      guestId: "g1",
    });
    expect(result.arrangement.assignments).toEqual({});
  });

  it("unassigning a guest who isn't seated is a no-op", () => {
    const start = arrangement();
    const result = seatingReducer(start, { type: "unassign", guestId: "ghost" });
    expect(result.arrangement).toEqual(start);
  });

  it("rejects a drop onto a table that is already at capacity", () => {
    const start = arrangement({ g1: "table-02" });
    const result = seatingReducer(start, { type: "assign", guestId: "g2", tableId: "table-02" });
    expect(result.arrangement).toEqual(start);
    expect(result.rejection).toEqual({ guestId: "g2", tableId: "table-02", reason: "capacity" });
  });

  it("allows re-dropping a guest onto the table they already occupy, even at capacity", () => {
    const start = arrangement({ g1: "table-02" });
    const result = seatingReducer(start, { type: "assign", guestId: "g1", tableId: "table-02" });
    expect(result.arrangement.assignments).toEqual({ g1: "table-02" });
    expect(result.rejection).toBeUndefined();
  });

  it("moving into a table that would then exceed capacity is rejected", () => {
    const start = arrangement({ g1: "table-01", g2: "table-01", g3: "table-02" });
    const result = seatingReducer(start, { type: "assign", guestId: "g3", tableId: "table-01" });
    expect(result.arrangement).toEqual(start);
    expect(result.rejection).toEqual({ guestId: "g3", tableId: "table-01", reason: "capacity" });
  });

  it("ignores an assign to an unknown table id", () => {
    const start = arrangement();
    const result = seatingReducer(start, { type: "assign", guestId: "g1", tableId: "nope" });
    expect(result.arrangement).toEqual(start);
    expect(result.rejection).toBeUndefined();
  });

  it("never mutates the input arrangement", () => {
    const start = arrangement({ g1: "table-01" });
    const snapshot = JSON.parse(JSON.stringify(start));
    seatingReducer(start, { type: "assign", guestId: "g2", tableId: "table-02" });
    seatingReducer(start, { type: "unassign", guestId: "g1" });
    expect(start).toEqual(snapshot);
  });
});

describe("seatingReducer with seatCost (confirmed plus-ones)", () => {
  it("headline regression: capacity-2 table, 2 confirmed guests each with plusOnes:1 overflows; the same 2 guests with plusOnes:0 fit", () => {
    const start = arrangement({ g1: "table-01" }); // table-01 capacity 2

    const withPlusOnes = buildSeatCost([
      { ...makeGuest({ id: "g1" }), plusOnes: 1 },
      { ...makeGuest({ id: "g2" }), plusOnes: 1 },
    ]);
    const rejected = seatingReducer(
      start,
      { type: "assign", guestId: "g2", tableId: "table-01" },
      withPlusOnes,
    );
    expect(rejected.arrangement).toEqual(start);
    expect(rejected.rejection).toEqual({ guestId: "g2", tableId: "table-01", reason: "capacity" });

    const noPlusOnes = buildSeatCost([
      { ...makeGuest({ id: "g1" }), plusOnes: 0 },
      { ...makeGuest({ id: "g2" }), plusOnes: 0 },
    ]);
    const accepted = seatingReducer(
      start,
      { type: "assign", guestId: "g2", tableId: "table-01" },
      noPlusOnes,
    );
    expect(accepted.arrangement.assignments).toEqual({ g1: "table-01", g2: "table-01" });
    expect(accepted.rejection).toBeUndefined();
  });

  it("accepts a drop that exactly fits by seat-cost, rejects the same drop one seat over", () => {
    const table: SeatingArrangement = {
      tables: [{ id: "t1", label: "Table 1", capacity: 3 }],
      assignments: { g1: "t1" },
    };

    const exactFit = buildSeatCost([
      { ...makeGuest({ id: "g1" }), plusOnes: 1 }, // 2 seats
      { ...makeGuest({ id: "g2" }), plusOnes: 0 }, // 1 seat -> 3 total, exactly fits
    ]);
    const fits = seatingReducer(table, { type: "assign", guestId: "g2", tableId: "t1" }, exactFit);
    expect(fits.arrangement.assignments).toEqual({ g1: "t1", g2: "t1" });
    expect(fits.rejection).toBeUndefined();

    const oneOver = buildSeatCost([
      { ...makeGuest({ id: "g1" }), plusOnes: 1 }, // 2 seats
      { ...makeGuest({ id: "g2" }), plusOnes: 1 }, // 2 seats -> 4 total, over
    ]);
    const rejected = seatingReducer(table, { type: "assign", guestId: "g2", tableId: "t1" }, oneOver);
    expect(rejected.arrangement).toEqual(table);
    expect(rejected.rejection).toEqual({ guestId: "g2", tableId: "t1", reason: "capacity" });
  });

  it("a guest-id absent from the seatCost roster still defaults to 1 seat", () => {
    const start = arrangement({ g1: "table-02" }); // table-02 capacity 1
    const seatCost = buildSeatCost([]); // "g1" unknown -> costs 1, same as no-seatCost default
    const result = seatingReducer(start, { type: "assign", guestId: "g2", tableId: "table-02" }, seatCost);
    expect(result.rejection).toEqual({ guestId: "g2", tableId: "table-02", reason: "capacity" });
  });
});
