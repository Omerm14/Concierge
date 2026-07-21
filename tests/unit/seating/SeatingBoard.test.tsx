import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeatingBoard } from "@/components/seating/SeatingBoard";
import { resetAnalyticsSink, setAnalyticsSink } from "@/lib/analytics/track";
import type { Guest, SeatingArrangement, Table } from "@/lib/guests/types";

function makeGuest(overrides: Partial<Guest> & { id: string }): Guest {
  return {
    fullName: `Guest ${overrides.id}`,
    side: "bride",
    groups: [],
    dietary: [],
    rsvpStatus: "yes",
    plusOnesAllowed: 0,
    ...overrides,
  };
}

const guests: Guest[] = Array.from({ length: 6 }, (_, i) => makeGuest({ id: `g${i + 1}` }));
const tables: Table[] = [
  { id: "t1", label: "Table 1", capacity: 4 },
  { id: "t2", label: "Table 2", capacity: 4 },
];
const initialArrangement: SeatingArrangement = { tables, assignments: { g1: "t1" } };

describe("<SeatingBoard /> auto-seat", () => {
  afterEach(() => {
    cleanup();
    resetAnalyticsSink();
  });

  it("running Auto-seat populates the board and shows a review banner with score and unseated count", async () => {
    const user = userEvent.setup();
    render(<SeatingBoard guests={guests} initialArrangement={initialArrangement} />);

    await user.click(screen.getByTestId("auto-seat-button"));

    expect(screen.getByTestId("auto-seat-review")).toBeInTheDocument();
    expect(screen.getByTestId("auto-seat-score")).toBeInTheDocument();
    expect(screen.getByTestId("auto-seat-unseated-count")).toHaveTextContent("0");
  });

  it("fires auto_seat_run with the table count and unseated count", async () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);
    const user = userEvent.setup();
    render(<SeatingBoard guests={guests} initialArrangement={initialArrangement} />);

    await user.click(screen.getByTestId("auto-seat-button"));

    expect(sink).toHaveBeenCalledWith("auto_seat_run", { tableCount: 2, unseatedCount: 0 });
  });

  it("Approve dismisses the review banner and keeps the proposed arrangement", async () => {
    const user = userEvent.setup();
    render(<SeatingBoard guests={guests} initialArrangement={initialArrangement} />);

    await user.click(screen.getByTestId("auto-seat-button"));
    expect(screen.getByTestId("unassigned-count")).toHaveTextContent("(0)");

    await user.click(screen.getByTestId("auto-seat-approve"));

    expect(screen.queryByTestId("auto-seat-review")).not.toBeInTheDocument();
    expect(screen.getByTestId("unassigned-count")).toHaveTextContent("(0)");
  });

  it("Undo restores the exact pre-auto-seat arrangement", async () => {
    const user = userEvent.setup();
    render(<SeatingBoard guests={guests} initialArrangement={initialArrangement} />);

    expect(screen.getByTestId("unassigned-count")).toHaveTextContent("(5)");
    await user.click(screen.getByTestId("auto-seat-button"));
    expect(screen.getByTestId("unassigned-count")).toHaveTextContent("(0)");

    await user.click(screen.getByTestId("auto-seat-undo"));

    expect(screen.queryByTestId("auto-seat-review")).not.toBeInTheDocument();
    expect(screen.getByTestId("unassigned-count")).toHaveTextContent("(5)");
    expect(within(screen.getByTestId("table-t1")).queryByTestId("chip-g1")).toBeInTheDocument();
  });
});

describe("<SeatingBoard /> funnel events", () => {
  beforeEach(() => {
    // jsdom does not implement the Pointer Events capture API used by the
    // board's drag handlers.
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  afterEach(() => {
    cleanup();
    resetAnalyticsSink();
    vi.restoreAllMocks();
  });

  it("fires seating_opened exactly once on mount", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    render(<SeatingBoard guests={guests} initialArrangement={initialArrangement} />);

    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith("seating_opened", {});
  });

  it("fires seating_assignment_made with the board's table count when a guest is dropped onto a table", () => {
    const sink = vi.fn();
    render(<SeatingBoard guests={guests} initialArrangement={initialArrangement} />);
    setAnalyticsSink(sink);

    const chip = screen.getByTestId("chip-g2");
    const targetTable = screen.getByTestId("table-t2");
    document.elementFromPoint = vi.fn().mockReturnValue(targetTable);

    fireEvent.pointerDown(chip, { pointerId: 1 });
    fireEvent.pointerUp(chip, { pointerId: 1, clientX: 1, clientY: 1 });

    expect(sink).toHaveBeenCalledWith("seating_assignment_made", { tableCount: 2 });
  });

  it("does not fire seating_assignment_made when a guest is dropped onto the unassign tray", () => {
    const sink = vi.fn();
    render(<SeatingBoard guests={guests} initialArrangement={initialArrangement} />);
    setAnalyticsSink(sink);

    const chip = screen.getByTestId("chip-g1");
    const tray = screen.getByTestId("unassigned-tray");
    document.elementFromPoint = vi.fn().mockReturnValue(tray);

    fireEvent.pointerDown(chip, { pointerId: 1 });
    fireEvent.pointerUp(chip, { pointerId: 1, clientX: 1, clientY: 1 });

    expect(sink).not.toHaveBeenCalledWith("seating_assignment_made", expect.anything());
  });

  it("does not fire seating_assignment_made when a drop is rejected for capacity", () => {
    const fullTables: Table[] = [{ id: "t1", label: "Table 1", capacity: 1 }];
    const fullArrangement: SeatingArrangement = { tables: fullTables, assignments: { g1: "t1" } };
    const sink = vi.fn();
    render(<SeatingBoard guests={guests} initialArrangement={fullArrangement} />);
    setAnalyticsSink(sink);

    const chip = screen.getByTestId("chip-g2");
    const targetTable = screen.getByTestId("table-t1");
    document.elementFromPoint = vi.fn().mockReturnValue(targetTable);

    fireEvent.pointerDown(chip, { pointerId: 1 });
    fireEvent.pointerUp(chip, { pointerId: 1, clientX: 1, clientY: 1 });

    expect(screen.getByTestId("rejection-message")).toBeInTheDocument();
    expect(sink).not.toHaveBeenCalledWith("seating_assignment_made", expect.anything());
  });
});
