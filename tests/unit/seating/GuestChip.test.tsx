import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { GuestChip } from "@/components/seating/GuestChip";
import type { Guest } from "@/lib/guests/types";

function makeGuest(overrides: Partial<Guest> & { id: string }): Guest {
  return {
    fullName: `Guest ${overrides.id}`,
    side: "bride",
    groups: [],
    dietary: ["none"],
    rsvpStatus: "yes",
    plusOnesAllowed: 0,
    ...overrides,
  };
}

const noop = vi.fn();

afterEach(() => {
  cleanup();
});

describe("<GuestChip /> plus-ones badge", () => {
  it("AC3: shows a visible +N badge for a guest with confirmed plus-ones", () => {
    const guest = { ...makeGuest({ id: "g1", fullName: "Dana Levi" }), plusOnes: 2 };
    render(<GuestChip guest={guest} dragging={false} onPointerDown={noop} onPointerUp={noop} />);

    const badge = screen.getByTestId("plus-ones-badge-g1");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("+2");
  });

  it("AC3: shows no badge for a guest with 0 confirmed plus-ones (unchanged render)", () => {
    const guest = { ...makeGuest({ id: "g2", fullName: "Noa Cohen" }), plusOnes: 0 };
    render(<GuestChip guest={guest} dragging={false} onPointerDown={noop} onPointerUp={noop} />);

    expect(screen.queryByTestId("plus-ones-badge-g2")).not.toBeInTheDocument();
  });

  it("AC3: shows no badge for a guest with no plusOnes field at all (unchanged render)", () => {
    const guest = makeGuest({ id: "g3", fullName: "Omer Peretz" });
    render(<GuestChip guest={guest} dragging={false} onPointerDown={noop} onPointerUp={noop} />);

    expect(screen.queryByTestId("plus-ones-badge-g3")).not.toBeInTheDocument();
  });
});
