import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useMemo, useState } from "react";

import { AppMenu } from "@/components/AppMenu";
import {
  DAYS,
  MONTH_LABEL,
  categoryColor,
  dayPercentFor,
  habitStats,
  habits,
  monthTrend,
  percent,
  weekdayPercentFor,
} from "@/lib/habit-analytics";

const FILL: Record<string, string> = {
  w1: "bg-w1",
  w2: "bg-w2",
  w3: "bg-w3",
  w4: "bg-w4",
  w5: "bg-w5",
};
const SOFT: Record<string, string> = {
  w1: "bg-w1-soft",
  w2: "bg-w2-soft",
  w3: "bg-w3-soft",
  w4: "bg-w4-soft",
  w5: "bg-w5-soft",
};

const RANGES = ["Week", "Month", "Semester", "Custom"] as const;
type RangeKey = (typeof RANGES)[number];

const HABIT_EMOJI: Record<string, string> = {
  notes: "📖",
  assign: "✏️",
  read: "📚",
  exercise: "🏃",
  water: "💧",
  plan: "🗂️",
  meditate: "🧘",
  language: "🗣️",
  journal: "📝",
  steps: "👟",
  "cold-shower": "🚿",
  flashcards: "🃏",
};

const stickers = [
  { emoji: "📚", label: "Study Star" },
  { emoji: "💧", label: "Hydration Hero" },
  { emoji: "🌸", label: "Mindful Moment" },
  { emoji: "🎯", label: "Goal Getter" },
  { emoji: "💗", label: "Self-Care Champ" },
];

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Habit Tracker for Students" },
      {
        name: "description",
        content:
          "A calm look at how your habits are growing: completion trends, per-habit consistency, gentle insights, weekday patterns and earned stickers.",
      },
      { property: "og:title", content: "Analytics — Habit Tracker for Students" },
      {
        property: "og:description",
        content:
          "Trends, streaks and supportive insights that help you understand your own habits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("Month");

  const list = useMemo(() => habits.filter((h) => h.status === "active"), []);
  const stats = useMemo(() => habitStats(list), [list]);
  const dayPercent = useMemo(() => dayPercentFor(list), [list]);
  const weekdays = useMemo(() => weekdayPercentFor(list), [list]);

  const visibleDays = range === "Week" ? 7 : range === "Custom" ? 14 : DAYS;
  const series = dayPercent.slice(DAYS - visibleDays);

  const overall = percent(
    stats.reduce((a, s) => a + s.done, 0),
    list.length * DAYS,
  );
  const bestStreak = Math.max(...stats.map((s) => s.best));
  const sorted = [...stats].sort((a, b) => b.rate - a.rate);
  const bestHabit = sorted[0];
  const strongest = sorted.slice(0, 2);
  const nurture = sorted.slice(-2).reverse();
  const weeklyAvg = Math.round(
    weekdays.reduce((a, w) => a + w.value, 0) / (weekdays.length || 1),
  );
  const bestDay = [...weekdays].sort((a, b) => b.value - a.value)[0];

  const half = Math.floor(series.length / 2) || 1;
  const firstAvg = avg(series.slice(0, half));
  const lastAvg = avg(series.slice(half));
  const delta = lastAvg - firstAvg;

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      {/* header */}
      <header className="border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <AppMenu />
          <span className="font-[family-name:Playfair_Display] text-sm">Habit Tracker</span>
          <span className="ml-auto hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:inline">
            {MONTH_LABEL}
          </span>
          <button
            aria-label="Notifications"
            className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-w2-soft text-[10px] font-semibold">
            HM
          </span>
        </div>
      </header>

      <div className="mx-auto h-[calc(100vh-49px)] max-w-6xl px-4 py-3">
        <div className="grid h-full grid-cols-1 gap-3 lg:grid-cols-12">
          {/* left column */}
          <div className="flex flex-col gap-3 lg:col-span-8">
            {/* title */}
            <section>
              <h1 className="font-[family-name:Playfair_Display] text-2xl">Analytics</h1>
              <p className="font-[family-name:Playfair_Display] text-xs italic text-muted-foreground">
                A little look at how your habits are growing.
              </p>
            </section>

            {/* summary */}
            <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <Summary tint="w1" icon="🌤️" label="Overall completion" value={`${overall}%`} note="Keep it up!" />
              <Summary tint="w2" icon="🔥" label="Best streak" value={`${bestStreak} days`} note="Consistency is key." />
              <Summary
                tint="w3"
                icon="🌟"
                label="Most consistent habit"
                value={bestHabit?.habit.name ?? "—"}
                note="You've got this!"
                small
              />
              <Summary tint="w4" icon="📈" label="Weekly average" value={`${weeklyAvg}%`} note="Keep building!" />
            </section>

            {/* trend */}
            <Card className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-[family-name:Playfair_Display] text-base">Habit Completion Trend</h2>
                <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`rounded-md px-2 py-0.5 text-[10px] transition-colors ${
                        range === r ? "bg-w1-soft font-semibold" : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <div className="flex h-28 flex-col justify-between py-[2px] text-[8px] tabular-nums text-muted-foreground">
                  {[100, 75, 50, 25, 0].map((t) => (
                    <span key={t}>{t}%</span>
                  ))}
                </div>
                <div className="relative h-28 flex-1">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="h-px w-full bg-border" />
                    ))}
                  </div>
                  <div className="relative flex h-full items-end gap-[2px] sm:gap-1">
                    {series.map((p, i) => (
                      <div
                        key={i}
                        title={`${p}%`}
                        className="flex-1 rounded-t-md bg-w1/70 transition-colors hover:bg-w1"
                        style={{ height: `${Math.max(p, 4)}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-1 flex justify-between pl-6 text-[8px] tabular-nums text-muted-foreground">
                <span>day {DAYS - visibleDays + 1}</span>
                <span>day {DAYS}</span>
              </div>

              <p className="mt-2 rounded-lg bg-w3-soft px-2 py-1 text-[11px]">
                {delta >= 0 ? "🌱 " : "🍃 "}
                Your consistency has {delta >= 0 ? "improved" : "eased"} by {Math.abs(delta)}% compared with
                the previous period.
              </p>
            </Card>

            {/* per habit */}
            <section>
              <h2 className="mb-1 font-[family-name:Playfair_Display] text-base">Habit performance</h2>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {sorted.slice(0, 8).map((s) => {
                  const tint = categoryColor[s.habit.category] ?? "w1";
                  return (
                    <div
                      key={s.habit.id}
                      className="rounded-xl border border-border bg-card p-2 shadow-sm"
                    >
                      <div className="flex items-start gap-2">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${SOFT[tint]} text-xs`}>
                          {HABIT_EMOJI[s.habit.id] ?? "✨"}
                        </span>
                        <p className="text-[11px] leading-tight">{s.habit.name}</p>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {s.rate >= 70 ? "↑" : s.rate >= 55 ? "→" : "↓"}
                        </span>
                      </div>
                      <p className="mt-1 text-lg font-semibold tabular-nums">{s.rate}%</p>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                        <span
                          className={`block h-full rounded-full ${FILL[tint]}`}
                          style={{ width: `${s.rate}%` }}
                        />
                      </span>
                      <p className="mt-1 text-[9px] text-muted-foreground">
                        🔥 Streak: {s.current || s.best} days
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* right column */}
          <div className="flex flex-col gap-3 lg:col-span-4">
            {/* insights */}
            <section className="grid grid-cols-2 gap-2">
              <Insight tint="w3" title="🌿 Strongest habits">
                {strongest.map((s) => (
                  <li key={s.habit.id}>{s.habit.name}</li>
                ))}
              </Insight>
              <Insight tint="w4" title="🌱 Nurture">
                {nurture.map((s) => (
                  <li key={s.habit.id}>{s.habit.name}</li>
                ))}
              </Insight>
              <Insight tint="w2" title="✨ Best day">
                <li>
                  {bestDay?.label} — {bestDay?.value}%
                </li>
              </Insight>
              <Insight tint="w1" title="🌙 Best time">
                <li>Evening</li>
              </Insight>
            </section>

            {/* patterns */}
            <Card className="flex-1">
              <h2 className="font-[family-name:Playfair_Display] text-base">Patterns</h2>
              <ul className="mt-2 grid gap-1 text-[11px]">
                {[
                  "Weekdays are stronger than weekends",
                  "Your consistency is highest in the evening",
                  "You complete study-related habits more consistently",
                  "Your longest streak happened during Week 3",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2 rounded-lg bg-muted/40 px-2 py-1">
                    <span className="text-w3">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Card>

            {/* reflection */}
            <section className="rounded-xl border border-border bg-cream p-3 shadow-sm">
              <h2 className="font-[family-name:Playfair_Display] text-base">Reflection</h2>
              <p className="mt-1 font-[family-name:Playfair_Display] text-sm italic leading-snug text-foreground/80">
                “What one small change could make next week easier?”
              </p>
              <textarea
                rows={2}
                placeholder="Write a gentle note to yourself…"
                className="mt-2 w-full resize-none rounded-xl border border-border bg-card/70 px-2 py-1 font-[family-name:Playfair_Display] text-[11px] italic outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-w1"
              />
            </section>

            {/* stickers */}
            <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <h2 className="font-[family-name:Playfair_Display] text-base">Stickers earned</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {stickers.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-w2-soft px-2 py-1 text-[10px]"
                  >
                    <span role="img" aria-label={s.label} className="text-sm">
                      {s.emoji}
                    </span>
                    {s.label}
                  </li>
                ))}
              </ul>
            </section>

            <p className="text-center text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              {MONTH_LABEL} · {monthTrend[monthTrend.length - 1]?.value}% this month
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


function avg(v: number[]) {
  return Math.round(v.reduce((a, b) => a + b, 0) / (v.length || 1));
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>{children}</section>
  );
}

function Summary({
  icon,
  label,
  value,
  note,
  tint,
  small = false,
}: {
  icon: string;
  label: string;
  value: string;
  note: string;
  tint: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-full ${SOFT[tint]}`}>{icon}</span>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      </div>
      <p className={`mt-3 font-semibold tabular-nums ${small ? "text-base" : "text-2xl"}`}>{value}</p>
      <p className="mt-1 font-[family-name:Playfair_Display] text-[11px] italic text-muted-foreground">
        {note}
      </p>
    </div>
  );
}

function Insight({
  title,
  tint,
  children,
}: {
  title: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-border ${SOFT[tint]} p-4 shadow-sm`}>
      <h3 className="text-[12px] font-semibold">{title}</h3>
      <ul className="mt-2 flex flex-col gap-1 text-[12px] text-foreground/80">{children}</ul>
    </div>
  );
}
