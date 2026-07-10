import type { Dietary, Guest, SeatingArrangement, Side } from "../guests/types";

/**
 * Single source of derived guest-graph stats — Venue View (CON-4), the RSVP
 * dashboard (CON-15), and the seating board (CON-3/CON-8) all import from
 * here instead of rolling their own count logic, so headcount/dietary/
 * response numbers are provably the same across every screen.
 */

export interface ResponseBreakdown {
  yes: number;
  no: number;
  pending: number;
  maybe: number;
  responseRate: number;
}

export interface Headcount {
  confirmedGuests: number;
  minAttending: number;
  maxAttending: number;
}

export interface AllergyNote {
  fullName: string;
  allergyNote: string;
}

export interface DietaryTotals {
  counts: Record<Dietary, number>;
  allergyNotes: AllergyNote[];
}

export interface GroupedStats {
  headcount: Headcount;
  responseBreakdown: ResponseBreakdown;
}

const DIETARY_VALUES: Dietary[] = [
  "none",
  "vegetarian",
  "vegan",
  "glatt",
  "gluten-free",
  "kids-meal",
  "allergy",
];

const SIDES: Side[] = ["bride", "groom", "both", "other"];

export function responseBreakdown(guests: Guest[]): ResponseBreakdown {
  const counts = { yes: 0, no: 0, pending: 0, maybe: 0 };
  for (const guest of guests) counts[guest.rsvpStatus]++;

  const total = guests.length;
  const responded = counts.yes + counts.no + counts.maybe;
  return { ...counts, responseRate: total === 0 ? 0 : responded / total };
}

export function headcount(guests: Guest[]): Headcount {
  const confirmed = guests.filter((guest) => guest.rsvpStatus === "yes");
  const minAttending = confirmed.length;
  const maxAttending =
    minAttending +
    confirmed.reduce((sum, guest) => sum + guest.plusOnesAllowed, 0);

  return { confirmedGuests: minAttending, minAttending, maxAttending };
}

export function dietaryTotals(guests: Guest[]): DietaryTotals {
  const counts = Object.fromEntries(
    DIETARY_VALUES.map((tag) => [tag, 0]),
  ) as Record<Dietary, number>;
  const allergyNotes: AllergyNote[] = [];

  for (const guest of guests) {
    for (const tag of guest.dietary) {
      counts[tag] += 1;
    }
    if (guest.allergyNote) {
      allergyNotes.push({ fullName: guest.fullName, allergyNote: guest.allergyNote });
    }
  }

  return { counts, allergyNotes };
}

export function bySide(guests: Guest[]): Record<Side, GroupedStats> {
  const result = {} as Record<Side, GroupedStats>;
  for (const side of SIDES) {
    const subset = guests.filter((guest) => guest.side === side);
    result[side] = {
      headcount: headcount(subset),
      responseBreakdown: responseBreakdown(subset),
    };
  }
  return result;
}

export function byGroup(guests: Guest[]): Record<string, GroupedStats> {
  const groupNames = new Set<string>();
  for (const guest of guests) {
    for (const groupName of guest.groups) groupNames.add(groupName);
  }

  const result: Record<string, GroupedStats> = {};
  for (const groupName of groupNames) {
    const subset = guests.filter((guest) => guest.groups.includes(groupName));
    result[groupName] = {
      headcount: headcount(subset),
      responseBreakdown: responseBreakdown(subset),
    };
  }
  return result;
}

export function unseatedConfirmed(
  guests: Guest[],
  arrangement: SeatingArrangement,
): Guest[] {
  return guests.filter(
    (guest) => guest.rsvpStatus === "yes" && !(guest.id in arrangement.assignments),
  );
}
