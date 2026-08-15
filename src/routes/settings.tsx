import { createFileRoute } from "@tanstack/react-router";

import { AppMenu } from "@/components/AppMenu";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & profile — Habit Tracker" },
      {
        name: "description",
        content:
          "Manage your profile, region, reminder times, trip mode and appearance preferences for your habit tracker.",
      },
      { property: "og:title", content: "Settings & profile — Habit Tracker" },
      {
        property: "og:description",
        content: "Profile, region, reminders and trip mode settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <main className="min-h-screen bg-background p-4 text-foreground">
      <header className="mb-4 flex items-center gap-3">
        <AppMenu />
        <h1 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Settings &amp; profile
        </h1>
      </header>

      <div className="mx-auto grid max-w-xl gap-4">
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-w2-soft text-lg">
              🌱
            </div>
            <div>
              <p className="text-sm font-semibold">Hemanth M.</p>
              <p className="text-[11px] text-muted-foreground">Karnataka, IN · Rank #12</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <h2 className="bg-w1-soft px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
            Preferences
          </h2>
          {[
            "Daily reminder — 7:00 AM",
            "Trip mode (pause streaks while travelling)",
            "Show me on the regional leaderboard",
            "Weekly summary email",
          ].map((label) => (
            <label
              key={label}
              className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0"
            >
              {label}
              <input type="checkbox" className="h-4 w-4 accent-w1" defaultChecked />
            </label>
          ))}
        </section>
      </div>
    </main>
  );
}