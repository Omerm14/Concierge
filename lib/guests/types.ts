export type Side = "bride" | "groom" | "both" | "other";

export type Dietary =
  | "none"
  | "vegetarian"
  | "vegan"
  | "glatt"
  | "gluten-free"
  | "kids-meal"
  | "allergy";

export type RsvpStatus = "pending" | "yes" | "no" | "maybe";

export type Language = "he" | "en" | "ru" | "ar";

export interface Guest {
  id: string;
  fullName: string;
  phone?: string;
  side: Side;
  groups: string[];
  dietary: Dietary[];
  allergyNote?: string;
  rsvpStatus: RsvpStatus;
  plusOnesAllowed: number;
  language?: Language;
}

export interface Table {
  id: string;
  label: string;
  capacity: number;
  shape?: "round" | "rect";
}

export interface SeatingArrangement {
  tables: Table[];
  assignments: Record<string, string>;
}
