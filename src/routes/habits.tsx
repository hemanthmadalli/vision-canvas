import { createFileRoute } from "@tanstack/react-router";
import { Archive, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";

import { AppMenu } from "@/components/AppMenu";
import { habits as seedHabits, categoryColor } from "@/lib/habit-analytics";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title: "Habit management — Habit Tracker" },
      {
        name: "description",
        content:
          "Create, edit and archive habits. Archiving keeps historical consistency data in your reports while hiding the habit from the active matrix.",
      },
      { property: "og:title", content: "Habit management — Habit Tracker" },
      {
        property: "og:description",
        content: "Archive instead of delete so your streak history and graphs stay intact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HabitsPage,
});

function HabitsPage() {
  const [list, setList] = useState(seedHabits);

  const toggle = (id: string) =>
    setList((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, status: h.status === "active" ? "archived" : "active" } : h,
      ),
    );

  const active = list.filter((h) => h.status === "active");
  const archived = list.filter((h) => h.status === "archived");

  return (
    <main className="min-h-screen bg-background p-4 text-foreground">
      <header className="mb-4 flex items-center gap-3">
        <AppMenu />
        <h1 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Habit management
        </h1>
        <button className="ml-auto flex items-center gap-1.5 rounded-xl bg-w1 px-3 py-2 text-xs font-semibold text-card">
          <Plus className="h-3.5 w-3.5" /> New habit
        </button>
      </header>

      <div className="mx-auto grid max-w-3xl gap-4">
        <Section title={`Active (${active.length})`}>
          {active.map((h) => (
            <Row key={h.id} name={h.name} category={h.category} kind={h.kind}>
              <button
                onClick={() => toggle(h.id)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] transition-colors hover:bg-accent"
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </button>
            </Row>
          ))}
        </Section>

        <Section title={`Archived (${archived.length})`}>
          <p className="px-4 py-2 text-[11px] text-muted-foreground">
            Archived habits stay out of your active matrix, but their history is kept in analytics.
          </p>
          {archived.map((h) => (
            <Row key={h.id} name={h.name} category={h.category} kind={h.kind} muted>
              <button
                onClick={() => toggle(h.id)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] transition-colors hover:bg-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </button>
            </Row>
          ))}
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <h2 className="bg-w1-soft px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  name,
  category,
  kind,
  muted,
  children,
}: {
  name: string;
  category: string;
  kind: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  const tint = categoryColor[category] ?? "w1";
  return (
    <div
      className={`flex items-center gap-3 border-b border-border px-4 py-2.5 text-sm last:border-b-0 ${
        muted ? "text-muted-foreground" : ""
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full bg-${tint}`} />
      <span className="flex-1">{name}</span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {category} · {kind}
      </span>
      {children}
    </div>
  );
}