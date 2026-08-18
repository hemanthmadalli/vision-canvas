import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useMemo, useState } from "react";

import { AppMenu } from "@/components/AppMenu";
import {
  DAYS,
  WEEKDAYS,
  categoryColor,
  habitStats,
  habits,
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
const STROKE: Record<string, string> = {
  w1: "var(--w1)",
  w2: "var(--w2)",
  w3: "var(--w3)",
  w4: "var(--w4)",
  w5: "var(--w5)",
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
};

const stickers = [
  { emoji: "📖", label: "Study Star" },
  { emoji: "💧", label: "Hydration Hero" },
  { emoji: "🧘", label: "Mindful Moment" },
  { emoji: "🎯", label: "Goal Getter" },
  { emoji: "💗", label: "Self-Care Champ" },
];

const WEEK_TINTS = ["w1", "w2", "w3", "w4", "w1", "w2", "w3", "w4"];

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Habit Tracker for Students" },
      {
        name: "description",
        content:
          "A calm look at how your habits are growing: completion trend, weekly gauges, per-habit performance, gentle patterns and earned stickers.",
      },
      { property: "og:title", content: "Analytics — Habit Tracker for Students" },
      {
        property: "og:description",
        content: "Trends, streaks and supportive insights that help you understand your own habits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("Week");

  const list = useMemo(() => habits.filter((h) => h.status === "active"), []);
  const stats = useMemo(() => habitStats(list), [list]);
  const weekdays = useMemo(() => weekdayPercentFor(list), [list]);

  const overall = percent(
    stats.reduce((a, s) => a + s.done, 0),
    list.length * DAYS,
  );
  const bestStreak = Math.max(...stats.map((s) => s.best));
  const sorted = [...stats].sort((a, b) => b.rate - a.rate);
  const strongest = sorted.slice(0, 2);
  const nurture = sorted.slice(-2).reverse();
  const weeklyAvg = Math.round(
    weekdays.reduce((a, w) => a + w.value, 0) / (weekdays.length || 1),
  );
  const weekGauges = useMemo(
    () =>
      WEEK_TINTS.map((tint, i) => ({
        tint,
        label: `Week ${i + 1}`,
        value: 60 + ((i * 13 + 7) % 12),
      })),
    [],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <AppMenu />
          <span className="font-[family-name:Playfair_Display] text-base">Analytics</span>

          <div className="mx-auto hidden gap-2 sm:flex">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full border px-4 py-1.5 text-[12px] transition-colors ${
                  range === r
                    ? "border-transparent bg-w1-soft font-semibold text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            aria-label="Notifications"
            className="ml-auto grid h-9 w-9 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent sm:ml-0"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-w2-soft text-[11px] font-semibold">
            HM
          </span>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:hidden">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-[12px] ${
                range === r
                  ? "border-transparent bg-w1-soft font-semibold"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-5">
        {/* summary row */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Donut value={overall} tint="w1" size={54} />
            <p className="text-[13px]">
              Completion rate: <span className="text-xl font-semibold tabular-nums">{overall}%</span>
            </p>
          </div>
          <Summary tint="w4" icon="📚" label="Active habits" value={`${list.length}`} note="Keep it up!" />
          <Summary tint="w2" icon="🔥" label="Best streak" value={`${bestStreak} days`} note="Consistency is key!" />
          <Summary tint="w3" icon="📈" label="Weekly avg" value={`${weeklyAvg}%`} note="Keep building!" />
        </section>

        {/* trend */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-[15px] font-semibold">
            {range === "Week" ? "Weekly" : range} Completion Trend
          </h2>
          <p className="text-[11px] text-muted-foreground">Average: {weeklyAvg}%</p>

          <div className="mt-5 flex h-44 items-end gap-2 sm:gap-4">
            {weekdays.map((d, i) => {
              const tint = WEEK_TINTS[i % 4]!;
              return (
                <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    title={`${d.value}%`}
                    className={`w-full rounded-lg ${FILL[tint]} opacity-80`}
                    style={{ height: `${Math.max(d.value, 6)}%` }}
                  />
                  <span className="mt-2 text-[11px] text-muted-foreground">
                    {WEEKDAYS[i] ?? d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4">
            {weekGauges.map((w) => (
              <div key={w.label} className="flex items-center gap-2">
                <Donut value={w.value} tint={w.tint} size={38} showLabel />
                <div className="leading-tight">
                  <p className="text-[11px]">{w.label}</p>
                  <p className="text-[10px] tabular-nums text-muted-foreground">{w.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* habit performance */}
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">Habit Performance</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {sorted.slice(0, 4).map((s) => {
              const tint = categoryColor[s.habit.category] ?? "w1";
              return (
                <div key={s.habit.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${SOFT[tint]}`}>
                      {HABIT_EMOJI[s.habit.id] ?? "✨"}
                    </span>
                    <p className="text-[12px] leading-snug">{s.habit.name}</p>
                  </div>
                  <p className="mt-3 text-xl font-semibold tabular-nums">{s.rate}%</p>
                  <span className="mt-2 block h-2 overflow-hidden rounded-full bg-muted">
                    <span className={`block h-full rounded-full ${FILL[tint]}`} style={{ width: `${s.rate}%` }} />
                  </span>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    🔥 Current streak: {s.current || s.best} days
                  </p>
                </div>
              );
            })}

            <Insight title="👑 Strongest habits" note="You're doing amazing!">
              {strongest.map((s) => (
                <li key={s.habit.id} className="flex items-center gap-2">
                  <span>{HABIT_EMOJI[s.habit.id] ?? "✨"}</span>
                  {s.habit.name}
                </li>
              ))}
            </Insight>
            <Insight title="🌱 Habits to nurture" note="Small steps, big progress!">
              {nurture.map((s) => (
                <li key={s.habit.id} className="flex items-center gap-2">
                  <span>{HABIT_EMOJI[s.habit.id] ?? "✨"}</span>
                  {s.habit.name}
                </li>
              ))}
            </Insight>
          </div>
        </section>

        {/* bottom row */}
        <section className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold">🌿 Patterns</h3>
            <ul className="mt-3 space-y-2 text-[12px]">
              {["Weekdays look stronger than weekends", "Evenings are your most consistent time"].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="text-w3">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold">📓 Reflection</h3>
            <p className="mt-3 font-[family-name:Playfair_Display] text-[14px] italic leading-relaxed text-foreground/80">
              “What one small change could make next month easier?”
            </p>
            <textarea
              rows={2}
              placeholder="Write a gentle note to yourself…"
              className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 font-[family-name:Playfair_Display] text-[13px] italic outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-w1"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold">Stickers earned</h3>
            <ul className="mt-3 flex flex-wrap gap-3">
              {stickers.map((s, i) => (
                <li key={s.label} className="flex w-16 flex-col items-center gap-1 text-center">
                  <span
                    role="img"
                    aria-label={s.label}
                    className={`grid h-11 w-11 place-items-center rounded-full ${SOFT[WEEK_TINTS[i % 4]!]} text-lg`}
                  >
                    {s.emoji}
                  </span>
                  <span className="font-[family-name:Playfair_Display] text-[10px] italic leading-tight text-muted-foreground">
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

function Donut({
  value,
  tint,
  size,
  showLabel = false,
}: {
  value: number;
  tint: string;
  size: number;
  showLabel?: boolean;
}) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={STROKE[tint]}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-[9px] font-semibold tabular-nums">{value}%</span>
      )}
    </span>
  );
}

function Summary({
  icon,
  label,
  value,
  note,
  tint,
}: {
  icon: string;
  label: string;
  value: string;
  note: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${SOFT[tint]}`}>{icon}</span>
      <div>
        <p className="text-[13px]">
          {label}: <span className="text-xl font-semibold tabular-nums">{value}</span>
        </p>
        <p className="font-[family-name:Playfair_Display] text-[11px] italic text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

function Insight({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-[13px] font-semibold">{title}</h3>
      <ul className="mt-2 flex flex-col gap-1.5 text-[12px] text-foreground/80">{children}</ul>
      <p className="mt-2 font-[family-name:Playfair_Display] text-[11px] italic text-muted-foreground">{note}</p>
    </div>
  );
}
