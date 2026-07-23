import { randomUUID } from "node:crypto";
import type { SeatingArrangement, Table } from "../guests/types";

export type NewTableInput = Omit<Table, "id">;

export interface TableMutationResult {
  tables: Table[];
  warnings: string[];
}

export interface OverCapacityWarning {
  tableId: string;
  seatedCount: number;
  capacity: number;
}

export interface CapacityMutationResult {
  tables: Table[];
  overCapacity?: OverCapacityWarning;
}

export interface RemoveTableResult {
  tables: Table[];
  displacedGuestIds: string[];
}

export interface TableWarning {
  tableId?: string;
  label?: string;
  reason: "duplicate-label" | "empty-label" | "non-positive-capacity";
}

function seatedGuestIds(arrangement: SeatingArrangement, tableId: string): string[] {
  return Object.entries(arrangement.assignments)
    .filter(([, assignedTableId]) => assignedTableId === tableId)
    .map(([guestId]) => guestId);
}

/** Appends a table with a generated id. Rejects a blank label. */
export function addTable(tables: Table[], input: NewTableInput): TableMutationResult {
  const label = input.label.trim();
  if (!label) {
    return { tables, warnings: ["Cannot add table: label is required"] };
  }

  const table: Table = { ...input, label, id: randomUUID() };
  return { tables: [...tables, table], warnings: [] };
}

export function renameTable(tables: Table[], id: string, label: string): TableMutationResult {
  const index = tables.findIndex((table) => table.id === id);
  if (index === -1) {
    return { tables, warnings: [`renameTable: no table with id "${id}"`] };
  }

  const trimmed = label.trim();
  if (!trimmed) {
    return { tables, warnings: ["Cannot rename table: label is required"] };
  }

  const updated = [...tables];
  updated[index] = { ...tables[index], label: trimmed };
  return { tables: updated, warnings: [] };
}

/**
 * Setting a capacity below the number of guests currently seated at that
 * table never evicts anyone — it returns the updated tables plus an
 * `overCapacity` flag so the caller (the board/UI) decides how to resolve it.
 */
export function setCapacity(
  tables: Table[],
  arrangement: SeatingArrangement,
  id: string,
  capacity: number,
): CapacityMutationResult {
  const index = tables.findIndex((table) => table.id === id);
  if (index === -1) {
    return { tables };
  }

  const updated = [...tables];
  updated[index] = { ...tables[index], capacity };

  const seatedCount = seatedGuestIds(arrangement, id).length;
  const overCapacity =
    seatedCount > capacity ? { tableId: id, seatedCount, capacity } : undefined;

  return { tables: updated, overCapacity };
}

/**
 * Removes a table and surfaces the guest ids that were seated there, so the
 * caller can move them back to the unassigned tray — never a silent drop.
 * Does not itself edit the arrangement's assignments.
 */
export function removeTable(
  tables: Table[],
  arrangement: SeatingArrangement,
  id: string,
): RemoveTableResult {
  return {
    tables: tables.filter((table) => table.id !== id),
    displacedGuestIds: seatedGuestIds(arrangement, id),
  };
}

/** Reorders the display order of tables; a no-op for an unknown id or an out-of-range index. */
export function reorderTables(tables: Table[], id: string, toIndex: number): Table[] {
  const index = tables.findIndex((table) => table.id === id);
  if (index === -1 || toIndex < 0 || toIndex >= tables.length) {
    return tables;
  }

  const updated = [...tables];
  const [moved] = updated.splice(index, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
}

/** Flags duplicate labels, empty labels, and non-positive capacities as structured warnings — never throws. */
export function validateTables(tables: Table[]): TableWarning[] {
  const warnings: TableWarning[] = [];
  const labelCounts = new Map<string, number>();

  for (const table of tables) {
    const label = table.label.trim();
    if (!label) {
      warnings.push({ tableId: table.id, reason: "empty-label" });
    } else {
      labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
    }

    if (table.capacity <= 0) {
      warnings.push({ tableId: table.id, reason: "non-positive-capacity" });
    }
  }

  for (const table of tables) {
    const label = table.label.trim();
    if (label && (labelCounts.get(label) ?? 0) > 1) {
      warnings.push({ tableId: table.id, label, reason: "duplicate-label" });
    }
  }

  return warnings;
}
