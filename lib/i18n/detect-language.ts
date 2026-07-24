import type { Language } from "../guests/types";

export interface DetectLanguageInput {
  name?: string;
  phone?: string;
  text?: string;
}

export interface DetectLanguageResult {
  language: Language;
  confidence: number;
}

const HEBREW_RE = /[֐-׿]/g;
const CYRILLIC_RE = /[Ѐ-ӿ]/g;
const ARABIC_RE = /[؀-ۿݐ-ݿ]/g;
const LATIN_RE = /[A-Za-z]/g;

function scriptCounts(text: string): Record<Language, number> {
  return {
    he: text.match(HEBREW_RE)?.length ?? 0,
    ru: text.match(CYRILLIC_RE)?.length ?? 0,
    ar: text.match(ARABIC_RE)?.length ?? 0,
    en: text.match(LATIN_RE)?.length ?? 0,
  };
}

/**
 * Weak tiebreaker only: an Israeli number is any local format starting "0"
 * or an international "+972"/"972" prefix. Returns undefined (no signal)
 * when the phone doesn't clearly indicate either way.
 */
function isNonIsraeliPhone(phone: string): boolean | undefined {
  const normalized = phone.replace(/[\s()-]/g, "");
  if (/^(\+?972)/.test(normalized)) return false;
  if (/^0\d/.test(normalized)) return false;
  if (/^\+\d/.test(normalized)) return true;
  return undefined;
}

/**
 * Best-guess language detector for the RSVP flow (CON-2's `language` field).
 * Heuristic, offline, deterministic: Unicode script of the name/text is the
 * primary signal (Hebrew/Cyrillic/Arabic blocks are unambiguous against each
 * other and against Latin); phone country code only breaks a tie when the
 * script signal is Latin but too weak to be confident it's genuinely `en`.
 * Never throws; defaults to `he` (the primary market language) when the
 * signal is empty or genuinely ambiguous.
 */
export function detectLanguage(input: DetectLanguageInput): DetectLanguageResult {
  const combined = [input.name, input.text].filter(Boolean).join(" ");
  const counts = scriptCounts(combined);
  const totalLetters = counts.he + counts.ru + counts.ar + counts.en;

  if (totalLetters === 0) {
    return { language: "he", confidence: 0.2 };
  }

  const ranked = (Object.entries(counts) as [Language, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const [topLanguage, topCount] = ranked[0];
  const [, secondCount] = ranked[1];
  const dominanceRatio = topCount / totalLetters;

  if (topCount === secondCount) {
    // No clear majority script (e.g. equal Hebrew/Latin runs) — too
    // ambiguous to commit to a guess.
    return { language: "he", confidence: 0.3 };
  }

  if (topLanguage !== "en") {
    // Hebrew/Cyrillic/Arabic character ranges don't overlap each other or
    // Latin, so any presence at all is a strong signal.
    return { language: topLanguage, confidence: dominanceRatio >= 0.6 ? 0.9 : 0.6 };
  }

  const weakLatinSignal = totalLetters < 3 || dominanceRatio < 0.6;
  if (!weakLatinSignal) {
    return { language: "en", confidence: 0.85 };
  }

  if (input.phone) {
    const nonIsraeli = isNonIsraeliPhone(input.phone);
    if (nonIsraeli === true) {
      return { language: "en", confidence: 0.6 };
    }
  }

  return { language: "he", confidence: 0.3 };
}
