"use client";

export function AutoSeatButton({ onAutoSeat }: { onAutoSeat: () => void }) {
  return (
    <button
      type="button"
      data-testid="auto-seat-button"
      onClick={onAutoSeat}
      className="self-start rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
    >
      Auto-seat
    </button>
  );
}
