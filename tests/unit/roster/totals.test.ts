import { describe, expect, it } from "vitest";
import {
  bySide,
  byGroup,
  dietaryTotals,
  headcount,
  responseBreakdown,
  unseatedConfirmed,
} from "../../../lib/roster/totals";
import { demoArrangement, demoGuests } from "../../../lib/fixtures/demo-wedding";
import type { Guest } from "../../../lib/guests/types";

// Mirrors lib/roster/totals.ts's RosterGuest — a Guest optionally carrying
// the CON-9 reducer's confirmed plusOnes count.
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

const fixedGuests: TrackedGuest[] = [
  makeGuest({
    id: "g1",
    rsvpStatus: "yes",
    plusOnesAllowed: 2,
    plusOnes: 1,
    side: "bride",
    groups: ["family"],
  }),
  makeGuest({ id: "g2", rsvpStatus: "no", side: "groom", groups: ["family"] }),
  makeGuest({ id: "g3", rsvpStatus: "pending", side: "bride", groups: ["work-friends"] }),
  makeGuest({ id: "g4", rsvpStatus: "maybe", side: "both", groups: ["work-friends"] }),
  makeGuest({
    id: "g5",
    rsvpStatus: "yes",
    plusOnesAllowed: 3,
    plusOnes: 0,
    dietary: ["allergy", "vegan"],
    allergyNote: "Peanut allergy",
    side: "groom",
    groups: ["family"],
  }),
];

describe("responseBreakdown", () => {
  it("counts sum to guests.length and responseRate reflects yes+no+maybe", () => {
    const result = responseBreakdown(fixedGuests);
    expect(result).toEqual({ yes: 2, no: 1, pending: 1, maybe: 1, responseRate: 4 / 5 });
  });

  it("cross-checks against the CON-16 demo fixture", () => {
    const result = responseBreakdown(demoGuests);
    expect(result.yes + result.no + result.pending + result.maybe).toBe(demoGuests.length);
    expect(result.responseRate).toBe((result.yes + result.no + result.maybe) / demoGuests.length);
  });
});

describe("headcount", () => {
  it("maxAttending adds confirmed plusOnes, not plusOnesAllowed", () => {
    const result = headcount(fixedGuests);
    expect(result.minAttending).toBe(2);
    expect(result.confirmedGuests).toBe(2);
    // g1: host + 1 confirmed plus-one; g5: host + 0 confirmed plus-ones.
    expect(result.maxAttending).toBe(3);
  });

  it("AC1: a confirmed plusOnes count overrides a larger plusOnesAllowed", () => {
    const guest = makeGuest({ id: "a1", rsvpStatus: "yes", plusOnesAllowed: 2, plusOnes: 1 });
    expect(headcount([guest]).maxAttending).toBe(2);
  });

  it("AC2: a guest who confirms zero plus-ones contributes only themself", () => {
    const guest = makeGuest({ id: "a2", rsvpStatus: "yes", plusOnesAllowed: 3, plusOnes: 0 });
    expect(headcount([guest]).maxAttending).toBe(1);
  });

  it("AC4: a raw Guest with no plusOnes field treats confirmed plus-ones as 0, no crash", () => {
    const guest: Guest = {
      id: "a3",
      fullName: "Raw Guest",
      side: "bride",
      groups: [],
      dietary: ["none"],
      rsvpStatus: "yes",
      plusOnesAllowed: 4,
    };
    expect(() => headcount([guest])).not.toThrow();
    expect(headcount([guest]).maxAttending).toBe(1);
  });

  it("maxAttending is always >= minAttending on the demo fixture", () => {
    const result = headcount(demoGuests);
    expect(result.maxAttending).toBeGreaterThanOrEqual(result.minAttending);
  });
});

