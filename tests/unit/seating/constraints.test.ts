import { describe, expect, it } from "vitest";
import { evaluateConstraints } from "../../../lib/seating/constraints";
import { buildSeatCost } from "../../../lib/seating/occupancy";
import type { Guest, SeatingArrangement } from "../../../lib/guests/types";

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

describe("evaluateConstraints", () => {
  const guests: Guest[] = [
    makeGuest({ id: "g1", side: "bride" }),
    makeGuest({ id: "g2", side: "groom" }),
    makeGuest({ id: "g3", side: "bride" }),
    makeGuest({ id: "g4", side: "groom" }),
  ];

  const arrangement: SeatingArrangement = {
    tables: [
      { id: "t1", label: "Table 1", capacity: 2 },
      { id: "t2", label: "Table 2", capacity: 2 },
    ],
    assignments: {
      g1: "t1",
      g2: "t1",
      g3: "t2",
      g4: "t2",
    },
  };

  it("flags a keep-apart pair seated at the same table as violated, satisfied when separated", () => {
    const violated = evaluateConstraints(
      arrangement,
      [{ type: "keep-apart", guestIds: ["g1", "g2"] }],
      guests,
    );
    expect(violated.results[0].satisfied).toBe(false);
    expect(violated.results[0].violatingGuestIds.sort()).toEqual(["g1", "g2"]);

    const satisfied = evaluateConstraints(
      arrangement,
      [{ type: "keep-apart", guestIds: ["g1", "g3"] }],
      guests,
    );
    expect(satisfied.results[0].satisfied).toBe(true);
    expect(satisfied.results[0].violatingGuestIds).toEqual([]);
  });

  it("reports a keep-together group split across tables as a soft violation with offending guestIds", () => {
    const result = evaluateConstraints(
      arrangement,
      [{ type: "keep-together", guestIds: ["g1", "g3"] }],
      guests,
    );
    expect(result.results[0].satisfied).toBe(false);
    expect(result.results[0].constraint.hardness).toBeUndefined();
    expect(result.results[0].violatingGuestIds.sort()).toEqual(["g1", "g3"]);
    // soft violation must not count toward hardViolations
    expect(result.hardViolations).toBe(0);

    const together = evaluateConstraints(
      arrangement,
      [{ type: "keep-together", guestIds: ["g1", "g2"] }],
      guests,
    );
    expect(together.results[0].satisfied).toBe(true);
  });

  it("reports a table over capacity as a hard violation and counts hardViolations correctly across a mixed set", () => {
    const overCapacityArrangement: SeatingArrangement = {
      tables: [{ id: "t1", label: "Table 1", capacity: 1 }],
      assignments: { g1: "t1", g2: "t1" },
    };

    const result = evaluateConstraints(
      overCapacityArrangement,
      [
        { type: "capacity" },
        { type: "keep-together", guestIds: ["g1", "g2"] }, // satisfied, soft
        { type: "must-sit-at", guestId: "g1", tableId: "t2" }, // violated, hard
      ],
      guests,
    );

    const capacityResult = result.results.find((r) => r.constraint.type === "capacity");
    expect(capacityResult?.satisfied).toBe(false);
    expect(capacityResult?.violatingGuestIds.sort()).toEqual(["g1", "g2"]);
    // capacity (hard) + must-sit-at (hard) violated, keep-together satisfied
    expect(result.hardViolations).toBe(2);
  });

  it("flags plus-one seat-cost overflow via seatCost even when the guest-id count is within capacity, and does not without it", () => {
    const twoGuestsAtCapacityTwo: SeatingArrangement = {
      tables: [{ id: "t1", label: "Table 1", capacity: 2 }],
      assignments: { g1: "t1", g2: "t1" },
    };

    const guestsWithPlusOnes = [
      { ...makeGuest({ id: "g1" }), plusOnes: 1 },
      { ...makeGuest({ id: "g2" }), plusOnes: 1 },
    ];
    const overflow = evaluateConstraints(
      twoGuestsAtCapacityTwo,
      [{ type: "capacity" }],
      guestsWithPlusOnes,
      buildSeatCost(guestsWithPlusOnes),
    );
    const overflowResult = overflow.results.find((r) => r.constraint.type === "capacity");
    expect(overflowResult?.satisfied).toBe(false);
    expect(overflowResult?.violatingGuestIds.sort()).toEqual(["g1", "g2"]);

    // Same 2 guest-ids at the same capacity-2 table, no seatCost supplied —
    // the guest-id count (2) alone is within capacity, so it's satisfied.
    const withoutSeatCost = evaluateConstraints(
      twoGuestsAtCapacityTwo,
      [{ type: "capacity" }],
      guests,
    );
    const defaultResult = withoutSeatCost.results.find((r) => r.constraint.type === "capacity");
    expect(defaultResult?.satisfied).toBe(true);

    // The same guests with 0 confirmed plus-ones also fit under seatCost.
    const guestsNoPlusOnes = [
      { ...makeGuest({ id: "g1" }), plusOnes: 0 },
      { ...makeGuest({ id: "g2" }), plusOnes: 0 },
    ];
    const fits = evaluateConstraints(
      twoGuestsAtCapacityTwo,
      [{ type: "capacity" }],
      guestsNoPlusOnes,
      buildSeatCost(guestsNoPlusOnes),
    );
    const fitsResult = fits.results.find((r) => r.constraint.type === "capacity");
    expect(fitsResult?.satisfied).toBe(true);
  });

  it("detects a must-sit-at violation when the guest is at the wrong or no table", () => {
    const wrongTable = evaluateConstraints(
      arrangement,
      [{ type: "must-sit-at", guestId: "g1", tableId: "t2" }],
      guests,
    );
    expect(wrongTable.results[0].satisfied).toBe(false);
    expect(wrongTable.results[0].violatingGuestIds).toEqual(["g1"]);

    const unassignedArrangement: SeatingArrangement = {
      tables: [{ id: "t1", label: "Table 1", capacity: 4 }],
      assignments: {},
    };
    const noTable = evaluateConstraints(
      unassignedArrangement,
      [{ type: "must-sit-at", guestId: "g1", tableId: "t1" }],
      guests,
    );
    expect(noTable.results[0].satisfied).toBe(false);

    const correctTable = evaluateConstraints(
      arrangement,
      [{ type: "must-sit-at", guestId: "g1", tableId: "t1" }],
      guests,
    );
    expect(correctTable.results[0].satisfied).toBe(true);
  });

  it("flags a same-side-table mix beyond tolerance and respects a custom tolerance", () => {
    const strict = evaluateConstraints(
      arrangement,
      [{ type: "same-side-table" }],
      guests,
    );
    // both tables mix one bride + one groom guest -> minority side (1) > default tolerance (0)
    expect(strict.results[0].satisfied).toBe(false);
    expect(strict.hardViolations).toBe(0); // soft by default

    const tolerant = evaluateConstraints(
      arrangement,
      [{ type: "same-side-table", tolerance: 1 }],
      guests,
    );
    expect(tolerant.results[0].satisfied).toBe(true);
  });

  it("is pure: same inputs produce the same output and never mutate the passed arrangement or guests", () => {
    const frozenArrangement: SeatingArrangement = {
      tables: arrangement.tables.map((t) => Object.freeze({ ...t })),
      assignments: Object.freeze({ ...arrangement.assignments }),
    };
    Object.freeze(frozenArrangement);
    const frozenGuests: Guest[] = guests.map((g) => Object.freeze({ ...g }));
    Object.freeze(frozenGuests);

    const constraints = [
      { type: "keep-apart" as const, guestIds: ["g1", "g2"] },
      { type: "capacity" as const },
      { type: "same-side-table" as const },
    ];

    const first = evaluateConstraints(frozenArrangement, constraints, frozenGuests);
    const second = evaluateConstraints(frozenArrangement, constraints, frozenGuests);

    expect(first).toEqual(second);
    // freezing means any mutation attempt would throw in strict mode / silently
    // no-op otherwise; asserting the object identity of nested structures is
    // untouched proves no mutation occurred.
    expect(frozenArrangement.tables).toEqual(arrangement.tables);
    expect(frozenArrangement.assignments).toEqual(arrangement.assignments);
  });
});
