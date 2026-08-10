import { createFileRoute } from "@tanstack/react-router";
import { Menu, Check } from "lucide-react";
import homePhoto from "@/assets/home-photo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "June Habit Tracker — Monthly Planner Dashboard" },
      {
        name: "description",
        content:
          "Pastel monthly habit planner: weekly bar chart, week completion gauges, checkbox habit matrix, top habits ranking and daily progress goals.",
      },
      { property: "og:title", content: "June Habit Tracker — Monthly Planner" },
      {
        property: "og:description",
        content:
          "Track 14 daily habits across the month with weekly gauges, a checkbox matrix and progress rankings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MONTH = "June";
const YEAR = 2026;
const DAYS = 30;
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const weeks = [
  { label: "week 1", days: [1, 2, 3, 4, 5, 6, 7], color: "w1" },
  { label: "week 2", days: [8, 9, 10, 11, 12, 13, 14], color: "w2" },
  { label: "week 3", days: [15, 16, 17, 18, 19, 20, 21], color: "w3" },
  { label: "week 4", days: [22, 23, 24, 25, 26, 27, 28], color: "w4" },
  { label: "week 5", days: [29, 30], color: "w5" },
];

const weekTint: Record<
  string,
  { bar: string; soft: string; text: string; border: string; stroke: string }
> = {
  w1: { bar: "bg-w1", soft: "bg-w1-soft", text: "text-w1", border: "border-w1", stroke: "stroke-w1" },
  w2: { bar: "bg-w2", soft: "bg-w2-soft", text: "text-w2", border: "border-w2", stroke: "stroke-w2" },
  w3: { bar: "bg-w3", soft: "bg-w3-soft", text: "text-w3", border: "border-w3", stroke: "stroke-w3" },
  w4: { bar: "bg-w4", soft: "bg-w4-soft", text: "text-w4", border: "border-w4", stroke: "stroke-w4" },
  w5: { bar: "bg-w5", soft: "bg-w5-soft", text: "text-w5", border: "border-w5", stroke: "stroke-w5" },
};

const habits = [
  { name: "Review class notes", seed: 3, goal: 30 },
  { name: "Solve assignments", seed: 5, goal: 30 },
  { name: "Organize study desk", seed: 7, goal: 25 },
  { name: "Read 10 pages of a book", seed: 2, goal: 30 },
  { name: "Exercise for 30 minutes", seed: 11, goal: 25 },
  { name: "Drink 8 glasses of water", seed: 4, goal: 30 },
  { name: "Plan next day's schedule", seed: 6, goal: 30 },
  { name: "Meditate for 10 minutes", seed: 9, goal: 20 },
  { name: "Check emails and updates", seed: 13, goal: 30 },
  { name: "Practice language skills", seed: 8, goal: 25 },
  { name: "Review flashcards", seed: 10, goal: 20 },
  { name: "Write in a journal", seed: 12, goal: 30 },
  { name: "Solve 5 practice problems", seed: 14, goal: 25 },
  { name: "Connect with a classmate", seed: 15, goal: 20 },
];

const dates = Array.from({ length: DAYS }, (_, i) => i + 1);
const rand = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const grid = habits.map((h, hi) =>
  dates.map((d) => rand(h.seed + hi, d) < 0.55 + ((hi % 5) * 0.06)),
);

const dayPercent = dates.map((_, i) =>
  Math.round((grid.filter((row) => row[i]).length / habits.length) * 100),
);

const habitCount = grid.map((row) => row.filter(Boolean).length);
const habitPercent = habitCount.map((c) => Math.round((c / DAYS) * 100));

const weekPercent = weeks.map((w) => {
  const idx = w.days.map((d) => d - 1);
  let done = 0;
  let total = 0;
  for (const row of grid) {
    for (const i of idx) {
      total += 1;
      if (row[i]) done += 1;
    }
  }
  return Math.round((done / total) * 1000) / 10;
});

const totalDone = habitCount.reduce((a, b) => a + b, 0);
const totalCells = habits.length * DAYS;
const overall = Math.round((totalDone / totalCells) * 10000) / 100;

const stickers = [
  { emoji: "🌸", label: "7-day streak" },
  { emoji: "🏅", label: "Perfect week" },
  { emoji: "📚", label: "Reader" },
  { emoji: "💧", label: "Hydrated" },
  { emoji: "🧘", label: "Calm mind" },
  { emoji: "🔥", label: "30-day streak" },
];

const leaderboard = [
  { rank: 1, name: "Ananya R.", percent: 94, you: false },
  { rank: 2, name: "Dev Patel", percent: 91, you: false },
  { rank: 3, name: "Meera S.", percent: 88, you: false },
  { rank: 12, name: "You", percent: Math.round(overall), you: true },
];

function Donut({
  value,
  color,
  size = 56,
  label,
}: {
  value: number;
  color: string;
  size?: number;
  label?: string;
}) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={6}
            className="stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${(c * value) / 100} ${c}`}
            className={color}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold tabular-nums">
          {value}%
        </span>
      </div>
      {label ? (
        <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function AreaChart() {
  const pts = dayPercent.map((p, i) => {
    const x = (i / (DAYS - 1)) * 100;
    const y = 100 - Math.min(p, 100) * 0.85;
    return `${x},${y}`;
  });
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      role="img"
      aria-label="Monthly completion trend"
    >
      <polygon points={`0,100 ${pts.join(" ")} 100,100`} className="fill-w1-soft" />
      <polyline
        points={pts.join(" ")}
        fill="none"
        className="stroke-w1"
        strokeWidth={0.8}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function PanelTitle({ children, tint = "bg-w1-soft" }: { children: string; tint?: string }) {
  return (
    <div
      className={`${tint} rounded-t-md px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70`}
    >
      {children}
    </div>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-background p-3 text-foreground">
      <div className="grid items-start gap-3 lg:grid-cols-[190px_minmax(0,1fr)_260px]">
        {/* ---------------- TOP LEFT ---------------- */}
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-start gap-2">
            <button
              aria-label="Open menu"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                {MONTH} {YEAR} — Habit Tracker
              </h1>
            </div>
          </div>

          <figure className="flex flex-1 flex-col overflow-hidden rounded-md border border-border bg-cream">
            <img
              src={homePhoto}
              alt="Woman journaling her habits at a sunlit desk"
              width={736}
              height={912}
              className="h-[150px] w-full object-cover lg:h-auto lg:min-h-0 lg:flex-1"
            />
            <figcaption className="px-2 py-1.5 font-[family-name:Playfair_Display] text-[10px] italic leading-snug text-foreground/70">
              I am calm, intentional, and ready for the month ahead.
            </figcaption>
          </figure>
        </div>

        {/* ---------------- TOP CENTER ---------------- */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="h-[92px] overflow-hidden rounded-md border border-border bg-panel">
            <AreaChart />
          </div>

          <div className="rounded-md border border-border bg-panel p-2">
            {/* week labels */}
            <div className="flex gap-3">
              {weeks.map((w) => (
                <div
                  key={w.label}
                  className="text-center text-[9px] uppercase tracking-[0.2em] text-muted-foreground"
                  style={{ flex: w.days.length }}
                >
                  {w.label}
                </div>
              ))}
            </div>
            {/* bars */}
            <div className="mt-1 flex h-[86px] items-end gap-3">
              {weeks.map((w) => (
                <div key={w.label} className="flex h-full items-end gap-[3px]" style={{ flex: w.days.length }}>
                  {w.days.map((d) => (
                    <div
                      key={d}
                      title={`${MONTH} ${d}: ${dayPercent[d - 1]}%`}
                      className={`flex-1 rounded-t-sm ${weekTint[w.color]!.bar}`}
                      style={{ height: `${Math.max(dayPercent[d - 1]!, 5)}%` }}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* percentages + dates */}
            <div className="mt-1 flex gap-3">
              {weeks.map((w) => (
                <div key={w.label} className="flex gap-[3px]" style={{ flex: w.days.length }}>
                  {w.days.map((d) => (
                    <span
                      key={d}
                      className="flex-1 text-center text-[7px] tabular-nums text-muted-foreground"
                    >
                      {dayPercent[d - 1]}%
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {weeks.map((w) => (
                <div key={w.label} className="flex gap-[3px]" style={{ flex: w.days.length }}>
                  {w.days.map((d) => (
                    <span key={d} className="flex-1 text-center text-[7px] tabular-nums text-foreground/60">
                      {d}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* week gauges */}
          <div className="flex items-center rounded-md border border-border bg-panel px-2 py-2">
            <div className="flex w-full gap-3">
              {weeks.map((w, i) => (
                <div
                  key={w.label}
                  className="flex min-w-0 items-center justify-center"
                  style={{ flex: w.days.length }}
                >
                  <Donut
                    value={weekPercent[i]!}
                    color={weekTint[w.color]!.stroke}
                    size={58}
                    label={w.label}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- TOP RIGHT ---------------- */}
        <div className="flex flex-col gap-3">
          {/* earned stickers */}
          <div className="rounded-md border border-border bg-panel">
            <PanelTitle tint="bg-w2-soft">Stickers earned</PanelTitle>
            <ul className="flex flex-wrap items-center justify-center gap-2 px-2 py-3">
              {stickers.map((s) => (
                <li
                  key={s.label}
                  title={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-w2-soft text-base"
                >
                  <span role="img" aria-label={s.label}>
                    {s.emoji}
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-border px-2 py-1 text-center font-[family-name:Playfair_Display] text-[9px] italic text-muted-foreground">
              {stickers.length} stickers collected this month
            </p>
          </div>

          {/* leaderboard */}
          <div className="rounded-md border border-border bg-panel">
            <PanelTitle>Leaderboard</PanelTitle>
            <div className="flex items-center justify-between border-b border-border px-2 py-1 text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
              <span>Region — top 3</span>
              <span>Score</span>
            </div>
            <ol className="divide-y divide-border">
              {leaderboard.map((p) => (
                <li
                  key={p.name}
                  className={`flex items-center gap-2 px-2 py-1.5 text-[10px] ${
                    p.you ? "bg-w2-soft font-semibold" : ""
                  }`}
                >
                  <span className="w-4 shrink-0 tabular-nums text-muted-foreground">{p.rank}</span>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="shrink-0 tabular-nums">{p.percent}%</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ---------------- BOTTOM LEFT: daily habits ---------------- */}
        <div className="rounded-md border border-border bg-panel">
          <PanelTitle>Daily habits</PanelTitle>
          <div className="h-[22px]" aria-hidden="true" />
          <ul className="flex flex-col gap-[4px] px-2 pb-2">
            {habits.map((h) => (
              <li
                key={h.name}
                className="flex h-[20px] items-center truncate text-[10px] text-foreground/80"
              >
                {h.name}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------------- BOTTOM CENTER: habit matrix ---------------- */}
        <div className="overflow-x-auto rounded-md border border-border bg-panel p-2">
          <div className="flex min-w-[520px] gap-3">
            {weeks.map((w) => (
              <div key={w.label} style={{ flex: w.days.length }}>
                <div
                  className={`${weekTint[w.color]!.soft} rounded-sm text-center text-[8px] uppercase tracking-[0.2em] text-foreground/60`}
                >
                  {w.label}
                </div>
                <div className="mt-1 flex gap-[3px]">
                  {w.days.map((d, di) => (
                    <span
                      key={d}
                      className={`flex-1 text-center text-[7px] font-semibold ${weekTint[w.color]!.text}`}
                    >
                      {WEEKDAYS[(d - 1) % 7] ?? WEEKDAYS[di]}
                    </span>
                  ))}
                </div>
                <div className="flex gap-[3px]">
                  {w.days.map((d) => (
                    <span
                      key={d}
                      className="flex-1 text-center text-[7px] tabular-nums text-muted-foreground"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="mt-1 flex flex-col gap-[4px]">
                  {habits.map((h, ri) => (
                    <div key={h.name} className="flex h-[20px] items-center gap-[3px]">
                      {w.days.map((d) => {
                        const done = grid[ri]![d - 1];
                        return (
                          <span
                            key={d}
                            title={`${h.name} — ${MONTH} ${d}`}
                            className={`grid h-[14px] flex-1 place-items-center rounded-[3px] border ${
                              weekTint[w.color]!.border
                            } ${done ? weekTint[w.color]!.bar : "bg-panel"}`}
                          >
                            {done ? (
                              <Check className="h-[9px] w-[9px] text-panel" strokeWidth={4} />
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- BOTTOM RIGHT: daily progress ---------------- */}
        <div className="rounded-md border border-border bg-panel">
          <PanelTitle tint="bg-w1-soft">Daily progress</PanelTitle>
          <div className="grid h-[22px] grid-cols-[26px_minmax(0,1fr)_34px] items-center gap-1 border-b border-border px-2 text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
            <span>Goal</span>
            <span>Percentage</span>
            <span className="text-right">Count</span>
          </div>
          <ul className="flex flex-col gap-[4px] px-1 pb-1">
            {habits.map((h, i) => (
              <li
                key={h.name}
                className="grid h-[20px] grid-cols-[26px_minmax(0,1fr)_34px] items-center gap-1 px-1 text-[9px]"
              >
                <span className="tabular-nums text-muted-foreground">{h.goal}</span>
                <span className="flex items-center gap-1">
                  <span className="w-6 shrink-0 tabular-nums">{habitPercent[i]}%</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-sm bg-muted">
                    <span
                      className="block h-full rounded-sm bg-w1"
                      style={{ width: `${habitPercent[i]}%` }}
                    />
                  </span>
                </span>
                <span className="text-right tabular-nums text-muted-foreground">
                  {habitCount[i]}/{h.goal}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
