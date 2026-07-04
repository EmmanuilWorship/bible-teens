"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getPlan, currentYearMonth, todayStr } from "@/lib/plan";
import { getAllUsersProgress, getUserProgress } from "@/lib/progress";
import { getAllUsers } from "@/lib/users";
import { groupThoughtsByDate } from "@/lib/community-thoughts";
import DayPanel from "@/components/DayPanel";
import type { DayPlan, DayProgress, MonthPlan } from "@/lib/types";
import type { CommunityThought } from "@/lib/community-thoughts";

export default function MonthPage() {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<MonthPlan | null>(null);
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
        const map: Record<string, DayProgress> = {};
        progs.forEach((pr) => (map[pr.date] = pr));
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
  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const totalDays = plan?.days.length ?? 0;
  const percent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  if (loading) {
    return (
      <div className="page pt-6">
        <div className="glass h-28 mb-4 shimmer rounded-2xl" />
        <div className="glass h-64 shimmer rounded-2xl" />
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
        <h1 className="text-2xl font-black gradient-text">Місячний план</h1>
        {plan && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Тема: {plan.title}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="glass-strong p-4 rounded-2xl mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Прогрес місяця</span>
          <span className="text-sm font-bold" style={{ color: "#10B981" }}>
            {completedCount}/{totalDays}
          </span>
        </div>
        <div className="h-3 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(90deg, #059669, #10B981)",
              boxShadow: "0 0 8px rgba(16,185,129,0.5)",
            }}
          />
        </div>
        <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
          {percent}% виконано
        </p>
      </div>

      {!plan ? (
        <div className="glass-strong p-8 rounded-2xl text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-bold">План не завантажено</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Адмін ще не завантажив план на цей місяць
          </p>
        </div>
      ) : (
        <div>
          {/* Week grouping */}
          {groupByWeek(plan.days).map((week, wi) => (
            <div key={wi} className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--muted)" }}>
                Тиждень {wi + 1} · {week[0].date.split("-")[2]}–{week[week.length - 1].date.split("-")[2]}
              </p>
              <div className="flex flex-col gap-2">
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
                      className="rounded-xl overflow-hidden transition-all"
                      style={{
                        background: isToday
                          ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))"
                          : done
                          ? "rgba(16,185,129,0.07)"
                          : "rgba(255,255,255,0.03)",
                        border: isToday
                          ? "1px solid rgba(139,92,246,0.35)"
                          : done
                          ? "1px solid rgba(16,185,129,0.15)"
                          : "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                    <button
                      type="button"
                      onClick={() => setExpandedDate(expanded ? null : day.date)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02]"
                    >
                      {/* Date circle */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{
                          background: done
                            ? "rgba(16,185,129,0.2)"
                            : isToday
                            ? "rgba(139,92,246,0.25)"
                            : "rgba(255,255,255,0.05)",
                          color: done ? "#10B981" : isToday ? "#A78BFA" : isPast ? "var(--muted)" : "#fff",
                        }}
                      >
                        {day.date.split("-")[2]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: isPast && !done ? "var(--muted)" : "#fff" }}
                        >
                          {day.theme}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                          {day.reading}
                        </p>
                      </div>

                      {/* Check */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {thoughts.length > 0 && (
                          <span className="text-xs font-bold" style={{ color: "#A78BFA" }}>
                            💭 {thoughts.length}
                          </span>
                        )}
                        {done ? <span>✅</span> : isToday ? <span>👉</span> : <span className="opacity-30">○</span>}
                        <span className="text-xs" style={{ color: "var(--muted)" }}>⌄</span>
                      </div>
                    </button>
                    {expanded && profile && (
                      <DayPanel
                        day={day}
                        progress={prog ?? null}
                        thoughts={thoughts}
                        profile={profile}
                        onMarkCompleted={(date, newProg) =>
                          setProgressMap((m) => ({ ...m, [date]: newProg }))
                        }
                      />
                    )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByWeek(days: DayPlan[]): DayPlan[][] {
  const weeks: DayPlan[][] = [];
  let current: DayPlan[] = [];

  days.forEach((day, i) => {
    current.push(day);
    const d = new Date(day.date);
    if (d.getDay() === 0 || i === days.length - 1) {
      weeks.push(current);
      current = [];
    }
  });

  if (current.length > 0) weeks.push(current);
  return weeks;
}
