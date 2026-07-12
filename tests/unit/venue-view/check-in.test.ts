import { describe, expect, it } from "vitest";
import { checkInList, tableLayout } from "../../../lib/venue-view/check-in";
import type { Guest, SeatingArrangement, Table } from "../../../lib/guests/types";

function makeGuest(overrides: Partial<Guest> & { id: string }): Guest {
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

const tableA: Table = { id: "table-a", label: "Table A", capacity: 4 };
const tableB: Table = { id: "table-b", label: "Table B", capacity: 2 };

const guests: Guest[] = [
  makeGuest({ id: "g1", fullName: "Zoe Adler", rsvpStatus: "yes" }),
  makeGuest({ id: "g2", fullName: "Amir Ben", rsvpStatus: "yes" }),
  makeGuest({ id: "g3", fullName: "Noa Cohen", rsvpStatus: "pending" }),
  makeGuest({ id: "g4", fullName: "Dana Even", rsvpStatus: "yes" }),
];

const arrangement: SeatingArrangement = {
  tables: [tableA, tableB],
  assignments: {
    g1: "table-a",
    g2: "table-a",
    g3: "table-a",
    // g4 confirmed but unseated
  },
};

describe("tableLayout", () => {
  it("groups guests by their assigned table, in arrangement order, regardless of RSVP status", () => {
    const groups = tableLayout(guests, arrangement);

    expect(groups.map((g) => g.table.id)).toEqual(["table-a", "table-b"]);
    expect(groups[0].guests.map((g) => g.id)).toEqual(["g1", "g2", "g3"]);
    expect(groups[1].guests).toEqual([]);
  });

  it("does not mutate its inputs", () => {
    const guestsCopy = structuredClone(guests);
    const arrangementCopy = structuredClone(arrangement);
    tableLayout(guests, arrangement);
    expect(guests).toEqual(guestsCopy);
    expect(arrangement).toEqual(arrangementCopy);
  });
});

describe("checkInList", () => {
  it("includes only confirmed guests per table, sorted alphabetically", () => {
    const { byTable } = checkInList(guests, arrangement);

    expect(byTable[0].table.id).toBe("table-a");
    expect(byTable[0].guests.map((g) => g.fullName)).toEqual(["Amir Ben", "Zoe Adler"]);
  });

  it("surfaces confirmed-but-unseated guests separately instead of dropping them", () => {
    const { unseated } = checkInList(guests, arrangement);
    expect(unseated.map((g) => g.id)).toEqual(["g4"]);
  });

  it("never drops a confirmed guest from either the by-table or unseated lists", () => {
    const { byTable, unseated } = checkInList(guests, arrangement);
    const confirmedIds = guests.filter((g) => g.rsvpStatus === "yes").map((g) => g.id).sort();
    const surfacedIds = [...byTable.flatMap((g) => g.guests.map((guest) => guest.id)), ...unseated.map((g) => g.id)].sort();
    expect(surfacedIds).toEqual(confirmedIds);
  });
});
