import type { DayProgress, BadgeId, UserStats } from "./types";
import { calcStreak } from "./progress";

export function calcUserStats(
  uid: string,
  name: string,
  photoURL: string,
  progressList: DayProgress[]
): UserStats {
  const completed = progressList.filter((p) => p.completed);
  const totalPoints = completed.reduce((sum, p) => sum + (p.points || 0), 0);
  const totalCompleted = completed.length;
  const totalReflections = completed.filter((p) => p.reflection?.length > 20).length;
  const { current: currentStreak, longest: longestStreak } = calcStreak(completed);

  const badges: BadgeId[] = [];
  if (totalCompleted >= 1) badges.push("first_step");
  if (currentStreak >= 7 || longestStreak >= 7) badges.push("week_streak");
  if (currentStreak >= 30 || longestStreak >= 30) badges.push("month_streak");
  if (totalReflections >= 10) badges.push("thinker");
  if (totalCompleted >= 20) badges.push("excellent");

  return {
    uid,
    name,
    photoURL,
    totalPoints,
    currentStreak,
    longestStreak,
    totalCompleted,
    totalReflections,
    badges,
  };
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}.`;
}

export function getStreakEmoji(streak: number): string {
  if (streak === 0) return "💤";
  if (streak < 3) return "🌱";
  if (streak < 7) return "🔥";
  if (streak < 14) return "⚡";
  if (streak < 30) return "💎";
  return "👑";
}

export function getLevelName(points: number): string {
  if (points < 50) return "Початківець";
  if (points < 150) return "Учень";
  if (points < 300) return "Шукач";
  if (points < 500) return "Вірний";
  if (points < 750) return "Мудрець";
  return "Чемпіон";
}

export function getLevelColor(points: number): string {
  if (points < 50) return "#6B7280";
  if (points < 150) return "#10B981";
  if (points < 300) return "#3B82F6";
  if (points < 500) return "#8B5CF6";
  if (points < 750) return "#F59E0B";
  return "#EF4444";
}
