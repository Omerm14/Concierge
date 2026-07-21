"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";
import type { EventPropsMap } from "@/lib/analytics/events";

/** Event names whose props are the closed zero-prop shape — the only kind a page-view can fire. */
type PageViewEvent = {
  [E in keyof EventPropsMap]: EventPropsMap[E] extends Record<string, never> ? E : never;
}[keyof EventPropsMap];

/**
 * Fires one page-view event on mount. The pages that own these moments are
 * server components, so this tiny client child is the wiring point — reused
 * across every page-view surface instead of duplicating a useEffect per page.
 */
export function PageViewTracker({ event }: { event: PageViewEvent }) {
  useEffect(() => {
    track(event, {});
  }, [event]);

  return null;
}
