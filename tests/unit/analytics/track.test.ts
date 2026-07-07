import { describe, it, expect, afterEach, vi } from "vitest";
import { track, setAnalyticsSink, resetAnalyticsSink } from "@/lib/analytics/track";

describe("track()", () => {
  afterEach(() => {
    resetAnalyticsSink();
  });

  it("forwards event + props to the currently installed sink", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    track("viral_hook_shown", { source: "venue-view" });

    expect(sink).toHaveBeenCalledWith("viral_hook_shown", { source: "venue-view" });
  });

  it("swapping the sink is a single injection point — old sink stops receiving events", () => {
    const first = vi.fn();
    const second = vi.fn();

    setAnalyticsSink(first);
    track("pricing_viewed", {});

    setAnalyticsSink(second);
    track("landing_viewed", {});

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("default sink is a no-op/console sink and does not throw", () => {
    expect(() => track("seating_opened", {})).not.toThrow();
  });
});
