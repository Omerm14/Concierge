import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { dedupe } from "../../../lib/guests/dedupe";
import type { Guest } from "../../../lib/guests/types";

function makeGuest(overrides: Partial<Guest>): Guest {
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

describe("dedupe", () => {
  it("groups two records with the same phone in different formats into one cluster", () => {
    const a = makeGuest({ fullName: "John Smith", phone: "050-123-4567" });
    const b = makeGuest({ fullName: "John S.", phone: "+972501234567" });
    const unrelated = makeGuest({ fullName: "Jane Doe", phone: "0529998888" });

    const clusters = dedupe([a, b, unrelated]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].guests.map((g) => g.id).sort()).toEqual(
      [a.id, b.id].sort()
    );
  });

  it("falls back to a normalized-name cluster when phone is absent", () => {
    const a = makeGuest({ fullName: "  Dana   Cohen " });
    const b = makeGuest({ fullName: "dana cohen" });
    const unrelated = makeGuest({ fullName: "Someone Else" });

    const clusters = dedupe([a, b, unrelated]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].guests.map((g) => g.id).sort()).toEqual(
      [a.id, b.id].sort()
    );
  });

  it("returns no clusters when nothing duplicates", () => {
    const guests = [
      makeGuest({ fullName: "Alice", phone: "0501112222" }),
      makeGuest({ fullName: "Bob", phone: "0503334444" }),
    ];

    expect(dedupe(guests)).toEqual([]);
  });
});
