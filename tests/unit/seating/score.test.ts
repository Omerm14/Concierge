import { describe, expect, it } from "vitest";
import { scoreArrangement } from "../../../lib/seating/score";
import { buildSeatCost } from "../../../lib/seating/occupancy";
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

describe("scoreArrangement — occupancy imbalance with seatCost", () => {
  const tables: Table[] = [
    { id: "t1", label: "Table 1", capacity: 4 },
    { id: "t2", label: "Table 2", capacity: 4 },
  ];
  const arrangement: SeatingArrangement = {
    tables,
    assignments: { g1: "t1", g2: "t2" },
  };
  // By guest-id count this is perfectly balanced (1 guest each, 1/4 fill).
  // By seat-cost it is badly imbalanced: g1's plus-ones fill t1 completely
  // (4/4) while t2 sits mostly empty (1/4).
  const guests = [
    { ...makeGuest({ id: "g1" }), plusOnes: 3 },
    { ...makeGuest({ id: "g2" }), plusOnes: 0 },
  ];

  it("scores a plus-one-skewed arrangement lower once seat-cost reveals the real imbalance", () => {
    const withoutSeatCost = scoreArrangement(arrangement, [], guests);
    const withSeatCost = scoreArrangement(arrangement, [], guests, buildSeatCost(guests));
    expect(withSeatCost).toBeLessThan(withoutSeatCost);
  });

  it("matches the default-1 (no seatCost) score when every guest has 0 confirmed plus-ones", () => {
    const flatGuests = [
      { ...makeGuest({ id: "g1" }), plusOnes: 0 },
      { ...makeGuest({ id: "g2" }), plusOnes: 0 },
    ];
    const withoutSeatCost = scoreArrangement(arrangement, [], flatGuests);
    const withSeatCost = scoreArrangement(arrangement, [], flatGuests, buildSeatCost(flatGuests));
    expect(withSeatCost).toBe(withoutSeatCost);
  });
});
