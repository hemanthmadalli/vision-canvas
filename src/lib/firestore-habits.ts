import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  limit,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";

export type HabitItem = {
  id: string;
  name: string;
  seed: number;
  goal: number;
  category?: string;
  status?: "active" | "archived";
  createdAt?: string;
};

export type HabitLogRecord = {
  id: string;
  habitId: string;
  day: number;
  month: string;
  year: number;
  completed: boolean;
  updatedAt?: string;
};

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  totalCompleted: number;
  streak: number;
  updatedAt?: string;
};

export const defaultHabitsTemplate: Omit<HabitItem, "id">[] = [
  { name: "Review class notes", seed: 3, goal: 30, category: "Study" },
  { name: "Solve assignments", seed: 5, goal: 30, category: "Study" },
  { name: "Organize study desk", seed: 7, goal: 25, category: "Routine" },
  { name: "Read 10 pages of a book", seed: 2, goal: 30, category: "Mind" },
  { name: "Exercise for 30 minutes", seed: 11, goal: 25, category: "Health" },
  { name: "Drink 8 glasses of water", seed: 4, goal: 30, category: "Health" },
  { name: "Plan next day's schedule", seed: 6, goal: 30, category: "Routine" },
  { name: "Meditate for 10 minutes", seed: 9, goal: 20, category: "Mind" },
  { name: "Check emails and updates", seed: 13, goal: 30, category: "Routine" },
  { name: "Practice language skills", seed: 8, goal: 25, category: "Study" },
  { name: "Review flashcards", seed: 10, goal: 20, category: "Study" },
  { name: "Write in a journal", seed: 12, goal: 30, category: "Mind" },
  { name: "Solve 5 practice problems", seed: 14, goal: 25, category: "Study" },
  { name: "Connect with a classmate", seed: 15, goal: 20, category: "Social" },
];

/**
 * Fetch or initialize a user's personal habits from Firestore
 */
export async function getUserHabits(userId: string): Promise<HabitItem[]> {
  const habitsColPath = `users/${userId}/habits`;
  try {
    const snap = await getDocs(collection(db, habitsColPath));
    if (!snap.empty) {
      const items: HabitItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || "Untitled Habit",
          seed: typeof data.seed === "number" ? data.seed : 5,
          goal: typeof data.goal === "number" ? data.goal : 30,
          category: data.category || "General",
          createdAt: data.createdAt,
        });
      });
      return items;
    }

    // First time user: initialize their personalized default habits
    const batch = writeBatch(db);
    const newHabits: HabitItem[] = [];
    defaultHabitsTemplate.forEach((item, index) => {
      const habitId = `habit_${index + 1}_${item.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .slice(0, 15)}`;
      const habitDocRef = doc(db, habitsColPath, habitId);
      const habitData = {
        id: habitId,
        userId,
        name: item.name,
        seed: item.seed,
        goal: item.goal,
        category: item.category,
        createdAt: new Date().toISOString(),
      };
      batch.set(habitDocRef, habitData);
      newHabits.push({ id: habitId, ...item });
    });

    await batch.commit();
    return newHabits;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, habitsColPath);
    return [];
  }
}

/**
 * Fetch all completion logs for a user for a specific month and year
 */
export async function getUserHabitLogs(
  userId: string,
  _month: string,
  _year: number,
): Promise<HabitLogRecord[]> {
  const logsColPath = `users/${userId}/logs`;
  try {
    const snap = await getDocs(collection(db, logsColPath));
    const logs: HabitLogRecord[] = [];
    snap.forEach((d) => {
      const data = d.data();
      logs.push({
        id: d.id,
        habitId: data.habitId,
        day: Number(data.day),
        month: data.month,
        year: Number(data.year),
        completed: Boolean(data.completed),
        updatedAt: data.updatedAt,
      });
    });
    return logs;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, logsColPath);
    return [];
  }
}

/**
 * Save or toggle a user's single habit completion in Firestore
 */
