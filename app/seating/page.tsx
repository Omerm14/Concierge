import type { Metadata } from "next";
import { boardArrangement, boardGuests } from "@/lib/seating/mock-board";
import { SeatingBoard } from "@/components/seating/SeatingBoard";

export const metadata: Metadata = {
  title: "Seating board — Concierge",
  description: "Mobile-first, touch drag-and-drop seating board (mock data).",
};

// v0 renders an in-memory mock dataset only — no DB, no fetch, no auth, no
// real guest data. Saving arrangements is persistence (🔒), a separate ticket.
export default function SeatingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 bg-white px-4 py-10 dark:bg-black">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Seating board</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Drag a guest onto a table — works with touch on your phone.
        </p>
      </div>
      <SeatingBoard guests={boardGuests} initialArrangement={boardArrangement} />
    </div>
  );
}
