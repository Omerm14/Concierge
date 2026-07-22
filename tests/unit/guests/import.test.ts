import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { importGuests } from "../../../lib/guests/import";
import type { Guest } from "../../../lib/guests/types";

const fixturesDir = path.join(__dirname, "fixtures");

function withoutId(guests: Guest[]) {
  return [...guests]
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .map((g) => ({
      fullName: g.fullName,
      phone: g.phone,
      side: g.side,
      groups: g.groups,
      dietary: g.dietary,
      allergyNote: g.allergyNote,
      rsvpStatus: g.rsvpStatus,
      plusOnesAllowed: g.plusOnesAllowed,
      language: g.language,
    }));
}

describe("importGuests", () => {
  it("parses a valid .csv fixture into normalized guests", async () => {
    const csv = readFileSync(path.join(fixturesDir, "guests-en.csv"), "utf-8");
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(warnings).toEqual([]);
    expect(guests).toHaveLength(2);
    expect(withoutId(guests)).toEqual([
      {
        fullName: "Jane Doe",
        phone: "0521234567",
        side: "groom",
        groups: ["Work"],
        dietary: ["none"],
        allergyNote: undefined,
        rsvpStatus: "pending",
        plusOnesAllowed: 0,
        language: "en",
      },
      {
        fullName: "John Smith",
        phone: "0501234567",
        side: "bride",
        groups: ["Family", "College"],
        dietary: ["vegetarian"],
        allergyNote: undefined,
        rsvpStatus: "pending",
        plusOnesAllowed: 1,
        language: "en",
      },
    ]);
  });

  it("parses a valid .xlsx fixture into an identical normalized Guest[] as the equivalent .csv", async () => {
    const buffer = readFileSync(path.join(fixturesDir, "guests-en.xlsx"));
    const csv = readFileSync(path.join(fixturesDir, "guests-en.csv"), "utf-8");

    const xlsxResult = await importGuests(buffer, "xlsx");
    const csvResult = await importGuests(csv, "csv");

    expect(xlsxResult.warnings).toEqual([]);
    expect(withoutId(xlsxResult.guests)).toEqual(withoutId(csvResult.guests));
  });

  it("tolerantly maps Hebrew headers and warns once about an unmapped extra column", async () => {
    const csv = readFileSync(path.join(fixturesDir, "guests-he.csv"), "utf-8");
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(warnings).toEqual([expect.stringContaining("הערות פנימיות")]);
    expect(guests).toHaveLength(2);
    const dana = guests.find((g) => g.fullName === "דנה כהן");
    const yossi = guests.find((g) => g.fullName === "יוסי לוי");

    expect(dana?.side).toBe("bride");
    expect(dana?.phone).toBe("0509876543");
    expect(yossi?.side).toBe("groom");
    expect(yossi?.phone).toBe("0541112222");
  });

  it("collects malformed rows into warnings instead of throwing", async () => {
    const csv = readFileSync(
      path.join(fixturesDir, "guests-malformed.csv"),
      "utf-8"
    );
    const { guests, warnings } = await importGuests(csv, "csv");

    // missing-name row is skipped; the other two rows survive.
    expect(guests).toHaveLength(2);

    const badPhoneGuest = guests.find((g) => g.fullName === "Bad Phone Guest");
    expect(badPhoneGuest?.phone).toBeUndefined();

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("missing name"),
        expect.stringContaining('invalid phone "abc"'),
      ])
    );
  });

  it("preserves an international phone number with no drop warning", async () => {
    const csv = "Full Name,Phone\nAnglo Guest,+14155551234\n";
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(guests).toHaveLength(1);
    expect(guests[0]?.phone).toBe("+14155551234");
    expect(warnings).toEqual([]);
  });

  it("produces zero warnings for a fully clean sheet", async () => {
    const csv = readFileSync(path.join(fixturesDir, "guests-en.csv"), "utf-8");
    const { warnings } = await importGuests(csv, "csv");

    expect(warnings).toEqual([]);
  });

  it("warns once per distinct unmapped header, not once per row", async () => {
    const csv = "Full Name,Table\nA,1\nB,2\nC,3\n";
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(guests).toHaveLength(3);
    expect(warnings).toEqual(['Unrecognized column "Table", ignored']);
  });

  it("keeps side as \"other\" and warns on an unrecognized side token", async () => {
    const csv = "Full Name,Side\nA,Work\n";
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(guests[0]?.side).toBe("other");
    expect(warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('"Work"')])
    );
  });

  it("drops an unrecognized dietary token but keeps the recognized ones, with a warning", async () => {
    const csv = 'Full Name,Dietary\nA,"vegetarian, sparkly"\n';
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(guests[0]?.dietary).toEqual(["vegetarian"]);
    expect(warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('"sparkly"')])
    );
  });

  it("sets language to undefined and warns on an unrecognized language", async () => {
    const csv = "Full Name,Language\nA,klingon\n";
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(guests[0]?.language).toBeUndefined();
    expect(warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('"klingon"')])
    );
  });

  it("defaults plusOnesAllowed to 0 and warns on a non-numeric value", async () => {
    const csv = "Full Name,Plus Ones Allowed\nA,two\n";
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(guests[0]?.plusOnesAllowed).toBe(0);
    expect(warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('"two"')])
    );
  });

  it("defaults plusOnesAllowed to 0 and warns on a negative value", async () => {
    const csv = "Full Name,Plus Ones Allowed\nA,-1\n";
    const { guests, warnings } = await importGuests(csv, "csv");

    expect(guests[0]?.plusOnesAllowed).toBe(0);
    expect(warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('"-1"')])
    );
  });
});
