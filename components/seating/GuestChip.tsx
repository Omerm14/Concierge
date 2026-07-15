"use client";

import type { PointerEvent } from "react";
import type { Guest } from "@/lib/guests/types";

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
  guest: Guest;
  dragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  const dietaryBadges = guest.dietary.filter((tag) => tag !== "none");

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
