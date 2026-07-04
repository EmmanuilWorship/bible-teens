"use client";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import type { DayProgress } from "./types";

export function progressId(uid: string, date: string) {
  return `${uid}_${date}`;
}

export async function getProgress(uid: string, date: string): Promise<DayProgress | null> {
  const ref = doc(db, "progress", progressId(uid, date));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as DayProgress;
}

export async function markCompleted(
  uid: string,
  date: string,
  reflection: string
): Promise<DayProgress> {
  const existing = await getProgress(uid, date);
  const points = 10 + (reflection.trim().length > 20 ? 5 : 0);
  const data: DayProgress = {
    uid,
    date,
    completed: true,
    reflection: reflection.trim(),
    completedAt: Date.now(),
    points: existing?.completed ? existing.points : points,
  };
  await setDoc(doc(db, "progress", progressId(uid, date)), data);
  return data;
}

export async function getUserProgress(uid: string, yearMonth: string): Promise<DayProgress[]> {
  const q = query(
    collection(db, "progress"),
    where("uid", "==", uid),
    where("date", ">=", yearMonth + "-01"),
    where("date", "<=", yearMonth + "-31")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DayProgress);
}

export async function getAllUsersProgress(yearMonth: string): Promise<DayProgress[]> {
  const q = query(
    collection(db, "progress"),
    where("date", ">=", yearMonth + "-01"),
    where("date", "<=", yearMonth + "-31")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DayProgress);
}

export function calcStreak(progressList: DayProgress[]): { current: number; longest: number } {
  if (!progressList.length) return { current: 0, longest: 0 };

  const completed = progressList
    .filter((p) => p.completed)
    .map((p) => p.date)
    .sort();

  if (!completed.length) return { current: 0, longest: 0 };

  let longest = 1;
  let current = 1;
  let tempStreak = 1;

  for (let i = 1; i < completed.length; i++) {
    const prev = new Date(completed[i - 1]);
    const curr = new Date(completed[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      tempStreak++;
      if (tempStreak > longest) longest = tempStreak;
    } else if (diff > 1) {
      tempStreak = 1;
    }
  }

  const today = new Date();
  const lastDate = new Date(completed[completed.length - 1]);
  const daysSinceLast = Math.floor(
    (today.getTime() - lastDate.getTime()) / 86400000
  );
  current = daysSinceLast <= 1 ? tempStreak : 0;

  return { current, longest };
}
