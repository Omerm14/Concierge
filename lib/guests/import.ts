import { randomUUID } from "node:crypto";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { normalizePhone } from "./normalize";
import type { Dietary, Guest, Language, Side } from "./types";

export type ImportFileKind = "xlsx" | "csv";

export interface ImportResult {
  guests: Guest[];
  warnings: string[];
}

const HEADER_ALIASES: Record<string, string[]> = {
  fullName: ["name", "full name", "fullname", "guest name", "שם", "שם מלא"],
  phone: ["phone", "phone number", "mobile", "טלפון", "נייד"],
  side: ["side", "צד"],
  groups: ["group", "groups", "tag", "tags", "קבוצה", "קבוצות"],
  dietary: ["dietary", "diet", "dietary restrictions", "תזונה", "כשרות"],
  allergyNote: ["allergy note", "allergy details", "הערת אלרגיה"],
  plusOnesAllowed: [
    "plus ones",
    "plus ones allowed",
    "plusones",
    "מוזמנים נוספים",
    "פלוסים",
  ],
  language: ["language", "lang", "שפה"],
};

const ALIAS_LOOKUP: Record<string, string> = {};
for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_LOOKUP[alias.trim().toLowerCase()] = canonical;
  }
}

const SIDE_VALUES: Record<string, Side> = {
  bride: "bride",
  כלה: "bride",
  groom: "groom",
  חתן: "groom",
  both: "both",
  שניהם: "both",
  משותף: "both",
};

const DIETARY_VALUES: Record<string, Dietary> = {
  none: "none",
  ללא: "none",
  vegetarian: "vegetarian",
  צמחוני: "vegetarian",
  vegan: "vegan",
  טבעוני: "vegan",
  glatt: "glatt",
  גלאט: "glatt",
  "gluten-free": "gluten-free",
  "gluten free": "gluten-free",
  "ללא גלוטן": "gluten-free",
  "kids-meal": "kids-meal",
  "kids meal": "kids-meal",
  "מנת ילדים": "kids-meal",
  allergy: "allergy",
  אלרגיה: "allergy",
};

const LANGUAGE_VALUES: Record<string, Language> = {
  he: "he",
  hebrew: "he",
  עברית: "he",
  en: "en",
  english: "en",
  אנגלית: "en",
  ru: "ru",
  russian: "ru",
  רוסית: "ru",
  ar: "ar",
  arabic: "ar",
  ערבית: "ar",
};

type RawRow = Record<string, string>;

function toCanonicalRow(raw: RawRow): RawRow {
  const canonical: RawRow = {};
  for (const [rawHeader, value] of Object.entries(raw)) {
    const field = ALIAS_LOOKUP[rawHeader.trim().toLowerCase()];
    if (field) canonical[field] = value;
  }
  return canonical;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function rowToGuest(
  row: RawRow,
  rowNumber: number,
  warnings: string[]
): Guest | undefined {
  const fullName = row.fullName?.trim();
  if (!fullName) {
    warnings.push(`Row ${rowNumber}: missing name, skipped`);
    return undefined;
  }

  let phone: string | undefined;
  const rawPhone = row.phone?.trim();
  if (rawPhone) {
    phone = normalizePhone(rawPhone);
    if (!phone) {
      warnings.push(`Row ${rowNumber}: invalid phone "${rawPhone}", dropped`);
    }
  }

  const side = SIDE_VALUES[row.side?.trim().toLowerCase() ?? ""] ?? "other";

  const dietaryTokens = splitList(row.dietary)
    .map((t) => DIETARY_VALUES[t.toLowerCase()])
    .filter((d): d is Dietary => Boolean(d));
  const dietary = dietaryTokens.length > 0 ? dietaryTokens : ["none" as const];

  const plusOnesAllowed = Number.parseInt(row.plusOnesAllowed ?? "", 10);

  const language = LANGUAGE_VALUES[row.language?.trim().toLowerCase() ?? ""];

  return {
    id: randomUUID(),
    fullName,
    phone,
    side,
    groups: splitList(row.groups),
    dietary,
    allergyNote: row.allergyNote?.trim() || undefined,
    rsvpStatus: "pending",
    plusOnesAllowed: Number.isFinite(plusOnesAllowed) ? plusOnesAllowed : 0,
    language,
  };
}

async function parseXlsxRows(file: Buffer): Promise<RawRow[]> {
  const workbook = new ExcelJS.Workbook();
  // exceljs's .d.ts declares its own module-local `Buffer extends ArrayBuffer`,
  // which a real Node Buffer instance doesn't structurally satisfy under newer
  // @types/node — a type-only mismatch; the runtime happily accepts a Buffer.
  await workbook.xlsx.load(file as never);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headers: string[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? "").trim();
  });

  const rows: RawRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: RawRow = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) obj[header] = cell.value == null ? "" : String(cell.value);
    });
    rows.push(obj);
  });
  return rows;
}

function parseCsvRows(text: string): RawRow[] {
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

export async function importGuests(
  file: Buffer | string,
  kind: ImportFileKind
): Promise<ImportResult> {
  const warnings: string[] = [];

  const rawRows =
    kind === "xlsx"
      ? await parseXlsxRows(typeof file === "string" ? Buffer.from(file) : file)
      : parseCsvRows(typeof file === "string" ? file : file.toString("utf-8"));

  const guests: Guest[] = [];
  rawRows.forEach((raw, index) => {
    const canonical = toCanonicalRow(raw);
    const guest = rowToGuest(canonical, index + 2, warnings);
    if (guest) guests.push(guest);
  });

  return { guests, warnings };
}
