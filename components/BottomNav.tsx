"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/today", icon: "📖", label: "Сьогодні" },
  { href: "/week", icon: "📅", label: "Тиждень" },
  { href: "/month", icon: "🗓", label: "Місяць" },
  { href: "/leaderboard", icon: "🏆", label: "Рейтинг" },
  { href: "/profile", icon: "👤", label: "Профіль" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="flex justify-around py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
              style={{ minWidth: 56 }}
            >
              <span
                className="text-xl transition-all"
                style={{
                  filter: active ? "none" : "grayscale(0.6) opacity(0.5)",
                  transform: active ? "scale(1.15)" : "scale(1)",
                }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[10px] font-semibold transition-colors"
                style={{ color: active ? "var(--primary-light)" : "var(--muted)" }}
              >
                {tab.label}
              </span>
              {active && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: "var(--primary-light)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