describe("dietaryTotals", () => {
  it("sums each dietary tag once per guest, adds confirmed plus-one meals, and collects allergy notes verbatim", () => {
    const result = dietaryTotals(fixedGuests);
    expect(result.counts.allergy).toBe(1);
    expect(result.counts.vegan).toBe(1);
    // g2, g3, g4 (base "none") + g1 (base "none") + g1's 1 confirmed plus-one.
    expect(result.counts.none).toBe(5);
    expect(result.allergyNotes).toEqual([{ fullName: "Guest g5", allergyNote: "Peanut allergy" }]);
  });

  it("a plus-one's meal defaults to the host's single dietary tag when it's trivially derivable", () => {
    const veganHost = makeGuest({ id: "m1", rsvpStatus: "yes", dietary: ["vegan"], plusOnes: 2 });
    const result = dietaryTotals([veganHost]);
    expect(result.counts.vegan).toBe(3); // host + 2 confirmed plus-ones
  });

  it("a plus-one's meal defaults to none when the host's dietary tag is ambiguous (0 or >1 tags)", () => {
    const multiTagHost = makeGuest({
      id: "m2",
      rsvpStatus: "yes",
      dietary: ["vegan", "gluten-free"],
      plusOnes: 2,
    });
    const noTagHost = makeGuest({ id: "m3", rsvpStatus: "yes", dietary: [], plusOnes: 1 });
    const result = dietaryTotals([multiTagHost, noTagHost]);
    expect(result.counts.vegan).toBe(1);
    expect(result.counts["gluten-free"]).toBe(1);
    expect(result.counts.none).toBe(3); // 2 ambiguous plus-ones from m2 + 1 from m3
  });

  it("AC3: mains reconcile with headcount.maxAttending for a single-tag confirmed cohort", () => {
    const cohort: TrackedGuest[] = [
      makeGuest({ id: "c1", rsvpStatus: "yes", dietary: ["vegan"], plusOnes: 2 }),
      makeGuest({ id: "c2", rsvpStatus: "yes", dietary: ["none"], plusOnes: 0 }),
      makeGuest({ id: "c3", rsvpStatus: "yes", dietary: ["gluten-free"], plusOnes: 1 }),
    ];
    const mains = Object.values(dietaryTotals(cohort).counts).reduce((sum, n) => sum + n, 0);
    expect(mains).toBe(headcount(cohort).maxAttending);
  });

  it("counts every Dietary tag against the demo fixture without throwing", () => {
    const result = dietaryTotals(demoGuests);
    const total = Object.values(result.counts).reduce((sum, n) => sum + n, 0);
    expect(total).toBeGreaterThan(0);
    expect(result.allergyNotes.length).toBeGreaterThan(0);
  });
});

describe("bySide / byGroup", () => {
  it("groups headcount and responseBreakdown by side", () => {
    const result = bySide(fixedGuests);
    expect(result.bride.responseBreakdown.yes).toBe(1);
    expect(result.groom.responseBreakdown.yes).toBe(1);
    expect(result.groom.headcount.maxAttending).toBe(1); // g5 confirmed 0 plus-ones
    expect(result.both.responseBreakdown.maybe).toBe(1);
  });

  it("groups by each groups value, counting a multi-group guest in each", () => {
    const result = byGroup(fixedGuests);
    expect(result.family.responseBreakdown.yes).toBe(2);
    expect(result["work-friends"].responseBreakdown.pending).toBe(1);
  });
});

describe("unseatedConfirmed", () => {
  it("returns only confirmed guests missing from the arrangement", () => {
    const arrangement = { tables: [{ id: "t1", label: "Table 1", capacity: 1 }], assignments: { g1: "t1" } };
    const result = unseatedConfirmed(fixedGuests, arrangement);
    expect(result.map((g) => g.id)).toEqual(["g5"]);
  });

  it("never returns a guest present in the demo arrangement's assignments", () => {
    const result = unseatedConfirmed(demoGuests, demoArrangement);
    for (const guest of result) {
      expect(demoArrangement.assignments[guest.id]).toBeUndefined();
    }
  });
});

describe("purity", () => {
  it("never mutates the input guest list and is deterministic across calls", () => {
    const guests = fixedGuests.map((g) => Object.freeze({ ...g }));

    expect(() => {
      responseBreakdown(guests);
      headcount(guests);
      dietaryTotals(guests);
      bySide(guests);
      byGroup(guests);
    }).not.toThrow();

    expect(responseBreakdown(guests)).toEqual(responseBreakdown(guests));
    expect(headcount(guests)).toEqual(headcount(guests));
    expect(dietaryTotals(guests)).toEqual(dietaryTotals(guests));
  });
});
