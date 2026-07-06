import { normalizeNameKey, normalizePhone } from "./normalize";
import type { Guest } from "./types";

export interface DedupeCluster {
  key: string;
  guests: Guest[];
}

/**
 * Groups guests that look like the same person. Returns only clusters with
 * 2+ members for review — callers decide whether to merge, not this function.
 */
export function dedupe(guests: Guest[]): DedupeCluster[] {
  const byPhone = new Map<string, Guest[]>();
  const byName = new Map<string, Guest[]>();

  for (const guest of guests) {
    const phoneKey = guest.phone ? normalizePhone(guest.phone) : undefined;
    if (phoneKey) {
      const list = byPhone.get(phoneKey) ?? [];
      list.push(guest);
      byPhone.set(phoneKey, list);
    } else {
      const nameKey = normalizeNameKey(guest.fullName);
      const list = byName.get(nameKey) ?? [];
      list.push(guest);
      byName.set(nameKey, list);
    }
  }

  const clusters: DedupeCluster[] = [];
  for (const [key, list] of byPhone) {
    if (list.length > 1) clusters.push({ key, guests: list });
  }
  for (const [key, list] of byName) {
    if (list.length > 1) clusters.push({ key, guests: list });
  }
  return clusters;
}
