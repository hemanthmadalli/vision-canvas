import { createFileRoute } from "@tanstack/react-router";
import { Menu, Trophy } from "lucide-react";
import homePhoto from "@/assets/home-photo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Habit Home — Monthly Streaks, Graph & Regional Leaderboard" },
      {
        name: "description",
        content:
          "Track daily habits across the month, see your completion graph, earned stickers and how you rank against the top members in your region.",
      },
      { property: "og:title", content: "Habit Home — Monthly Habit Tracker" },
      {
        property: "og:description",
        content:
          "Daily habit grid, percentage-vs-date graph, earned stickers and your regional leaderboard rank.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MONTH = "August";
const YEAR = 2026;
const DAYS = 31;
const dates = Array.from({ length: DAYS }, (_, i) => i + 1);

const stickers = ["🔥", "⭐", "🌱", "💧", "🏅"];

const habits = [
  { name: "Wake up 6 AM", seed: 3 },
  { name: "Workout", seed: 5 },
  { name: "Read 20 pages", seed: 7 },
  { name: "Meditate", seed: 2 },
  { name: "No sugar", seed: 11 },
  { name: "Journal", seed: 4 },
];

// deterministic mock completion data
const grid = habits.map((h) => dates.map((d) => (d * h.seed) % 4 !== 0));
const habitPercent = grid.map(
  (row) => Math.round((row.filter(Boolean).length / DAYS) * 100),
);
const dayPercent = dates.map((_, i) =>
  Math.round((grid.filter((row) => row[i]).length / habits.length) * 100),
);

const leaderboard = [
  { rank: 1, name: "Aarav S.", score: 96 },
  { rank: 2, name: "Meera K.", score: 92 },
  { rank: 3, name: "Rohan D.", score: 88 },
  { rank: 14, name: "You", score: 74, isUser: true },
];

function Index() {
  return (
    <main className="min-h-screen bg-background px-4 py-4 text-foreground sm:px-6">
      {/* Top bar */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[220px_minmax(0,1fr)_260px]">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
            {MONTH} <span className="text-muted-foreground">{YEAR}</span>
          </h1>
        </div>

        <p className="order-3 col-span-2 text-center text-sm italic text-muted-foreground md:order-none md:col-span-1">
          “We are what we repeatedly do. Excellence, then, is a habit.”
        </p>

        <div className="flex shrink-0 items-center justify-end gap-1.5">
          {stickers.map((s, i) => (
            <span
              key={i}
              title="Earned sticker"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-base shadow-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </header>

      {/* Photo + graph + leaderboard */}
      <section className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)_260px]">
        <img
          src={homePhoto}
          alt="Sunrise over misty mountain ridges"
          width={640}
          height={512}
          className="h-[200px] w-full rounded-2xl border border-border object-cover"
        />

        {/* Bar graph: percentage vs date */}
        <div className="h-[200px] rounded-2xl border border-border bg-card p-3">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="text-sm font-medium">Completion %</h2>
            <span className="text-xs text-muted-foreground">by date</span>
          </div>
          <div className="flex h-[150px] items-end gap-[2px] overflow-x-auto">
            {dayPercent.map((p, i) => (
              <div
                key={i}
                title={`${MONTH} ${dates[i]}: ${p}%`}
                className="min-w-[6px] flex-1 rounded-t bg-primary/80"
                style={{ height: `${Math.max(p, 4)}%` }}
              />
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="h-[200px] overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Region leaderboard</h2>
          </div>
          <ul>
            {leaderboard.map((m) => (
              <li
                key={m.rank}
                className={`flex items-center justify-between px-3 py-[11px] text-sm ${
                  m.isUser ? "border-t border-border bg-accent font-medium" : ""
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-6 shrink-0 text-muted-foreground">#{m.rank}</span>
                  <span className="truncate">{m.name}</span>
                </span>
                <span className="shrink-0 tabular-nums">{m.score}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Habit table: rows = habits, columns = dates, right = habit % */}
      <section className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)_260px]">
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-3 py-2 text-sm font-medium">
            Daily habits
          </div>
          <ul>
            {habits.map((h) => (
              <li
                key={h.name}
                className="truncate border-b border-border px-3 py-2 text-sm last:border-b-0"
              >
                {h.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card p-3">
          <div className="mb-2 flex gap-[2px]">
            {dates.map((d) => (
              <span
                key={d}
                className="min-w-[6px] flex-1 text-center text-[9px] text-muted-foreground tabular-nums"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="space-y-[6px]">
            {grid.map((row, ri) => (
              <div key={ri} className="flex gap-[2px]">
                {row.map((done, ci) => (
                  <span
                    key={ci}
                    title={`${habits[ri]?.name} — ${MONTH} ${dates[ci]}`}
                    className={`h-[26px] min-w-[6px] flex-1 rounded ${
                      done ? "bg-primary/80" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-3 py-2 text-sm font-medium">
            Monthly %
          </div>
          <ul>
            {habitPercent.map((p, i) => (
              <li
                key={i}
                className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
              >
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right text-sm tabular-nums">{p}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
