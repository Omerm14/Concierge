import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { VenueViewHeader } from "@/components/venue-view/VenueViewHeader";
import type { WeddingProfile } from "@/lib/wedding/types";

const wedding: WeddingProfile = {
  coupleDisplayName: "נועה & איתי",
  partnerAName: "נועה כהן",
  partnerBName: "איתי לוי",
  weddingDate: "2026-09-17",
  venueName: "Gan HaShlosha Gardens",
  venueCity: "Beit She'an",
  defaultLanguage: "he",
};

const generatedAt = new Date("2026-08-01T12:00:00Z");

describe("<VenueViewHeader />", () => {
  afterEach(cleanup);

  it("renders the couple name, wedding date, and venue from the WeddingProfile", () => {
    render(<VenueViewHeader wedding={wedding} generatedAt={generatedAt} />);

    expect(screen.getByText("נועה & איתי")).toBeInTheDocument();
    expect(screen.getByText(/September 17, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Gan HaShlosha Gardens, Beit She'an/)).toBeInTheDocument();
    expect(screen.getByText(/Generated on/)).toBeInTheDocument();
  });

  it("never renders the 'Concierge' brand name", () => {
    render(<VenueViewHeader wedding={wedding} generatedAt={generatedAt} />);

    expect(screen.queryByText(/Concierge/)).not.toBeInTheDocument();
  });

  it("degrades gracefully when venue fields are absent", () => {
    const { venueName, venueCity, ...noVenue } = wedding;
    void venueName;
    void venueCity;

    render(<VenueViewHeader wedding={noVenue} generatedAt={generatedAt} />);

    expect(screen.getByText(/September 17, 2026/)).toBeInTheDocument();
  });

  it("is not marked print:hidden anywhere, so it survives print output", () => {
    const { container } = render(
      <VenueViewHeader wedding={wedding} generatedAt={generatedAt} />
    );

    expect(container.innerHTML).not.toContain("print:hidden");
  });
});
