"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAllUsers, getAvatarUrl } from "@/lib/users";
import { getAllUsersProgress, calcStreak } from "@/lib/progress";
import { currentYearMonth } from "@/lib/plan";
import { calcUserStats, getLevelName, getLevelColor, getRankEmoji } from "@/lib/gamification";
import { savePlan } from "@/lib/plan";
import type { UserStats, MonthPlan } from "@/lib/types";
import Papa from "papaparse";
import Image from "next/image";

export default function AdminPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "plan">("users");

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "admin")) {
      router.replace("/today");
    }
  }, [profile, loading, router]);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
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
      setLoadingStats(false);
    }
    load();
  }, [profile]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus("Обробляємо файл...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as Record<string, string>[];
          if (!rows.length) {
            setUploadStatus("❌ Файл порожній");
            setUploading(false);
            return;
          }

          const firstDate = rows[0]?.date || "";
          if (!firstDate.match(/^\d{4}-\d{2}/)) {
            setUploadStatus("❌ Невірний формат. Потрібно: date,theme,reading,question");
            setUploading(false);
            return;
          }

          const yearMonth = firstDate.slice(0, 7);
          const plan: MonthPlan = {
            yearMonth,
            title: "Пізнати Бога",
            days: rows.map((r) => ({
              date: r.date?.trim() || "",
              theme: r.theme?.trim() || "",
              reading: r.reading?.trim() || "",
              question: r.question?.trim() || "",
            })).filter((d) => d.date && d.theme),
          };

          await savePlan(plan);
          setUploadStatus(`✅ Завантажено ${plan.days.length} днів на ${yearMonth}`);
        } catch {
          setUploadStatus("❌ Помилка збереження");
        } finally {
          setUploading(false);
          if (fileRef.current) fileRef.current.value = "";
        }
      },
      error: () => {
        setUploadStatus("❌ Не вдалося прочитати файл");
        setUploading(false);
      },
    });
  }

  const totalUsers = stats.length;
  const activeToday = stats.filter((s) => s.totalCompleted > 0).length;
  const totalPoints = stats.reduce((sum, s) => sum + s.totalPoints, 0);

  if (loading || !profile) return null;
  if (profile.role !== "admin") return null;

  return (
    <div className="min-h-dvh animated-bg pb-10">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
              Адмін панель
            </p>
            <h1 className="text-2xl font-black gradient-text-gold">⚙️ ЄС 12/18</h1>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-sm"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--muted)" }}
          >
            ← Назад
          </button>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Учасників", value: totalUsers, color: "#8B5CF6", emoji: "👥" },
            { label: "Активних", value: activeToday, color: "#10B981", emoji: "✅" },
            { label: "Всього балів", value: totalPoints, color: "#F59E0B", emoji: "⭐" },
          ].map((s) => (
            <div key={s.label} className="glass p-3 rounded-2xl text-center">
              <div className="text-xl mb-1">{s.emoji}</div>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
          {(["users", "plan"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab ? "rgba(139,92,246,0.7)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--muted)",
              }}
            >
              {tab === "users" ? "👥 Учасники" : "📖 Завантажити план"}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {activeTab === "users" && (
          <div>
            {loadingStats ? (
              <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="glass h-20 shimmer rounded-2xl" />
                ))}
              </div>
            ) : stats.length === 0 ? (
              <div className="glass-strong p-8 rounded-2xl text-center">
                <div className="text-5xl mb-3">👥</div>
                <p className="font-bold">Ще немає учасників</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.map((s, i) => (
                  <div
                    key={s.uid}
                    className="glass p-4 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base w-6 flex-shrink-0">{getRankEmoji(i + 1)}</span>
                      <Image
                        src={s.photoURL}
                        alt={s.name}
                        width={40}
                        height={40}
                        className="rounded-full flex-shrink-0"
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{s.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            ✅ {s.totalCompleted} днів
                          </span>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            🔥 {s.currentStreak} серія
                          </span>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            💭 {s.totalReflections}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-lg" style={{ color: getLevelColor(s.totalPoints) }}>
                          {s.totalPoints}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          {getLevelName(s.totalPoints)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (s.totalCompleted / 31) * 100)}%`,
                            background: `linear-gradient(90deg, ${getLevelColor(s.totalPoints)}, ${getLevelColor(s.totalPoints)}88)`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Badges */}
                    {s.badges.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {s.badges.map((b) => (
                          <span key={b} className="text-base" title={b}>
                            {b === "first_step" ? "🌅" : b === "week_streak" ? "🔥" : b === "month_streak" ? "⚡" : b === "thinker" ? "💭" : b === "champion" ? "👑" : "🎯"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload plan tab */}
        {activeTab === "plan" && (
          <div>
            <div className="glass-strong p-5 rounded-2xl mb-4">
              <h3 className="font-bold mb-2">📤 Завантажити план читання</h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                Завантаж CSV файл з планом на місяць
              </p>

              <div
                className="rounded-xl p-4 mb-4 text-center cursor-pointer transition-all hover:border-purple-500"
                style={{
                  border: "2px dashed rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.02)",
                }}
                onClick={() => fileRef.current?.click()}
              >
                <div className="text-4xl mb-2">📁</div>
                <p className="font-semibold text-sm">Натисни щоб вибрати файл</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>CSV формат</p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />

              {uploading && (
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <div className="w-4 h-4 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Завантажуємо...
                </div>
              )}
              {uploadStatus && !uploading && (
                <p className="text-sm font-semibold" style={{
                  color: uploadStatus.startsWith("✅") ? "#10B981" : "#EF4444"
                }}>
                  {uploadStatus}
                </p>
              )}
            </div>

            <div className="glass p-4 rounded-2xl">
              <p className="text-xs font-bold mb-2" style={{ color: "var(--muted)" }}>
                Формат CSV файлу:
              </p>
              <div
                className="rounded-xl p-3 text-xs font-mono overflow-x-auto"
                style={{ background: "rgba(0,0,0,0.4)", color: "#A78BFA" }}
              >
                <p>date,theme,reading,question</p>
                <p>2026-07-01,Бог — Творець,Буття 1–2,Питання...</p>
                <p>2026-07-02,Бог шукає людину,Буття 3–4,...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
