import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  Compass,
  Flame,
  HelpCircle,
  Leaf,
  Lock,
  Search,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppMenu } from "@/components/AppMenu";
import { useHabits } from "@/lib/habits-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/stickers")({
  head: () => ({
    meta: [
      { title: "Sticker Store — Habit Tracker" },
      {
        name: "description",
        content:
          "Reward your consistency. Collect stickers, unlock badges with stars, and make your habit tracking journey fun.",
      },
      { property: "og:title", content: "Sticker Store — Habit Tracker" },
      {
        property: "og:description",
        content:
          "Earn stars for building positive rituals and trade them for beautiful milestone stickers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StickerStorePage,
});

type Category = "All" | "Streaks" | "Study" | "Health" | "Productivity" | "Lifestyle" | "Special";

interface Sticker {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: Category;
  cost: number;
  unlocked: boolean;
  tint: string;
  unlockedAt?: string;
}

const INITIAL_STICKERS: Sticker[] = [
  // --- ALREADY UNLOCKED (Your Collection) ---
  {
    id: "first-step",
    name: "First Step",
    description: "Create your first habit",
    emoji: "👟",
    category: "Special",
    cost: 10,
    unlocked: true,
    tint: "bg-blue-50/70 border-blue-100 text-blue-600",
    unlockedAt: "June 1, 2026",
  },
  {
    id: "7-day-streak",
    name: "7 Day Streak",
    description: "Maintain a streak for 7 days",
    emoji: "🔥",
    category: "Streaks",
    cost: 20,
    unlocked: true,
    tint: "bg-rose-50/70 border-rose-100 text-rose-600",
    unlockedAt: "June 7, 2026",
  },
  {
    id: "study-star",
    name: "Study Star",
    description: "Complete study habit 10 times",
    emoji: "📖",
    category: "Study",
    cost: 25,
    unlocked: true,
    tint: "bg-indigo-50/70 border-indigo-100 text-indigo-600",
    unlockedAt: "June 10, 2026",
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Log a habit before 8 AM",
    emoji: "☀️",
    category: "Lifestyle",
    cost: 20,
    unlocked: true,
    tint: "bg-amber-50/70 border-amber-100 text-amber-600",
    unlockedAt: "June 12, 2026",
  },
  {
    id: "hydration-hero",
    name: "Hydration Hero",
    description: "Log water 7 days",
    emoji: "💧",
    category: "Health",
    cost: 20,
    unlocked: true,
    tint: "bg-cyan-50/70 border-cyan-100 text-cyan-600",
    unlockedAt: "June 14, 2026",
  },
  {
    id: "goal-getter",
    name: "Goal Getter",
    description: "Reach 80% completion",
    emoji: "🎯",
    category: "Special",
    cost: 30,
    unlocked: true,
    tint: "bg-emerald-50/70 border-emerald-100 text-emerald-600",
    unlockedAt: "June 18, 2026",
  },
  {
    id: "mindful-morning",
    name: "Mindful Morning",
    description: "Meditate before breakfast",
    emoji: "🧘",
    category: "Health",
    cost: 25,
    unlocked: true,
    tint: "bg-purple-50/70 border-purple-100 text-purple-600",
  },
  {
    id: "clean-desk",
    name: "Clean Desk",
    description: "Organize workspace 5 days",
    emoji: "🧹",
    category: "Productivity",
    cost: 20,
    unlocked: true,
    tint: "bg-teal-50/70 border-teal-100 text-teal-600",
  },
  {
    id: "journal-keeper",
    name: "Journal Keeper",
    description: "Write in journal 7 days",
    emoji: "📝",
    category: "Lifestyle",
    cost: 25,
    unlocked: true,
    tint: "bg-amber-50/70 border-amber-100 text-amber-600",
  },
  {
    id: "language-learner",
    name: "Language Learner",
    description: "Practice vocabulary 5 days",
    emoji: "🗣️",
    category: "Study",
    cost: 25,
    unlocked: true,
    tint: "bg-blue-50/70 border-blue-100 text-blue-600",
  },
  {
    id: "step-champion",
    name: "Step Champion",
    description: "Reach 8k steps 7 days",
    emoji: "👟",
    category: "Health",
    cost: 30,
    unlocked: true,
    tint: "bg-emerald-50/70 border-emerald-100 text-emerald-600",
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    description: "100% completion in week 1",
    emoji: "🏅",
    category: "Special",
    cost: 40,
    unlocked: true,
    tint: "bg-amber-50/70 border-amber-100 text-amber-600",
  },
  {
    id: "night-routine",
    name: "Night Routine",
    description: "Plan next day before bed",
    emoji: "🗂️",
    category: "Productivity",
    cost: 20,
    unlocked: true,
    tint: "bg-indigo-50/70 border-indigo-100 text-indigo-600",
  },
  {
    id: "focus-master",
    name: "Focus Master",
    description: "Complete 3 focus sessions",
    emoji: "⏱️",
    category: "Productivity",
    cost: 30,
    unlocked: true,
    tint: "bg-rose-50/70 border-rose-100 text-rose-600",
  },

  // --- AVAILABLE TO UNLOCK (Store) ---
  {
    id: "30-day-streak",
    name: "30 Day Streak",
    description: "Maintain a streak for 30 days",
    emoji: "📅",
    category: "Streaks",
    cost: 50,
    unlocked: false,
    tint: "bg-rose-50/70 border-rose-100 text-rose-600",
  },
  {
    id: "consistency-king",
    name: "Consistency King",
    description: "Maintain 80% completion for a month",
    emoji: "👑",
    category: "Special",
    cost: 40,
    unlocked: false,
    tint: "bg-amber-50/70 border-amber-100 text-amber-600",
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Log a habit after 10 PM",
    emoji: "🌙",
    category: "Lifestyle",
    cost: 20,
    unlocked: false,
    tint: "bg-indigo-50/70 border-indigo-100 text-indigo-600",
  },
  {
    id: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Stay consistent during weekends",
    emoji: "⛰️",
    category: "Streaks",
    cost: 30,
    unlocked: false,
    tint: "bg-emerald-50/70 border-emerald-100 text-emerald-600",
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Read 5 books",
    emoji: "📚",
    category: "Study",
    cost: 50,
    unlocked: false,
    tint: "bg-cyan-50/70 border-cyan-100 text-cyan-600",
  },
  {
    id: "fitness-champ",
    name: "Fitness Champ",
    description: "Complete workout 20 times",
    emoji: "🏋️",
    category: "Health",
    cost: 40,
    unlocked: false,
    tint: "bg-purple-50/70 border-purple-100 text-purple-600",
  },
  {
    id: "no-sugar",
    name: "No Sugar",
    description: "Stay sugar-free for 14 days",
    emoji: "🚫",
    category: "Health",
    cost: 40,
    unlocked: false,
    tint: "bg-rose-50/70 border-rose-100 text-rose-600",
  },
  {
    id: "mindful",
    name: "Mindful",
    description: "Meditate for 10 days",
    emoji: "🪷",
    category: "Health",
    cost: 30,
    unlocked: false,
    tint: "bg-purple-50/70 border-purple-100 text-purple-600",
  },
  {
    id: "productivity-pro",
    name: "Productivity Pro",
    description: "Complete all habits in a day",
    emoji: "📊",
    category: "Productivity",
    cost: 50,
    unlocked: false,
    tint: "bg-emerald-50/70 border-emerald-100 text-emerald-600",
  },
  {
    id: "early-riser",
    name: "Early Riser",
    description: "Log a habit 5 days in a row before 6 AM",
    emoji: "🌅",
    category: "Lifestyle",
    cost: 30,
    unlocked: false,
    tint: "bg-amber-50/70 border-amber-100 text-amber-600",
  },
  {
    id: "water-streak",
    name: "Water Streak",
    description: "Log water 30 days",
    emoji: "💧",
    category: "Health",
    cost: 40,
    unlocked: false,
    tint: "bg-cyan-50/70 border-cyan-100 text-cyan-600",
  },
  {
    id: "balanced",
    name: "Balanced",
    description: "Maintain all habit types for 2 weeks",
    emoji: "⚖️",
    category: "Special",
    cost: 50,
    unlocked: false,
    tint: "bg-blue-50/70 border-blue-100 text-blue-600",
  },
  {
    id: "deep-focus",
    name: "Deep Focus",
    description: "Complete 10 hours of deep study",
    emoji: "🧠",
    category: "Study",
    cost: 45,
    unlocked: false,
    tint: "bg-indigo-50/70 border-indigo-100 text-indigo-600",
  },
  {
    id: "mindful-eater",
    name: "Mindful Eater",
    description: "Eat home-cooked meals for 10 days",
    emoji: "🥗",
    category: "Health",
    cost: 35,
    unlocked: false,
    tint: "bg-emerald-50/70 border-emerald-100 text-emerald-600",
  },
];

const CATEGORIES: Category[] = [
  "All",
  "Streaks",
  "Study",
  "Health",
  "Productivity",
  "Lifestyle",
  "Special",
];

const STICKERS_STORAGE_KEY = "vision_unlocked_stickers_v2";

function getStoredUnlocks(): { unlockedIds: string[]; spentStars: number } {
  if (typeof window === "undefined") return { unlockedIds: [], spentStars: 0 };
  try {
    const raw = localStorage.getItem(STICKERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Error reading stickers from localStorage:", err);
  }
  return { unlockedIds: [], spentStars: 0 };
}

function StickerStorePage() {
  const { stars: earnedStars } = useHabits();
  const [unlockData, setUnlockData] = useState(getStoredUnlocks);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"default" | "low-to-high" | "high-to-low">(
    "default",
  );
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [confirmUnlock, setConfirmUnlock] = useState<Sticker | null>(null);

  // Sync unlock data across tabs in real-time
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("vision_stickers_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "STICKER_UNLOCK_SYNC" && event.data?.payload) {
          setUnlockData(event.data.payload);
        }
      };
    } catch {
      // BroadcastChannel unsupported in test env
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STICKERS_STORAGE_KEY && e.newValue) {
        try {
          setUnlockData(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      bc?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Compute stars available: 120 base bonus + earned stars from habit checks - spent stars
  const stars = Math.max(0, 120 + earnedStars - (unlockData.spentStars || 0));

  const stickers = useMemo<Sticker[]>(() => {
    return INITIAL_STICKERS.map((s) => {
      if (s.unlocked || unlockData.unlockedIds.includes(s.id)) {
        return { ...s, unlocked: true };
      }
      return s;
    });
  }, [unlockData.unlockedIds]);

  // Stats
  const unlockedStickers = useMemo(() => stickers.filter((s) => s.unlocked), [stickers]);
  const totalCount = 40;
  const currentEarnedCount = unlockedStickers.length;
  const progressPercent = Math.round((currentEarnedCount / totalCount) * 100);

  // Filtered available stickers
  const availableList = useMemo(() => {
    let list = stickers.filter((s) => !s.unlocked);

    if (activeCategory !== "All") {
      list = list.filter((s) => s.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
      );
    }

    if (sortOption === "low-to-high") {
      list = [...list].sort((a, b) => a.cost - b.cost);
    } else if (sortOption === "high-to-low") {
      list = [...list].sort((a, b) => b.cost - a.cost);
    }

    return list;
  }, [stickers, activeCategory, searchQuery, sortOption]);

  const handleUnlock = (sticker: Sticker) => {
    if (stars < sticker.cost) {
      toast.error(
        `Not enough stars! You need ${sticker.cost - stars} more stars to unlock "${sticker.name}".`,
      );
      return;
    }

    const nextData = {
      unlockedIds: Array.from(new Set([...unlockData.unlockedIds, sticker.id])),
      spentStars: (unlockData.spentStars || 0) + sticker.cost,
    };
    setUnlockData(nextData);

    try {
      localStorage.setItem(STICKERS_STORAGE_KEY, JSON.stringify(nextData));
      const bc = new BroadcastChannel("vision_stickers_channel");
      bc.postMessage({ type: "STICKER_UNLOCK_SYNC", payload: nextData });
      bc.close();
    } catch (err) {
      console.warn("Failed to broadcast sticker unlock:", err);
    }

    setConfirmUnlock(null);
    toast.success(`🎉 Unlocked "${sticker.name}" sticker for ${sticker.cost} stars!`);
  };

  const featuredSticker = stickers.find((s) => s.id === "consistency-king");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ----------------- TOP APP BAR ----------------- */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <AppMenu />
          <span className="font-[family-name:Playfair_Display] text-base font-medium">
            Sticker Store
          </span>

          {/* Header Action Badges */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-1.5 shadow-xs">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <div className="leading-tight">
                <span className="block text-[9px] font-medium uppercase tracking-wider text-amber-700">
                  Your Stars
                </span>
                <span className="text-xs font-bold text-amber-900">{stars}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/70 px-3 py-1.5 shadow-xs">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div className="leading-tight">
                <span className="block text-[9px] font-medium uppercase tracking-wider text-blue-700">
                  Earned
                </span>
                <span className="text-xs font-bold text-blue-900">
                  {currentEarnedCount} / {totalCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- MAIN LAYOUT ----------------- */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ============================================================ */}
          {/* LEFT COLUMN: STORE CATALOG & COLLECTION                      */}
          {/* ============================================================ */}
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Sticker Store
                </h1>
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Reward your consistency. Collect stickers and make your journey more fun!
              </p>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      activeCategory === cat
                        ? "bg-blue-600 text-white shadow-xs"
                        : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search stickers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Motivational Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 p-6 shadow-xs">
              <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="max-w-sm">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    Small Stickers
                    <br />
                    Big Progress
                  </h2>
                  <p className="mt-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                    Keep showing up. Every habit counts.
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-[family-name:Playfair_Display] text-xs italic leading-relaxed text-slate-700 sm:text-sm">
                    “Consistency today,
                    <br />a better you tomorrow.”
                  </p>
                </div>
              </div>

              {/* Mountain Illustration Background */}
              <div className="pointer-events-none absolute bottom-0 right-10 opacity-70">
                <MountainBannerArtwork />
              </div>
            </div>

            {/* Section 1: Your Collection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground sm:text-lg">
                    Your Collection ({unlockedStickers.length})
                  </h2>
                </div>
                <button
                  onClick={() => setViewAllOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {unlockedStickers.slice(0, 6).map((sticker) => (
                  <div
                    key={sticker.id}
                    className="flex flex-col items-center rounded-2xl border border-border bg-card p-3.5 text-center shadow-xs transition-transform hover:-translate-y-0.5"
                  >
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl border ${sticker.tint} text-2xl shadow-xs`}
                    >
                      <span>{sticker.emoji}</span>
                    </div>
                    <p className="mt-2.5 text-xs font-bold text-foreground">{sticker.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                      {sticker.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Available Stickers */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  Available Stickers ({availableList.length})
                </h2>

                <div className="flex items-center gap-2">
                  {/* Category select */}
                  <div className="relative">
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value as Category)}
                      aria-label="Filter category"
                      className="h-8 rounded-lg border border-border bg-card px-2.5 pr-7 text-xs font-medium text-foreground outline-none focus:border-blue-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* Sort select */}
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) =>
                        setSortOption(e.target.value as "default" | "low-to-high" | "high-to-low")
                      }
                      aria-label="Sort stickers"
                      className="h-8 rounded-lg border border-border bg-card px-2.5 pr-7 text-xs font-medium text-foreground outline-none focus:border-blue-500"
                    >
                      <option value="default">Sort: Default</option>
                      <option value="low-to-high">Stars: Low to High</option>
                      <option value="high-to-low">Stars: High to Low</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {availableList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <p className="text-sm font-semibold text-foreground">No stickers found</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try changing your search or category filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {availableList.map((sticker) => (
                    <div
                      key={sticker.id}
                      onClick={() => setConfirmUnlock(sticker)}
                      className="group flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-border bg-card p-3.5 text-center shadow-xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`grid h-12 w-12 place-items-center rounded-2xl border ${sticker.tint} text-2xl shadow-xs transition-transform group-hover:scale-110`}
                        >
                          <span>{sticker.emoji}</span>
                        </div>
                        <p className="mt-2.5 text-xs font-bold text-foreground">{sticker.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                          {sticker.description}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        <span>{sticker.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: PROGRESS, FEATURED, HOW IT WORKS               */}
          {/* ============================================================ */}
          <div className="space-y-5">
            {/* Card 1: Your Progress */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h2 className="text-sm font-bold text-foreground">Your Progress</h2>

              <div className="mt-4 flex items-center gap-4">
                {/* Donut Chart */}
                <div className="relative grid h-16 w-16 place-items-center">
                  <svg width="64" height="64" className="-rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      strokeWidth="6"
                      className="stroke-muted"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(2 * Math.PI * 26 * progressPercent) / 100} ${2 * Math.PI * 26}`}
                      className="stroke-blue-600 transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-foreground">
                    {progressPercent}%
                  </span>
                </div>

                <div>
                  <p className="text-base font-bold text-foreground">
                    {currentEarnedCount} / {totalCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Stickers collected</p>
                </div>
              </div>

              {/* Encouragement banner */}
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-2.5 text-xs text-emerald-800">
                <Leaf className="h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold">Keep going!</p>
                  <p className="text-[11px] text-emerald-700/90">
                    More stickers are waiting for you.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Featured Sticker */}
            {featuredSticker && !featuredSticker.unlocked && (
              <div className="relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/50 to-amber-100/40 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Featured Sticker
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-300 bg-white text-3xl shadow-xs">
                    <Trophy className="h-8 w-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{featuredSticker.name}</h3>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {featuredSticker.description}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{featuredSticker.cost}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setConfirmUnlock(featuredSticker)}
                  className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
                >
                  Unlock
                </button>
              </div>
            )}

            {/* Card 3: How It Works */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h2 className="text-sm font-bold text-foreground">How It Works</h2>

              <div className="mt-4 space-y-3.5">
                <StepRow
                  num={1}
                  tint="bg-blue-100 text-blue-700"
                  title="Complete habits"
                  desc="Be consistent with your daily habits."
                />
                <StepRow
                  num={2}
                  tint="bg-emerald-100 text-emerald-700"
                  title="Earn stars"
                  desc="Get stars by completing habits and achieving milestones."
                />
                <StepRow
                  num={3}
                  tint="bg-amber-100 text-amber-700"
                  title="Unlock stickers"
                  desc="Use your stars to unlock new stickers."
                />
                <StepRow
                  num={4}
                  tint="bg-purple-100 text-purple-700"
                  title="Show your collection"
                  desc="Collect all stickers and track your progress!"
                />
              </div>
            </div>

            {/* Card 4: Motivational Footer Card */}
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-indigo-50/70 p-4 text-center shadow-xs">
              <p className="font-[family-name:Playfair_Display] text-xs italic leading-relaxed text-slate-700">
                “Better habits. Brighter days.
                <br />
                One sticker at a time.”
              </p>
              <div className="relative mt-2 flex justify-center">
                <MountainArtwork />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ----------------- DIALOGS ----------------- */}

      {/* 1. Unlock Confirmation Dialog */}
      <Dialog open={confirmUnlock !== null} onOpenChange={() => setConfirmUnlock(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Unlock Sticker
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to unlock this sticker?
            </DialogDescription>
          </DialogHeader>

          {confirmUnlock && (
            <div className="my-3 flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center">
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl border ${confirmUnlock.tint} text-3xl shadow-xs`}
              >
                <span>{confirmUnlock.emoji}</span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">{confirmUnlock.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{confirmUnlock.description}</p>

              <div className="mt-3 flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                Cost: {confirmUnlock.cost} Stars
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setConfirmUnlock(null)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmUnlock && handleUnlock(confirmUnlock)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Confirm & Unlock
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. View All Collection Dialog */}
      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Your Complete Collection ({unlockedStickers.length} / {totalCount})
            </DialogTitle>
            <DialogDescription className="text-xs">
              All the milestone stickers and rewards you have earned so far.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-3 sm:grid-cols-4">
            {unlockedStickers.map((sticker) => (
              <div
                key={sticker.id}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-3 text-center shadow-xs"
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl border ${sticker.tint} text-2xl shadow-xs`}
                >
                  <span>{sticker.emoji}</span>
                </div>
                <p className="mt-2 text-xs font-bold text-foreground">{sticker.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                  {sticker.description}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <button
              onClick={() => setViewAllOpen(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----------------- SUBCOMPONENTS -----------------

function StepRow({
  num,
  tint,
  title,
  desc,
}: {
  num: number;
  tint: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${tint}`}
      >
        {num}
      </span>
      <div>
        <p className="text-xs font-bold text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function MountainBannerArtwork() {
  return (
    <svg viewBox="0 0 240 100" className="h-24 w-60">
      <polygon points="120,10 180,90 60,90" fill="#93c5fd" opacity="0.6" />
      <polygon points="120,10 180,90 120,90" fill="#60a5fa" opacity="0.7" />
      <polygon points="80,40 130,90 30,90" fill="#bfdbfe" opacity="0.8" />
      <polygon points="160,35 210,90 110,90" fill="#3b82f6" opacity="0.4" />
      <polygon points="120,10 135,35 125,30 120,35 115,30 105,35" fill="#ffffff" />
      <line x1="120" y1="10" x2="120" y2="2" stroke="#1e40af" strokeWidth="1.5" />
      <polygon points="120,2 132,6 120,10" fill="#2563eb" />
    </svg>
  );
}

function MountainArtwork() {
  return (
    <svg viewBox="0 0 200 110" className="h-20 w-44">
      <polygon points="100,15 160,100 40,100" fill="#93c5fd" opacity="0.6" />
      <polygon points="100,15 160,100 100,100" fill="#60a5fa" opacity="0.7" />
      <polygon points="60,40 110,100 10,100" fill="#bfdbfe" opacity="0.8" />
      <polygon points="140,35 190,100 90,100" fill="#3b82f6" opacity="0.4" />
      <polygon points="100,15 115,35 105,30 100,35 95,30 85,35" fill="#ffffff" />
      <line x1="100" y1="15" x2="100" y2="5" stroke="#1e40af" strokeWidth="1.5" />
      <polygon points="100,5 114,9 100,13" fill="#2563eb" />
    </svg>
  );
}
