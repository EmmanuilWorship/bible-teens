"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { getOrCreateUser } from "./users";
import { withTimeout } from "./firestore-utils";
import type { UserProfile } from "./types";

interface AuthContextType {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  setProfile: (p: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  profile: null,
  loading: true,
  profileLoading: true,
  setProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setProfileLoading(false);
    }, 5000);

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

      // Authentication is ready at this point. Do not block every route while
      // the optional Firestore profile request is still in flight.
      setProfile(fallback);
      setLoading(false);

      try {
        if (user) {
          const savedProfile = await withTimeout(getOrCreateUser(user), 3000);
          if (savedProfile) setProfile(savedProfile);
        }
      } catch {
      } finally {
        setProfileLoading(false);
      }
    });
    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, profileLoading, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
