import type { Language } from "@/lib/guests/types";
import type { RsvpAnswer } from "@/lib/rsvp/types";

/**
 * v0 funnel event taxonomy (constitution §14 item 6, §8.2).
 *
 * Each event's props are an explicit, closed shape — no free-form string/object
 * escape hatch — so a PII field (name/phone/email/free guest text) can never
 * be smuggled in without changing this file and its type-level tests.
 */
export interface EventPropsMap {
  landing_viewed: Record<string, never>;
  pricing_viewed: Record<string, never>;
  guest_import_started: { fileType: "xlsx" | "csv" };
  guest_import_completed: {
    guestCount: number;
    duplicateCount: number;
    warningCount: number;
  };
  seating_opened: Record<string, never>;
  seating_assignment_made: { tableCount: number };
  venue_view_generated: Record<string, never>;
  viral_hook_shown: { source: string };
  viral_hook_clicked: { source: string };
  rsvp_page_opened: { language: Language };
  rsvp_started: Record<string, never>;
  rsvp_submitted: { status: RsvpAnswer; plusOnes: number };
  rsvp_language_switched: { language: Language };
  auto_seat_run: { tableCount: number; unseatedCount: number };
}

export type EventName = keyof EventPropsMap;
