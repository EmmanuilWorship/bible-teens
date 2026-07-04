"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { getOrCreateUser } from "./users";
import type { UserProfile } from "./types";

interface AuthContextType {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      setFirebaseUser(user);
      const fallback: UserProfile | null = user ? {
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "Учасник",
        email: user.email || "",
        photoURL: user.photoURL || "",
        role: "user",
        createdAt: Date.now(),
      } : null;

      try {
        if (user) {
          const firestoreTimeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Firestore timeout")), 3000)
          );
          const p = await Promise.race([getOrCreateUser(user), firestoreTimeout]);
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(fallback);
      } finally {
        setLoading(false);
      }
    });
    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
