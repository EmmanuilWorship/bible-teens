"use client";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { MonthPlan, DayPlan } from "./types";
import { withTimeout } from "./firestore-utils";

export function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function getPlan(yearMonth: string): Promise<MonthPlan | null> {
  const ref = doc(db, "plans", yearMonth);
  const snap = await withTimeout(getDoc(ref), null as any);
  if (!snap || !snap.exists()) return null;
  return snap.data() as MonthPlan;
}

export async function savePlan(plan: MonthPlan): Promise<void> {
  const ref = doc(db, "plans", plan.yearMonth);
  await setDoc(ref, plan);
}

export function getTodayPlan(plan: MonthPlan): DayPlan | null {
  const today = todayStr();
  return plan.days.find((d) => d.date === today) ?? null;
}

export function getWeekPlans(plan: MonthPlan): DayPlan[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const found = plan.days.find((p) => p.date === dateStr);
    if (found) days.push(found);
  }
  return days;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
}

export function formatDayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("uk-UA", { weekday: "short" });
}
