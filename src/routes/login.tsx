import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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
  const { user, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Signed in successfully with Google!");
      navigate({ to: "/" });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to sign in with Google";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">June 2026</p>
          <h1 className="mt-2 font-[family-name:Playfair_Display] text-3xl font-medium">
            Habit Tracker
          </h1>
          <p className="mt-2 font-[family-name:Playfair_Display] text-sm italic text-foreground/60">
            “Small things, done daily, become who you are.”
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          {user ? (
            <div className="flex flex-col items-center gap-3 py-3 text-center">
              <p className="text-sm font-medium">Signed in as {user.displayName || user.email}</p>
              <button
                onClick={() => navigate({ to: "/" })}
                className="w-full rounded-xl bg-w1 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90"
              >
                Go to Tracker Dashboard
              </button>
            </div>
          ) : (
            <>
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

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {loading ? "Signing in..." : "Continue with Google"}
                </button>
              </div>

              <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or email demo
                <span className="h-px flex-1 bg-border" />
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
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="mt-1 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-90"
                >
                  {mode === "login" ? "Guest Log in" : "Guest Create account"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          <Link to="/" className="underline hover:text-foreground">
            Continue to dashboard as guest
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-w1"
      />
    </label>
  );
}
