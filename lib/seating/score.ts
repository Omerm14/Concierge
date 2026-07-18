import type { Guest, SeatingArrangement } from "../guests/types";
import { evaluateConstraints, type Constraint } from "./constraints";
import type { SeatCost } from "./occupancy";

export interface ScoreWeights {
  seated: number;
  hardViolation: number;
  softViolation: number;
  imbalance: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  seated: 100,
  hardViolation: 1000,
  softViolation: 20,
  imbalance: 5,
};

/**
 * Variance of per-table occupancy fraction (seats / capacity). Lower is
 * more evenly filled; tables with zero capacity are ignored. `seatCost`
 * (default 1 per guest) lets a confirmed plus-one count as extra seats.
 */
function occupancyImbalance(
  arrangement: SeatingArrangement,
  seatCost?: SeatCost,
): number {
  const seatedByTable = new Map<string, number>();
  for (const [guestId, tableId] of Object.entries(arrangement.assignments)) {
    const seats = seatCost ? seatCost(guestId) : 1;
    seatedByTable.set(tableId, (seatedByTable.get(tableId) ?? 0) + seats);
  }

  const fractions = arrangement.tables
    .filter((table) => table.capacity > 0)
    .map((table) => (seatedByTable.get(table.id) ?? 0) / table.capacity);

  if (fractions.length === 0) return 0;

  const mean = fractions.reduce((sum, f) => sum + f, 0) / fractions.length;
  const variance =
    fractions.reduce((sum, f) => sum + (f - mean) ** 2, 0) / fractions.length;
  return variance;
}

/**
 * Pure scoring function: higher is better. Rewards seating more guests,
 * heavily penalizes hard-constraint violations, penalizes soft-constraint
 * violations more lightly, and lightly penalizes uneven table fill.
 */
export function scoreArrangement(
  arrangement: SeatingArrangement,
  constraints: Constraint[],
  guests: Guest[],
  seatCost?: SeatCost,
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS,
): number {
  const { results, hardViolations } = evaluateConstraints(
    arrangement,
    constraints,
    guests,
    seatCost,
  );
  const totalViolations = results.filter((result) => !result.satisfied).length;
  const softViolations = totalViolations - hardViolations;
  const seatedCount = Object.keys(arrangement.assignments).length;

  return (
    seatedCount * weights.seated -
    hardViolations * weights.hardViolation -
    softViolations * weights.softViolation -
    occupancyImbalance(arrangement, seatCost) * weights.imbalance
  );
}
