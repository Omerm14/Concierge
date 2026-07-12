import type { Metadata } from "next";
import { demoArrangement, demoGuests } from "@/lib/fixtures/demo-wedding";
import { dietaryTotals, headcount, responseBreakdown } from "@/lib/roster/totals";
import { checkInList, tableLayout } from "@/lib/venue-view/check-in";
import { HeadcountSummary } from "@/components/venue-view/HeadcountSummary";
import { DietaryTotals } from "@/components/venue-view/DietaryTotals";
import { TableLayout } from "@/components/venue-view/TableLayout";
import { CheckInList } from "@/components/venue-view/CheckInList";
import { PrintButton } from "@/components/venue-view/PrintButton";

export const metadata: Metadata = {
  title: "Venue View — Concierge",
  description: "Read-only headcount, table layout, dietary totals, and check-in list for the venue.",
};

// v0 renders the shared mock dataset only — no DB, no fetch, no auth, no
// real guest data. Wiring this to the couple's real (in-memory) guest list
// is a separate ticket; the public/shareable export is 🔒 (see CON-32).
export default function VenueViewPage() {
  const guests = demoGuests;
  const arrangement = demoArrangement;

  const groups = tableLayout(guests, arrangement);
  const { byTable, unseated } = checkInList(guests, arrangement);

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 bg-white px-6 py-16 print:gap-6 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Venue View</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            Everything the venue needs — read-only, printable.
          </p>
        </div>
        <PrintButton />
      </div>

      <HeadcountSummary
        headcount={headcount(guests)}
        responseBreakdown={responseBreakdown(guests)}
      />
      <TableLayout groups={groups} />
      <DietaryTotals dietaryTotals={dietaryTotals(guests)} />
      <CheckInList byTable={byTable} unseated={unseated} />
    </div>
  );
}
