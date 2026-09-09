import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import {
  defaultHabitsTemplate,
  subscribeLeaderboard,
  subscribeUserHabitLogs,
  subscribeUserHabits,
  saveUserHabitLog,
  addUserHabit as addFirestoreHabit,
  updateUserHabit as updateFirestoreHabit,
  deleteUserHabit as deleteFirestoreHabit,
  syncUserLeaderboard,
  type HabitItem,
  type HabitLogRecord,
  type LeaderboardEntry,
} from "./firestore-habits";

export const MONTH = "June";
export const YEAR = 2026;
export const DAYS_COUNT = 30;
export const dates = Array.from({ length: DAYS_COUNT }, (_, i) => i + 1);

export const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const WEEKS = [
  { label: "week 1", days: [1, 2, 3, 4, 5, 6, 7], color: "w1" },
  { label: "week 2", days: [8, 9, 10, 11, 12, 13, 14], color: "w2" },
  { label: "week 3", days: [15, 16, 17, 18, 19, 20, 21], color: "w3" },
  { label: "week 4", days: [22, 23, 24, 25, 26, 27, 28], color: "w4" },
  { label: "week 5", days: [29, 30], color: "w5" },
];

export interface EarnedSticker {
  id: string;
  emoji: string;
  label: string;
  description: string;
  unlocked: boolean;
  cost: number;
}

