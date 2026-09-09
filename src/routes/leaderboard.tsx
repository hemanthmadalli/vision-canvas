import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Eye,
  Flame,
  Medal,
  ShieldCheck,
  Trophy,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppMenu } from "@/components/AppMenu";
import { useAuth } from "@/lib/auth-context";
import { getLeaderboardEntries, type LeaderboardEntry } from "@/lib/firestore-habits";

export const Route = createFileRoute("/leaderboard")({ component: LeaderboardPage });

type PersonItem = {
  rank: number;
  name: string;
  score: number;
  streak: number;
  trend: number;
  avatar: string;
  tint: string;
  you?: boolean;
};

const defaultPeople: PersonItem[] = [
  { rank: 1, name: "Ananya R.", score: 94, streak: 18, trend: 1, avatar: "👩🏻", tint: "#ffe9b5" },
  { rank: 2, name: "Dev Patel", score: 91, streak: 15, trend: 0, avatar: "👨🏽", tint: "#dbeafe" },
  { rank: 3, name: "Meera S.", score: 88, streak: 12, trend: 2, avatar: "👩🏽", tint: "#ffe0d3" },
  { rank: 4, name: "Rahul K.", score: 86, streak: 11, trend: -1, avatar: "👨🏻", tint: "#e2e8f0" },
  { rank: 5, name: "Arjun M.", score: 84, streak: 10, trend: 3, avatar: "👨🏾", tint: "#fef3c7" },
  {
    rank: 12,
    name: "You",
    score: 82,
    streak: 10,
    trend: 3,
    avatar: "👨🏽",
    tint: "#dbeafe",
    you: true,
  },
  { rank: 13, name: "Karan J.", score: 81, streak: 9, trend: -2, avatar: "👨🏽", tint: "#e0f2fe" },
];

