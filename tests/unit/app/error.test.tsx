import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import * as Sentry from "@sentry/nextjs";
import ErrorFallback from "@/app/error";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("<Error />", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("reports the error to Sentry exactly once", () => {
    const error = new Error("boom");
    render(<ErrorFallback error={error} reset={vi.fn()} />);

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it("renders a fallback and a reset control wired to the reset prop", () => {
    const reset = vi.fn();
    render(<ErrorFallback error={new Error("boom")} reset={reset} />);

    const button = screen.getByRole("button", { name: /try again/i });
    expect(button).toBeInTheDocument();

    button.click();
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
