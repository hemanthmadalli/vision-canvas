import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppMenu } from "@/components/AppMenu";
import {
  DAYS,
  MONTH_LABEL,
  categoryColor,
  dates,
  dayPercentFor,
  habitStats,
  habits,
  monthTrend,
  percent,
  weekdayPercentFor,
} from "@/lib/habit-analytics";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Habit Tracker" },
      {
        name: "description",
        content:
          "Full habit analytics: daily completion trend, month-over-month growth, per-habit consistency, streaks, weekday patterns and archived-habit history.",
      },
      { property: "og:title", content: "Analytics — Habit Tracker" },
      {
        property: "og:description",
        content:
          "See every graph of your habit data — trends, streaks, category splits and archived habit history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [includeArchived, setIncludeArchived] = useState(false);

  const list = useMemo(
    () => habits.filter((h) => includeArchived || h.status === "active"),
    [includeArchived],
  );
  const stats = useMemo(() => habitStats(list), [list]);
  const dayPercent = useMemo(() => dayPercentFor(list), [list]);
  const weekdays = useMemo(() => weekdayPercentFor(list), [list]);

  const overall = percent(
    stats.reduce((a, s) => a + s.done, 0),
    list.length * DAYS,
  );
  const bestStreak = Math.max(...stats.map((s) => s.best));
  const perfectDays = dayPercent.filter((p) => p === 100).length;
  const bestHabit = [...stats].sort((a, b) => b.rate - a.rate)[0];
  const weakest = [...stats].sort((a, b) => a.rate - b.rate)[0];

  const categories = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>();
    stats.forEach((s) => {
      const cur = map.get(s.habit.category) ?? { done: 0, total: 0 };
      map.set(s.habit.category, { done: cur.done + s.done, total: cur.total + DAYS });
    });
    return [...map.entries()].map(([name, v]) => ({
      name,
      value: percent(v.done, v.total),
    }));
  }, [stats]);

  const archived = habitStats(habits.filter((h) => h.status === "archived"));

  return (
    <main className="min-h-screen bg-background p-4 text-foreground">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <AppMenu />
        <h1 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Analytics — {MONTH_LABEL}
        </h1>
        <label className="ml-auto flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-[11px]">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-w1"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          Include archived habits
        </label>
      </header>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Overall completion" value={`${overall}%`} tint="w1" />
        <Kpi label="Longest streak" value={`${bestStreak} days`} tint="w2" />
        <Kpi label="Perfect days" value={`${perfectDays}`} tint="w3" />
        <Kpi label="Habits tracked" value={`${list.length}`} tint="w4" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {/* Daily trend */}
        <Panel title="Daily completion trend" className="lg:col-span-2">
          <div className="h-40">
            <AreaChart values={dayPercent} />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
            {[1, 8, 15, 22, DAYS].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </Panel>

        {/* Month over month */}
        <Panel title="Month over month">
          <div className="flex h-40 items-end gap-2">
            {monthTrend.map((m, i) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] tabular-nums text-muted-foreground">{m.value}%</span>
                <div
                  className={`w-full rounded-t bg-w${(i % 5) + 1}`}
                  style={{ height: `${m.value}%` }}
                />
                <span className="text-[9px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {/* Per-habit consistency */}
        <Panel title="Consistency by habit" className="lg:col-span-2">
          <ul className="flex flex-col gap-1.5">
            {[...stats]
              .sort((a, b) => b.rate - a.rate)
              .map((s) => {
                const tint = categoryColor[s.habit.category] ?? "w1";
                return (
                  <li key={s.habit.id} className="flex items-center gap-2 text-[11px]">
                    <span className="w-40 shrink-0 truncate">
                      {s.habit.name}
                      {s.habit.status === "archived" ? (
                        <span className="ml-1 text-muted-foreground">(archived)</span>
                      ) : null}
                    </span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={`block h-full rounded-full bg-${tint}`}
                        style={{ width: `${s.rate}%` }}
                      />
                    </span>
                    <span className="w-8 text-right tabular-nums">{s.rate}%</span>
                    <span className="w-12 text-right text-muted-foreground">🔥{s.best}d</span>
                  </li>
                );
              })}
          </ul>
        </Panel>

        {/* Category split */}
        <Panel title="By category">
          <div className="grid grid-cols-2 gap-3 py-2">
            {categories.map((c) => (
              <Donut
                key={c.name}
                value={c.value}
                label={c.name}
                color={`stroke-${categoryColor[c.name] ?? "w1"}`}
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {/* Weekday pattern */}
        <Panel title="Weekday pattern">
          <div className="flex h-32 items-end gap-1.5">
            {weekdays.map((w, i) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t bg-w${(i % 5) + 1}`}
                  style={{ height: `${w.value}%` }}
                />
                <span className="text-[9px] text-muted-foreground">{w.label.slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Heatmap */}
        <Panel title="Completion heatmap" className="lg:col-span-2">
          <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-1">
            {dates.map((d, i) => {
              const p = dayPercent[i]!;
              return (
                <div
                  key={d}
                  title={`Day ${d}: ${p}%`}
                  className="grid aspect-square place-items-center rounded text-[9px] tabular-nums"
                  style={{ backgroundColor: `color-mix(in oklab, var(--w1) ${p}%, var(--muted))` }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title="Highlights">
          <ul className="flex flex-col gap-2 text-[12px]">
            <li>
              Strongest habit — <strong>{bestHabit?.habit.name}</strong> at {bestHabit?.rate}%
            </li>
            <li>
              Needs attention — <strong>{weakest?.habit.name}</strong> at {weakest?.rate}%
            </li>
            <li>
              Best weekday —{" "}
              <strong>{[...weekdays].sort((a, b) => b.value - a.value)[0]?.label}</strong>
            </li>
            <li>
              Current active streaks —{" "}
              <strong>{stats.filter((s) => s.current > 0).length}</strong> habits running
            </li>
          </ul>
        </Panel>

        <Panel title="Archived habits (history kept)">
          {archived.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">No archived habits yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-[11px]">
              {archived.map((s) => (
                <li key={s.habit.id} className="flex items-center gap-2">
                  <span className="flex-1 truncate">{s.habit.name}</span>
                  <span className="text-muted-foreground">
                    archived {s.habit.archivedOn}
                  </span>
                  <span className="w-8 text-right tabular-nums">{s.rate}%</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Archiving removes a habit from the active matrix but preserves its consistency data in
            these reports. Deleting a habit erases its history permanently.
          </p>
        </Panel>
      </div>
    </main>
  );
}

function Kpi({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-${tint}-soft px-4 py-3`}>
      <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      <h2 className="bg-w1-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
        {title}
      </h2>
      <div className="p-3">{children}</div>
    </section>
  );
}

function AreaChart({ values }: { values: number[] }) {
  const pts = values.map((p, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - Math.min(p, 100) * 0.9;
    return `${x},${y}`;
  });
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      role="img"
      aria-label="Daily completion trend"
    >
      <polygon points={`0,100 ${pts.join(" ")} 100,100`} className="fill-w1-soft" />
      <polyline
        points={pts.join(" ")}
        fill="none"
        className="stroke-w1"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Donut({ value, color, label }: { value: number; color: string; label: string }) {
  const size = 64;
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={7} className="stroke-muted" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={`${(c * value) / 100} ${c}`}
            className={color}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold tabular-nums">
          {value}%
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
    </div>
  );
}