import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Flame,
  Hash,
  Leaf,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppMenu } from "@/components/AppMenu";
import {
  habitStats,
  habits as seedHabits,
  type Habit,
  type HabitKind,
} from "@/lib/habit-analytics";

export const Route = createFileRoute("/habits")({ component: HabitsPage });
type Filter = "all" | "active" | "archived";
type KindFilter = "all" | HabitKind;
const KIND: Record<
  HabitKind,
  { label: string; hint: string; icon: typeof Hash; accent: string; color: string; soft: string }
> = {
  binary: {
    label: "Binary",
    hint: "Done / Not done",
    icon: CheckCircle2,
    accent: "blue",
    color: "#2563eb",
    soft: "#eff6ff",
  },
  numeric: {
    label: "Numeric",
    hint: "Count / Quantity",
    icon: Hash,
    accent: "rose",
    color: "#e85d85",
    soft: "#fff1f5",
  },
  duration: {
    label: "Duration",
    hint: "Time based",
    icon: Clock3,
    accent: "teal",
    color: "#25a5a4",
    soft: "#ecfdfb",
  },
};
const EXTRAS: Record<string, [string, string, string]> = {
  notes: ["Make it a daily habit", "Daily", "18 / 30 days"],
  assign: ["Practice and improve", "3× per week", "14 / 20 problems"],
  meditate: ["Clear mind, better focus", "Daily", "15 / 20 min"],
  read: ["Grow knowledge daily", "Daily", "16 / 30 pages"],
  exercise: ["Stay strong and healthy", "4× per week", "40 / 60 min"],
};

