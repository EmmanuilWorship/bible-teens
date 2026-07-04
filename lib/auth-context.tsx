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
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      try {
        if (user) {
          const p = await getOrCreateUser(user);
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("Auth error:", e);
        if (user) {
          setProfile({
            uid: user.uid,
            name: user.displayName || user.email?.split("@")[0] || "Учасник",
            email: user.email || "",
            photoURL: user.photoURL || "",
            role: "user",
            createdAt: Date.now(),
          });
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });
    return unsub;
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
