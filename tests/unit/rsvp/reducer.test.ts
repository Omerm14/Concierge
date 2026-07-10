import { describe, expect, it } from "vitest";
import { applyRsvpResponse } from "../../../lib/rsvp/reducer";
import type { RsvpResponse } from "../../../lib/rsvp/types";
import type { Guest } from "../../../lib/guests/types";

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: "g1",
    fullName: "Guest One",
    side: "bride",
    groups: [],
    dietary: [],
    rsvpStatus: "pending",
    plusOnesAllowed: 2,
    ...overrides,
  };
}

describe("applyRsvpResponse", () => {
  it("applies a yes with plus-ones within the allowance, no warnings", () => {
    const guest = makeGuest();
    const response: RsvpResponse = { rsvpStatus: "yes", plusOnes: 2 };

    const result = applyRsvpResponse(guest, response);

    expect(result.guest.rsvpStatus).toBe("yes");
    expect(result.guest.plusOnes).toBe(2);
    expect(result.changed).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("clamps plus-ones above the allowance with a warning", () => {
    const guest = makeGuest({ plusOnesAllowed: 1 });
    const response: RsvpResponse = { rsvpStatus: "yes", plusOnes: 5 };

    const result = applyRsvpResponse(guest, response);

    expect(result.guest.plusOnes).toBe(1);
    expect(result.warnings).toEqual([expect.stringContaining("clamped")]);
  });

  it("forces plus-ones to 0 on a no response", () => {
    const guest = makeGuest({ rsvpStatus: "yes" });
    const priorYes = applyRsvpResponse(guest, { rsvpStatus: "yes", plusOnes: 2 });

    const result = applyRsvpResponse(priorYes.guest, { rsvpStatus: "no" });

    expect(result.guest.rsvpStatus).toBe("no");
    expect(result.guest.plusOnes).toBe(0);
    expect(result.changed).toBe(true);
  });

  it("is idempotent: re-applying the identical response is a no-op", () => {
    const guest = makeGuest();
    const response: RsvpResponse = { rsvpStatus: "yes", plusOnes: 2 };

    const first = applyRsvpResponse(guest, response);
    const second = applyRsvpResponse(first.guest, response);

    expect(second.changed).toBe(false);
    expect(second.guest).toEqual(first.guest);
  });

  it("accepts changing a prior yes to no and clears plus-ones", () => {
    const guest = makeGuest();
    const yes = applyRsvpResponse(guest, { rsvpStatus: "yes", plusOnes: 2 });

    const no = applyRsvpResponse(yes.guest, { rsvpStatus: "no" });

    expect(no.guest.rsvpStatus).toBe("no");
    expect(no.guest.plusOnes).toBe(0);
    expect(no.changed).toBe(true);
  });

  it("warns on an allergy tag with no note", () => {
    const guest = makeGuest();
    const response: RsvpResponse = {
      rsvpStatus: "yes",
      dietary: ["allergy"],
    };

    const result = applyRsvpResponse(guest, response);

    expect(result.warnings).toEqual([
      expect.stringContaining("allergyNote"),
    ]);
  });

  it("does not warn when an allergy tag carries an allergyNote", () => {
    const guest = makeGuest();
    const response: RsvpResponse = {
      rsvpStatus: "yes",
      dietary: ["allergy"],
      allergyNote: "peanuts",
    };

    const result = applyRsvpResponse(guest, response);

    expect(result.warnings).toEqual([]);
    expect(result.guest.allergyNote).toBe("peanuts");
  });

  it("drops unknown dietary values with a warning", () => {
    const guest = makeGuest();
    const response = {
      rsvpStatus: "yes",
      dietary: ["kosher-style"],
    } as unknown as RsvpResponse;

    const result = applyRsvpResponse(guest, response);

    expect(result.guest.dietary).toEqual([]);
    expect(result.warnings).toEqual([
      expect.stringContaining("unknown dietary value"),
    ]);
  });

  it("never mutates the input guest", () => {
    const guest = Object.freeze(makeGuest({ dietary: ["vegan"] }));

    expect(() =>
      applyRsvpResponse(guest, { rsvpStatus: "yes", plusOnes: 1 }),
    ).not.toThrow();
    expect(guest.rsvpStatus).toBe("pending");
    expect(guest.dietary).toEqual(["vegan"]);
  });

  it("merges an optional language onto the guest", () => {
    const guest = makeGuest();
    const result = applyRsvpResponse(guest, { rsvpStatus: "maybe", language: "he" });

    expect(result.guest.language).toBe("he");
  });
});
