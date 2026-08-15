export type HabitKind = "binary" | "numeric" | "duration";
export type HabitStatus = "active" | "archived";

export type Habit = {
  id: string;
  name: string;
  category: string;
  kind: HabitKind;
  status: HabitStatus;
  seed: number;
  archivedOn?: string;
};

export const DAYS = 30;
export const MONTH_LABEL = "June 2026";

export const habits: Habit[] = [
  { id: "notes", name: "Review class notes", category: "Study", kind: "duration", status: "active", seed: 3 },
  { id: "assign", name: "Solve assignments", category: "Study", kind: "binary", status: "active", seed: 5 },
  { id: "read", name: "Read 10 pages", category: "Mind", kind: "numeric", status: "active", seed: 2 },
  { id: "exercise", name: "Exercise 30 min", category: "Body", kind: "duration", status: "active", seed: 11 },
  { id: "water", name: "Drink 8 glasses of water", category: "Body", kind: "numeric", status: "active", seed: 4 },
  { id: "plan", name: "Plan next day", category: "Routine", kind: "binary", status: "active", seed: 6 },
  { id: "meditate", name: "Meditate 10 min", category: "Mind", kind: "duration", status: "active", seed: 9 },
  { id: "language", name: "Practice language", category: "Study", kind: "duration", status: "active", seed: 8 },
  { id: "journal", name: "Write in journal", category: "Mind", kind: "binary", status: "active", seed: 12 },
  { id: "steps", name: "Walk 8,000 steps", category: "Body", kind: "numeric", status: "active", seed: 15 },
  {
    id: "cold-shower",
    name: "Cold shower",
    category: "Body",
    kind: "binary",
    status: "archived",
    seed: 21,
    archivedOn: "12 May 2026",
  },
  {
    id: "flashcards",
    name: "Review flashcards",
    category: "Study",
    kind: "numeric",
    status: "archived",
    seed: 24,
    archivedOn: "3 Jun 2026",
  },
];

export const dates = Array.from({ length: DAYS }, (_, i) => i + 1);

const rand = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** completion grid: habit -> day -> done */
export const gridFor = (list: Habit[]) =>
  list.map((h, hi) => dates.map((d) => rand(h.seed + hi, d) < 0.55 + ((hi % 5) * 0.06)));

export const percent = (done: number, total: number) =>
  total === 0 ? 0 : Math.round((done / total) * 100);

export const habitStats = (list: Habit[]) => {
  const grid = gridFor(list);
  return list.map((h, i) => {
    const row = grid[i]!;
    const done = row.filter(Boolean).length;
    let best = 0;
    let run = 0;
    let current = 0;
    row.forEach((v, idx) => {
      run = v ? run + 1 : 0;
      best = Math.max(best, run);
      if (idx === row.length - 1) current = run;
    });
    return { habit: h, done, rate: percent(done, DAYS), best, current, row };
  });
};

export const dayPercentFor = (list: Habit[]) => {
  const grid = gridFor(list);
  return dates.map((_, i) => percent(grid.filter((row) => row[i]).length, list.length || 1));
};

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const weekdayPercentFor = (list: Habit[]) => {
  const day = dayPercentFor(list);
  return WEEKDAYS.map((label, w) => {
    const vals = day.filter((_, i) => i % 7 === w);
    return { label, value: Math.round(vals.reduce((a, b) => a + b, 0) / (vals.length || 1)) };
  });
};

export const monthTrend = [
  { month: "Jan", value: 54 },
  { month: "Feb", value: 61 },
  { month: "Mar", value: 58 },
  { month: "Apr", value: 70 },
  { month: "May", value: 76 },
  { month: "Jun", value: 81 },
];

export const categoryColor: Record<string, string> = {
  Study: "w1",
  Body: "w2",
  Mind: "w3",
  Routine: "w4",
};