import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  region: text("region").default("Karnataka, IN"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Habits table
export const habits = pgTable("habits", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Routine"),
  kind: text("kind").notNull().default("binary"),
  status: text("status").notNull().default("active"),
  seed: integer("seed").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Habit daily logs table
export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  habitId: text("habit_id")
    .references(() => habits.id)
    .notNull(),
  day: integer("day").notNull(), // 1-30
  completed: boolean("completed").notNull().default(false),
  value: integer("value").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  habitLogs: many(habitLogs),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  user: one(users, {
    fields: [habitLogs.userId],
    references: [users.id],
  }),
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}));
