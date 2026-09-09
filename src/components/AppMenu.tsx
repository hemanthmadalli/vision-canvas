import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  BarChart3,
  Trophy,
  ListChecks,
  UserCog,
  LogOut,
  LogIn,
  Star,
  Database,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const items = [
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/habits", label: "Habit Management", icon: ListChecks },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/stickers", label: "Sticker Store", icon: Star },
  { to: "/settings", label: "Profile & Settings", icon: UserCog },
] as const;

export function AppMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, dbUser, signOut, signInWithGoogle } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent"
      >
        <Menu className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-card p-0 flex flex-col justify-between">
        <div>
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="font-[family-name:Playfair_Display] text-lg font-medium">
              Habit Tracker
            </SheetTitle>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <Database className="h-3 w-3" />
              <span>Cloud SQL PostgreSQL</span>
            </div>
          </SheetHeader>

          {user ? (
            <div className="border-b border-border px-4 py-3 bg-muted/30">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="h-8 w-8 rounded-full border border-border"
                  />
                ) : (
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-w1 text-xs font-semibold text-white">
                    {(user.displayName || user.email || "U")[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {user.displayName || user.email}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {dbUser ? `Synced (ID #${dbUser.id})` : user.email}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <nav className="flex flex-col gap-1 p-3">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              activeProps={{ className: "bg-w1-soft text-foreground font-medium" }}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <span className="grid h-5 w-5 place-items-center text-[13px]">🏠</span>
              Home
            </Link>
            {items.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-w1-soft text-foreground font-medium" }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-3 border-t border-border">
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <button
              onClick={async () => {
                setOpen(false);
                navigate({ to: "/login" });
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent"
            >
              <LogIn className="h-4 w-4 text-muted-foreground" />
              Sign in with Google
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
