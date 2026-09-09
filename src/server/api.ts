import { verifyToken } from "../middleware/auth.ts";
import { getOrCreateUser, getUserByUid, getAllUsers } from "../db/users.ts";
import {
  getUserHabits,
  createHabit,
  toggleHabitStatus,
  getUserHabitLogs,
  setHabitLog,
} from "../db/habits.ts";

type CreateHabitPayload = {
  id?: string;
  name: string;
  category?: string;
  kind?: string;
  seed?: number;
};

type HabitLogPayload = {
  habitId: string;
  day: number;
  completed: boolean;
  value?: number;
};

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) {
    return null;
  }

  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders });
  }

  // Health check endpoint
  if (url.pathname === "/api/health") {
    return new Response(
      JSON.stringify({ status: "ok", database: "cloud_sql_postgresql", timestamp: new Date() }),
      { status: 200, headers: jsonHeaders },
    );
  }

  // Auth check for protected endpoints
  const authHeader = request.headers.get("Authorization");
  const decodedToken = await verifyToken(authHeader);

  if (url.pathname === "/api/leaderboard" && request.method === "GET") {
    try {
      const allUsers = await getAllUsers();
      return new Response(JSON.stringify({ users: allUsers }), {
        status: 200,
        headers: jsonHeaders,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch leaderboard";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: jsonHeaders,
      });
    }
  }

  if (!decodedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized: Valid Bearer token required" }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  try {
    // Synchronize or get user from Cloud SQL
    const user = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || "user@visioncanvas.app",
      decodedToken.name || null,
      decodedToken.picture || null,
    );

    if (url.pathname === "/api/me") {
      if (request.method === "GET") {
        return new Response(JSON.stringify({ user }), { status: 200, headers: jsonHeaders });
      }
    }

    if (url.pathname === "/api/habits") {
      if (request.method === "GET") {
        const habits = await getUserHabits(user.id);
        return new Response(JSON.stringify({ habits }), { status: 200, headers: jsonHeaders });
      }

      if (request.method === "POST") {
        const body = (await request.json()) as CreateHabitPayload;
        const habit = await createHabit(user.id, body);
        return new Response(JSON.stringify({ habit }), { status: 201, headers: jsonHeaders });
      }
    }

    if (url.pathname.startsWith("/api/habits/") && url.pathname.endsWith("/toggle")) {
      const parts = url.pathname.split("/");
      const habitId = parts[3];
      if (habitId && request.method === "POST") {
        const updated = await toggleHabitStatus(user.id, habitId);
        return new Response(JSON.stringify({ habit: updated }), {
          status: 200,
          headers: jsonHeaders,
        });
      }
    }

    if (url.pathname === "/api/logs") {
      if (request.method === "GET") {
        const logs = await getUserHabitLogs(user.id);
        return new Response(JSON.stringify({ logs }), { status: 200, headers: jsonHeaders });
      }

      if (request.method === "POST") {
        const body = (await request.json()) as HabitLogPayload;
        const log = await setHabitLog(
          user.id,
          body.habitId,
          body.day,
          Boolean(body.completed),
          Number(body.value || 0),
        );
        return new Response(JSON.stringify({ log }), { status: 200, headers: jsonHeaders });
      }
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: jsonHeaders,
    });
  } catch (error: unknown) {
    console.error("API execution error:", error);
    const message = error instanceof Error ? error.message : "Internal database error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}
