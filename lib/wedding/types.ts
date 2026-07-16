import type { Language } from "../guests/types";

/**
 * The couple/event identity every couple-facing surface (RSVP page, Venue
 * View header, landing) renders from — one shared source so those surfaces
 * never invent divergent ad-hoc couple fields. Guest-safe: carries only the
 * couple's own display info, never guest PII or guest arrays.
 */
export interface WeddingProfile {
  coupleDisplayName: string;
  partnerAName?: string;
  partnerBName?: string;
  weddingDate: string;
  venueName?: string;
  venueCity?: string;
  defaultLanguage: Language;
  brand?: {
    accentColor?: string;
    logoText?: string;
  };
  hostContactNote?: string;
}
