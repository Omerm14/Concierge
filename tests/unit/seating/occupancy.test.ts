import { describe, expect, it } from "vitest";
import { buildSeatCost } from "../../../lib/seating/occupancy";
import type { Guest } from "../../../lib/guests/types";

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

describe("buildSeatCost", () => {
  it("costs 1 seat for a guest with no confirmed plus-ones", () => {
    const seatCost = buildSeatCost([makeGuest({ id: "g1" })]);
    expect(seatCost("g1")).toBe(1);
  });

  it("costs 1 + confirmed plusOnes seats for a guest that has them", () => {
    const seatCost = buildSeatCost([{ ...makeGuest({ id: "g1" }), plusOnes: 2 }]);
    expect(seatCost("g1")).toBe(3);
  });

  it("ignores plusOnesAllowed (the ceiling) — only confirmed plusOnes counts", () => {
    const seatCost = buildSeatCost([makeGuest({ id: "g1", plusOnesAllowed: 5 })]);
    expect(seatCost("g1")).toBe(1);
  });

  it("defaults to 1 seat for a guest-id not present in the roster", () => {
    const seatCost = buildSeatCost([]);
    expect(seatCost("unknown")).toBe(1);
  });
});
