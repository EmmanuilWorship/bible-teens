import Image from "next/image";
import Link from "next/link";
import type { CommunityThought } from "@/lib/community-thoughts";

interface CommunityThoughtsProps {
  thoughts: CommunityThought[];
  currentUid?: string;
  showTodayLink?: boolean;
}

export default function CommunityThoughts({
  thoughts,
  currentUid,
  showTodayLink = false,
}: CommunityThoughtsProps) {
  return (
    <div
      className="px-4 pb-4 pt-3"
      style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#A78BFA" }}>
        💭 Думки учасників
      </p>

      {thoughts.length === 0 ? (
        <p className="text-sm py-2" style={{ color: "var(--muted)" }}>
          Ще ніхто не поділився думкою за цей день.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {thoughts.map((thought, index) => (
            <div key={`${thought.uid}-${index}`} className="flex items-start gap-3">
              {thought.photoURL ? (
                <Image
                  src={thought.photoURL}
                  alt={thought.name}
                  width={34}
                  height={34}
                  className="rounded-full flex-shrink-0"
                  unoptimized
                />
              ) : (
                <div
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "rgba(139,92,246,0.25)", color: "#C4B5FD" }}
                >
                  {thought.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div
                className="min-w-0 flex-1 rounded-xl px-3 py-2"
                style={{ background: "rgba(0,0,0,0.2)" }}
              >
                <p className="text-xs font-bold mb-1">
                  {thought.uid === currentUid ? "Ви" : thought.name}
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {thought.reflection}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showTodayLink && (
        <Link
          href="/today"
          className="block mt-4 py-2.5 rounded-xl text-center text-sm font-bold"
          style={{ background: "rgba(139,92,246,0.22)", color: "#C4B5FD" }}
        >
          Перейти до сьогоднішнього читання →
        </Link>
      )}
    </div>
  );
}