export interface HabitsContextValue {
  habits: HabitItem[];
  activeHabits: HabitItem[];
  logs: HabitLogRecord[];
  grid: boolean[][];
  dates: number[];
  month: string;
  year: number;
  daysCount: number;
  dayPercentages: number[];
  weekPercentages: number[];
  habitCounts: number[];
  habitPercentages: number[];
  totalDone: number;
  totalPossible: number;
  overall: number;
  streak: number;
  bestStreak: number;
  weekdayPercentages: { label: string; value: number }[];
  communityLeaderboard: LeaderboardEntry[];
  syncing: boolean;
  cloudSynced: boolean;
  earnedStickers: EarnedSticker[];
  stars: number;
  toggleCell: (habitIndex: number, day: number) => Promise<void>;
  addHabit: (name: string, category?: string, goal?: number) => Promise<void>;
  toggleHabitStatus: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

const defaultGuestHabits: HabitItem[] = defaultHabitsTemplate.map((item, idx) => ({
  id: `default_${idx + 1}`,
  name: item.name,
  seed: item.seed,
  goal: item.goal,
  category: item.category,
  status: "active",
}));

interface GuestStorageState {
  habits: HabitItem[];
  logs: Record<string, boolean>; // key: `${habitId}_${day}` -> boolean
}

function getInitialGuestState(): GuestStorageState {
  if (typeof window === "undefined") {
    return { habits: defaultGuestHabits, logs: {} };
  }
  try {
    const raw = localStorage.getItem("vision_guest_state_v2");
    if (raw) {
      const parsed = JSON.parse(raw) as GuestStorageState;
      if (Array.isArray(parsed.habits) && parsed.habits.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading guest state:", err);
  }
  return { habits: defaultGuestHabits, logs: {} };
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [guestState, setGuestState] = useState<GuestStorageState>(getInitialGuestState);
  const [firestoreHabits, setFirestoreHabits] = useState<HabitItem[]>([]);
  const [firestoreLogs, setFirestoreLogs] = useState<HabitLogRecord[]>([]);
  const [communityBoard, setCommunityBoard] = useState<LeaderboardEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);

  // Cross-browser-tab broadcast channel for guests
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("vision_habits_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "GUEST_STATE_UPDATE" && event.data.payload) {
          setGuestState(event.data.payload);
        }
      };
    } catch {
      // BroadcastChannel not supported in some older environments
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "vision_guest_state_v2" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && Array.isArray(parsed.habits)) {
            setGuestState(parsed);
          }
        } catch (err) {
          console.warn("Storage sync error:", err);
        }
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      bc?.close();
    };
  }, []);

  // Real-time Firestore Subscriptions for authenticated users
  useEffect(() => {
    if (!user) {
      setCloudSynced(false);
      return;
    }

    setSyncing(true);

    // 1. Subscribe to User Habits in Firestore (Live cross-tab & cross-device)
    const unsubHabits = subscribeUserHabits(
      user.uid,
      (items) => {
        setFirestoreHabits(items);
        setCloudSynced(true);
        setSyncing(false);
      },
      () => setSyncing(false),
    );

    // 2. Subscribe to User Habit Logs in Firestore (Live completion checkmarks)
    const unsubLogs = subscribeUserHabitLogs(
      user.uid,
      (logItems) => {
        setFirestoreLogs(logItems);
        setSyncing(false);
      },
      () => setSyncing(false),
    );

    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [user]);

  // Real-time Community Leaderboard Subscription
  useEffect(() => {
    const unsubLeaderboard = subscribeLeaderboard((entries) => {
      setCommunityBoard(entries);
    });
    return () => {
      unsubLeaderboard();
    };
  }, []);

  // Effective habits list based on auth state
  const habits = useMemo(() => {
    if (user && firestoreHabits.length > 0) {
      return firestoreHabits;
    }
    return guestState.habits;
  }, [user, firestoreHabits, guestState.habits]);

  const activeHabits = useMemo(() => {
    return habits.filter((h) => h.status !== "archived");
  }, [habits]);

  // Effective 2D completion grid: habits x 30 days
  const grid = useMemo(() => {
    if (user) {
      return habits.map((h) => {
        const habitLogs = firestoreLogs.filter((l) => l.habitId === h.id);
        return dates.map((d) => {
          const match = habitLogs.find((l) => l.day === d);
          return match ? match.completed : false;
        });
      });
    }

    // Guest mode: read from guestState.logs map
    return habits.map((h) => {
      return dates.map((d) => {
        return Boolean(guestState.logs[`${h.id}_${d}`]);
      });
    });
  }, [user, habits, firestoreLogs, guestState.logs]);

  // Day percentages (1..30)
  const dayPercentages = useMemo(() => {
    const count = habits.length || 1;
    return dates.map((_, i) => Math.round((grid.filter((row) => row[i]).length / count) * 100));
  }, [grid, habits.length]);

  // Counts & Percentages per habit
  const habitCounts = useMemo(() => grid.map((row) => row.filter(Boolean).length), [grid]);

  const habitPercentages = useMemo(
    () => habitCounts.map((c) => Math.round((c / DAYS_COUNT) * 100)),
    [habitCounts],
  );

  // Week percentages
  const weekPercentages = useMemo(() => {
    return WEEKS.map((w) => {
      const idx = w.days.map((d) => d - 1);
      let done = 0;
      let total = 0;
      for (const row of grid) {
        for (const i of idx) {
          total += 1;
          if (row[i]) done += 1;
        }
      }
      return total > 0 ? Math.round((done / total) * 1000) / 10 : 0;
    });
  }, [grid]);

  // Total completions and overall percentage
  const totalDone = useMemo(() => habitCounts.reduce((a, b) => a + b, 0), [habitCounts]);
  const totalPossible = habits.length * DAYS_COUNT;
  const overall = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 10000) / 100 : 0;

  // Compute Streak metrics
  const { streak, bestStreak } = useMemo(() => {
    let currentRun = 0;
    let maxRun = 0;
    // Check consecutive days with at least 1 completed habit
    for (let d = 0; d < DAYS_COUNT; d++) {
      const anyDoneThisDay = grid.some((row) => row[d]);
      if (anyDoneThisDay) {
        currentRun++;
        maxRun = Math.max(maxRun, currentRun);
      } else {
        currentRun = 0;
      }
    }
    return { streak: currentRun, bestStreak: maxRun };
  }, [grid]);

  // Weekday distribution statistics (Mon -> Sun)
  const weekdayPercentages = useMemo(() => {
    return WEEKDAY_LABELS.map((label, w) => {
      const vals = dayPercentages.filter((_, i) => i % 7 === w);
      const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      return { label, value: avg };
    });
  }, [dayPercentages]);

  // Total Stars: 5 stars per habit checkmark + streak bonus
  const stars = useMemo(() => {
    return totalDone * 5 + streak * 10;
  }, [totalDone, streak]);

  // Earned Stickers / Badges calculated dynamically from real progress
  const earnedStickers: EarnedSticker[] = useMemo(() => {
    return [
      {
        id: "first-step",
        emoji: "👟",
        label: "First Step",
        description: "Created or completed your first habit",
        unlocked: totalDone >= 1,
        cost: 10,
      },
      {
        id: "7-day-streak",
        emoji: "🔥",
        label: "7-Day Streak",
        description: "Maintained a streak for 7 days",
        unlocked: bestStreak >= 7,
        cost: 20,
      },
      {
        id: "study-star",
        emoji: "📖",
        label: "Study Star",
        description: "Completed 10 or more habit checks",
        unlocked: totalDone >= 10,
        cost: 25,
      },
      {
        id: "hydration-hero",
        emoji: "💧",
        label: "Hydration Hero",
        description: "Completed 15 or more habit checks",
        unlocked: totalDone >= 15,
        cost: 20,
      },
      {
        id: "calm-mind",
        emoji: "🧘",
        label: "Calm Mind",
        description: "Maintained consistent meditation & routine",
        unlocked: totalDone >= 20,
        cost: 25,
      },
      {
        id: "goal-getter",
        emoji: "🎯",
        label: "Goal Getter",
        description: "Reached over 50% monthly completion",
        unlocked: overall >= 50,
        cost: 30,
      },
      {
        id: "perfect-month",
        emoji: "🏅",
        label: "Master of Habit",
        description: "Completed over 50 total habit checkmarks",
        unlocked: totalDone >= 50,
        cost: 50,
      },
    ];
  }, [totalDone, bestStreak, overall]);

  // Toggle checkmark handler
  const toggleCell = useCallback(
    async (habitIndex: number, day: number) => {
      const habit = habits[habitIndex];
      if (!habit) return;

      const current = grid[habitIndex]?.[day - 1] ?? false;
      const next = !current;

      if (!user) {
        // Guest mode: update guest state and broadcast to other tabs
        const nextLogs = {
          ...guestState.logs,
          [`${habit.id}_${day}`]: next,
        };
        const nextState: GuestStorageState = {
          ...guestState,
          logs: nextLogs,
        };
        setGuestState(nextState);
        try {
          localStorage.setItem("vision_guest_state_v2", JSON.stringify(nextState));
          const bc = new BroadcastChannel("vision_habits_sync");
          bc.postMessage({ type: "GUEST_STATE_UPDATE", payload: nextState });
          bc.close();
        } catch (err) {
          console.warn("Guest storage write error:", err);
        }
        return;
      }

      // Authenticated mode: save to user's isolated Firestore collection
      try {
        setSyncing(true);
        await saveUserHabitLog(user.uid, habit.id, day, next, MONTH, YEAR);

        // Optimistically update Leaderboard score
        const nextDone = next ? totalDone + 1 : Math.max(totalDone - 1, 0);
        const nextScore = Math.round((nextDone / Math.max(totalPossible, 1)) * 100);
        await syncUserLeaderboard(
          user.uid,
          user.displayName || user.email || "You",
          nextScore,
          nextDone,
          streak,
          user.photoURL || undefined,
        );
      } catch (err) {
        console.error("Failed to save habit log to Firestore:", err);
      } finally {
        setSyncing(false);
      }
    },
    [habits, grid, user, guestState, totalDone, totalPossible, streak],
  );

  // Add Habit handler
  const addHabit = useCallback(
    async (name: string, category = "Routine", goal = 30) => {
      if (!name.trim()) return;

      if (!user) {
        const newHabit: HabitItem = {
          id: `habit_${Date.now()}`,
          name: name.trim(),
          category,
          goal,
          seed: habits.length + 1,
          status: "active",
        };
        const nextState: GuestStorageState = {
          ...guestState,
          habits: [...guestState.habits, newHabit],
        };
        setGuestState(nextState);
        try {
          localStorage.setItem("vision_guest_state_v2", JSON.stringify(nextState));
          const bc = new BroadcastChannel("vision_habits_sync");
          bc.postMessage({ type: "GUEST_STATE_UPDATE", payload: nextState });
          bc.close();
        } catch (err) {
          console.warn("Guest habit add write error:", err);
        }
        return;
      }

      try {
        setSyncing(true);
        await addFirestoreHabit(user.uid, name.trim(), category, goal);
      } catch (err) {
        console.error("Failed to add habit to Firestore:", err);
      } finally {
        setSyncing(false);
      }
    },
    [user, habits.length, guestState],
  );

  // Toggle Habit Status (active <-> archived)
  const toggleHabitStatus = useCallback(
    async (habitId: string) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;
      const nextStatus: "active" | "archived" = habit.status === "archived" ? "active" : "archived";

      if (!user) {
        const nextHabits = guestState.habits.map((h) =>
          h.id === habitId ? { ...h, status: nextStatus } : h,
        );
        const nextState: GuestStorageState = {
          ...guestState,
          habits: nextHabits,
        };
        setGuestState(nextState);
        try {
          localStorage.setItem("vision_guest_state_v2", JSON.stringify(nextState));
          const bc = new BroadcastChannel("vision_habits_sync");
          bc.postMessage({ type: "GUEST_STATE_UPDATE", payload: nextState });
          bc.close();
        } catch (err) {
          console.warn("Guest status write error:", err);
        }
        return;
      }

      try {
        setSyncing(true);
        await updateFirestoreHabit(user.uid, habitId, { status: nextStatus });
      } catch (err) {
        console.error("Failed to update habit status in Firestore:", err);
      } finally {
        setSyncing(false);
      }
    },
    [habits, user, guestState],
  );

  // Delete Habit
  const deleteHabit = useCallback(
    async (habitId: string) => {
      if (!user) {
        const nextHabits = guestState.habits.filter((h) => h.id !== habitId);
        const nextState: GuestStorageState = {
          ...guestState,
          habits: nextHabits,
        };
        setGuestState(nextState);
        try {
          localStorage.setItem("vision_guest_state_v2", JSON.stringify(nextState));
          const bc = new BroadcastChannel("vision_habits_sync");
          bc.postMessage({ type: "GUEST_STATE_UPDATE", payload: nextState });
          bc.close();
        } catch (err) {
          console.warn("Guest habit delete write error:", err);
        }
        return;
      }

      try {
        setSyncing(true);
        await deleteFirestoreHabit(user.uid, habitId);
      } catch (err) {
        console.error("Failed to delete habit from Firestore:", err);
      } finally {
        setSyncing(false);
      }
    },
    [user, guestState],
  );

  const value: HabitsContextValue = useMemo(
    () => ({
      habits,
      activeHabits,
      logs: firestoreLogs,
      grid,
      dates,
      month: MONTH,
      year: YEAR,
      daysCount: DAYS_COUNT,
      dayPercentages,
      weekPercentages,
      habitCounts,
      habitPercentages,
      totalDone,
      totalPossible,
      overall,
      streak,
      bestStreak,
      weekdayPercentages,
      communityLeaderboard: communityBoard,
      syncing,
      cloudSynced,
      earnedStickers,
      stars,
      toggleCell,
      addHabit,
      toggleHabitStatus,
      deleteHabit,
    }),
    [
      habits,
      activeHabits,
      firestoreLogs,
      grid,
      dayPercentages,
      weekPercentages,
      habitCounts,
      habitPercentages,
      totalDone,
      totalPossible,
      overall,
      streak,
      bestStreak,
      weekdayPercentages,
      communityBoard,
      syncing,
      cloudSynced,
      earnedStickers,
      stars,
      toggleCell,
      addHabit,
      toggleHabitStatus,
      deleteHabit,
    ],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}
