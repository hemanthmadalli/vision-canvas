import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Cloud, Database, LogIn, RefreshCw, Sparkles, User as UserIcon } from "lucide-react";
import { useMemo } from "react";
import { AppMenu } from "@/components/AppMenu";
import homePhoto from "@/assets/home-photo.jpg";
import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/habits-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "June Habit Tracker — Personal Monthly Planner" },
      {
        name: "description",
        content:
          "Pastel monthly habit planner with isolated per-user Firestore persistence, real-time matrix tracking, weekly progress gauges, and community leaderboard.",
      },
      { property: "og:title", content: "June Habit Tracker — Personal Monthly Planner" },
      {
        property: "og:description",
        content:
          "Track your personal daily habits with individual Firestore cloud synchronization, gauges, and habit checklist.",
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
  w1: {
    bar: "bg-w1",
    soft: "bg-w1-soft",
    text: "text-w1",
    border: "border-w1",
    stroke: "stroke-w1",
  },
  w2: {
    bar: "bg-w2",
    soft: "bg-w2-soft",
    text: "text-w2",
    border: "border-w2",
    stroke: "stroke-w2",
  },
  w3: {
    bar: "bg-w3",
    soft: "bg-w3-soft",
    text: "text-w3",
    border: "border-w3",
    stroke: "stroke-w3",
  },
  w4: {
    bar: "bg-w4",
    soft: "bg-w4-soft",
    text: "text-w4",
    border: "border-w4",
    stroke: "stroke-w4",
  },
  w5: {
    bar: "bg-w5",
    soft: "bg-w5-soft",
    text: "text-w5",
    border: "border-w5",
    stroke: "stroke-w5",
  },
};

const dates = Array.from({ length: DAYS }, (_, i) => i + 1);

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
            strokeDasharray={c}
            strokeDashoffset={c - (c * Math.min(Math.max(value, 0), 100)) / 100}
            strokeLinecap="round"
            className={`${color} transition-all duration-500`}
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

