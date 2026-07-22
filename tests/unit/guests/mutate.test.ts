import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  addGuest,
  mergeGuests,
  removeGuest,
  updateGuest,
  type NewGuestInput,
} from "../../../lib/guests/mutate";
import type { Guest } from "../../../lib/guests/types";

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: randomUUID(),
    fullName: "Test Guest",
    side: "other",
    groups: [],
    dietary: ["none"],
    rsvpStatus: "pending",
    plusOnesAllowed: 0,
    ...overrides,
  };
}

const NEW_GUEST_INPUT: NewGuestInput = {
  fullName: "New Guest",
  side: "bride",
  groups: ["Family"],
  dietary: ["none"],
  plusOnesAllowed: 0,
};

describe("addGuest", () => {
  it("appends a guest with a generated id and rsvpStatus:pending", () => {
    const { guests, warnings } = addGuest([], NEW_GUEST_INPUT);

    expect(warnings).toEqual([]);
    expect(guests).toHaveLength(1);
    expect(guests[0]).toMatchObject({
      fullName: "New Guest",
      rsvpStatus: "pending",
    });
    expect(guests[0].id).toBeTruthy();
  });

  it("rejects an empty fullName with a warning and no insert", () => {
    const existing = [makeGuest()];
    const { guests, warnings } = addGuest(existing, {
      ...NEW_GUEST_INPUT,
      fullName: "   ",
    });

    expect(guests).toBe(existing);
    expect(warnings).toEqual([expect.stringContaining("fullName")]);
  });

  it("does not mutate the input array", () => {
    const existing = [makeGuest()];
    const snapshot = [...existing];
    addGuest(existing, NEW_GUEST_INPUT);

    expect(existing).toEqual(snapshot);
  });
});

describe("updateGuest", () => {
  it("edits fields immutably", () => {
    const guest = makeGuest({ fullName: "Before" });
    const existing = [guest];

    const { guests, warnings } = updateGuest(existing, guest.id, {
      fullName: "After",
    });

    expect(warnings).toEqual([]);
    expect(guests[0].fullName).toBe("After");
    expect(guests[0].id).toBe(guest.id);
    expect(existing[0].fullName).toBe("Before");
    expect(guests).not.toBe(existing);
  });

  it("no-ops with a warning for an unknown id", () => {
    const existing = [makeGuest()];
    const { guests, warnings } = updateGuest(existing, "missing-id", {
      fullName: "Whoever",
    });

    expect(guests).toBe(existing);
    expect(warnings).toEqual([expect.stringContaining("missing-id")]);
  });
});

describe("removeGuest", () => {
  it("drops a guest by id immutably", () => {
    const a = makeGuest({ fullName: "A" });
    const b = makeGuest({ fullName: "B" });
    const existing = [a, b];

    const { guests, warnings } = removeGuest(existing, a.id);

    expect(warnings).toEqual([]);
    expect(guests).toEqual([b]);
    expect(existing).toEqual([a, b]);
  });

  it("no-ops with a warning for an unknown id", () => {
    const existing = [makeGuest()];
    const { guests, warnings } = removeGuest(existing, "missing-id");

    expect(guests).toBe(existing);
    expect(warnings).toEqual([expect.stringContaining("missing-id")]);
  });
});

describe("mergeGuests", () => {
  it("unions groups/dietary and keeps the best-available phone/language/allergyNote, keyed by keepId", () => {
    const keep = makeGuest({
      fullName: "Dana Cohen",
      groups: ["Family"],
      dietary: ["none"],
      phone: undefined,
      language: undefined,
      allergyNote: undefined,
      plusOnesAllowed: 0,
      side: "other",
    });
    const drop = makeGuest({
      fullName: "Dana C.",
      groups: ["College"],
      dietary: ["vegetarian"],
      phone: "0501234567",
      language: "he",
      allergyNote: "nuts",
      plusOnesAllowed: 2,
      side: "bride",
    });

    const { guests, warnings } = mergeGuests([keep, drop], keep.id, drop.id);

    expect(warnings).toEqual([]);
    expect(guests).toHaveLength(1);
    const merged = guests[0];
    expect(merged.id).toBe(keep.id);
    expect(merged.groups.sort()).toEqual(["College", "Family"]);
    expect(merged.dietary).toEqual(["vegetarian"]);
    expect(merged.phone).toBe("0501234567");
    expect(merged.language).toBe("he");
    expect(merged.allergyNote).toBe("nuts");
    expect(merged.plusOnesAllowed).toBe(2);
    expect(merged.side).toBe("bride");
  });

  it("prefers the kept guest's non-empty phone/language/allergyNote when both present", () => {
    const keep = makeGuest({
      phone: "0501111111",
      language: "en",
      allergyNote: "shellfish",
    });
    const drop = makeGuest({
      phone: "0502222222",
      language: "he",
      allergyNote: "nuts",
    });

    const { guests } = mergeGuests([keep, drop], keep.id, drop.id);

    expect(guests[0].phone).toBe("0501111111");
    expect(guests[0].language).toBe("en");
    expect(guests[0].allergyNote).toBe("shellfish");
  });

  it("merging a yes guest with a pending duplicate yields yes", () => {
    const keep = makeGuest({ rsvpStatus: "pending" });
    const drop = makeGuest({ rsvpStatus: "yes" });

    const { guests, warnings } = mergeGuests([keep, drop], keep.id, drop.id);

    expect(warnings).toEqual([]);
    expect(guests[0].rsvpStatus).toBe("yes");
  });

  it("merging conflicting decided statuses keeps the kept guest's and warns", () => {
    const keep = makeGuest({ rsvpStatus: "yes" });
    const drop = makeGuest({ rsvpStatus: "no" });

    const { guests, warnings } = mergeGuests([keep, drop], keep.id, drop.id);

    expect(guests[0].rsvpStatus).toBe("yes");
    expect(warnings).toEqual([expect.stringContaining("conflicting rsvpStatus")]);
  });

  it("plusOnesAllowed is the max of the two guests", () => {
    const keep = makeGuest({ plusOnesAllowed: 1 });
    const drop = makeGuest({ plusOnesAllowed: 3 });

    const { guests } = mergeGuests([keep, drop], keep.id, drop.id);

    expect(guests).toHaveLength(1);
    expect(guests[0].plusOnesAllowed).toBe(3);
  });

  it("no-ops with a warning when either id is unknown", () => {
    const existing = [makeGuest()];
    const { guests, warnings } = mergeGuests(existing, existing[0].id, "missing-id");

    expect(guests).toBe(existing);
    expect(warnings).toEqual([expect.stringContaining("missing-id")]);
  });

  it("does not mutate the input array or its guest objects", () => {
    const keep = makeGuest({ groups: ["A"] });
    const drop = makeGuest({ groups: ["B"] });
    const existing = [keep, drop];
    const snapshot = JSON.parse(JSON.stringify(existing));

    mergeGuests(existing, keep.id, drop.id);

    expect(existing).toEqual(snapshot);
  });
});
