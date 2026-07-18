import type { SeatingArrangement, Side, Table } from "../guests/types";
import type { Constraint } from "./constraints";
import { buildSeatCost, type RosterGuest, type SeatCost } from "./occupancy";
import { scoreArrangement } from "./score";

export interface AutoSeatOptions {
  /** Fixed seed for the deterministic PRNG driving tie-breaks and local search. */
  seed?: number;
  /** Number of local-search improvement attempts after the greedy seed. */
  maxSwapIterations?: number;
}

export interface AutoSeatResult {
  arrangement: SeatingArrangement;
  score: number;
  unseated: string[];
}

const DEFAULT_SEED = 42;
const DEFAULT_MAX_SWAP_ITERATIONS = 300;
const SIDE_PRIORITY: Side[] = ["bride", "groom", "both", "other"];

/** Deterministic PRNG (mulberry32) — no Math.random(), reproducible per seed. */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, exclusiveMax: number): number {
  return Math.floor(rng() * exclusiveMax);
}

function shuffleInPlace<T>(items: T[], rng: () => number): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
}

/** Union-find over guest IDs, merged along `keep-together` constraints. */
class UnionFind {
  private readonly parent = new Map<string, string>();

  constructor(ids: Iterable<string>) {
    for (const id of ids) this.parent.set(id, id);
  }

  find(id: string): string {
    const parent = this.parent.get(id);
    if (parent === undefined) {
      this.parent.set(id, id);
      return id;
    }
    if (parent === id) return id;
    const root = this.find(parent);
    this.parent.set(id, root);
    return root;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootA, rootB);
  }
}

function buildClusters(guestIds: string[], constraints: Constraint[]): string[][] {
  const unionFind = new UnionFind(guestIds);
  for (const constraint of constraints) {
    if (constraint.type !== "keep-together") continue;
    for (let i = 1; i < constraint.guestIds.length; i++) {
      unionFind.union(constraint.guestIds[0], constraint.guestIds[i]);
    }
  }

  const clustersByRoot = new Map<string, string[]>();
  for (const id of guestIds) {
    const root = unionFind.find(id);
    const cluster = clustersByRoot.get(root) ?? [];
    cluster.push(id);
    clustersByRoot.set(root, cluster);
  }
  return [...clustersByRoot.values()];
}

/** Largest clusters first (best-fit-decreasing); ties broken by a seeded shuffle. */
function orderClusters(clusters: string[][], rng: () => number): string[][] {
  const bySize = new Map<number, string[][]>();
  for (const cluster of clusters) {
    const bucket = bySize.get(cluster.length) ?? [];
    bucket.push(cluster);
    bySize.set(cluster.length, bucket);
  }

  const ordered: string[][] = [];
  for (const size of [...bySize.keys()].sort((a, b) => b - a)) {
    const bucket = bySize.get(size)!;
    shuffleInPlace(bucket, rng);
    ordered.push(...bucket);
  }
  return ordered;
}

function buildKeepApartMap(constraints: Constraint[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    const set = map.get(a) ?? new Set<string>();
    set.add(b);
    map.set(a, set);
  };

  for (const constraint of constraints) {
    if (constraint.type !== "keep-apart") continue;
    for (let i = 0; i < constraint.guestIds.length; i++) {
      for (let j = i + 1; j < constraint.guestIds.length; j++) {
        add(constraint.guestIds[i], constraint.guestIds[j]);
        add(constraint.guestIds[j], constraint.guestIds[i]);
      }
    }
  }
  return map;
}

function violatesKeepApart(
  candidateIds: string[],
  tableMemberIds: string[],
  keepApart: Map<string, Set<string>>,
): boolean {
  for (const id of candidateIds) {
    const forbidden = keepApart.get(id);
    if (!forbidden) continue;
    for (const memberId of tableMemberIds) {
      if (forbidden.has(memberId)) return true;
    }
  }
  return false;
}

function majoritySide(
  guestIds: string[],
  guestsById: Map<string, RosterGuest>,
): Side | undefined {
  const counts = new Map<Side, number>();
  for (const id of guestIds) {
    const side = guestsById.get(id)?.side;
    if (!side) continue;
    counts.set(side, (counts.get(side) ?? 0) + 1);
  }
  if (counts.size === 0) return undefined;

  let best: Side | undefined;
  let bestCount = -1;
  for (const side of SIDE_PRIORITY) {
    const count = counts.get(side) ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = side;
    }
  }
  return best;
}

interface SeatState {
  seatCounts: Map<string, number>;
  seatMembers: Map<string, string[]>;
  assignments: Record<string, string>;
}

