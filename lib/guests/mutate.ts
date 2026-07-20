import { randomUUID } from "node:crypto";
import type { Dietary, Guest, RsvpStatus } from "./types";

export interface MutationResult {
  guests: Guest[];
  warnings: string[];
}

export type NewGuestInput = Omit<Guest, "id" | "rsvpStatus">;

export type GuestPatch = Partial<Omit<Guest, "id">>;

/**
 * Appends a guest with a generated id and rsvpStatus:"pending". Rejects a
 * blank fullName instead of inserting a nameless guest.
 */
export function addGuest(guests: Guest[], input: NewGuestInput): MutationResult {
  const fullName = input.fullName.trim();
  if (!fullName) {
    return { guests, warnings: ["Cannot add guest: fullName is required"] };
  }

  const guest: Guest = {
    ...input,
    fullName,
    id: randomUUID(),
    rsvpStatus: "pending",
  };

  return { guests: [...guests, guest], warnings: [] };
}

export function updateGuest(
  guests: Guest[],
  id: string,
  patch: GuestPatch
): MutationResult {
  const index = guests.findIndex((g) => g.id === id);
  if (index === -1) {
    return { guests, warnings: [`updateGuest: no guest with id "${id}"`] };
  }

  const updated = [...guests];
  updated[index] = { ...guests[index], ...patch, id };
  return { guests: updated, warnings: [] };
}

export function removeGuest(guests: Guest[], id: string): MutationResult {
  const index = guests.findIndex((g) => g.id === id);
  if (index === -1) {
    return { guests, warnings: [`removeGuest: no guest with id "${id}"`] };
  }

  return { guests: guests.filter((g) => g.id !== id), warnings: [] };
}

function mergeDietary(keep: Dietary[], drop: Dietary[]): Dietary[] {
  const union = Array.from(new Set([...keep, ...drop]));
  return union.length > 1 ? union.filter((d) => d !== "none") : union;
}

function mergeRsvpStatus(
  keep: Guest,
  drop: Guest,
  keepId: string,
  warnings: string[]
): RsvpStatus {
  const keepDecided = keep.rsvpStatus !== "pending";
  const dropDecided = drop.rsvpStatus !== "pending";

  if (keepDecided && dropDecided) {
    if (keep.rsvpStatus === drop.rsvpStatus) return keep.rsvpStatus;
    warnings.push(
      `mergeGuests ${keepId}: conflicting rsvpStatus ("${keep.rsvpStatus}" vs "${drop.rsvpStatus}") — kept "${keep.rsvpStatus}"`
    );
    return keep.rsvpStatus;
  }

  if (keepDecided) return keep.rsvpStatus;
  if (dropDecided) return drop.rsvpStatus;
  return "pending";
}

/**
 * Merges two duplicate guests into one, keyed by keepId. Lossless: unions
 * groups/dietary, keeps the best-available phone/language/allergyNote, and
 * never silently drops a decided rsvpStatus signal (emits a warning instead).
 */
export function mergeGuests(
  guests: Guest[],
  keepId: string,
  dropId: string
): MutationResult {
  const keep = guests.find((g) => g.id === keepId);
  const drop = guests.find((g) => g.id === dropId);

  if (!keep || !drop) {
    const missing = !keep ? keepId : dropId;
    return { guests, warnings: [`mergeGuests: no guest with id "${missing}"`] };
  }

  const warnings: string[] = [];

  const merged: Guest = {
    ...keep,
    groups: Array.from(new Set([...keep.groups, ...drop.groups])),
    dietary: mergeDietary(keep.dietary, drop.dietary),
    phone: keep.phone ?? drop.phone,
    allergyNote: keep.allergyNote ?? drop.allergyNote,
    language: keep.language ?? drop.language,
    plusOnesAllowed: Math.max(keep.plusOnesAllowed, drop.plusOnesAllowed),
    side:
      keep.side === "other" && drop.side !== "other" ? drop.side : keep.side,
    rsvpStatus: mergeRsvpStatus(keep, drop, keepId, warnings),
  };

  const result = guests
    .filter((g) => g.id !== dropId)
    .map((g) => (g.id === keepId ? merged : g));

  return { guests: result, warnings };
}
