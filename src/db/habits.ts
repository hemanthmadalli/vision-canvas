import { and, eq } from "drizzle-orm";
import { db } from "./index.ts";
import { habitLogs, habits } from "./schema.ts";

const DEFAULT_HABITS = [
  { id: "notes", name: "Review class notes", category: "Study", kind: "duration", seed: 3 },
  { id: "assign", name: "Solve assignments", category: "Study", kind: "binary", seed: 5 },
  { id: "read", name: "Read 10 pages", category: "Mind", kind: "numeric", seed: 2 },
  { id: "exercise", name: "Exercise 30 min", category: "Body", kind: "duration", seed: 11 },
  { id: "water", name: "Drink 8 glasses of water", category: "Body", kind: "numeric", seed: 4 },
  { id: "plan", name: "Plan next day", category: "Routine", kind: "binary", seed: 6 },
  { id: "meditate", name: "Meditate 10 min", category: "Mind", kind: "duration", seed: 9 },
];

export async function getUserHabits(userId: number) {
  try {
    let list = await db.select().from(habits).where(eq(habits.userId, userId));
    if (list.length === 0) {
      // Seed default habits for new user
      for (const h of DEFAULT_HABITS) {
        await db.insert(habits).values({
          id: `${h.id}-${userId}`,
          userId,
          name: h.name,
          category: h.category,
          kind: h.kind,
          seed: h.seed,
          status: "active",
        });
      }
      list = await db.select().from(habits).where(eq(habits.userId, userId));
    }
    return list;
  } catch (error) {
    console.error("Database getUserHabits failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function createHabit(
  userId: number,
  data: { id?: string; name: string; category?: string; kind?: string; seed?: number },
) {
  try {
    const habitId = data.id || `h-${Date.now()}`;
    const result = await db
      .insert(habits)
      .values({
        id: habitId,
        userId,
        name: data.name,
        category: data.category || "Routine",
        kind: data.kind || "binary",
        status: "active",
        seed: data.seed ?? Math.floor(Math.random() * 50) + 1,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database createHabit failed:", error);
    throw new Error("Database operation failed. Please try again later.", { cause: error });
  }
}

export async function toggleHabitStatus(userId: number, habitId: string) {
  try {
    const existing = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
    if (!existing[0]) return null;

    const nextStatus = existing[0].status === "active" ? "archived" : "active";
    const updated = await db
      .update(habits)
      .set({ status: nextStatus })
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Database toggleHabitStatus failed:", error);
    throw new Error("Database operation failed. Please try again later.", { cause: error });
  }
}

export async function getUserHabitLogs(userId: number) {
  try {
    return await db.select().from(habitLogs).where(eq(habitLogs.userId, userId));
  } catch (error) {
    console.error("Database getUserHabitLogs failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function setHabitLog(
  userId: number,
  habitId: string,
  day: number,
  completed: boolean,
  value: number = 0,
) {
  try {
    const existing = await db
      .select()
      .from(habitLogs)
      .where(
        and(eq(habitLogs.userId, userId), eq(habitLogs.habitId, habitId), eq(habitLogs.day, day)),
      );

    if (existing[0]) {
      const updated = await db
        .update(habitLogs)
        .set({ completed, value })
        .where(eq(habitLogs.id, existing[0].id))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(habitLogs)
        .values({
          userId,
          habitId,
          day,
          completed,
          value,
        })
        .returning();
      return inserted[0];
    }
  } catch (error) {
    console.error("Database setHabitLog failed:", error);
    throw new Error("Database operation failed. Please try again later.", { cause: error });
  }
}