function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("Month");
  const [visible, setVisible] = useState(true);
  const [people, setPeople] = useState<PersonItem[]>(defaultPeople);

  useEffect(() => {
    let active = true;
    async function loadFirestoreBoard() {
      try {
        const entries = await getLeaderboardEntries();
        if (!active) return;
        if (entries && entries.length > 0) {
          const mapped: PersonItem[] = entries.map((e, idx) => ({
            rank: idx + 1,
            name: e.userId === user?.uid ? `${e.displayName} (You)` : e.displayName,
            score: e.score,
            streak: e.streak || 7,
            trend: idx === 0 ? 1 : 0,
            avatar: "👤",
            tint: idx === 0 ? "#ffe9b5" : "#dbeafe",
            you: e.userId === user?.uid,
          }));

          // If current user is not yet in top entries, add their personal row
          if (user && !mapped.some((p) => p.you)) {
            mapped.push({
              rank: mapped.length + 1,
              name: `${user.displayName || user.email || "You"} (You)`,
              score: 85,
              streak: 8,
              trend: 1,
              avatar: "👨🏽",
              tint: "#dbeafe",
              you: true,
            });
          }
          setPeople(mapped);
        } else if (user) {
          // If no entries in Firestore yet, update the "You" row with user's actual profile name
          setPeople((prev) =>
            prev.map((p) =>
              p.you ? { ...p, name: `${user.displayName || user.email || "You"} (You)` } : p,
            ),
          );
        }
      } catch (err) {
        console.warn("Error fetching leaderboard:", err);
      }
    }
    void loadFirestoreBoard();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <main className="min-h-screen bg-[#fbfcff] p-3 text-slate-900 md:p-4">
      <div className="mx-auto max-w-[1500px] grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <header className="flex flex-wrap items-start gap-3 border-b border-slate-200 pb-5">
            <AppMenu />
            <div className="min-w-[260px] flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Leaderboard <Trophy className="inline h-7 w-7 text-blue-600" />
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                A little friendly motivation to keep you consistent.
              </p>
            </div>
            <button
              onClick={() => setVisible(!visible)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm"
            >
              <Eye className="h-5 w-5 text-slate-500" />
              <span>
                <strong className="block font-medium">Show me on leaderboard</strong>
                <small className="text-xs text-slate-500">Visible to others</small>
              </span>
              <span
                className={`h-7 w-12 rounded-full p-1 ${visible ? "bg-blue-500" : "bg-slate-200"}`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${visible ? "translate-x-5" : ""}`}
                />
              </span>
            </button>
          </header>
          <div className="flex flex-wrap items-center justify-between gap-3 py-5">
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              {["Week", "Month", "Semester", "All Time"].map((x) => (
                <button
                  key={x}
                  onClick={() => setPeriod(x)}
                  className={`rounded-md px-4 py-2 text-sm ${period === x ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-700"}`}
                >
                  {x}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm">
                ▣ &nbsp; June 2026 <ChevronDown className="h-4 w-4" />
              </button>
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-2 text-xs text-blue-900">
                <strong>♢ &nbsp; Leaderboard updates every night</strong>
                <br />
                <span className="ml-5 text-blue-700">
                  Scores are calculated fairly and securely.
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <Podium person={people[1]} medal="2" className="md:mt-4" />
            <Podium person={people[0]} medal="1" className="order-first md:order-none" winner />
            <Podium person={people[2]} medal="3" className="md:mt-8" />
          </div>
          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
            <div className="hidden grid-cols-[60px_minmax(160px,1.5fr)_1.6fr_1fr_.6fr] gap-3 border-b border-slate-200 px-4 py-3 text-xs text-slate-500 md:grid">
              <span>Rank</span>
              <span>User</span>
              <span>Score ⓘ</span>
              <span>Streak</span>
              <span>Trend</span>
            </div>
            {people.map((p, i) => (
              <div key={p.rank}>
                {i === 5 && (
                  <div className="py-1 text-center tracking-[.35em] text-slate-500">•••</div>
                )}
                <Row person={p} />
              </div>
            ))}
          </div>
          <button className="mx-auto mt-3 flex items-center gap-3 rounded-lg border border-slate-200 px-10 py-2.5 text-sm">
            Show more <ChevronDown className="h-4 w-4" />
          </button>
        </section>
        <aside className="space-y-5">
          <ScoreCard />
          <ProgressCard />
          <div className="flex gap-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-slate-600">
            <ShieldCheck className="h-9 w-9 shrink-0 text-emerald-600" />
            <p>
              <strong className="block text-sm text-slate-800">Scores are calculated fairly</strong>
              We prevent gaming and ensure everyone competes on consistency.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
function Podium({
  person,
  medal,
  winner,
  className = "",
}: {
  person: (typeof people)[number];
  medal: string;
  winner?: boolean;
  className?: string;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 text-center ${winner ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white" : medal === "2" ? "border-blue-200 bg-blue-50/40" : "border-orange-200 bg-orange-50/40"} ${className}`}
    >
      <div
        className={`mx-auto grid h-11 w-11 place-items-center rounded-full border-2 text-2xl font-semibold ${winner ? "border-amber-400 bg-amber-200 text-amber-700" : medal === "2" ? "border-slate-300 bg-slate-100 text-slate-600" : "border-orange-300 bg-orange-200 text-orange-700"}`}
      >
        {medal}
      </div>
      <div className="mt-3">
        <Avatar person={person} big />
        <h2 className="mt-3 text-lg font-semibold">{person.name}</h2>
        <strong
          className={`mt-2 inline-block rounded-lg px-5 py-1 text-xl ${winner ? "bg-amber-200" : medal === "2" ? "bg-blue-100 text-blue-700" : "bg-orange-200"}`}
        >
          {person.score}%
        </strong>
        <p className="mt-3 text-sm">
          <Flame className="inline h-4 w-4 fill-orange-500 text-orange-500" /> {person.streak} days
          streak
        </p>
      </div>
    </article>
  );
}
function Row({ person }: { person: (typeof people)[number] }) {
  return (
    <div
      className={`grid items-center gap-3 px-4 py-3 text-sm md:grid-cols-[60px_minmax(160px,1.5fr)_1.6fr_1fr_.6fr] ${person.you ? "border-y border-blue-200 bg-blue-50/70 font-medium" : "border-b border-slate-100"}`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full ${person.rank < 4 ? "bg-amber-200" : ""}`}
      >
        {person.rank}
      </span>
      <span className={person.you ? "text-blue-600" : ""}>{person.name}</span>
      <span className="flex items-center gap-3">
        <strong>{person.score}%</strong>
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <span
            className="block h-full rounded-full bg-blue-500"
            style={{ width: `${person.score}%` }}
          />
        </span>
      </span>
      <span>
        <Flame className="inline h-4 w-4 fill-orange-500 text-orange-500" /> {person.streak} days
      </span>
      <Trend value={person.trend} />
    </div>
  );
}
function Avatar({ person, big }: { person: (typeof people)[number]; big?: boolean }) {
  const positions: Record<number, string> = { 1: "0% 0%", 2: "100% 0%", 3: "66.66% 0%" };
  return (
    <span
      aria-label={`${person.name} avatar`}
      className={`mx-auto block shrink-0 rounded-full border-2 border-white bg-no-repeat shadow-sm ${big ? "h-20 w-20" : "h-9 w-9"}`}
      style={{
        backgroundImage: "url('/leaderboard-avatars.jpg')",
        backgroundSize: "400%",
        backgroundPosition: positions[person.rank] ?? "0% 0%",
      }}
    />
  );
}
function Trend({ value }: { value: number }) {
  return value === 0 ? (
    <span>—</span>
  ) : (
    <span className={value > 0 ? "text-emerald-600" : "text-red-500"}>
      {value > 0 ? (
        <TrendingUp className="inline h-4 w-4" />
      ) : (
        <TrendingDown className="inline h-4 w-4" />
      )}{" "}
      {Math.abs(value)}
    </span>
  );
}
function ScoreCard() {
  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold">How the score works</h2>
      <div className="mt-5 space-y-5">
        <Rule
          icon={<CheckCircle2 />}
          color="blue"
          title="Completion (70%)"
          text="Based on % of your scheduled targets completed."
        />
        <Rule
          icon={<Flame />}
          color="emerald"
          title="Streak (20%)"
          text="Longer current streak earns more points."
        />
        <Rule
          icon={<BarChart3 />}
          color="violet"
          title="Improvement (10%)"
          text="Your progress compared to your previous best."
        />
      </div>
      <button className="mt-6 text-sm text-blue-600">Learn more about scoring &nbsp; →</button>
    </section>
  );
}
function Rule({
  icon,
  color,
  title,
  text,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  text: string;
}) {
  const palette: Record<string, { backgroundColor: string; color: string }> = {
    blue: { backgroundColor: "#eff6ff", color: "#2563eb" },
    emerald: { backgroundColor: "#ecfdf5", color: "#059669" },
    violet: { backgroundColor: "#f5f3ff", color: "#7c3aed" },
  };
  return (
    <div className="flex gap-3">
      <span className="grid h-14 w-14 place-items-center rounded-xl" style={palette[color]}>
        {icon}
      </span>
      <p className="text-sm">
        <strong>{title}</strong>
        <span className="mt-1 block text-xs leading-5 text-slate-600">{text}</span>
      </p>
    </div>
  );
}
function ProgressCard() {
  const points =
    "0,70 30,38 55,45 88,16 120,42 155,68 185,78 215,58 248,31 280,61 310,72 345,55 378,66 410,35 440,26";
  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold">Your Progress</h2>
      <svg viewBox="0 0 440 95" className="mt-5 h-24 w-full">
        <polyline points={`0,90 ${points} 440,90`} fill="#dbeafe" stroke="none" />
        <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2" />
        {points.split(" ").map((p) => {
          const [cx, cy] = p.split(",");
          return <circle key={p} cx={cx} cy={cy} r="3" fill="#2563eb" />;
        })}
      </svg>
      <p className="border-t border-slate-200 pt-4 text-sm">
        You're <strong>6%</strong> away from the next position.
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <span className="block h-full w-[70%] rounded-full bg-blue-500" />
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <strong>82%</strong>
        <span className="text-slate-500">Next: 88%</span>
      </div>
      <p className="mt-4 text-xs text-slate-600">Keep going, you're doing great! 🚀</p>
    </section>
  );
}
