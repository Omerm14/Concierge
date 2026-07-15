import { describe, expect, it } from "vitest";
import { seatingReducer } from "../../../lib/seating/reducer";
import type { SeatingArrangement } from "../../../lib/guests/types";

function arrangement(assignments: Record<string, string> = {}): SeatingArrangement {
  return {
    tables: [
      { id: "table-01", label: "Table 1", capacity: 2 },
      { id: "table-02", label: "Table 2", capacity: 1 },
    ],
    assignments,
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
