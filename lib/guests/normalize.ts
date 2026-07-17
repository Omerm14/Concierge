const ISRAELI_LOCAL = /^0\d{8,9}$/;

/**
 * Canonicalizes a phone number to a dedupe/storage key.
 * Israeli numbers (`050-123-4567`, `+972501234567`, `972501234567`,
 * `0501234567`) all canonicalize to the same local `0XXXXXXXXX` key.
 * Genuinely international numbers (leading `+`, non-972 country code) are
 * preserved in E.164 form (`+<countrycode><subscriber>`) instead of being
 * dropped — losing them would strip contact info for exactly the
 * international/Anglo/immigrant guests this product needs to reach.
 * Returns undefined only for true garbage (no digits, too short to be any
 * real phone number).
 */
export function normalizePhone(raw: string): string | undefined {
  const kept = raw.replace(/[^\d+]/g, "");
  const hasPlus = kept.startsWith("+");
  const digits = kept.replace(/\+/g, "");

  if (!digits) return undefined;

  if (digits.startsWith("972")) {
    const local = "0" + digits.slice(3);
    if (ISRAELI_LOCAL.test(local)) return local;
  } else {
    const candidate =
      !hasPlus && !digits.startsWith("0") && digits.length === 9
        ? "0" + digits
        : digits;
    if (ISRAELI_LOCAL.test(candidate)) return candidate;
  }

  if (hasPlus && digits.length >= 8 && digits.length <= 15) {
    return "+" + digits;
  }

  return undefined;
}

export function normalizeNameKey(fullName: string): string {
  return fullName.trim().toLowerCase().replace(/\s+/g, " ");
}
