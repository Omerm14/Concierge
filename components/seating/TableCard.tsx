"use client";

import type { PointerEvent } from "react";
import type { Guest, Table } from "@/lib/guests/types";
import { GuestChip } from "./GuestChip";

export function TableCard({
  table,
  seatedGuests,
  draggingGuestId,
  onChipPointerDown,
  onChipPointerUp,
}: {
  table: Table;
  seatedGuests: Guest[];
  draggingGuestId: string | null;
  onChipPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onChipPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  const isFull = seatedGuests.length >= table.capacity;

  return (
    <div
      data-testid={`table-${table.id}`}
      data-table-id={table.id}
      className={`rounded-xl border p-3 ${
        isFull
          ? "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
          : "border-dashed border-zinc-300 dark:border-zinc-700"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium text-black dark:text-zinc-50">{table.label}</h3>
        <span
          data-testid={`table-${table.id}-count`}
          className="text-xs text-zinc-500 dark:text-zinc-400"
        >
          {seatedGuests.length}/{table.capacity}
        </span>
      </div>
      <div className="mt-2 flex min-h-12 flex-wrap gap-2">
        {seatedGuests.map((guest) => (
          <GuestChip
            key={guest.id}
            guest={guest}
            dragging={draggingGuestId === guest.id}
            onPointerDown={onChipPointerDown}
            onPointerUp={onChipPointerUp}
          />
        ))}
      </div>
    </div>
  );
}
