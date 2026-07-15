"use client";

import { useState } from "react";
import type { PointerEvent } from "react";
import type { Guest, SeatingArrangement } from "@/lib/guests/types";
import { seatingReducer } from "@/lib/seating/reducer";
import { GuestChip } from "./GuestChip";
import { TableCard } from "./TableCard";

export function SeatingBoard({
  guests,
  initialArrangement,
}: {
  guests: Guest[];
  initialArrangement: SeatingArrangement;
}) {
  const [arrangement, setArrangement] = useState(initialArrangement);
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);
  const [rejectedGuestName, setRejectedGuestName] = useState<string | null>(null);

  const guestsById = new Map(guests.map((guest) => [guest.id, guest]));
  const unassignedGuests = guests.filter((guest) => !(guest.id in arrangement.assignments));

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingGuestId(event.currentTarget.dataset.guestId ?? null);
    setRejectedGuestName(null);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const guestId = event.currentTarget.dataset.guestId;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDraggingGuestId(null);
    if (!guestId) return;

    const dropTarget = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-table-id], [data-tray]");
    if (!dropTarget) return;

    if (dropTarget.dataset.tray !== undefined) {
      const result = seatingReducer(arrangement, { type: "unassign", guestId });
      setArrangement(result.arrangement);
      return;
    }

    const tableId = dropTarget.dataset.tableId;
    if (!tableId) return;

    const result = seatingReducer(arrangement, { type: "assign", guestId, tableId });
    setArrangement(result.arrangement);
    if (result.rejection) {
      setRejectedGuestName(guestsById.get(guestId)?.fullName ?? "Guest");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section data-tray="" data-testid="unassigned-tray" aria-labelledby="tray-heading">
        <h2 id="tray-heading" className="text-lg font-medium text-black dark:text-zinc-50">
          Unassigned guests
        </h2>
        <div className="mt-2 flex min-h-14 flex-wrap gap-2 rounded-xl border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
          {unassignedGuests.map((guest) => (
            <GuestChip
              key={guest.id}
              guest={guest}
              dragging={draggingGuestId === guest.id}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            />
          ))}
          {unassignedGuests.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Everyone is seated.</p>
          )}
        </div>
      </section>

      {rejectedGuestName && (
        <p
          role="alert"
          data-testid="rejection-message"
          className="text-sm text-red-600 dark:text-red-400"
        >
          That table is full — pick another table for {rejectedGuestName}.
        </p>
      )}

      <section aria-labelledby="tables-heading">
        <h2 id="tables-heading" className="text-lg font-medium text-black dark:text-zinc-50">
          Tables
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {arrangement.tables.map((table) => {
            const seatedGuests = Object.entries(arrangement.assignments)
              .filter(([, tableId]) => tableId === table.id)
              .map(([guestId]) => guestsById.get(guestId))
              .filter((guest): guest is Guest => guest !== undefined);

            return (
              <TableCard
                key={table.id}
                table={table}
                seatedGuests={seatedGuests}
                draggingGuestId={draggingGuestId}
                onChipPointerDown={handlePointerDown}
                onChipPointerUp={handlePointerUp}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
