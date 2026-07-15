import type {
  Dietary,
  Guest,
  Language,
  SeatingArrangement,
  Side,
  Table,
} from "../guests/types";
import type { WeddingProfile } from "../wedding/types";

/**
 * Canonical demo wedding — the single mock dataset for every v0 UI/aggregator
 * ticket (seating board, Venue View, guest-list screen, RSVP guest page).
 * Fully synthetic: invented names and fake local-format phone numbers, no
 * real person or real contact data. Deterministic — re-running this module
 * always produces the exact same values.
 */

const HE_FIRST_NAMES = [
  "נועה",
  "איתי",
  "מאיה",
  "דניאל",
  "שירה",
  "יובל",
  "טל",
  "רוני",
  "עומר",
  "ליאור",
  "אביגיל",
  "נדב",
];

const HE_LAST_NAMES = [
  "כהן",
  "לוי",
  "מזרחי",
  "פרץ",
  "ביטון",
  "אברהם",
  "גולן",
  "שפירא",
  "אזולאי",
  "דהן",
  "רוזן",
  "ברק",
];

const EN_FIRST_NAMES = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "Lucas",
  "Grace",
  "Henry",
];

const EN_LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Cohen",
  "Klein",
];

const SIDES: Side[] = ["bride", "groom", "both", "other"];

const GROUP_POOL = [
  "family",
  "college-friends",
  "work-friends",
  "neighbors",
  "bride-side-family",
  "groom-side-family",
];

const RSVP_CYCLE: Guest["rsvpStatus"][] = [
  "yes",
  "yes",
  "pending",
  "pending",
  "yes",
  "no",
  "maybe",
  "yes",
  "pending",
];

const LANGUAGES: Language[] = ["he", "en", "ru", "ar"];

// One entry per non-"none" Dietary value, guaranteeing every tag is used at
// least once. Placed at a handful of guest indices; every other guest is
// "none" (realistic — most guests have no dietary restriction).
const SPECIAL_DIETARY: { dietary: Dietary; allergyNote?: string }[] = [
  { dietary: "vegetarian" },
  { dietary: "vegan" },
  { dietary: "glatt" },
  { dietary: "gluten-free" },
  { dietary: "kids-meal" },
  { dietary: "allergy", allergyNote: "Peanut allergy — severe, kitchen must confirm" },
  { dietary: "allergy", allergyNote: "Shellfish allergy" },
];

function phoneFor(index: number): string {
  const digits = String(index).padStart(7, "0");
  return `050-${digits.slice(0, 3)}-${digits.slice(3)}`;
}

function guestName(index: number): string {
  if (index % 2 === 0) {
    const first = HE_FIRST_NAMES[index % HE_FIRST_NAMES.length];
    const last = HE_LAST_NAMES[(index * 3 + 1) % HE_LAST_NAMES.length];
    return `${first} ${last}`;
  }
  const first = EN_FIRST_NAMES[index % EN_FIRST_NAMES.length];
  const last = EN_LAST_NAMES[(index * 3 + 1) % EN_LAST_NAMES.length];
  return `${first} ${last}`;
}

function buildGeneratedGuests(count: number): Guest[] {
  const guests: Guest[] = [];

  for (let i = 0; i < count; i++) {
    const id = `guest-${String(i + 1).padStart(3, "0")}`;
    const rsvpStatus = RSVP_CYCLE[i % RSVP_CYCLE.length];
    const special = i % 17 === 0 ? SPECIAL_DIETARY[(i / 17) % SPECIAL_DIETARY.length] : undefined;
    const groups =
      i % 5 === 0
        ? [GROUP_POOL[i % GROUP_POOL.length], GROUP_POOL[(i + 3) % GROUP_POOL.length]]
        : [GROUP_POOL[i % GROUP_POOL.length]];

    guests.push({
      id,
      fullName: guestName(i),
      phone: phoneFor(i + 1),
      side: SIDES[i % SIDES.length],
      groups,
      dietary: [special?.dietary ?? "none"],
      allergyNote: special?.allergyNote,
      rsvpStatus,
      plusOnesAllowed: i % 5 === 0 && rsvpStatus === "yes" ? 1 : 0,
      language: LANGUAGES[i % LANGUAGES.length],
    });
  }

  return guests;
}

// Deliberate dedupe pair: same phone number, two different formats, so
// CON-2/CON-11 dedupe UIs have a real cluster to surface against.
const DEDUPE_PAIR: Guest[] = [
  {
    id: "guest-119",
    fullName: "Yossi Peretz",
    phone: "052-345-6789",
    side: "groom",
    groups: ["college-friends"],
    dietary: ["none"],
    rsvpStatus: "yes",
    plusOnesAllowed: 0,
    language: "he",
  },
  {
    id: "guest-120",
    fullName: "Yossi Peretz",
    phone: "+972-52-345-6789",
    side: "groom",
    groups: ["college-friends"],
    dietary: ["none"],
    rsvpStatus: "pending",
    plusOnesAllowed: 0,
    language: "he",
  },
];

export const demoGuests: Guest[] = [
  ...buildGeneratedGuests(118),
  ...DEDUPE_PAIR,
];

function buildTables(count: number): Table[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `table-${String(i + 1).padStart(2, "0")}`,
    label: `Table ${i + 1}`,
    capacity: i % 2 === 0 ? 8 : 10,
    shape: i % 3 === 0 ? "rect" : "round",
  }));
}

export const demoTables: Table[] = buildTables(14);

// Seats every guest except the last 8 (round-robin across tables, respecting
// capacity), so Venue View/seating-board demos exercise both the seated and
// the unseated-guest states.
const UNSEATED_COUNT = 8;

function buildArrangement(guests: Guest[], tables: Table[]): SeatingArrangement {
  const assignments: Record<string, string> = {};
  const seatCounts = new Map(tables.map((table) => [table.id, 0]));
  const seatedGuests = guests.slice(0, guests.length - UNSEATED_COUNT);

  let tableCursor = 0;
  for (const guest of seatedGuests) {
    let attempts = 0;
    while (attempts < tables.length) {
      const table = tables[tableCursor % tables.length];
      const seated = seatCounts.get(table.id) ?? 0;
      if (seated < table.capacity) {
        assignments[guest.id] = table.id;
        seatCounts.set(table.id, seated + 1);
        tableCursor++;
        break;
      }
      tableCursor++;
      attempts++;
    }
  }

  return { tables, assignments };
}

export const demoArrangement: SeatingArrangement = buildArrangement(
  demoGuests,
  demoTables
);

// The couple/event identity for the demo dataset above. Fixed ISO date, no
// guest PII — only the couple's own display info (see lib/wedding/types.ts).
export const demoWedding: WeddingProfile = {
  coupleDisplayName: "נועה & איתי",
  partnerAName: "נועה כהן",
  partnerBName: "איתי לוי",
  weddingDate: "2026-09-17",
  venueName: "Gan HaShlosha Gardens",
  venueCity: "Beit She'an",
  defaultLanguage: "he",
  brand: {
    accentColor: "#B8895A",
    logoText: "N&E",
  },
  hostContactNote: "Questions? Call Noa at 050-000-0000.",
};