function createSeatState(tables: Table[]): SeatState {
  return {
    seatCounts: new Map(tables.map((table) => [table.id, 0])),
    seatMembers: new Map(tables.map((table) => [table.id, []])),
    assignments: {},
  };
}

function placeAt(
  state: SeatState,
  guestIds: string[],
  tableId: string,
  seatCost: SeatCost,
): void {
  for (const guestId of guestIds) {
    state.assignments[guestId] = tableId;
    state.seatCounts.set(tableId, (state.seatCounts.get(tableId) ?? 0) + seatCost(guestId));
    state.seatMembers.get(tableId)?.push(guestId);
  }
}

/** Best eligible table for a candidate group: fits capacity (by seat-cost),
 * respects keep-apart, prefers side cohesion, tie-broken toward the emptier
 * table (even fill). */
function pickBestTable(
  candidateIds: string[],
  tables: Table[],
  state: SeatState,
  keepApart: Map<string, Set<string>>,
  guestsById: Map<string, RosterGuest>,
  seatCost: SeatCost,
): Table | undefined {
  const side = majoritySide(candidateIds, guestsById);
  const candidateSeats = candidateIds.reduce((sum, id) => sum + seatCost(id), 0);
  let best: Table | undefined;
  let bestScore = -Infinity;

  for (const table of tables) {
    const used = state.seatCounts.get(table.id) ?? 0;
    if (table.capacity - used < candidateSeats) continue;
    const members = state.seatMembers.get(table.id) ?? [];
    if (violatesKeepApart(candidateIds, members, keepApart)) continue;

    const sideMatches = side
      ? members.filter((id) => guestsById.get(id)?.side === side).length
      : 0;
    const occupancyFraction = table.capacity > 0 ? used / table.capacity : 0;
    const score = sideMatches - occupancyFraction;

    if (score > bestScore) {
      bestScore = score;
      best = table;
    }
  }
  return best;
}

function greedySeed(
  guests: RosterGuest[],
  tables: Table[],
  constraints: Constraint[],
  rng: () => number,
  seatCost: SeatCost,
): { state: SeatState; unseated: string[] } {
  const guestsById = new Map(guests.map((guest) => [guest.id, guest]));
  const keepApart = buildKeepApartMap(constraints);
  const tableById = new Map(tables.map((table) => [table.id, table]));
  const state = createSeatState(tables);
  const unseated: string[] = [];
  const placed = new Set<string>();

  // 1. must-sit-at is hard: force it first, best-effort (never over capacity,
  // never onto a keep-apart neighbor — those hard constraints win).
  for (const constraint of constraints) {
    if (constraint.type !== "must-sit-at") continue;
    if (!guestsById.has(constraint.guestId) || placed.has(constraint.guestId)) continue;
    const table = tableById.get(constraint.tableId);
    if (!table) continue;
    const used = state.seatCounts.get(table.id) ?? 0;
    if (used + seatCost(constraint.guestId) > table.capacity) continue;
    const members = state.seatMembers.get(table.id) ?? [];
    if (violatesKeepApart([constraint.guestId], members, keepApart)) continue;
    placeAt(state, [constraint.guestId], table.id, seatCost);
    placed.add(constraint.guestId);
  }

  // 2. Cluster remaining guests by keep-together, seed by side/group cohesion.
  const remainingIds = guests.map((guest) => guest.id).filter((id) => !placed.has(id));
  const clusters = orderClusters(buildClusters(remainingIds, constraints), rng);

  for (const cluster of clusters) {
    const table = pickBestTable(cluster, tables, state, keepApart, guestsById, seatCost);
    if (table) {
      placeAt(state, cluster, table.id, seatCost);
      continue;
    }
    // Cluster doesn't fit together (keep-together is soft) — place individually.
    for (const guestId of cluster) {
      const single = pickBestTable([guestId], tables, state, keepApart, guestsById, seatCost);
      if (single) placeAt(state, [guestId], single.id, seatCost);
      else unseated.push(guestId);
    }
  }

  return { state, unseated };
}

type Move =
  | { kind: "swap"; guestA: string; guestB: string }
  | { kind: "seat"; guestId: string; tableId: string };

function pickMove(
  assignments: Record<string, string>,
  unseated: string[],
  tables: Table[],
  rng: () => number,
): Move | undefined {
  const seatedIds = Object.keys(assignments);
  const canSwap = seatedIds.length >= 2;
  const canSeat = unseated.length > 0 && tables.length > 0;
  if (!canSwap && !canSeat) return undefined;

  const trySwap = canSwap && (!canSeat || rng() < 0.5);
  if (trySwap) {
    const i = randInt(rng, seatedIds.length);
    let j = randInt(rng, seatedIds.length);
    if (j === i) j = (j + 1) % seatedIds.length;
    return { kind: "swap", guestA: seatedIds[i], guestB: seatedIds[j] };
  }

  const guestId = unseated[randInt(rng, unseated.length)];
  const tableId = tables[randInt(rng, tables.length)].id;
  return { kind: "seat", guestId, tableId };
}