function AreaChart({ dayPercentages }: { dayPercentages: number[] }) {
  const pts = dayPercentages.map((p, i) => {
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
  const { user, signInWithGoogle } = useAuth();
  const {
    habits: habitsList,
    grid,
    syncing,
    cloudSynced,
    communityLeaderboard: communityBoard,
    dayPercentages: dayPercent,
    habitCounts: habitCount,
    habitPercentages: habitPercent,
    weekPercentages: weekPercent,
    totalDone,
    overall,
    toggleCell,
    earnedStickers,
  } = useHabits();

  // Build Leaderboard Display
  const leaderboard = useMemo(() => {
    const yourScore = Math.round(overall);
    const youName = user?.displayName ? `${user.displayName} (You)` : "You";

    if (communityBoard.length > 0) {
      const rows = communityBoard.map((entry, idx) => ({
        rank: idx + 1,
        name: entry.userId === user?.uid ? `${entry.displayName} (You)` : entry.displayName,
        percent: entry.score,
        you: entry.userId === user?.uid,
      }));
      // If user not yet in top entries, append them
      if (!rows.some((r) => r.you)) {
        rows.push({
          rank: rows.length + 1,
          name: youName,
          percent: yourScore,
          you: true,
        });
      }
      return rows.slice(0, 5);
    }

    return [
      { rank: 1, name: "Ananya R.", percent: 94, you: false },
      { rank: 2, name: "Dev Patel", percent: 91, you: false },
      { rank: 3, name: "Meera S.", percent: 88, you: false },
      {
        rank: 4,
        name: youName,
        percent: yourScore,
        you: true,
      },
    ];
  }, [communityBoard, overall, user]);

  return (
    <main className="min-h-screen bg-background p-3 text-foreground">
      <div className="grid items-start gap-3 lg:grid-cols-[190px_minmax(0,1fr)_260px]">
        {/* ---------------- TOP LEFT ---------------- */}
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-start gap-2">
            <AppMenu />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                  {MONTH} {YEAR} — Habit Tracker
                </h1>
              </div>

              {/* Firestore Connection Indicator */}
              <div className="mt-1 flex items-center gap-1.5 text-[9px]">
                <Cloud className="h-2.5 w-2.5 text-amber-600" />
                <span className="font-medium text-amber-700">
                  {user ? "Firestore (Isolated)" : "Guest Session (Local)"}
                </span>
                {syncing ? (
                  <RefreshCw className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
                ) : cloudSynced ? (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    title="Synced to Firestore"
                  />
                ) : null}
              </div>

              {/* User / Guest Status */}
              {!user ? (
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-medium text-amber-900 transition-colors hover:bg-amber-200"
                  >
                    <LogIn className="h-2.5 w-2.5" /> Sign in with Google to sync
                  </button>
                </div>
              ) : (
                <div className="mt-0.5 text-[8px] text-muted-foreground truncate max-w-[150px]">
                  👤 {user.displayName || user.email}
                </div>
              )}
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
            <AreaChart dayPercentages={dayPercent} />
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
                <div
                  key={w.label}
                  className="flex h-full items-end gap-[3px]"
                  style={{ flex: w.days.length }}
                >
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
                    <span
                      key={d}
                      className="flex-1 text-center text-[7px] tabular-nums text-foreground/60"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* donuts row */}
          <div className="rounded-md border border-border bg-panel p-2">
            <div className="flex items-center justify-around gap-1">
              {weeks.map((w, i) => (
                <Donut
                  key={w.label}
                  label={w.label}
                  value={Math.round(weekPercent[i]!)}
                  color={weekTint[w.color]!.stroke}
                />
              ))}
              <Donut label="Overall" value={Math.round(overall)} color="stroke-foreground" />
            </div>
          </div>
        </div>

        {/* ---------------- TOP RIGHT ---------------- */}
        <div className="flex flex-col gap-3">
          {/* earned stickers */}
          <div className="rounded-md border border-border bg-panel">
            <PanelTitle tint="bg-w2-soft">Stickers earned</PanelTitle>
            <ul className="flex flex-wrap items-center justify-center gap-2 px-2 py-3">
              {earnedStickers.map((s) => (
                <li
                  key={s.id}
                  title={`${s.label}: ${s.description} (${s.unlocked ? "Unlocked" : "Locked"})`}
                  className={`grid h-9 w-9 place-items-center rounded-full border transition-all ${
                    s.unlocked
                      ? "border-amber-300 bg-amber-50 text-base shadow-xs"
                      : "border-border bg-muted/30 text-base opacity-40 grayscale"
                  }`}
                >
                  <span role="img" aria-label={s.label}>
                    {s.emoji}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[9px] text-muted-foreground">
              <span className="font-[family-name:Playfair_Display] italic">
                {earnedStickers.filter((s) => s.unlocked).length} of {earnedStickers.length}{" "}
                unlocked
              </span>
              <Link
                to="/stickers"
                className="font-medium text-amber-800 underline underline-offset-2 hover:text-amber-950"
              >
                Store →
              </Link>
            </div>
          </div>

          {/* leaderboard */}
          <div className="rounded-md border border-border bg-panel">
            <PanelTitle>Community Leaderboard</PanelTitle>
            <div className="flex items-center justify-between border-b border-border px-2 py-1 text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
              <span>Member</span>
              <span>Score</span>
            </div>
            <ol className="divide-y divide-border">
              {leaderboard.map((p) => (
                <li
                  key={`${p.rank}-${p.name}`}
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
          <div className="flex items-center justify-between border-b border-border bg-w1-soft px-3 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
              Daily habits
            </span>
            <Link
              to="/habits"
              className="text-[9px] font-medium text-amber-800 underline underline-offset-2 hover:text-amber-950"
            >
              Manage
            </Link>
          </div>
          <div className="h-[22px]" aria-hidden="true" />
          <ul className="flex flex-col gap-[4px] px-2 pb-2">
            {habitsList.map((h) => (
              <li
                key={h.id || h.name}
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
                  {habitsList.map((h, ri) => (
                    <div key={h.id || h.name} className="flex h-[20px] items-center gap-[3px]">
                      {w.days.map((d) => {
                        const done = grid[ri]?.[d - 1] ?? false;
                        return (
                          <button
                            type="button"
                            key={d}
                            onClick={() => void toggleCell(ri, d)}
                            title={`${h.name} — ${MONTH} ${d} (Click to toggle)`}
                            className={`grid h-[14px] flex-1 place-items-center rounded-[3px] border transition-transform hover:scale-110 ${
                              weekTint[w.color]!.border
                            } ${done ? weekTint[w.color]!.bar : "bg-panel hover:bg-muted/40"}`}
                          >
                            {done ? (
                              <Check className="h-[9px] w-[9px] text-panel" strokeWidth={4} />
                            ) : null}
                          </button>
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
            {habitsList.map((h, i) => (
              <li
                key={h.id || h.name}
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
