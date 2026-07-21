"use client";

import type { PointerEvent } from "react";
import type { Guest } from "@/lib/guests/types";

/**
 * A guest that may have gone through the CON-9 RSVP reducer. Mirrors
 * lib/roster/totals.ts's RosterGuest — confirmed plus-ones live on
 * `plusOnes`, never the `plusOnesAllowed` ceiling.
 */
type RosterGuest = Guest & { plusOnes?: number };

const DIETARY_LABELS: Record<string, string> = {
  vegetarian: "Veg",
  vegan: "Vegan",
  glatt: "Glatt",
  "gluten-free": "GF",
  "kids-meal": "Kids",
  allergy: "Allergy",
};

export function GuestChip({
  guest,
  dragging,
  onPointerDown,
  onPointerUp,
}: {
  guest: RosterGuest;
  dragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  const dietaryBadges = guest.dietary.filter((tag) => tag !== "none");
  const plusOnes = guest.plusOnes ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`chip-${guest.id}`}
      data-guest-id={guest.id}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={`touch-none select-none rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 ${
        dragging ? "opacity-50" : ""
      }`}
    >
      <span>{guest.fullName}</span>
      {plusOnes > 0 && (
        <span
          data-testid={`plus-ones-badge-${guest.id}`}
          className="ml-1.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-xs text-sky-900 dark:bg-sky-900 dark:text-sky-100"
        >
          +{plusOnes}
        </span>
      )}
      {dietaryBadges.map((tag) => (
        <span
          key={tag}
          data-testid={`dietary-badge-${guest.id}-${tag}`}
          className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900 dark:bg-amber-900 dark:text-amber-100"
        >
          {DIETARY_LABELS[tag] ?? tag}
        </span>
      ))}
    </div>
  );
}