function tableSeatSum(
  assignments: Record<string, string>,
  tableId: string,
  seatCost: SeatCost,
): number {
  let sum = 0;
  for (const [guestId, assignedTableId] of Object.entries(assignments)) {
    if (assignedTableId === tableId) sum += seatCost(guestId);
  }
  return sum;
}

function exceedsCapacity(
  tables: Table[],
  assignments: Record<string, string>,
  tableId: string,
  seatCost: SeatCost,
): boolean {
  const table = tables.find((t) => t.id === tableId);
  return table !== undefined && tableSeatSum(assignments, tableId, seatCost) > table.capacity;
}

function applyMove(
  arrangement: SeatingArrangement,
  unseated: string[],
  move: Move,
  seatCost: SeatCost,
): { arrangement: SeatingArrangement; unseated: string[] } {
  const assignments = { ...arrangement.assignments };

  if (move.kind === "swap") {
    const tableA = assignments[move.guestA];
    const tableB = assignments[move.guestB];
    const nextAssignments = { ...assignments, [move.guestA]: tableB, [move.guestB]: tableA };
    // Swapping guests with different seat-costs can push either table over
    // capacity (a plain 1-for-1 guest swap never could) — reject if so.
    if (
      exceedsCapacity(arrangement.tables, nextAssignments, tableA, seatCost) ||
      exceedsCapacity(arrangement.tables, nextAssignments, tableB, seatCost)
    ) {
      return { arrangement, unseated };
    }
    return { arrangement: { tables: arrangement.tables, assignments: nextAssignments }, unseated };
  }

  const table = arrangement.tables.find((t) => t.id === move.tableId);
  const used = tableSeatSum(assignments, move.tableId, seatCost);
  if (!table || used + seatCost(move.guestId) > table.capacity) {
    return { arrangement, unseated };
  }
  assignments[move.guestId] = move.tableId;
  return {
    arrangement: { tables: arrangement.tables, assignments },
    unseated: unseated.filter((id) => id !== move.guestId),
  };
}

/**
 * Randomized local search: proposes swaps between two seated guests' tables,
 * or seating a currently-unseated guest, and only commits a move when it
 * does not decrease the score — guaranteeing the result is never worse than
 * the greedy seed.
 */
function localSearch(
  arrangement: SeatingArrangement,
  unseated: string[],
  constraints: Constraint[],
  guests: RosterGuest[],
  rng: () => number,
  maxIterations: number,
  seatCost: SeatCost,
): { arrangement: SeatingArrangement; unseated: string[]; score: number } {
  let current = arrangement;
  let currentUnseated = unseated;
  let currentScore = scoreArrangement(current, constraints, guests, seatCost);

  for (let i = 0; i < maxIterations; i++) {
    const move = pickMove(current.assignments, currentUnseated, current.tables, rng);
    if (!move) break;

    const next = applyMove(current, currentUnseated, move, seatCost);
    const nextScore = scoreArrangement(next.arrangement, constraints, guests, seatCost);
    if (nextScore >= currentScore) {
      current = next.arrangement;
      currentUnseated = next.unseated;
      currentScore = nextScore;
    }
  }

  return { arrangement: current, unseated: currentUnseated, score: currentScore };
}

/**
 * Deterministic heuristic solver: greedily seeds an arrangement (grouping by
 * side/keep-together cohesion while respecting hard constraints), then runs
 * randomized local search to improve the soft score without ever regressing
 * it or exceeding table capacity.
 */
export function autoSeat(
  guests: RosterGuest[],
  tables: Table[],
  constraints: Constraint[],
  opts: AutoSeatOptions = {},
): AutoSeatResult {
  const seed = opts.seed ?? DEFAULT_SEED;
  const maxSwapIterations = opts.maxSwapIterations ?? DEFAULT_MAX_SWAP_ITERATIONS;
  const rng = createRng(seed);
  const seatCost = buildSeatCost(guests);

  const { state, unseated } = greedySeed(guests, tables, constraints, rng, seatCost);
  const seeded: SeatingArrangement = { tables, assignments: state.assignments };

  const improved = localSearch(seeded, unseated, constraints, guests, rng, maxSwapIterations, seatCost);

  return {
    arrangement: improved.arrangement,
    score: improved.score,
    unseated: improved.unseated,
  };
}
