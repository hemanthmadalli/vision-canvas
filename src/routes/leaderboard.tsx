import { createFileRoute } from "@tanstack/react-router";

import { AppMenu } from "@/components/AppMenu";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Habit Tracker" },
      {
        name: "description",
        content: "See how your consistency ranks against other members in your region this month.",
      },
      { property: "og:title", content: "Leaderboard — Habit Tracker" },
      { property: "og:description", content: "Regional habit consistency rankings for June 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

const rows = [
  { rank: 1, name: "Ananya R.", percent: 94, streak: 28 },
  { rank: 2, name: "Dev Patel", percent: 91, streak: 24 },
  { rank: 3, name: "Meera S.", percent: 88, streak: 21 },
  { rank: 4, name: "Rohit K.", percent: 85, streak: 19 },
  { rank: 5, name: "Sara N.", percent: 83, streak: 17 },
  { rank: 12, name: "You", percent: 74, streak: 9, you: true },
];

function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-background p-4 text-foreground">
      <header className="mb-4 flex items-center gap-3">
        <AppMenu />
        <h1 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Leaderboard — Karnataka, IN
        </h1>
      </header>
      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((r) => (
          <div
            key={r.rank}
            className={`flex items-center gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0 ${
              r.you ? "bg-w2-soft font-semibold" : ""
            }`}
          >
            <span className="w-8 tabular-nums text-muted-foreground">#{r.rank}</span>
            <span className="flex-1">{r.name}</span>
            <span className="text-[11px] text-muted-foreground">🔥 {r.streak}d</span>
            <span className="w-12 text-right tabular-nums">{r.percent}%</span>
          </div>
        ))}
      </div>
    </main>
  );
}