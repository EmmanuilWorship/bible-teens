export interface DayPlan {
  date: string;       // "2026-07-01"
  theme: string;      // "Бог — Творець"
  reading: string;    // "Буття 1–2"
  question: string;   // "Що ці розділи показують..."
}

export interface MonthPlan {
  yearMonth: string;  // "2026-07"
  title: string;      // "Пізнати Бога"
  days: DayPlan[];
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: "admin" | "user";
  createdAt: number;
}

export interface DayProgress {
  uid: string;
  date: string;
  completed: boolean;
  reflection: string;
  completedAt: number | null;
  points: number;
}

export interface UserStats {
  uid: string;
  name: string;
  photoURL: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalReflections: number;
  badges: BadgeId[];
}

export type BadgeId =
  | "first_step"
  | "week_streak"
  | "month_streak"
  | "thinker"
  | "champion"
  | "excellent";

export interface Badge {
  id: BadgeId;
  emoji: string;
  name: string;
  description: string;
  color: string;
}

export const BADGES: Record<BadgeId, Badge> = {
  first_step: {
    id: "first_step",
    emoji: "🌅",
    name: "Перший крок",
    description: "Перше прочитання",
    color: "#10B981",
  },
  week_streak: {
    id: "week_streak",
    emoji: "🔥",
    name: "Тиждень вогню",
    description: "7 днів поспіль",
    color: "#F59E0B",
  },
  month_streak: {
    id: "month_streak",
    emoji: "⚡",
    name: "Місяць сили",
    description: "30 днів поспіль",
    color: "#8B5CF6",
  },
  thinker: {
    id: "thinker",
    emoji: "💭",
    name: "Мислитель",
    description: "10 роздумів написано",
    color: "#3B82F6",
  },
  champion: {
    id: "champion",
    emoji: "👑",
    name: "Чемпіон",
    description: "Повний місяць виконано",
    color: "#F59E0B",
  },
  excellent: {
    id: "excellent",
    emoji: "🎯",
    name: "Відмінник",
    description: "20+ днів у місяці",
    color: "#EC4899",
  },
};
