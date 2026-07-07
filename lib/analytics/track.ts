import type { EventName, EventPropsMap } from "./events";

export type AnalyticsSink = <E extends EventName>(
  event: E,
  props: EventPropsMap[E]
) => void;

const consoleSink: AnalyticsSink = (event, props) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[analytics] ${event}`, props);
  }
};

let sink: AnalyticsSink = consoleSink;

/** Single injection point for swapping the no-op/console sink for a real vendor later. */
export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

/** Restores the default no-op/console sink (mainly for test teardown). */
export function resetAnalyticsSink(): void {
  sink = consoleSink;
}

export function track<E extends EventName>(
  event: E,
  props: EventPropsMap[E]
): void {
  sink(event, props);
}
