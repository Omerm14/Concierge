import type { Dietary, Guest, Language } from "../guests/types";

export type RsvpAnswer = "yes" | "no" | "maybe";

export interface RsvpResponse {
  rsvpStatus: RsvpAnswer;
  plusOnes?: number;
  dietary?: Dietary[];
  allergyNote?: string;
  language?: Language;
}

/**
 * Guest.plusOnesAllowed (CON-2) is an allowance, not a confirmed count — the
 * reducer is the first thing that needs to track how many the guest actually
 * confirmed, so it carries that count alongside the CON-2 Guest fields.
 */
export type RsvpTrackedGuest = Guest & { plusOnes: number };

export interface ApplyRsvpResult {
  guest: RsvpTrackedGuest;
  changed: boolean;
  warnings: string[];
}
