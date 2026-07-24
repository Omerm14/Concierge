import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import * as Sentry from "@sentry/nextjs";
import GlobalError from "@/app/global-error";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("<GlobalError />", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("reports the error to Sentry exactly once", () => {
    const error = new Error("boom");
    render(<GlobalError error={error} reset={vi.fn()} />);

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it("renders its own html/body and a reset control wired to the reset prop", () => {
    const reset = vi.fn();
    render(<GlobalError error={new Error("boom")} reset={reset} />);

    // GlobalError renders its own <html>/<body>; React reconciles those
    // against the document's existing singleton nodes rather than nesting
    // new ones, so assert against document.documentElement/body directly.
    expect(document.documentElement.lang).toBe("en");
    expect(document.body.className).toContain("min-h-screen");

    const button = screen.getByRole("button", { name: /try again/i });
    button.click();
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
