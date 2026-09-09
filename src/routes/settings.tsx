import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Download,
  Flame,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppMenu } from "@/components/AppMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Habit Tracker" },
      {
        name: "description",
        content:
          "Manage your personal profile, notification preferences, appearance theme, habit defaults, privacy and account settings.",
      },
      { property: "og:title", content: "Profile & Settings — Habit Tracker" },
      {
        property: "og:description",
        content:
          "Customize your habit tracker experience, review streak stats, and manage privacy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfileAndSettingsPage,
});

// Accent color choices
const ACCENT_COLORS = [
  { id: "blue", hex: "#2563eb", name: "Classic Blue" },
  { id: "teal", hex: "#06b6d4", name: "Ocean Teal" },
  { id: "amber", hex: "#f59e0b", name: "Warm Amber" },
  { id: "purple", hex: "#8b5cf6", name: "Soft Violet" },
  { id: "rose", hex: "#f43f5e", name: "Rose Pink" },
];

function ProfileAndSettingsPage() {
  const navigate = useNavigate();

  // Profile Form State
  const [profile, setProfile] = useState({
    name: "Hemanth K.",
    username: "@hemanth",
    email: "hemanth@example.com",
    bio: "Engineering student\nBuilding better habits 🧑‍💻",
    dateJoined: "June 2026",
    isVerified: true,
  });

  // Modals state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [dangerModal, setDangerModal] = useState<"clear" | "delete" | null>(null);
  const [infoModal, setInfoModal] = useState<string | null>(null);

  // Profile Preferences
  const [visibility, setVisibility] = useState("Leaderboard only");
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [showStreakPublicly, setShowStreakPublicly] = useState(true);

  // Settings: Appearance
  const [theme, setTheme] = useState<"light" | "system">("light");
  const [selectedAccent, setSelectedAccent] = useState("blue");

  // Settings: Notifications
  const [notifications, setNotifications] = useState({
    habitReminders: true,
    dailySummary: true,
    streakReminders: true,
    achievementNotifs: true,
    reminderTime: "07:30 PM",
    quietStart: "10:00 PM",
    quietEnd: "07:00 AM",
  });

  // Settings: Habit Defaults
  const [habitDefaults, setHabitDefaults] = useState({
    frequency: "Daily",
    reminder: "On",
    trackingType: "Binary",
    weekStartsOn: "Monday",
  });

  // Settings: Privacy & Leaderboard
  const [privacy, setPrivacy] = useState({
    leaderboardVisible: true,
    showName: true,
    showAvatar: true,
    showStreak: true,
    showScore: true,
  });

  const handleSaveProfile = () => {
    setProfile(tempProfile);
    setEditProfileOpen(false);
    toast.success("Profile updated successfully!");
  };

  const handleExportData = () => {
    const data = {
      profile,
      exportedAt: new Date().toISOString(),
      stats: {
        activeHabits: 6,
        bestStreak: 12,
        overallCompletion: "68%",
        stickersEarned: 14,
      },
      settings: {
        theme,
        notifications,
        habitDefaults,
        privacy,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-tracker-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Your habit data has been exported!");
  };

  const handleClearHistory = () => {
    setDangerModal(null);
    toast.success("Habit history cleared successfully.");
  };

  const handleDeleteAccount = () => {
    setDangerModal(null);
    toast.error("Account deleted. Redirecting to login...");
    setTimeout(() => {
      navigate({ to: "/login" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ----------------- TOP APP BAR (LIKE ALL OTHER PAGES) ----------------- */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <AppMenu />
          <span className="font-[family-name:Playfair_Display] text-base font-medium">
            Profile & Settings
          </span>

          {/* Action buttons on top right */}
          <div className="ml-auto flex items-center gap-2.5">
            <button
              onClick={() => toast.info("You have no unread notifications.")}
              aria-label="Notifications"
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={() => setInfoModal("Help & Support")}
              aria-label="Help"
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <div
              onClick={() => setEditProfileOpen(true)}
              className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border border-border bg-slate-800 shadow-xs transition-transform hover:scale-105"
              title="Edit Profile"
            >
              <UserAvatarIllustration />
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-2">
          {/* ============================================================ */}
          {/* LEFT COLUMN: PROFILE SECTION                                 */}
          {/* ============================================================ */}
          <section className="space-y-5">
            {/* Section Header */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Profile
                </h2>
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage your personal information and see your habit journey.
              </p>
            </div>

            {/* Profile Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-border bg-slate-800 shadow-sm">
                  <UserAvatarIllustration />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{profile.name}</h3>
                  <p className="text-xs font-medium text-muted-foreground">{profile.username}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/80">{profile.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTempProfile(profile);
                  setEditProfileOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </button>
            </div>

            {/* Personal Information Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-foreground">Personal Information</h4>
                </div>
                <button
                  onClick={() => {
                    setTempProfile(profile);
                    setEditProfileOpen(true);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Full Name</label>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{profile.name}</p>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Date Joined
                  </label>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <span className="text-muted-foreground">📅</span>
                    {profile.dateJoined}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Username</label>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{profile.username}</p>
                </div>
                <div className="row-span-2">
                  <label className="text-[11px] font-medium text-muted-foreground">Bio</label>
                  <div className="mt-0.5 whitespace-pre-line text-sm text-foreground/90">
                    {profile.bio}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Email</label>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{profile.email}</p>
                    {profile.isVerified && (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-500/20 ring-inset">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Preferences Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Shield className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-foreground">Profile Preferences</h4>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Profile visibility</p>
                      <p className="text-[11px] text-muted-foreground">
                        Choose who can see your profile and activity.
                      </p>
                    </div>
                    <div className="relative">
                      <select
                        value={visibility}
                        onChange={(e) => {
                          setVisibility(e.target.value);
                          toast.success(`Profile visibility set to ${e.target.value}`);
                        }}
                        aria-label="Profile visibility"
                        className="h-8 rounded-lg border border-border bg-muted/40 px-3 pr-8 text-xs font-medium text-foreground outline-none focus:border-blue-500"
                      >
                        <option>Leaderboard only</option>
                        <option>Public</option>
                        <option>Private</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Show me on leaderboard</p>
                    <p className="text-[11px] text-muted-foreground">
                      Your name and score can appear on the leaderboard.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={showOnLeaderboard}
                    onChange={(v) => {
                      setShowOnLeaderboard(v);
                      toast.success(`Leaderboard visibility ${v ? "enabled" : "disabled"}`);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Show my streak publicly</p>
                    <p className="text-[11px] text-muted-foreground">
                      Others can see your current streak.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={showStreakPublicly}
                    onChange={(v) => {
                      setShowStreakPublicly(v);
                      toast.success(`Public streak ${v ? "enabled" : "disabled"}`);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Your Habit Journey (Stat Badges) */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-foreground">Your Habit Journey</h4>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Metric 1 */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-center">
                  <p className="text-2xl font-black text-blue-600">6</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <span>Active Habits</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-center">
                  <p className="text-2xl font-black text-emerald-600">12</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <span>Best Streak</span>
                    <Flame className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 text-center">
                  <p className="text-2xl font-black text-amber-600">68%</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <span>Overall Completion</span>
                    <span className="text-amber-500">◑</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 text-center">
                  <p className="text-2xl font-black text-purple-600">14</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <span>Stickers Earned</span>
                    <Star className="h-3.5 w-3.5 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-foreground">Recent Achievements</h4>
                </div>
                <button
                  onClick={() => toast.info("All 14 badges unlocked this month!")}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <AchievementBadge
                  emoji="⭐"
                  title="Study Star"
                  desc="Study 7 days consistently"
                  tint="amber"
                />
                <AchievementBadge
                  emoji="🔥"
                  title="7 Day Streak"
                  desc="Maintain a streak for 7 days"
                  tint="rose"
                />
                <AchievementBadge
                  emoji="🎯"
                  title="Goal Getter"
                  desc="Complete weekly goal"
                  tint="emerald"
                />
                <AchievementBadge
                  emoji="💧"
                  title="Hydration Hero"
                  desc="Drink water 7 days"
                  tint="blue"
                />
                <div
                  onClick={() => toast.info("Next milestone: 21-Day Habit Master badge")}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-3 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/30"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-muted-foreground">
                    More to unlock
                  </p>
                </div>
              </div>
            </div>

            {/* Account & Danger Zone Bottom Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Account Actions */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-bold text-foreground">Account</h4>
                </div>

                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => setChangePasswordOpen(true)}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2.5">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Change Password
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={handleExportData}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2.5">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      Download My Data
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => navigate({ to: "/login" })}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <LogOut className="h-4 w-4 text-red-500" />
                      Logout
                    </span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-red-100 pb-3 text-red-600">
                  <ShieldAlert className="h-4 w-4" />
                  <h4 className="text-sm font-bold">Danger Zone</h4>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => setDangerModal("delete")}
                    className="flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors hover:bg-red-100/50"
                  >
                    <div>
                      <p className="text-xs font-bold text-red-700">Delete Account</p>
                      <p className="mt-0.5 text-[11px] leading-tight text-red-600/80">
                        Permanently delete your account and all associated habit data.
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: SETTINGS SECTION                               */}
          {/* ============================================================ */}
          <section className="space-y-5">
            {/* Section Header */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Settings
                </h2>
                <SettingsIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage how Habit Tracker works for you.
              </p>
            </div>

            {/* Appearance Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Palette className="h-4 w-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-foreground">Appearance</h4>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-foreground">Theme</p>
                  <p className="text-[11px] text-muted-foreground">Choose your preferred theme.</p>
                  <div className="mt-2.5 flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                      <input
                        type="radio"
                        name="theme"
                        checked={theme === "light"}
                        onChange={() => setTheme("light")}
                        className="h-4 w-4 accent-blue-600"
                      />
                      Light
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                      <input
                        type="radio"
                        name="theme"
                        checked={theme === "system"}
                        onChange={() => {
                          setTheme("system");
                          toast.success("System theme enabled");
                        }}
                        className="h-4 w-4 accent-blue-600"
                      />
                      System
                    </label>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-foreground">Accent Color</p>
                  <p className="text-[11px] text-muted-foreground">Choose your accent color.</p>
                  <div className="mt-2.5 flex items-center gap-3">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedAccent(c.id);
                          toast.success(`Accent color set to ${c.name}`);
                        }}
                        title={c.name}
                        style={{ backgroundColor: c.hex }}
                        className={`grid h-7 w-7 place-items-center rounded-full transition-transform ${
                          selectedAccent === c.id
                            ? "scale-110 ring-2 ring-blue-600 ring-offset-2"
                            : "hover:scale-105"
                        }`}
                      >
                        {selectedAccent === c.id && (
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Bell className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-foreground">Notifications</h4>
              </div>

              <div className="mt-4 space-y-3.5">
                <NotificationRow
                  title="Habit reminders"
                  desc="Get reminded about your habits."
                  checked={notifications.habitReminders}
                  onChange={(v) => setNotifications((n) => ({ ...n, habitReminders: v }))}
                />
                <NotificationRow
                  title="Daily summary"
                  desc="Receive your daily progress summary."
                  checked={notifications.dailySummary}
                  onChange={(v) => setNotifications((n) => ({ ...n, dailySummary: v }))}
                />
                <NotificationRow
                  title="Streak reminders"
                  desc="Stay motivated to maintain streaks."
                  checked={notifications.streakReminders}
                  onChange={(v) => setNotifications((n) => ({ ...n, streakReminders: v }))}
                />
                <NotificationRow
                  title="Achievement notifications"
                  desc="Get notified for new achievements."
                  checked={notifications.achievementNotifs}
                  onChange={(v) => setNotifications((n) => ({ ...n, achievementNotifs: v }))}
                />

                {/* Reminder Time Dropdown */}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Reminder time</p>
                    <div className="relative">
                      <select
                        value={notifications.reminderTime}
                        onChange={(e) => {
                          setNotifications((n) => ({ ...n, reminderTime: e.target.value }));
                          toast.success(`Reminder time set to ${e.target.value}`);
                        }}
                        aria-label="Reminder time"
                        className="flex h-8 items-center rounded-lg border border-border bg-muted/40 pl-7 pr-8 text-xs font-medium text-foreground outline-none focus:border-blue-500"
                      >
                        <option>06:00 AM</option>
                        <option>07:00 AM</option>
                        <option>08:00 AM</option>
                        <option>12:00 PM</option>
                        <option>06:00 PM</option>
                        <option>07:30 PM</option>
                        <option>09:00 PM</option>
                        <option>10:00 PM</option>
                      </select>
                      <Clock className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Quiet Hours */}
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-foreground">Quiet hours</p>
                  <p className="text-[11px] text-muted-foreground">
                    No notifications during this time.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={notifications.quietStart}
                        onChange={(e) =>
                          setNotifications((n) => ({ ...n, quietStart: e.target.value }))
                        }
                        aria-label="Quiet hours start"
                        className="h-8 w-full rounded-lg border border-border bg-muted/40 px-3 pr-7 text-xs font-medium text-foreground outline-none focus:border-blue-500"
                      >
                        <option>09:00 PM</option>
                        <option>10:00 PM</option>
                        <option>11:00 PM</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">—</span>
                    <div className="relative flex-1">
                      <select
                        value={notifications.quietEnd}
                        onChange={(e) =>
                          setNotifications((n) => ({ ...n, quietEnd: e.target.value }))
                        }
                        aria-label="Quiet hours end"
                        className="h-8 w-full rounded-lg border border-border bg-muted/40 px-3 pr-7 text-xs font-medium text-foreground outline-none focus:border-blue-500"
                      >
                        <option>06:00 AM</option>
                        <option>07:00 AM</option>
                        <option>08:00 AM</option>
                        <option>09:00 AM</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Habit Defaults Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <RotateCcw className="h-4 w-4 text-rose-500" />
                <h4 className="text-sm font-bold text-foreground">Habit Defaults</h4>
              </div>

              <div className="mt-4 space-y-3">
                <SettingSelectRow
                  label="Default frequency"
                  value={habitDefaults.frequency}
                  options={["Daily", "Weekdays", "Weekends", "Custom"]}
                  onChange={(v) => setHabitDefaults((d) => ({ ...d, frequency: v }))}
                />
                <SettingSelectRow
                  label="Default reminder"
                  value={habitDefaults.reminder}
                  options={["On", "Off"]}
                  onChange={(v) => setHabitDefaults((d) => ({ ...d, reminder: v }))}
                />
                <SettingSelectRow
                  label="Default tracking type"
                  value={habitDefaults.trackingType}
                  options={["Binary", "Numeric", "Duration"]}
                  onChange={(v) => setHabitDefaults((d) => ({ ...d, trackingType: v }))}
                />
                <SettingSelectRow
                  label="Week starts on"
                  value={habitDefaults.weekStartsOn}
                  options={["Monday", "Sunday"]}
                  onChange={(v) => setHabitDefaults((d) => ({ ...d, weekStartsOn: v }))}
                />
              </div>
            </div>

            {/* Privacy & Leaderboard Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-foreground">Privacy & Leaderboard</h4>
              </div>

              <div className="mt-4 space-y-3.5">
                <NotificationRow
                  title="Show me on leaderboard"
                  desc="Allow others to see you."
                  checked={privacy.leaderboardVisible}
                  onChange={(v) => setPrivacy((p) => ({ ...p, leaderboardVisible: v }))}
                />
                <NotificationRow
                  title="Show my name"
                  desc="Display my name on leaderboard."
                  checked={privacy.showName}
                  onChange={(v) => setPrivacy((p) => ({ ...p, showName: v }))}
                />
                <NotificationRow
                  title="Show my profile picture"
                  desc="Display my avatar on leaderboard."
                  checked={privacy.showAvatar}
                  onChange={(v) => setPrivacy((p) => ({ ...p, showAvatar: v }))}
                />
                <NotificationRow
                  title="Show my streak"
                  desc="Display my current streak."
                  checked={privacy.showStreak}
                  onChange={(v) => setPrivacy((p) => ({ ...p, showStreak: v }))}
                />
                <NotificationRow
                  title="Show my score"
                  desc="Display my consistency score."
                  checked={privacy.showScore}
                  onChange={(v) => setPrivacy((p) => ({ ...p, showScore: v }))}
                />
                <p className="pt-2 text-[11px] text-muted-foreground">
                  You can hide yourself from leaderboard at any time.
                </p>
              </div>
            </div>

            {/* Data & Storage Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Database className="h-4 w-4 text-cyan-600" />
                <h4 className="text-sm font-bold text-foreground">Data & Storage</h4>
              </div>

              <div className="mt-4 space-y-3.5 divide-y divide-border">
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Export My Data</p>
                    <p className="text-[11px] text-muted-foreground">
                      Download all your habit and progress data.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    Export
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Clear Habit History</p>
                    <p className="text-[11px] text-muted-foreground">
                      This will remove all your habit history.
                    </p>
                  </div>
                  <button
                    onClick={() => setDangerModal("clear")}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-100"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Delete Account</p>
                    <p className="text-[11px] text-muted-foreground">
                      Permanently delete your account.
                    </p>
                  </div>
                  <button
                    onClick={() => setDangerModal("delete")}
                    className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Info className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-foreground">About</h4>
              </div>

              <div className="mt-3">
                <h5 className="text-sm font-bold text-foreground">Habit Tracker</h5>
                <p className="text-[11px] text-muted-foreground">Version 1.0.0</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                  Built for consistency, not perfection.
                </p>

                <div className="mt-4 space-y-1 divide-y divide-border border-t border-border">
                  {[
                    "Help & Support",
                    "Privacy Policy",
                    "Terms of Service",
                    "About the Project",
                  ].map((title) => (
                    <button
                      key={title}
                      onClick={() => setInfoModal(title)}
                      className="flex w-full items-center justify-between py-2.5 text-xs font-medium text-foreground transition-colors hover:text-blue-600"
                    >
                      <span>{title}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ----------------- MODALS & DIALOGS ----------------- */}

      {/* 1. Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Make changes to your profile details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <input
                type="text"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Username</label>
              <input
                type="text"
                value={tempProfile.username}
                onChange={(e) => setTempProfile({ ...tempProfile, username: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <input
                type="email"
                value={tempProfile.email}
                onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Bio</label>
              <textarea
                rows={3}
                value={tempProfile.bio}
                onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setEditProfileOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Change Password</DialogTitle>
            <DialogDescription className="text-xs">
              Enter your current password and choose a strong new password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-medium text-foreground">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">New Password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setChangePasswordOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setChangePasswordOpen(false);
                toast.success("Password updated successfully!");
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Update Password
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Danger Confirmation Dialog */}
      <Dialog open={dangerModal !== null} onOpenChange={() => setDangerModal(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-red-600">
              <ShieldAlert className="h-5 w-5" />
              {dangerModal === "clear" ? "Clear Habit History?" : "Delete Account Permanently?"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {dangerModal === "clear"
                ? "This action cannot be undone. All your past monthly check-ins and streaks will be reset."
                : "This action is irreversible. Your account, profile, streak history, and badges will be permanently removed."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <button
              onClick={() => setDangerModal(null)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={dangerModal === "clear" ? handleClearHistory : handleDeleteAccount}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              {dangerModal === "clear" ? "Yes, Clear History" : "Yes, Delete Account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Info Dialog */}
      <Dialog open={infoModal !== null} onOpenChange={() => setInfoModal(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">{infoModal}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs leading-relaxed text-muted-foreground">
            {infoModal === "Help & Support" && (
              <p>
                Need assistance with your habit journey? Reach out to support at{" "}
                <span className="font-semibold text-blue-600">support@habittracker.app</span> or
                check our community guides.
              </p>
            )}
            {infoModal === "Privacy Policy" && (
              <p>
                We value your privacy. Your personal habit logs and streaks are strictly
                confidential and will never be shared without your explicit consent.
              </p>
            )}
            {infoModal === "Terms of Service" && (
              <p>
                By using Habit Tracker, you agree to build positive rituals respectfully. All scores
                are calculated fairly according to community consistency standards.
              </p>
            )}
            {infoModal === "About the Project" && (
              <p>
                Habit Tracker is an open, mindful student planner designed to celebrate small daily
                actions and steady personal growth.
              </p>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setInfoModal(null)}
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

// ----------------- HELPER SUBCOMPONENTS -----------------

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-blue-600" : "bg-muted"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function NotificationRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function SettingSelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-8 rounded-lg border border-border bg-muted/40 px-3 pr-8 text-xs font-medium text-foreground outline-none focus:border-blue-500"
        >
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

function AchievementBadge({
  emoji,
  title,
  desc,
  tint,
}: {
  emoji: string;
  title: string;
  desc: string;
  tint: "amber" | "rose" | "emerald" | "blue";
}) {
  const badgeColors = {
    amber: "border-amber-400/80 bg-amber-500/10 text-amber-500",
    rose: "border-rose-400/80 bg-rose-500/10 text-rose-500",
    emerald: "border-emerald-400/80 bg-emerald-500/10 text-emerald-500",
    blue: "border-blue-400/80 bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card p-2.5 text-center">
      {/* Octagon / Hexagon Styled Badge Container */}
      <div
        className={`grid h-10 w-10 place-items-center rounded-xl border-2 shadow-xs ${badgeColors[tint]}`}
      >
        <span className="text-lg">{emoji}</span>
      </div>
      <p className="mt-2 text-[11px] font-bold text-foreground">{title}</p>
      <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">{desc}</p>
    </div>
  );
}

function UserAvatarIllustration() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {/* Background */}
      <rect width="100" height="100" fill="#1e293b" />
      {/* Hoodie Body */}
      <path d="M15 100 C15 70, 35 60, 50 60 C65 60, 85 70, 85 100 Z" fill="#334155" />
      {/* Hoodie collar/strings */}
      <path
        d="M42 65 L44 80 M58 65 L56 80"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Neck */}
      <path d="M42 55 L58 55 L58 65 L42 65 Z" fill="#fbcfe8" />
      {/* Head */}
      <ellipse cx="50" cy="42" rx="18" ry="22" fill="#fed7aa" />
      {/* Hair */}
      <path
        d="M32 36 C32 20, 68 20, 68 36 C68 28, 62 24, 50 24 C38 24, 32 28, 32 36 Z"
        fill="#0f172a"
      />
      <path
        d="M30 40 C31 28, 69 28, 70 40 C66 32, 60 28, 50 28 C40 28, 34 32, 30 40 Z"
        fill="#0f172a"
      />
      {/* Eyes & Smile */}
      <circle cx="44" cy="42" r="2" fill="#0f172a" />
      <circle cx="56" cy="42" r="2" fill="#0f172a" />
      <path
        d="M46 49 Q50 53 54 49"
        stroke="#0f172a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
