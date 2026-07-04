"use client";
import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import type { UserProfile } from "./types";
import type { User } from "firebase/auth";
import { withTimeout } from "./firestore-utils";

export async function getOrCreateUser(firebaseUser: User): Promise<UserProfile> {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return snap.data() as UserProfile;

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").trim();
  const profile: UserProfile = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Учасник",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || "",
    role: firebaseUser.email === adminEmail ? "admin" : "user",
    createdAt: Date.now(),
  };

  await setDoc(ref, profile);
  return profile;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await withTimeout(getDocs(collection(db, "users")));
  if (!snap) return [];
  return snap.docs.map((d) => d.data() as UserProfile);
}

export function getAvatarUrl(user: UserProfile): string {
  if (user.photoURL) return user.photoURL;
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8B5CF6&color=fff&size=128`;
}
