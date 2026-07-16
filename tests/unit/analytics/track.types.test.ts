import { describe, it, expect } from "vitest";
import { track } from "@/lib/analytics/track";

/**
 * Type-level guarantee that instrumentation cannot carry guest PII. These
 * calls must fail `tsc --noEmit` without the `@ts-expect-error` comments —
 * if the props type is ever loosened to accept a PII-shaped field, the
 * directive becomes "unused" and `npm run typecheck` fails.
 */
describe("track() PII rejection (type-level)", () => {
  it("rejects PII-shaped fields on an event with declared props", () => {
    // @ts-expect-error "name" is not part of viral_hook_shown's props
    track("viral_hook_shown", { source: "pricing", name: "Jane Doe" });
    // @ts-expect-error "phone" is not part of viral_hook_shown's props
    track("viral_hook_shown", { source: "pricing", phone: "050-123-4567" });
    // @ts-expect-error "email" is not part of viral_hook_shown's props
    track("viral_hook_shown", { source: "pricing", email: "jane@example.com" });

    expect(true).toBe(true);
  });

  it("rejects PII-shaped fields on a no-props event", () => {
    // @ts-expect-error pricing_viewed carries no props at all
    track("pricing_viewed", { name: "Jane Doe" });

    expect(true).toBe(true);
  });

  it("rejects event names outside the v0 funnel taxonomy", () => {
    // @ts-expect-error "guest_deleted" is not part of the taxonomy
    track("guest_deleted", {});

    expect(true).toBe(true);
  });

  it("rejects PII-shaped fields on the RSVP + auto-seat events", () => {
    // @ts-expect-error "name" is not part of rsvp_page_opened's props
    track("rsvp_page_opened", { language: "en", name: "Jane Doe" });
    // @ts-expect-error rsvp_started carries no props at all
    track("rsvp_started", { phone: "050-123-4567" });
    // @ts-expect-error "email" is not part of rsvp_submitted's props
    track("rsvp_submitted", { status: "yes", plusOnes: 1, email: "jane@example.com" });
    // @ts-expect-error "name" is not part of rsvp_language_switched's props
    track("rsvp_language_switched", { language: "he", name: "Jane Doe" });
    // @ts-expect-error "unseatedGuestNames" is not part of auto_seat_run's props
    track("auto_seat_run", { tableCount: 10, unseatedCount: 2, unseatedGuestNames: ["Jane"] });

    expect(true).toBe(true);
  });

  it("rejects wrong prop types on the RSVP + auto-seat events", () => {
    // @ts-expect-error "status" must be a RsvpAnswer, not an arbitrary string
    track("rsvp_submitted", { status: "pending", plusOnes: 1 });
    // @ts-expect-error "language" must be a Language, not an arbitrary string
    track("rsvp_page_opened", { language: "fr" });

    expect(true).toBe(true);
  });
});
