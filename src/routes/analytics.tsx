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
    <main className="min-h-screen bg-background text-foreground">
      {/* header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <AppMenu />
          <span className="font-[family-name:Playfair_Display] text-base">Habit Tracker</span>
          <span className="ml-auto hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:inline">
            {MONTH_LABEL}
          </span>
          <button
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-w2-soft text-[11px] font-semibold">
            HM
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
        {/* title */}
        <section>
          <h1 className="font-[family-name:Playfair_Display] text-3xl sm:text-4xl">Analytics</h1>
          <p className="mt-1 font-[family-name:Playfair_Display] text-sm italic text-muted-foreground">
            A little look at how your habits are growing.
          </p>
        </section>

        {/* summary */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-[family-name:Playfair_Display] text-xl">Habit Completion Trend</h2>
            <div className="ml-auto flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1 text-[11px] transition-colors ${
                    range === r ? "bg-w1-soft font-semibold" : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <div className="flex h-44 flex-col justify-between py-[2px] text-[9px] tabular-nums text-muted-foreground">
              {[100, 75, 50, 25, 0].map((t) => (
                <span key={t}>{t}%</span>
              ))}
            </div>
            <div className="relative h-44 flex-1">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="h-px w-full bg-border" />
                ))}
              </div>
              <div className="relative flex h-full items-end gap-[3px] sm:gap-1">
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
          <div className="mt-2 flex justify-between pl-8 text-[9px] tabular-nums text-muted-foreground">
            <span>day {DAYS - visibleDays + 1}</span>
            <span>day {DAYS}</span>
          </div>

          <p className="mt-4 rounded-xl bg-w3-soft px-3 py-2 text-[12px]">
            {delta >= 0 ? "🌱 " : "🍃 "}
            Your consistency has {delta >= 0 ? "improved" : "eased"} by {Math.abs(delta)}% compared with
            the previous period.
          </p>
        </Card>

        {/* per habit */}
        <section>
          <h2 className="mb-3 font-[family-name:Playfair_Display] text-xl">Habit performance</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sorted.slice(0, 8).map((s) => {
              const tint = categoryColor[s.habit.category] ?? "w1";
              return (
                <div
                  key={s.habit.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${SOFT[tint]}`}>
                      {HABIT_EMOJI[s.habit.id] ?? "✨"}
                    </span>
                    <p className="text-[12px] leading-snug">{s.habit.name}</p>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {s.rate >= 70 ? "↑" : s.rate >= 55 ? "→" : "↓"}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tabular-nums">{s.rate}%</p>
                  <span className="mt-2 block h-2 overflow-hidden rounded-full bg-muted">
                    <span
                      className={`block h-full rounded-full ${FILL[tint]}`}
                      style={{ width: `${s.rate}%` }}
                    />
                  </span>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    🔥 Current streak: {s.current || s.best} days
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* insights */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Insight tint="w3" title="🌿 Your strongest habits">
            {strongest.map((s) => (
              <li key={s.habit.id}>{s.habit.name}</li>
            ))}
          </Insight>
          <Insight tint="w4" title="🌱 Habits to nurture">
            {nurture.map((s) => (
              <li key={s.habit.id}>{s.habit.name}</li>
            ))}
          </Insight>
          <Insight tint="w2" title="✨ Your best day">
            <li>
              {bestDay?.label} — {bestDay?.value}% completion
            </li>
          </Insight>
          <Insight tint="w1" title="🌙 Your most consistent time">
            <li>Evening</li>
          </Insight>
        </section>

        {/* patterns */}
        <Card>
          <h2 className="font-[family-name:Playfair_Display] text-xl">Patterns</h2>
          <ul className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2">
            {[
              "Weekdays are stronger than weekends",
              "Your consistency is highest in the evening",
              "You complete study-related habits more consistently",
              "Your longest streak happened during Week 3",
            ].map((p) => (
              <li key={p} className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2">
                <span className="text-w3">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </Card>

        {/* reflection */}
        <section className="rounded-2xl border border-border bg-cream p-5 shadow-sm">
          <h2 className="font-[family-name:Playfair_Display] text-xl">Reflection</h2>
          <p className="mt-2 font-[family-name:Playfair_Display] text-lg italic leading-relaxed text-foreground/80">
            “What one small change could make next week easier?”
          </p>
          <textarea
            rows={3}
            placeholder="Write a gentle note to yourself…"
            className="mt-3 w-full resize-none rounded-xl border border-border bg-card/70 px-3 py-2 font-[family-name:Playfair_Display] text-[13px] italic outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-w1"
          />
        </section>

        {/* stickers */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-[family-name:Playfair_Display] text-xl">Stickers earned</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {stickers.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-2 rounded-full border border-border bg-w2-soft px-3 py-1.5 text-[11px]"
              >
                <span role="img" aria-label={s.label} className="text-base">
                  {s.emoji}
                </span>
                {s.label}
              </li>
            ))}
          </ul>
        </section>

        <p className="pb-4 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {MONTH_LABEL} · {monthTrend[monthTrend.length - 1]?.value}% this month
        </p>
      </div>
    </main>
  );
}

function avg(v: number[]) {
  return Math.round(v.reduce((a, b) => a + b, 0) / (v.length || 1));
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">{children}</section>
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
