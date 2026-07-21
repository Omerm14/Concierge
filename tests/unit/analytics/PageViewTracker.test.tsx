import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { resetAnalyticsSink, setAnalyticsSink } from "@/lib/analytics/track";

describe("<PageViewTracker />", () => {
  afterEach(() => {
    cleanup();
    resetAnalyticsSink();
  });

  it("fires the given event exactly once on mount", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    render(<PageViewTracker event="landing_viewed" />);

    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith("landing_viewed", {});
  });

  it("does not re-fire on re-render with the same event", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    const { rerender } = render(<PageViewTracker event="pricing_viewed" />);
    rerender(<PageViewTracker event="pricing_viewed" />);

    expect(sink).toHaveBeenCalledTimes(1);
  });

  it("fires venue_view_generated when given that event", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    render(<PageViewTracker event="venue_view_generated" />);

    expect(sink).toHaveBeenCalledWith("venue_view_generated", {});
  });

  it("renders nothing", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    const { container } = render(<PageViewTracker event="landing_viewed" />);

    expect(container).toBeEmptyDOMElement();
  });
});
