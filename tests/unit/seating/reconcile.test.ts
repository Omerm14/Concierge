import { describe, expect, it } from "vitest";
import { reconcileSeating } from "../../../lib/seating/reconcile";
import { unseatedConfirmed } from "../../../lib/roster/totals";
import { demoArrangement, demoGuests } from "../../../lib/fixtures/demo-wedding";
import type { Guest, SeatingArrangement } from "../../../lib/guests/types";

type TrackedGuest = Guest & { plusOnes?: number };

function makeGuest(overrides: Partial<TrackedGuest> & { id: string }): TrackedGuest {
  return {
    fullName: `Guest ${overrides.id}`,
    side: "bride",
    groups: [],
    dietary: ["none"],
    rsvpStatus: "pending",
    plusOnesAllowed: 0,
    ...overrides,
  };
}

const table: SeatingArrangement["tables"][number] = {
  id: "t1",
  label: "Table 1",
  capacity: 8,
};

describe("reconcileSeating", () => {
  it("AC1: flags a seated guest whose rsvpStatus is no/maybe/pending, never a still-yes seated guest", () => {
    const guests: TrackedGuest[] = [
      makeGuest({ id: "g1", rsvpStatus: "no" }),
      makeGuest({ id: "g2", rsvpStatus: "maybe" }),
      makeGuest({ id: "g3", rsvpStatus: "pending" }),
      makeGuest({ id: "g4", rsvpStatus: "yes", plusOnes: 1 }),
    ];
    const arrangement: SeatingArrangement = {
      tables: [table],
      assignments: { g1: "t1", g2: "t1", g3: "t1", g4: "t1" },
    };

    const result = reconcileSeating(guests, arrangement);

    expect(result.seatedNoLongerAttending).toEqual([
      { guestId: "g1", tableId: "t1", rsvpStatus: "no" },
      { guestId: "g2", tableId: "t1", rsvpStatus: "maybe" },
      { guestId: "g3", tableId: "t1", rsvpStatus: "pending" },
    ]);
    expect(result.seatedNoLongerAttending.some((entry) => entry.guestId === "g4")).toBe(false);
  });

  it("AC2: unseatedConfirmed is exactly what lib/roster/totals's unseatedConfirmed() returns for the same inputs", () => {
    const guests: TrackedGuest[] = [
      makeGuest({ id: "g1", rsvpStatus: "yes", plusOnes: 1 }),
      makeGuest({ id: "g2", rsvpStatus: "yes", plusOnes: 0 }),
      makeGuest({ id: "g3", rsvpStatus: "no" }),
    ];
    const arrangement: SeatingArrangement = {
      tables: [table],
      assignments: { g1: "t1" },
    };

    const result = reconcileSeating(guests, arrangement);

    expect(result.unseatedConfirmed).toEqual(unseatedConfirmed(guests, arrangement));

    const demoResult = reconcileSeating(demoGuests, demoArrangement);
    expect(demoResult.unseatedConfirmed).toEqual(unseatedConfirmed(demoGuests, demoArrangement));
  });

  it("AC3: a yes guest seated with confirmed plusOnes 0 (or undefined) surfaces in stalePlusOneSeats; one with plusOnes >= 1 does not", () => {
    const guests: TrackedGuest[] = [
      makeGuest({ id: "g1", rsvpStatus: "yes", plusOnes: 0 }),
      makeGuest({ id: "g2", rsvpStatus: "yes" }),
      makeGuest({ id: "g3", rsvpStatus: "yes", plusOnes: 1 }),
    ];
    const arrangement: SeatingArrangement = {
      tables: [table],
      assignments: { g1: "t1", g2: "t1", g3: "t1" },
    };

    const result = reconcileSeating(guests, arrangement);

    expect(result.stalePlusOneSeats).toEqual([
      { guestId: "g1", tableId: "t1" },
      { guestId: "g2", tableId: "t1" },
    ]);
    expect(result.stalePlusOneSeats.some((entry) => entry.guestId === "g3")).toBe(false);
  });

  it("AC4: isClean is true iff all three arrays are empty", () => {
    const cleanGuests: TrackedGuest[] = [makeGuest({ id: "g1", rsvpStatus: "yes", plusOnes: 1 })];
    const cleanArrangement: SeatingArrangement = { tables: [table], assignments: { g1: "t1" } };
    expect(reconcileSeating(cleanGuests, cleanArrangement).isClean).toBe(true);

    const driftedGuests: TrackedGuest[] = [makeGuest({ id: "g1", rsvpStatus: "no" })];
    const driftedArrangement: SeatingArrangement = { tables: [table], assignments: { g1: "t1" } };
    expect(reconcileSeating(driftedGuests, driftedArrangement).isClean).toBe(false);
  });

  it("a fully-consistent fixture returns isClean: true", () => {
    const guests: TrackedGuest[] = [makeGuest({ id: "g1", rsvpStatus: "yes", plusOnes: 2 })];
    const arrangement: SeatingArrangement = { tables: [table], assignments: { g1: "t1" } };
    expect(reconcileSeating(guests, arrangement)).toEqual({
      seatedNoLongerAttending: [],
      unseatedConfirmed: [],
      stalePlusOneSeats: [],
      isClean: true,
    });
  });

  it("AC5: output ordering is deterministic across repeated calls on the demo fixture", () => {
    const first = reconcileSeating(demoGuests, demoArrangement);
    const second = reconcileSeating(demoGuests, demoArrangement);
    expect(first).toEqual(second);
  });

  it("mutating a seated demo guest to declined and lowering a plus-one surfaces both", () => {
    const [seatedGuestId] = Object.keys(demoArrangement.assignments);
    const mutatedGuests: TrackedGuest[] = demoGuests.map((guest) =>
      guest.id === seatedGuestId ? { ...guest, rsvpStatus: "no" as const, plusOnes: 0 } : guest,
    );

    const result = reconcileSeating(mutatedGuests, demoArrangement);

    expect(
      result.seatedNoLongerAttending.some((entry) => entry.guestId === seatedGuestId),
    ).toBe(true);
    expect(result.isClean).toBe(false);
  });

  it("does not throw on a plain Guest[] with no plusOnes field", () => {
    const guest: Guest = {
      id: "raw-1",
      fullName: "Raw Guest",
      side: "bride",
      groups: [],
      dietary: ["none"],
      rsvpStatus: "yes",
      plusOnesAllowed: 0,
    };
    const arrangement: SeatingArrangement = { tables: [table], assignments: { "raw-1": "t1" } };

    expect(() => reconcileSeating([guest], arrangement)).not.toThrow();
    expect(reconcileSeating([guest], arrangement).stalePlusOneSeats).toEqual([
      { guestId: "raw-1", tableId: "t1" },
    ]);
  });
});
