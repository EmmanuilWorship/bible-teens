"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getPlan, getTodayPlan, currentYearMonth, todayStr, formatDate } from "@/lib/plan";
import { getProgress, markCompleted, getUserProgress, calcStreak } from "@/lib/progress";
import { getLevelName, getLevelColor, getStreakEmoji } from "@/lib/gamification";
import type { DayPlan, DayProgress, MonthPlan } from "@/lib/types";

export default function TodayPage() {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<MonthPlan | null>(null);
  const [today, setToday] = useState<DayPlan | null>(null);
  const [progress, setProgress] = useState<DayProgress | null>(null);
  const [allProgress, setAllProgress] = useState<DayProgress[]>([]);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      try {
        const ym = currentYearMonth();
        const p = await getPlan(ym);
        setPlan(p);
        if (p) setToday(getTodayPlan(p));
        try {
          const prog = await getProgress(profile!.uid, todayStr());
          setProgress(prog);
          if (prog?.reflection) setReflection(prog.reflection);
        } catch {}
        try {
          const all = await getUserProgress(profile!.uid, ym);
          setAllProgress(all);
        } catch {}
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  const totalPoints = allProgress.reduce((s, p) => s + (p.points || 0), 0);
  const { current: streak } = calcStreak(allProgress);
  const totalCompleted = allProgress.filter((p) => p.completed).length;

  async function handleMark() {
    if (!profile || !today || saving) return;
    setSaving(true);
    const prog = await markCompleted(profile.uid, todayStr(), reflection);
    setProgress(prog);
    const all = await getUserProgress(profile.uid, currentYearMonth());
    setAllProgress(all);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="page pt-6">
        <div className="glass h-28 mb-4 shimmer rounded-2xl" />
        <div className="glass h-64 mb-4 shimmer rounded-2xl" />
        <div className="glass h-32 shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--muted)" }}>
            {new Date().toLocaleDateString("uk-UA", { weekday: "long" })}
          </p>
          <h1 className="text-2xl font-black">
            Привіт, {profile?.name.split(" ")[0]} 👋
          </h1>
        </div>
        <div className="streak-badge">
          {getStreakEmoji(streak)} {streak}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Балів", value: totalPoints, color: "#8B5CF6" },
          { label: "Днів", value: totalCompleted, color: "#10B981" },
          { label: "Серія", value: streak, color: "#F59E0B" },
        ].map((s) => (
          <div key={s.label} className="glass p-3 text-center rounded-2xl">
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Level */}
      <div className="glass p-3 rounded-2xl mb-5 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${getLevelColor(totalPoints)}22`, border: `1px solid ${getLevelColor(totalPoints)}44` }}
        >
          ⭐
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Твій рівень</p>
          <p className="font-bold text-sm" style={{ color: getLevelColor(totalPoints) }}>
            {getLevelName(totalPoints)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--muted)" }}>до наступного</p>
          <p className="text-sm font-bold">{Math.max(0, nextLevel(totalPoints) - totalPoints)} балів</p>
        </div>
      </div>

      {/* Today's reading */}
      {!today ? (
        <div className="glass-strong p-6 rounded-2xl text-center mb-4">
          <div className="text-5xl mb-3">🌙</div>
          <p className="font-bold text-lg mb-1">На сьогодні немає читання</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Перевір план на тиждень</p>
        </div>
      ) : (
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(79,70,229,0.15) 100%)",
            border: "1px solid rgba(139,92,246,0.3)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--primary-light)" }}>
                📅 {formatDate(today.date)}
              </p>
              <h2 className="text-xl font-black leading-tight">{today.theme}</h2>
            </div>
            {progress?.completed && (
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: "rgba(16,185,129,0.2)", border: "1.5px solid #10B981" }}
              >
                ✓
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "rgba(0,0,0,0.3)" }}>
            <span className="text-base">📚</span>
            <span className="font-semibold text-sm">{today.reading}</span>
          </div>

          <div className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>💭 Питання дня</p>
            <p className="text-sm leading-relaxed">{today.question}</p>
          </div>
        </div>
      )}

      {/* Reflection */}
      {today && (
        <div className="glass-strong p-4 rounded-2xl mb-4">
          <p className="text-sm font-semibold mb-2">
            ✍️ Мої думки
            <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>+5 балів</span>
          </p>
          <textarea
            className="input-dark mb-3"
            placeholder="Що Бог показав мені сьогодні..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            disabled={!!progress?.completed}
          />
          {!progress?.completed ? (
            <button className="btn-success w-full" onClick={handleMark} disabled={saving}>
              {saving ? "⏳ Зберігаємо..." : saved ? "✅ Збережено!" : "✅ Прочитав(ла)! (+10 балів)"}
            </button>
          ) : (
            <div
              className="w-full py-3 rounded-2xl text-center font-semibold text-sm"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981" }}
            >
              ✅ Виконано сьогодні · +{progress.points} балів
            </div>
          )}
        </div>
      )}

      {/* Daily question */}
      <div className="glass p-4 rounded-2xl mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--warning)" }}>
          🌟 Щоденне запитання
        </p>
        <p className="font-semibold text-sm leading-relaxed">Яким я сьогодні побачив(ла) Бога?</p>
      </div>
    </div>
  );
}

function nextLevel(points: number): number {
  const levels = [50, 150, 300, 500, 750, 1000];
  return levels.find((l) => l > points) ?? 1000;
}
