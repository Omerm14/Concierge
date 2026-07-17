import type { Guest, SeatingArrangement, Table } from "../guests/types";
import type { Constraint } from "./constraints";
import { autoSeat, type AutoSeatResult } from "./autoseat";

export interface AutoSeatProposal {
  result: AutoSeatResult;
  previousArrangement: SeatingArrangement;
}

/**
 * Thin glue between the CON-8 solver and the board's UI state: runs
 * `autoSeat` over the board's current guests/tables/constraints and pairs
 * the result with the arrangement it would replace, so the caller can offer
 * an exact Undo. No solving/scoring logic lives here — that's `autoSeat`'s.
 */
export function proposeAutoSeat(
  guests: Guest[],
  tables: Table[],
  constraints: Constraint[],
  currentArrangement: SeatingArrangement
): AutoSeatProposal {
  return {
    result: autoSeat(guests, tables, constraints),
    previousArrangement: currentArrangement,
  };
}

/** Reverts to the arrangement captured just before an auto-seat proposal. */
export function undoAutoSeat(proposal: AutoSeatProposal): SeatingArrangement {
  return proposal.previousArrangement;
}