function HabitsPage() {
  const [habits, setHabits] = useState(() =>
    seedHabits.slice(0, 6).map((h, i) => (i === 5 ? { ...h, status: "archived" as const } : h)),
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");
  const [newKind, setNewKind] = useState<HabitKind>("binary");
  const [days, setDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const rows = useMemo(
    () =>
      habits.filter(
        (h) =>
          (filter === "all" || h.status === filter) &&
          (kind === "all" || h.kind === kind) &&
          h.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [habits, filter, kind, query],
  );
  const stats = habitStats(habits);
  const toggle = (id: string) =>
    setHabits((x) =>
      x.map((h) =>
        h.id === id ? { ...h, status: h.status === "active" ? "archived" : "active" } : h,
      ),
    );
  const save = () => {
    if (!name.trim()) return;
    setHabits((x) => [
      ...x,
      {
        id: String(Date.now()),
        name,
        category: "Routine",
        kind: newKind,
        status: "active",
        seed: 37 + x.length,
      },
    ]);
    setName("");
    setOpen(false);
  };
  return (
    <main className="min-h-screen bg-[#fbfcff] p-3 text-slate-900 md:p-4">
      <div
        className={`mx-auto grid max-w-[1280px] gap-3 ${open ? "xl:grid-cols-[minmax(0,1fr)_382px]" : "xl:grid-cols-1"}`}
      >
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <header className="flex items-start gap-3 border-b border-slate-200 pb-4">
            <AppMenu />
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">
                Habit Management <Leaf className="inline h-6 w-6 text-emerald-500" />
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Add, edit, and organize your daily habits.
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" /> New Habit
            </button>
          </header>
          <div className="grid gap-4 py-5 md:grid-cols-[1fr_1.15fr_1.25fr]">
            <Filters
              label="Filter by status"
              value={filter}
              set={(v) => setFilter(v as Filter)}
              options={[
                ["all", "All"],
                ["active", "Active"],
                ["archived", "Archived"],
              ]}
            />
            <Filters
              label="Filter by type"
              value={kind}
              set={(v) => setKind(v as KindFilter)}
              options={[
                ["all", "All"],
                ["binary", "Binary"],
                ["numeric", "Numeric"],
                ["duration", "Duration"],
              ]}
            />
            <label className="text-xs font-medium">
              Search habits
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-9"
                  placeholder="Search habits by name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </label>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="hidden grid-cols-[1.5fr_1fr_.7fr_1fr_.55fr_28px] gap-3 border-b border-slate-200 px-4 py-3 text-[10px] font-semibold uppercase text-slate-500 md:grid">
              <span>Habit</span>
              <span>Type & Frequency</span>
              <span>Streak</span>
              <span>Progress</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-200">
              {rows.map((h) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  stat={stats.find((s) => s.habit.id === h.id)}
                  toggle={() => toggle(h.id)}
                />
              ))}
            </div>
            {!rows.length && (
              <p className="p-10 text-center text-sm text-slate-500">
                No habits match these filters.
              </p>
            )}
          </div>
          <p className="pt-3 text-center text-xs text-slate-500">Showing {rows.length} habits</p>
        </section>
        {open && (
          <Editor
            name={name}
            setName={setName}
            habitKind={newKind}
            setHabitKind={setNewKind}
            days={days}
            setDays={setDays}
            close={() => setOpen(false)}
            save={save}
          />
        )}
      </div>
    </main>
  );
}
function HabitRow({
  habit,
  stat,
  toggle,
}: {
  habit: Habit;
  stat?: ReturnType<typeof habitStats>[number];
  toggle: () => void;
}) {
  const k = KIND[habit.kind],
    Icon = k.icon,
    [summary, freq, target] = EXTRAS[habit.id] ?? [habit.category, "Daily", "0 / 30 days"],
    archived = habit.status === "archived",
    pct = stat?.rate ?? 0;
  return (
    <div className="p-3 md:px-4">
      <div className="grid items-center gap-3 md:grid-cols-[1.5fr_1fr_.7fr_1fr_.55fr_28px]">
        <div className="flex gap-3">
          <span
            className="grid h-14 w-14 place-items-center rounded-lg"
            style={{ backgroundColor: k.soft, color: k.color }}
          >
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h2 className="font-semibold">{habit.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{summary}</p>
          </div>
        </div>
        <div className="text-sm">
          <span
            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: k.color }}
          />
          {k.label}
          <small className="ml-2 text-xs text-slate-500">{freq}</small>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
          {stat?.current || "—"} {stat?.current ? "days" : ""}
        </div>
        <div>
          <span className="text-sm">{archived ? "Last completed" : target}</span>
          <div className="mt-2 h-2 max-w-28 overflow-hidden rounded-full bg-slate-100">
            <span
              className="block h-full rounded-full"
              style={{ width: `${pct}%`, backgroundColor: k.color }}
            />
          </div>
          <small className="text-xs">
            {archived ? (habit.archivedOn ?? "May 8, 2026") : `${pct}%`}
          </small>
        </div>
        <span
          className={`w-fit rounded-lg px-3 py-2 text-xs ${archived ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}
        >
          {archived ? "Archived" : "Active"}
        </span>
        <button onClick={toggle} title="Archive or restore habit" className="p-1 text-slate-500">
          <MoreHorizontal />
        </button>
      </div>
      <div
        className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px]"
        style={{ backgroundColor: k.soft, color: k.color }}
      >
        <Archive className="h-3.5 w-3.5" />
        {k.label} habits track{" "}
        {habit.kind === "duration"
          ? "time. Meet or exceed your target duration."
          : habit.kind === "numeric"
            ? "a number. Reach your target to complete the habit."
            : "simple yes/no goals. Mark it done each day."}
      </div>
    </div>
  );
}
function Filters({
  label,
  value,
  set,
  options,
}: {
  label: string;
  value: string;
  set: (x: string) => void;
  options: string[][];
}) {
  return (
    <div>
      <p className="text-xs font-medium">{label}</p>
      <div className="mt-2 flex gap-1">
        {options.map(([v, l]) => (
          <button
            key={v}
            onClick={() => set(v)}
            className={`rounded-lg border px-3 py-2 text-xs ${value === v ? "border-blue-200 bg-blue-50 text-blue-600" : "border-slate-200"}`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
function Editor({
  name,
  setName,
  habitKind,
  setHabitKind,
  days,
  setDays,
  close,
  save,
}: {
  name: string;
  setName: (x: string) => void;
  habitKind: HabitKind;
  setHabitKind: (x: HabitKind) => void;
  days: string[];
  setDays: (x: string[]) => void;
  close: () => void;
  save: () => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-bold">Create New Habit</h2>
        <button onClick={close}>
          <X />
        </button>
      </header>
      <Band n="1. Basic Info" />
      <div className="space-y-4 p-4">
        <Field label="Habit name">
          <input
            className="input"
            placeholder="e.g., Review class notes"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Type">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(KIND) as HabitKind[]).map((x) => {
              const d = KIND[x],
                I = d.icon;
              return (
                <button
                  key={x}
                  onClick={() => setHabitKind(x)}
                  className={`rounded-lg border p-2 text-left ${habitKind === x ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}
                >
                  <span className="flex gap-2 text-sm font-medium">
                    <I className="h-4 w-4 text-blue-600" />
                    {d.label}
                  </span>
                  <small className="mt-1 block text-[10px] text-slate-500">{d.hint}</small>
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Description (optional)">
          <textarea
            className="input min-h-20 resize-none"
            placeholder="What does success look like for this habit?"
          />
        </Field>
      </div>
      <Band n="2. Schedule & Frequency" />
      <div className="space-y-4 p-4">
        <Field label="Frequency">
          <select className="input">
            <option>Daily</option>
            <option>Weekdays</option>
            <option>Custom days</option>
          </select>
        </Field>
        <Field label="Custom days (optional)">
          <div className="flex gap-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <button
                key={d}
                onClick={() =>
                  setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d])
                }
                className={`flex-1 rounded py-1.5 text-xs ${days.includes(d) ? "bg-blue-600 text-white" : "bg-slate-100"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex justify-between text-sm">
          Flexible time window{" "}
          <span className="h-5 w-9 rounded-full bg-blue-500 p-0.5">
            <span className="ml-auto block h-4 w-4 rounded-full bg-white" />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From">
            <input className="input" value="08:00 AM" readOnly />
          </Field>
          <Field label="To">
            <input className="input" value="10:00 PM" readOnly />
          </Field>
        </div>
      </div>
      <Band n="3. Goal & Tracking" />
      <div className="p-4">
        <Field label="Goal per day">
          <div className="grid grid-cols-2 gap-3">
            <input className="input" defaultValue="10" />
            <select className="input">
              <option>Pages</option>
              <option>Minutes</option>
            </select>
          </div>
        </Field>
      </div>
      <footer className="flex gap-4 border-t border-slate-100 p-4">
        <button className="flex-1 rounded-lg border py-2.5 text-sm" onClick={close}>
          Cancel
        </button>
        <button className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm text-white" onClick={save}>
          Save Habit
        </button>
      </footer>
    </aside>
  );
}
function Band({ n }: { n: string }) {
  return (
    <div className="border-y border-slate-100 bg-blue-50/60 px-4 py-3 text-sm font-medium text-blue-600">
      {n}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-700">
      {label}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
