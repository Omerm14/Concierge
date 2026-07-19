import type { WeddingProfile } from "@/lib/wedding/types";

function formatWeddingDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// Couple-branded, print-visible header for the venue-facing Venue View sheet.
// Deliberately not `print:hidden` — this is the identity a venue must see.
export function VenueViewHeader({
  wedding,
  generatedAt,
}: {
  wedding: WeddingProfile;
  generatedAt: Date;
}) {
  const venue = [wedding.venueName, wedding.venueCity].filter(Boolean).join(", ");

  return (
    <div>
      <h1 className="text-3xl font-semibold text-black dark:text-zinc-50 print:text-black">
        {wedding.coupleDisplayName}
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-300 print:text-black">
        {formatWeddingDate(wedding.weddingDate)}
        {venue ? ` · ${venue}` : ""}
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 print:text-black">
        Generated on {formatGeneratedAt(generatedAt)}
      </p>
    </div>
  );
}
