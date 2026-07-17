import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
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
