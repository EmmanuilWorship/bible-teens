"use client";
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";
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

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const dataUrl = await compressImage(file, 128);
  await updateDoc(doc(db, "users", uid), { photoURL: dataUrl });
  return dataUrl;
}

function compressImage(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
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
