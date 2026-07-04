"use client";
import { useState } from "react";
import { markCompleted } from "@/lib/progress";
import { formatDate } from "@/lib/plan";
import CommunityThoughts from "./CommunityThoughts";
import type { DayPlan, DayProgress, UserProfile } from "@/lib/types";
import type { CommunityThought } from "@/lib/community-thoughts";

interface DayPanelProps {
  day: DayPlan;
  progress: DayProgress | null;
  thoughts: CommunityThought[];
  profile: UserProfile;
  onMarkCompleted: (date: string, prog: DayProgress) => void;
}

export default function DayPanel({ day, progress, thoughts, profile, onMarkCompleted }: DayPanelProps) {
  const [reflection, setReflection] = useState(progress?.reflection ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localProgress, setLocalProgress] = useState<DayProgress | null>(progress);
  const [showThoughts, setShowThoughts] = useState(false);

  async function handleMark() {
    if (saving || localProgress?.completed) return;
    setSaving(true);
    try {
      const prog = await markCompleted(profile.uid, day.date, reflection);
      setLocalProgress(prog);
      onMarkCompleted(day.date, prog);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Mark failed:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-3 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Reading card */}
      <div
        className="rounded-2xl p-4 mt-3 mb-3"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))",
          border: "1px solid rgba(139,92,246,0.25)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary-light)" }}>
          📅 {formatDate(day.date)}
        </p>
        <h3 className="text-base font-black mb-3 leading-tight">{day.theme}</h3>
        <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "rgba(0,0,0,0.3)" }}>
          <span>📚</span>
          <span className="font-semibold text-sm">{day.reading}</span>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>💭 Питання дня</p>
          <p className="text-sm leading-relaxed">{day.question}</p>
        </div>
      </div>

      {/* Reflection + mark */}
      <div className="glass-strong p-4 rounded-2xl mb-3">
        <p className="text-sm font-semibold mb-2">
          ✍️ Мої думки
          <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>+5 балів</span>
        </p>
        <textarea
          className="input-dark mb-3"
          placeholder="Що Бог показав мені..."
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          disabled={!!localProgress?.completed}
          rows={3}
        />
        {!localProgress?.completed ? (
          <button className="btn-success w-full" onClick={handleMark} disabled={saving}>
            {saving ? "⏳ Зберігаємо..." : saved ? "✅ Збережено!" : "✅ Прочитав(ла)! (+10 балів)"}
          </button>
        ) : (
          <div
            className="w-full py-3 rounded-2xl text-center font-semibold text-sm"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10B981",
            }}
          >
            ✅ Виконано · +{localProgress.points} балів
          </div>
        )}
      </div>

      {/* Community thoughts */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowThoughts((v) => !v)}
          className="w-full p-4 flex items-center justify-between gap-3 text-left"
        >
          <div>
            <p className="font-bold text-sm">💭 Думки учасників</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {thoughts.length > 0 ? `${thoughts.length} ${countLabel(thoughts.length)}` : "Ще немає відповідей"}
            </p>
          </div>
          <span
            className="text-sm transition-transform"
            style={{ color: "var(--muted)", transform: showThoughts ? "rotate(180deg)" : "none" }}
          >
            ⌄
          </span>
        </button>
        {showThoughts && <CommunityThoughts thoughts={thoughts} currentUid={profile.uid} showTitle={false} />}
      </div>
    </div>
  );
}

function countLabel(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return "думка";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "думки";
  return "думок";
}
