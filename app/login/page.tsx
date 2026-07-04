"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && firebaseUser) router.replace("/today");
  }, [firebaseUser, loading, router]);

  async function handleGoogle() {
    setBusy(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace("/today");
    } catch {
      setError("Не вдалося увійти через Google");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "register") {
        if (!name.trim()) { setError("Введи своє ім'я"); setBusy(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace("/today");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential")
        setError("Невірний email або пароль");
      else if (code === "auth/email-already-in-use")
        setError("Цей email вже зареєстровано");
      else if (code === "auth/weak-password")
        setError("Пароль має бути мінімум 6 символів");
      else
        setError("Помилка. Спробуй ще раз");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh animated-bg flex flex-col items-center justify-center px-5 py-10">
      {/* Logo */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl glass-strong flex items-center justify-center mx-auto mb-4 text-4xl">
          📖
        </div>
        <h1 className="text-3xl font-black gradient-text mb-1">ЄС 12/18</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Читання Біблії · Липень 2026
        </p>
      </div>

      {/* Card */}
      <div className="glass-strong w-full max-w-sm p-6 animate-slide-up">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: mode === m ? "rgba(139,92,246,0.8)" : "transparent",
                color: mode === m ? "#fff" : "var(--muted)",
              }}
            >
              {m === "login" ? "Увійти" : "Реєстрація"}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmail} className="flex flex-col gap-3">
          {mode === "register" && (
            <input
              className="input-dark"
              placeholder="Твоє ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="input-dark"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input-dark"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
          <button type="submit" className="btn-primary mt-1" disabled={busy}>
            {busy ? "⏳" : mode === "login" ? "Увійти" : "Зареєструватись"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>або</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Увійти через Google
        </button>
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: "var(--muted)" }}>
        Тема місяця: <span className="text-purple-400 font-semibold">Пізнати Бога</span>
      </p>
    </div>
  );
}
