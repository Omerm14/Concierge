import type { Dietary, Guest } from "../guests/types";
import type { ApplyRsvpResult, RsvpResponse, RsvpTrackedGuest } from "./types";

const KNOWN_DIETARY = new Set<Dietary>([
  "none",
  "vegetarian",
  "vegan",
  "glatt",
  "gluten-free",
  "kids-meal",
  "allergy",
]);

function priorPlusOnes(guest: Guest): number {
  const tracked = guest as Partial<RsvpTrackedGuest>;
  return typeof tracked.plusOnes === "number" ? tracked.plusOnes : 0;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key) => deepEqual(aObj[key], bObj[key]))
  );
}

/**
 * Pure reducer: applies a structured RSVP response to a guest and returns the
 * new guest state. Never mutates its inputs, never throws — invalid input is
 * reported via warnings[] and handled (clamped/dropped) instead.
 */
export function applyRsvpResponse(
  guest: Guest,
  response: RsvpResponse,
): ApplyRsvpResult {
  const warnings: string[] = [];

  let plusOnes = response.plusOnes ?? priorPlusOnes(guest);
  if (response.rsvpStatus === "no") {
    plusOnes = 0;
  } else if (plusOnes > guest.plusOnesAllowed) {
    warnings.push(
      `plusOnes ${plusOnes} exceeds plusOnesAllowed ${guest.plusOnesAllowed}; clamped`,
    );
    plusOnes = guest.plusOnesAllowed;
  }

  let dietary = guest.dietary;
  if (response.dietary) {
    const filtered: Dietary[] = [];
    for (const tag of response.dietary) {
      if (KNOWN_DIETARY.has(tag)) {
        filtered.push(tag);
      } else {
        warnings.push(`unknown dietary value "${tag}" dropped`);
      }
    }
    dietary = filtered;
  }

  const allergyNote = response.allergyNote ?? guest.allergyNote;
  if (dietary.includes("allergy") && !allergyNote) {
    warnings.push("allergy dietary tag present without an allergyNote");
  }

  const language = response.language ?? guest.language;

  const nextGuest: RsvpTrackedGuest = {
    ...guest,
    rsvpStatus: response.rsvpStatus,
    plusOnes,
    dietary,
    ...(allergyNote !== undefined ? { allergyNote } : {}),
    ...(language !== undefined ? { language } : {}),
  };

  const priorGuest: RsvpTrackedGuest = { ...guest, plusOnes: priorPlusOnes(guest) };
  const changed = !deepEqual(priorGuest, nextGuest);

  return { guest: nextGuest, changed, warnings };
}
