import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <PageViewTracker event="landing_viewed" />
      <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
        Concierge — coming soon
      </h1>
    </div>
  );
}
