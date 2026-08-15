import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, BarChart3, Trophy, ListChecks, UserCog, LogOut } from "lucide-react";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const items = [
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/habits", label: "Habit management", icon: ListChecks },
  { to: "/settings", label: "Settings & profile", icon: UserCog },
] as const;

export function AppMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent"
      >
        <Menu className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] bg-card p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="font-[family-name:Playfair_Display] text-lg font-medium">
            Habit Tracker
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            activeProps={{ className: "bg-w1-soft" }}
            activeOptions={{ exact: true }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <span className="grid h-5 w-5 place-items-center text-[13px]">🏠</span>
            Home
          </Link>
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "bg-w1-soft" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </Link>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              navigate({ to: "/login" });
            }}
            className="mt-2 flex items-center gap-3 rounded-lg border-t border-border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Log out
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}