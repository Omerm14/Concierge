import type { Guest, SeatingArrangement } from "../guests/types";
import type { SeatCost } from "./occupancy";

export type ConstraintHardness = "hard" | "soft";

interface BaseConstraint {
  hardness?: ConstraintHardness;
  weight?: number;
}

export interface KeepTogetherConstraint extends BaseConstraint {
  type: "keep-together";
  guestIds: string[];
}

export interface KeepApartConstraint extends BaseConstraint {
  type: "keep-apart";
  guestIds: string[];
}

export interface MustSitAtConstraint extends BaseConstraint {
  type: "must-sit-at";
  guestId: string;
  tableId: string;
}

export interface SameSideTableConstraint extends BaseConstraint {
  type: "same-side-table";
  tableId?: string;
  tolerance?: number;
}

export interface CapacityConstraint extends BaseConstraint {
  type: "capacity";
  tableId?: string;
}

export type Constraint =
  | KeepTogetherConstraint
  | KeepApartConstraint
  | MustSitAtConstraint
  | SameSideTableConstraint
  | CapacityConstraint;

export interface ConstraintEvaluation {
  constraint: Constraint;
  satisfied: boolean;
  violatingGuestIds: string[];
}

export interface ConstraintEvaluationResult {
  results: ConstraintEvaluation[];
  hardViolations: number;
}

const DEFAULT_HARDNESS: Record<Constraint["type"], ConstraintHardness> = {
  "keep-together": "soft",
  "keep-apart": "hard",
  "must-sit-at": "hard",
  "same-side-table": "soft",
  capacity: "hard",
};

function resolveHardness(constraint: Constraint): ConstraintHardness {
  return constraint.hardness ?? DEFAULT_HARDNESS[constraint.type];
}

function tableIdForGuest(
  arrangement: SeatingArrangement,
  guestId: string,
): string | undefined {
  return arrangement.assignments[guestId];
}

function guestIdsAtTable(
  arrangement: SeatingArrangement,
  tableId: string,
): string[] {
  return Object.entries(arrangement.assignments)
    .filter(([, assignedTableId]) => assignedTableId === tableId)
    .map(([guestId]) => guestId);
}

function evaluateKeepTogether(
  constraint: KeepTogetherConstraint,
  arrangement: SeatingArrangement,
): ConstraintEvaluation {
  const tableIds = new Set(
    constraint.guestIds.map((guestId) => tableIdForGuest(arrangement, guestId)),
  );
  const satisfied = tableIds.size === 1 && !tableIds.has(undefined);
  return {
    constraint,
    satisfied,
    violatingGuestIds: satisfied ? [] : [...constraint.guestIds],
  };
}

function evaluateKeepApart(
  constraint: KeepApartConstraint,
  arrangement: SeatingArrangement,
): ConstraintEvaluation {
  const guestIdsByTable = new Map<string, string[]>();
  for (const guestId of constraint.guestIds) {
    const tableId = tableIdForGuest(arrangement, guestId);
    if (tableId === undefined) continue;
    const guestsAtThisTable = guestIdsByTable.get(tableId) ?? [];
    guestsAtThisTable.push(guestId);
    guestIdsByTable.set(tableId, guestsAtThisTable);
  }

  const violatingGuestIds: string[] = [];
  for (const guestIds of guestIdsByTable.values()) {
    if (guestIds.length > 1) violatingGuestIds.push(...guestIds);
  }

  return {
    constraint,
    satisfied: violatingGuestIds.length === 0,
    violatingGuestIds,
  };
}

function evaluateMustSitAt(
  constraint: MustSitAtConstraint,
  arrangement: SeatingArrangement,
): ConstraintEvaluation {
  const satisfied =
    tableIdForGuest(arrangement, constraint.guestId) === constraint.tableId;
  return {
    constraint,
    satisfied,
    violatingGuestIds: satisfied ? [] : [constraint.guestId],
  };
}

function evaluateCapacity(
  constraint: CapacityConstraint,
  arrangement: SeatingArrangement,
  seatCost?: SeatCost,
): ConstraintEvaluation {
  const tables = constraint.tableId
    ? arrangement.tables.filter((table) => table.id === constraint.tableId)
    : arrangement.tables;

  const violatingGuestIds: string[] = [];
  for (const table of tables) {
    const seatedGuestIds = guestIdsAtTable(arrangement, table.id);
    const totalSeats = seatCost
      ? seatedGuestIds.reduce((sum, guestId) => sum + seatCost(guestId), 0)
      : seatedGuestIds.length;
    if (totalSeats > table.capacity) {
      violatingGuestIds.push(...seatedGuestIds);
    }
  }

  return {
    constraint,
    satisfied: violatingGuestIds.length === 0,
    violatingGuestIds,
  };
}

function evaluateSameSideTable(
  constraint: SameSideTableConstraint,
  arrangement: SeatingArrangement,
  guestsById: Map<string, Guest>,
): ConstraintEvaluation {
  const tolerance = constraint.tolerance ?? 0;
  const tables = constraint.tableId
    ? arrangement.tables.filter((table) => table.id === constraint.tableId)
    : arrangement.tables;

  const violatingGuestIds: string[] = [];
  for (const table of tables) {
    const brideGuestIds: string[] = [];
    const groomGuestIds: string[] = [];
    for (const guestId of guestIdsAtTable(arrangement, table.id)) {
      const guest = guestsById.get(guestId);
      if (guest?.side === "bride") brideGuestIds.push(guestId);
      else if (guest?.side === "groom") groomGuestIds.push(guestId);
    }

    if (brideGuestIds.length === 0 || groomGuestIds.length === 0) continue;

    const minoritySide =
      brideGuestIds.length <= groomGuestIds.length ? brideGuestIds : groomGuestIds;
    if (minoritySide.length > tolerance) {
      violatingGuestIds.push(...minoritySide);
    }
  }

  return {
    constraint,
    satisfied: violatingGuestIds.length === 0,
    violatingGuestIds,
  };
}

/**
 * Pure validator: evaluates each constraint against a seating arrangement.
 * Does not mutate its inputs and does not solve/optimize the arrangement.
 */
export function evaluateConstraints(
  arrangement: SeatingArrangement,
  constraints: Constraint[],
  guests: Guest[],
  seatCost?: SeatCost,
): ConstraintEvaluationResult {
  const guestsById = new Map(guests.map((guest) => [guest.id, guest]));

  const results = constraints.map((constraint): ConstraintEvaluation => {
    switch (constraint.type) {
      case "keep-together":
        return evaluateKeepTogether(constraint, arrangement);
      case "keep-apart":
        return evaluateKeepApart(constraint, arrangement);
      case "must-sit-at":
        return evaluateMustSitAt(constraint, arrangement);
      case "capacity":
        return evaluateCapacity(constraint, arrangement, seatCost);
      case "same-side-table":
        return evaluateSameSideTable(constraint, arrangement, guestsById);
      default: {
        const exhaustive: never = constraint;
        throw new Error(`Unknown constraint type: ${JSON.stringify(exhaustive)}`);
      }
    }
  });

  const hardViolations = results.filter(
    (result) => !result.satisfied && resolveHardness(result.constraint) === "hard",
  ).length;

  return { results, hardViolations };
}
