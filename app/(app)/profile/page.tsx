"use client";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { getUserProgress, calcStreak } from "@/lib/progress";
import { currentYearMonth } from "@/lib/plan";
import { calcUserStats, getLevelName, getLevelColor, getStreakEmoji } from "@/lib/gamification";
import { BADGES } from "@/lib/types";
import { getAvatarUrl } from "@/lib/users";
import Image from "next/image";

export default function ProfilePage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ReturnType<typeof calcUserStats> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const ym = currentYearMonth();
      const progs = await getUserProgress(profile!.uid, ym);
      const s = calcUserStats(profile!.uid, profile!.name, getAvatarUrl(profile!), progs);
      setStats(s);
      setLoading(false);
    }
    load();
  }, [profile]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  if (loading || !profile) {
    return (
      <div className="page pt-6">
        <div className="glass h-40 mb-4 shimmer rounded-2xl" />
        <div className="glass h-32 shimmer rounded-2xl" />
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(profile);

  return (
    <div className="page pt-6 animate-fade-in">
      {/* Profile card */}
      <div
        className="rounded-2xl p-6 mb-4 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))",
          border: "1px solid rgba(139,92,246,0.3)",
        }}
      >
        <Image
          src={avatarUrl}
          alt={profile.name}
          width={80}
          height={80}
          className="rounded-full mx-auto mb-3 border-2"
          style={{ borderColor: "rgba(139,92,246,0.5)" }}
          unoptimized
        />
        <h2 className="text-xl font-black">{profile.name}</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{profile.email}</p>
        {profile.role === "admin" && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }}>
            👑 Адмін
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Загальні бали", value: stats.totalPoints, emoji: "⭐", color: "#8B5CF6" },
              { label: "Прочитано днів", value: stats.totalCompleted, emoji: "✅", color: "#10B981" },
              { label: "Поточна серія", value: `${getStreakEmoji(stats.currentStreak)} ${stats.currentStreak}`, emoji: "", color: "#F59E0B" },
              { label: "Написано думок", value: stats.totalReflections, emoji: "💭", color: "#3B82F6" },
            ].map((s) => (
              <div key={s.label} className="glass p-4 rounded-2xl">
                <p className="text-2xl font-black" style={{ color: s.color }}>
                  {s.emoji} {s.value}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Level */}
          <div className="glass-strong p-4 rounded-2xl mb-4">
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Твій рівень</p>
            <p className="text-lg font-black" style={{ color: getLevelColor(stats.totalPoints) }}>
              {getLevelName(stats.totalPoints)}
            </p>
          </div>

          {/* Badges */}
          {stats.badges.length > 0 && (
            <div className="glass-strong p-4 rounded-2xl mb-4">
              <p className="text-sm font-bold mb-3">🏅 Мої нагороди</p>
              <div className="grid grid-cols-2 gap-2">
                {stats.badges.map((b) => (
                  <div
                    key={b}
                    className="p-3 rounded-xl flex items-center gap-2"
                    style={{ background: `${BADGES[b].color}15`, border: `1px solid ${BADGES[b].color}30` }}
                  >
                    <span className="text-2xl">{BADGES[b].emoji}</span>
                    <div>
                      <p className="text-xs font-bold">{BADGES[b].name}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {BADGES[b].description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin link */}
      {profile.role === "admin" && (
        <button
          onClick={() => router.push("/admin")}
          className="w-full py-4 rounded-2xl font-semibold text-sm mb-3 flex items-center justify-center gap-2"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#F59E0B",
          }}
        >
          ⚙️ Адмін панель
        </button>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-4 rounded-2xl font-semibold text-sm"
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#EF4444",
        }}
      >
        Вийти з акаунту
      </button>
    </div>
  );
}
