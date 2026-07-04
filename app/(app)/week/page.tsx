"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getPlan, getWeekPlans, currentYearMonth, todayStr, formatDayOfWeek } from "@/lib/plan";
import { getAllUsersProgress, getUserProgress } from "@/lib/progress";
import { getAllUsers } from "@/lib/users";
import { groupThoughtsByDate } from "@/lib/community-thoughts";
import CommunityThoughts from "@/components/CommunityThoughts";
import type { DayPlan, DayProgress, MonthPlan } from "@/lib/types";
import type { CommunityThought } from "@/lib/community-thoughts";

export default function WeekPage() {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<MonthPlan | null>(null);
  const [week, setWeek] = useState<DayPlan[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, DayProgress>>({});
  const [thoughtsByDate, setThoughtsByDate] = useState<Record<string, CommunityThought[]>>({});
  const [expandedDate, setExpandedDate] = useState<string | null>(todayStr());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      try {
        const ym = currentYearMonth();
        const [p, progs, communityProgress, users] = await Promise.all([
          getPlan(ym),
          getUserProgress(profile!.uid, ym),
          getAllUsersProgress(ym).catch(() => []),
          getAllUsers().catch(() => []),
        ]);
        setPlan(p);
        if (p) setWeek(getWeekPlans(p));
        const map: Record<string, DayProgress> = {};
        progs.forEach((p) => (map[p.date] = p));
        setProgressMap(map);
        setThoughtsByDate(groupThoughtsByDate(communityProgress, users));
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  const today = todayStr();

  if (loading) {
    return (
      <div className="page pt-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="glass h-20 mb-3 shimmer rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="page pt-6 animate-fade-in">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
          Цей тиждень
        </p>
        <h1 className="text-2xl font-black gradient-text">Тижневий план</h1>
        {plan && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Тема: {plan.title}
          </p>
        )}
      </div>

      {week.length === 0 ? (
        <div className="glass-strong p-8 rounded-2xl text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-bold">План не знайдено</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Адмін ще не завантажив план
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {week.map((day) => {
            const prog = progressMap[day.date];
            const done = !!prog?.completed;
            const isToday = day.date === today;
            const isPast = day.date < today;
            const thoughts = thoughtsByDate[day.date] || [];
            const expanded = expandedDate === day.date;

            return (
              <div
                key={day.date}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: isToday
                    ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.15))"
                    : done
                    ? "rgba(16,185,129,0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: isToday
                    ? "1px solid rgba(139,92,246,0.4)"
                    : done
                    ? "1px solid rgba(16,185,129,0.2)"
                    : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedDate(expanded ? null : day.date)}
                  className="w-full p-4 text-left transition-all hover:bg-white/[0.02]"
                >
                <div className="flex items-center gap-3">
                  {/* Day indicator */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                    style={{
                      background: isToday
                        ? "rgba(139,92,246,0.25)"
                        : done
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <span className="text-xs font-bold uppercase" style={{
                      color: isToday ? "#A78BFA" : done ? "#10B981" : "var(--muted)"
                    }}>
                      {formatDayOfWeek(day.date)}
                    </span>
                    <span className="text-lg font-black" style={{
                      color: isToday ? "#fff" : done ? "#10B981" : isPast ? "var(--muted)" : "#fff"
                    }}>
                      {day.date.split("-")[2]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{day.theme}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>
                      📚 {day.reading}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2">
                      {thoughts.length > 0 && (
                        <span className="text-xs font-bold" style={{ color: "#A78BFA" }}>
                          💭 {thoughts.length}
                        </span>
                      )}
                      {done && <div className="day-check done">✓</div>}
                      <span className="text-xs transition-transform" style={{ color: "var(--muted)", transform: expanded ? "rotate(180deg)" : "none" }}>⌄</span>
                    </div>
                  </div>
                </div>

                {isToday && (
                  <p className="text-xs mt-2 pl-15" style={{ color: "var(--primary-light)", paddingLeft: "60px" }}>
                    ✨ Сьогоднішнє читання
                  </p>
                )}
                </button>
                {expanded && (
                  <CommunityThoughts
                    thoughts={thoughts}
                    currentUid={profile?.uid}
                    showTodayLink={isToday}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
