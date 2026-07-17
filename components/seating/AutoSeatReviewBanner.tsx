"use client";

export function AutoSeatReviewBanner({
  score,
  unseatedCount,
  onApprove,
  onUndo,
}: {
  score: number;
  unseatedCount: number;
  onApprove: () => void;
  onUndo: () => void;
}) {
  return (
    <div
      role="status"
      data-testid="auto-seat-review"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm dark:border-rose-800 dark:bg-rose-950"
    >
      <p className="text-black dark:text-zinc-50">
        Auto-seat proposal — score{" "}
        <span data-testid="auto-seat-score">{score.toFixed(2)}</span>,{" "}
        <span data-testid="auto-seat-unseated-count">{unseatedCount}</span>{" "}
        unseated
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          data-testid="auto-seat-approve"
          onClick={onApprove}
          className="rounded-lg bg-black px-3 py-1.5 font-medium text-white dark:bg-white dark:text-black"
        >
          Approve
        </button>
        <button
          type="button"
          data-testid="auto-seat-undo"
          onClick={onUndo}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium text-black dark:border-zinc-600 dark:text-zinc-50"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
