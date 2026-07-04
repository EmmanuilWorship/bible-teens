"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAllUsers, getAvatarUrl } from "@/lib/users";
import { getAllUsersProgress, calcStreak } from "@/lib/progress";
import { currentYearMonth } from "@/lib/plan";
import { calcUserStats, getRankEmoji, getStreakEmoji, getLevelName, getLevelColor } from "@/lib/gamification";
import { BADGES } from "@/lib/types";
import type { UserStats } from "@/lib/types";
import Image from "next/image";

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ym = currentYearMonth();
      const [users, allProgress] = await Promise.all([
        getAllUsers(),
        getAllUsersProgress(ym),
      ]);

      const progressByUser: Record<string, typeof allProgress> = {};
      allProgress.forEach((p) => {
        if (!progressByUser[p.uid]) progressByUser[p.uid] = [];
        progressByUser[p.uid].push(p);
      });

      const userStats = users.map((u) =>
        calcUserStats(u.uid, u.name, getAvatarUrl(u), progressByUser[u.uid] || [])
      );

      userStats.sort((a, b) => b.totalPoints - a.totalPoints);
      setStats(userStats);
      setLoading(false);
    }
    load();
  }, []);

  const myRank = stats.findIndex((s) => s.uid === profile?.uid) + 1;
  const myStats = stats.find((s) => s.uid === profile?.uid);

  if (loading) {
    return (
      <div className="page pt-6">
        <div className="glass h-28 mb-4 shimmer rounded-2xl" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass h-16 mb-3 shimmer rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="page pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
          Липень 2026
        </p>
        <h1 className="text-2xl font-black gradient-text">🏆 Рейтинг</h1>
      </div>

      {/* My position */}
      {myStats && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))",
            border: "1px solid rgba(139,92,246,0.35)",
          }}
        >
          <p className="text-xs mb-2 font-semibold" style={{ color: "var(--primary-light)" }}>
            Твоя позиція
          </p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black">{getRankEmoji(myRank)}</span>
            <div className="flex-1">
              <p className="font-bold">{myStats.name}</p>
              <p className="text-xs" style={{ color: getLevelColor(myStats.totalPoints) }}>
                {getLevelName(myStats.totalPoints)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black" style={{ color: "#A78BFA" }}>
                {myStats.totalPoints}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>балів</p>
            </div>
          </div>
          {myStats.badges.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-3">
              {myStats.badges.map((b) => (
                <span key={b} className="badge-pill" title={BADGES[b].description}>
                  {BADGES[b].emoji} {BADGES[b].name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top 3 podium */}
      {stats.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {[stats[1], stats[0], stats[2]].map((s, i) => {
            const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const heights = ["h-24", "h-32", "h-20"];
            const colors = [
              "rgba(192,192,192,0.15)",
              "rgba(255,215,0,0.15)",
              "rgba(205,127,50,0.15)",
            ];
            return (
              <div key={s.uid} className="flex flex-col items-center gap-2">
                <Image
                  src={s.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=8B5CF6&color=fff&size=64`}
                  alt={s.name}
                  width={i === 0 ? 52 : 44}
                  height={i === 0 ? 52 : 44}
                  className="rounded-full border-2"
                  style={{ borderColor: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32" }}
                  unoptimized
                />
                <p className="text-xs font-bold text-center max-w-[80px] truncate">{s.name.split(" ")[0]}</p>
                <div
                  className={`w-20 ${heights[i]} rounded-t-xl flex flex-col items-center justify-center gap-1`}
                  style={{ background: colors[i], border: `1px solid rgba(255,255,255,0.1)` }}
                >
                  <span className="text-xl">{getRankEmoji(actualRank)}</span>
                  <span className="text-xs font-black">{s.totalPoints}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="flex flex-col gap-2">
        {stats.map((s, i) => {
          const rank = i + 1;
          const isMe = s.uid === profile?.uid;
          return (
            <div
              key={s.uid}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{
                background: isMe ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)",
                border: isMe ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-base w-8 text-center font-bold flex-shrink-0">
                {getRankEmoji(rank)}
              </span>
              <Image
                src={s.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=8B5CF6&color=fff&size=64`}
                alt={s.name}
                width={36}
                height={36}
                className="rounded-full flex-shrink-0"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {s.name} {isMe && <span className="text-xs text-purple-400">(ти)</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {getStreakEmoji(s.currentStreak)} {s.currentStreak}д
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    ✅ {s.totalCompleted}
                  </span>
                  {s.badges.slice(0, 2).map((b) => (
                    <span key={b} title={BADGES[b].description} className="text-xs">
                      {BADGES[b].emoji}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black" style={{ color: getLevelColor(s.totalPoints) }}>
                  {s.totalPoints}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>балів</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
