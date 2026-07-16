/**
 * Canonicalizes a phone number to a local `0XXXXXXXXX`-style key so that
 * `050-123-4567` and `+972501234567` normalize to the same dedupe key.
 * Returns undefined for input that isn't phone-shaped (too short, no digits).
 */
export function normalizePhone(raw: string): string | undefined {
  const kept = raw.replace(/[^\d+]/g, "");
  let digits = kept.replace(/\+/g, "");

  if (digits.startsWith("972")) {
    digits = "0" + digits.slice(3);
  } else if (!digits.startsWith("0") && digits.length === 9) {
    digits = "0" + digits;
  }

  if (!/^0\d{8,9}$/.test(digits)) return undefined;
  return digits;
}

export function normalizeNameKey(fullName: string): string {
  return fullName.trim().toLowerCase().replace(/\s+/g, " ");
}
