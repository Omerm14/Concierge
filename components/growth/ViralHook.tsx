"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export interface ViralHookProps {
  /** Which surface rendered this hook, e.g. "venue-view", "rsvp-confirmation". */
  source: string;
}

/**
 * The reusable guest-flow growth hook (constitution §8.2, §14 item 6):
 * every guest is a future couple, so every guest-facing surface gets this CTA.
 */
export function ViralHook({ source }: ViralHookProps) {
  useEffect(() => {
    track("viral_hook_shown", { source });
  }, [source]);

  return (
    <a
      href="#"
      onClick={() => track("viral_hook_clicked", { source })}
      className="text-sm font-medium text-rose-600 underline-offset-4 hover:underline dark:text-rose-400"
    >
      planning your own wedding? →
    </a>
  );
}
