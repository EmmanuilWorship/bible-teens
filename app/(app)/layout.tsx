"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) router.replace("/login");
  }, [firebaseUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-dvh animated-bg flex flex-col items-center justify-center gap-6">
        <img
          src="/ekklesia.png"
          alt="Єклесія"
          className="w-24 h-24 rounded-full"
          style={{ boxShadow: "0 0 40px rgba(139,92,246,0.4)" }}
        />
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) return null;

  return (
    <div className="animated-bg min-h-dvh">
      {children}
      <BottomNav />
    </div>
  );
}
