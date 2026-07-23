import { describe, expect, it } from "vitest";
import {
  addTable,
  removeTable,
  renameTable,
  reorderTables,
  setCapacity,
  validateTables,
} from "../../../lib/seating/tables";
import { demoArrangement, demoTables } from "../../../lib/fixtures/demo-wedding";
import type { SeatingArrangement, Table } from "../../../lib/guests/types";

function freezeTables(tables: Table[]): Table[] {
  return Object.freeze(tables.map((table) => Object.freeze({ ...table }))) as Table[];
}

const fixedTables: Table[] = freezeTables([
  { id: "t1", label: "Head Table", capacity: 8 },
  { id: "t2", label: "Bride's Family 1", capacity: 10 },
]);

const arrangement: SeatingArrangement = Object.freeze({
  tables: fixedTables,
  assignments: Object.freeze({ g1: "t1", g2: "t1", g3: "t2" }),
});

describe("addTable", () => {
  it("appends a new table with a generated id, zero-arg capacity/label preserved", () => {
    const result = addTable(fixedTables, { label: "Groom's Family", capacity: 6 });
    expect(result.warnings).toEqual([]);
    expect(result.tables).toHaveLength(3);
    const added = result.tables[2];
    expect(added.label).toBe("Groom's Family");
    expect(added.capacity).toBe(6);
    expect(added.id).not.toBe("t1");
    expect(added.id).not.toBe("t2");
  });

  it("rejects a blank label instead of inserting a nameless table", () => {
    const result = addTable(fixedTables, { label: "   ", capacity: 6 });
    expect(result.tables).toBe(fixedTables);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("does not mutate the input array", () => {
    addTable(fixedTables, { label: "New Table", capacity: 4 });
    expect(fixedTables).toHaveLength(2);
  });
});

describe("renameTable", () => {
  it("returns a new array with the matching table's label updated", () => {
    const result = renameTable(fixedTables, "t1", "New Head Table");
    expect(result.warnings).toEqual([]);
    expect(result.tables[0].label).toBe("New Head Table");
    expect(result.tables[1]).toEqual(fixedTables[1]);
    expect(fixedTables[0].label).toBe("Head Table");
  });

  it("warns and returns the original array for an unknown id", () => {
    const result = renameTable(fixedTables, "unknown", "X");
    expect(result.tables).toBe(fixedTables);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("rejects a blank label", () => {
    const result = renameTable(fixedTables, "t1", "  ");
    expect(result.tables).toBe(fixedTables);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("setCapacity", () => {
  it("AC4: lowering capacity below the seated count does not drop guests and flags overCapacity", () => {
    // t1 has 2 guests seated (g1, g2); dropping capacity to 1 must not evict them.
    const result = setCapacity(fixedTables, arrangement, "t1", 1);
    expect(result.tables[0].capacity).toBe(1);
    expect(result.overCapacity).toEqual({ tableId: "t1", seatedCount: 2, capacity: 1 });
  });

  it("does not flag overCapacity when the new capacity still fits the seated count", () => {
    const result = setCapacity(fixedTables, arrangement, "t1", 5);
    expect(result.overCapacity).toBeUndefined();
  });

  it("is a no-op for an unknown id", () => {
    const result = setCapacity(fixedTables, arrangement, "unknown", 1);
    expect(result.tables).toBe(fixedTables);
  });

  it("does not mutate the input tables or arrangement", () => {
    setCapacity(fixedTables, arrangement, "t1", 1);
    expect(fixedTables[0].capacity).toBe(8);
    expect(arrangement.assignments).toEqual({ g1: "t1", g2: "t1", g3: "t2" });
  });
});

describe("removeTable", () => {
  it("AC3: returns the ids of guests seated at the removed table", () => {
    const result = removeTable(fixedTables, arrangement, "t1");
    expect(result.tables.map((table) => table.id)).toEqual(["t2"]);
    expect(result.displacedGuestIds.sort()).toEqual(["g1", "g2"]);
  });

  it("AC3: returns an empty displaced list for a table with no seated guests", () => {
    const empty: SeatingArrangement = { tables: fixedTables, assignments: {} };
    const result = removeTable(fixedTables, empty, "t1");
    expect(result.displacedGuestIds).toEqual([]);
  });

  it("does not mutate the arrangement's assignments", () => {
    removeTable(fixedTables, arrangement, "t1");
    expect(arrangement.assignments).toEqual({ g1: "t1", g2: "t1", g3: "t2" });
  });
});

describe("reorderTables", () => {
  it("moves a table to the target index without mutating the input", () => {
    const result = reorderTables(fixedTables, "t2", 0);
    expect(result.map((table) => table.id)).toEqual(["t2", "t1"]);
    expect(fixedTables.map((table) => table.id)).toEqual(["t1", "t2"]);
  });

  it("is a no-op for an unknown id or an out-of-range index", () => {
    expect(reorderTables(fixedTables, "unknown", 0)).toBe(fixedTables);
    expect(reorderTables(fixedTables, "t1", 99)).toBe(fixedTables);
  });
});

describe("validateTables", () => {
  it("AC5: flags duplicate labels, empty labels, and non-positive capacity as structured warnings, never throws", () => {
    const messy: Table[] = [
      { id: "a", label: "Head Table", capacity: 8 },
      { id: "b", label: "Head Table", capacity: 6 },
      { id: "c", label: "  ", capacity: 4 },
      { id: "d", label: "Overflow", capacity: 0 },
    ];
    const warnings = validateTables(messy);
    expect(warnings).toEqual(
      expect.arrayContaining([
        { tableId: "a", label: "Head Table", reason: "duplicate-label" },
        { tableId: "b", label: "Head Table", reason: "duplicate-label" },
        { tableId: "c", reason: "empty-label" },
        { tableId: "d", reason: "non-positive-capacity" },
      ]),
    );
  });

  it("returns no warnings for a clean table set", () => {
    expect(validateTables(fixedTables)).toEqual([]);
  });

  it("validates the demo fixture's tables without throwing", () => {
    expect(() => validateTables(demoTables)).not.toThrow();
    expect(validateTables(demoTables)).toEqual([]);
  });
});

describe("purity across the demo fixture", () => {
  it("all mutation functions leave demoTables/demoArrangement unchanged", () => {
    const beforeTables = JSON.stringify(demoTables);
    const beforeArrangement = JSON.stringify(demoArrangement);

    addTable(demoTables, { label: "Extra", capacity: 4 });
    renameTable(demoTables, demoTables[0].id, "Renamed");
    setCapacity(demoTables, demoArrangement, demoTables[0].id, 1);
    removeTable(demoTables, demoArrangement, demoTables[0].id);
    reorderTables(demoTables, demoTables[0].id, demoTables.length - 1);

    expect(JSON.stringify(demoTables)).toBe(beforeTables);
    expect(JSON.stringify(demoArrangement)).toBe(beforeArrangement);
  });
});
