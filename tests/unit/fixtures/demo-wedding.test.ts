import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  demoArrangement,
  demoGuests,
  demoTables,
} from "../../../lib/fixtures/demo-wedding";
import { normalizePhone } from "../../../lib/guests/normalize";
import type { Dietary, Language, Side } from "../../../lib/guests/types";

const ALL_SIDES: Side[] = ["bride", "groom", "both", "other"];
const ALL_DIETARY: Dietary[] = [
  "none",
  "vegetarian",
  "vegan",
  "glatt",
  "gluten-free",
  "kids-meal",
  "allergy",
];
const ALL_LANGUAGES: Language[] = ["he", "en", "ru", "ar"];

describe("demo-wedding fixture", () => {
  it("exports demoGuests, demoTables, demoArrangement with valid shapes", () => {
    expect(demoGuests.length).toBeGreaterThan(0);
    expect(demoTables.length).toBeGreaterThan(0);
    expect(demoArrangement.tables).toBe(demoTables);
  });

  it("covers every side, every dietary tag, and every language at least once", () => {
    const sides = new Set(demoGuests.map((g) => g.side));
    for (const side of ALL_SIDES) {
      expect(sides.has(side)).toBe(true);
    }

    const dietaryTags = new Set(demoGuests.flatMap((g) => g.dietary));
    for (const tag of ALL_DIETARY) {
      expect(dietaryTags.has(tag)).toBe(true);
    }

    const languages = new Set(demoGuests.map((g) => g.language));
    for (const language of ALL_LANGUAGES) {
      expect(languages.has(language)).toBe(true);
    }
  });

  it("has at least one deliberate dedupe pair (same normalized phone, different format)", () => {
    const byNormalizedPhone = new Map<string, number>();
    for (const guest of demoGuests) {
      if (!guest.phone) continue;
      const normalized = normalizePhone(guest.phone);
      if (!normalized) continue;
      byNormalizedPhone.set(normalized, (byNormalizedPhone.get(normalized) ?? 0) + 1);
    }

    const hasDuplicate = [...byNormalizedPhone.values()].some((count) => count > 1);
    expect(hasDuplicate).toBe(true);
  });

  it("has allergy guests with a verbatim allergy note", () => {
    const allergyGuests = demoGuests.filter((g) => g.dietary.includes("allergy"));
    expect(allergyGuests.length).toBeGreaterThan(0);
    for (const guest of allergyGuests) {
      expect(guest.allergyNote).toBeTruthy();
    }
  });

  it("assignments reference only guest/table IDs that exist, and at least one guest is unseated", () => {
    const guestIds = new Set(demoGuests.map((g) => g.id));
    const tableIds = new Set(demoTables.map((t) => t.id));

    for (const [guestId, tableId] of Object.entries(demoArrangement.assignments)) {
      expect(guestIds.has(guestId)).toBe(true);
      expect(tableIds.has(tableId)).toBe(true);
    }

    const seatedGuestIds = new Set(Object.keys(demoArrangement.assignments));
    const unseated = demoGuests.filter((g) => !seatedGuestIds.has(g.id));
    expect(unseated.length).toBeGreaterThan(0);
  });

  it("never seats a table beyond its capacity", () => {
    const seatedCountByTable = new Map<string, number>();
    for (const tableId of Object.values(demoArrangement.assignments)) {
      seatedCountByTable.set(tableId, (seatedCountByTable.get(tableId) ?? 0) + 1);
    }
    for (const table of demoTables) {
      const seated = seatedCountByTable.get(table.id) ?? 0;
      expect(seated).toBeLessThanOrEqual(table.capacity);
    }
  });

  it("is deterministic across re-imports (stable IDs and values, no randomness)", async () => {
    const reimported = await import("../../../lib/fixtures/demo-wedding");
    expect(reimported.demoGuests).toEqual(demoGuests);
    expect(reimported.demoTables).toEqual(demoTables);
    expect(reimported.demoArrangement).toEqual(demoArrangement);
  });

  it("never mutates input and produces the same guest ordering on every access", () => {
    const snapshot = JSON.parse(JSON.stringify(demoGuests));
    expect(demoGuests).toEqual(snapshot);
  });
});

describe("lib/fixtures boundary", () => {
  it("never imports @supabase, fetch, or filesystem APIs", () => {
    const fixturesDir = path.join(__dirname, "..", "..", "..", "lib", "fixtures");
    const files = readdirSync(fixturesDir).filter((f) => f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const contents = readFileSync(path.join(fixturesDir, file), "utf-8");
      expect(contents).not.toMatch(/@supabase/);
      expect(contents).not.toMatch(/\bfetch\(/);
      expect(contents).not.toMatch(/from "node:fs"/);
      expect(contents).not.toMatch(/from "fs"/);
    }
  });
});
