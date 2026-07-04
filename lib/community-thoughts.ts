import type { DayProgress, UserProfile } from "./types";

export interface CommunityThought {
  uid: string;
  name: string;
  photoURL: string;
  reflection: string;
  completedAt: number | null;
}

export function groupThoughtsByDate(
  progress: DayProgress[],
  users: UserProfile[]
): Record<string, CommunityThought[]> {
  const usersById = new Map(users.map((user) => [user.uid, user]));
  const grouped: Record<string, CommunityThought[]> = {};

  progress.forEach((entry) => {
    const reflection = entry.reflection?.trim();
    if (!reflection) return;

    const user = usersById.get(entry.uid);
    const thought: CommunityThought = {
      uid: entry.uid,
      name: user?.name || "Учасник",
      photoURL: user?.photoURL || "",
      reflection,
      completedAt: entry.completedAt,
    };

    if (!grouped[entry.date]) grouped[entry.date] = [];
    grouped[entry.date].push(thought);
  });

  Object.values(grouped).forEach((thoughts) => {
    thoughts.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  });

  return grouped;
}