export async function saveUserHabitLog(
  userId: string,
  habitId: string,
  day: number,
  completed: boolean,
  month: string,
  year: number,
): Promise<void> {
  const logDocPath = `users/${userId}/logs/${day}_${habitId}`;
  try {
    await setDoc(doc(db, logDocPath), {
      id: `${day}_${habitId}`,
      userId,
      habitId,
      day,
      month,
      year,
      completed,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, logDocPath);
  }
}

/**
 * Update user's community leaderboard document
 */
export async function syncUserLeaderboard(
  userId: string,
  displayName: string,
  score: number,
  totalCompleted: number,
  streak: number,
  photoURL?: string,
): Promise<void> {
  const boardPath = `leaderboard/${userId}`;
  try {
    await setDoc(
      doc(db, boardPath),
      {
        userId,
        displayName: displayName || "Habit Explorer",
        photoURL: photoURL || "",
        score,
        totalCompleted,
        streak,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, boardPath);
  }
}

/**
 * Fetch leaderboard rankings
 */
export async function getLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  const boardPath = "leaderboard";
  try {
    const q = query(collection(db, boardPath), limit(20));
    const snap = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snap.forEach((d) => {
      const data = d.data();
      entries.push({
        userId: d.id,
        displayName: data.displayName || "Habit Explorer",
        photoURL: data.photoURL || "",
        score: typeof data.score === "number" ? data.score : 0,
        totalCompleted: typeof data.totalCompleted === "number" ? data.totalCompleted : 0,
        streak: typeof data.streak === "number" ? data.streak : 0,
        updatedAt: data.updatedAt,
      });
    });
    return entries.sort((a, b) => b.score - a.score);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, boardPath);
    return [];
  }
}

/**
 * Real-time subscription to user's habits in Firestore.
 * Automatically synchronizes across all tabs and devices.
 */
export function subscribeUserHabits(
  userId: string,
  onUpdate: (habits: HabitItem[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const habitsColPath = `users/${userId}/habits`;
  return onSnapshot(
    collection(db, habitsColPath),
    (snap) => {
      if (snap.empty) {
        // Initialize default habits if user has no habits yet
        void getUserHabits(userId);
        return;
      }
      const items: HabitItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || "Untitled Habit",
          seed: typeof data.seed === "number" ? data.seed : 5,
          goal: typeof data.goal === "number" ? data.goal : 30,
          category: data.category || "General",
          status: data.status || "active",
          createdAt: data.createdAt,
        });
      });
      // Stable sort by creation time or id
      items.sort((a, b) => (a.createdAt || a.id).localeCompare(b.createdAt || b.id));
      onUpdate(items);
    },
    (err) => {
      console.error("Habits real-time subscription error:", err);
      onError?.(err);
    },
  );
}

/**
 * Real-time subscription to user's daily habit logs in Firestore.
 * Automatically synchronizes completion status across all tabs and devices.
 */
export function subscribeUserHabitLogs(
  userId: string,
  onUpdate: (logs: HabitLogRecord[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const logsColPath = `users/${userId}/logs`;
  return onSnapshot(
    collection(db, logsColPath),
    (snap) => {
      const logs: HabitLogRecord[] = [];
      snap.forEach((d) => {
        const data = d.data();
        logs.push({
          id: d.id,
          habitId: data.habitId,
          day: Number(data.day),
          month: data.month,
          year: Number(data.year),
          completed: Boolean(data.completed),
          updatedAt: data.updatedAt,
        });
      });
      onUpdate(logs);
    },
    (err) => {
      console.error("Habit logs real-time subscription error:", err);
      onError?.(err);
    },
  );
}

/**
 * Real-time subscription to community leaderboard.
 */
export function subscribeLeaderboard(
  onUpdate: (entries: LeaderboardEntry[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(collection(db, "leaderboard"), limit(25));
  return onSnapshot(
    q,
    (snap) => {
      const entries: LeaderboardEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        entries.push({
          userId: d.id,
          displayName: data.displayName || "Habit Explorer",
          photoURL: data.photoURL || "",
          score: typeof data.score === "number" ? data.score : 0,
          totalCompleted: typeof data.totalCompleted === "number" ? data.totalCompleted : 0,
          streak: typeof data.streak === "number" ? data.streak : 0,
          updatedAt: data.updatedAt,
        });
      });
      entries.sort((a, b) => b.score - a.score);
      onUpdate(entries);
    },
    (err) => {
      console.error("Leaderboard subscription error:", err);
      onError?.(err);
    },
  );
}

/**
 * Add a new habit to Firestore for a user
 */
export async function addUserHabit(
  userId: string,
  name: string,
  category = "Routine",
  goal = 30,
): Promise<HabitItem> {
  const habitId = `habit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const habitDocRef = doc(db, `users/${userId}/habits`, habitId);
  const newHabit: HabitItem = {
    id: habitId,
    name,
    category,
    goal,
    seed: Math.floor(Math.random() * 50) + 1,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  await setDoc(habitDocRef, {
    ...newHabit,
    userId,
  });

  return newHabit;
}

/**
 * Update habit properties (e.g. active/archived status)
 */
export async function updateUserHabit(
  userId: string,
  habitId: string,
  updates: Partial<HabitItem>,
): Promise<void> {
  const habitDocRef = doc(db, `users/${userId}/habits`, habitId);
  await updateDoc(habitDocRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a habit from Firestore
 */
export async function deleteUserHabit(userId: string, habitId: string): Promise<void> {
  const habitDocRef = doc(db, `users/${userId}/habits`, habitId);
  await deleteDoc(habitDocRef);
}
