import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViralHook } from "@/components/growth/ViralHook";
import { setAnalyticsSink, resetAnalyticsSink } from "@/lib/analytics/track";

describe("<ViralHook />", () => {
  afterEach(() => {
    cleanup();
    resetAnalyticsSink();
  });

  it("renders the constitution's hook copy", () => {
    render(<ViralHook source="venue-view" />);

    expect(
      screen.getByText("planning your own wedding? →")
    ).toBeInTheDocument();
  });

  it("fires viral_hook_shown on mount with the source", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    render(<ViralHook source="venue-view" />);

    expect(sink).toHaveBeenCalledWith("viral_hook_shown", { source: "venue-view" });
  });

  it("fires viral_hook_clicked with the source when clicked", async () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);
    const user = userEvent.setup();

    render(<ViralHook source="rsvp-confirmation" />);
    sink.mockClear();

    await user.click(screen.getByText("planning your own wedding? →"));

    expect(sink).toHaveBeenCalledWith("viral_hook_clicked", {
      source: "rsvp-confirmation",
    });
  });
});
