import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Habit Tracker" },
      {
        name: "description",
        content:
          "Sign in to your habit tracker to track daily rituals, streaks, weekly gauges and your regional leaderboard rank.",
      },
      { property: "og:title", content: "Sign in — Habit Tracker" },
      {
        property: "og:description",
        content: "Log in to continue your streaks and see your monthly habit matrix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            June 2026
          </p>
          <h1 className="mt-2 font-[family-name:Playfair_Display] text-3xl font-medium">
            Habit Tracker
          </h1>
          <p className="mt-2 font-[family-name:Playfair_Display] text-sm italic text-foreground/60">
            “Small things, done daily, become who you are.”
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-xs font-medium">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg py-2 transition-colors ${
                  mode === m ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Log in" : "Create account"}
              </button>
            ))}
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/" });
            }}
          >
            {mode === "signup" ? (
              <Field label="Name" type="text" placeholder="Your name" />
            ) : null}
            <Field label="Email" type="email" placeholder="you@example.com" />
            <Field label="Password" type="password" placeholder="••••••••" />
            {mode === "login" ? (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-w1" defaultChecked />
                  Keep me signed in
                </label>
                <button type="button" className="hover:text-foreground">
                  Forgot password?
                </button>
              </div>
            ) : (
              <Field label="Region" type="text" placeholder="e.g. Karnataka, IN" />
            )}

            <button
              type="submit"
              className="mt-1 rounded-xl bg-w1 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90"
            >
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            <button className="rounded-xl border border-border py-2 text-sm transition-colors hover:bg-accent">
              Continue with Google
            </button>
            <button className="rounded-xl border border-border py-2 text-sm transition-colors hover:bg-accent">
              Continue with Apple
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          <Link to="/" className="underline hover:text-foreground">
            Continue as guest
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  placeholder,
}: {
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-w1"
      />
    </label>
  );
}