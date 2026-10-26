"use client";

import { useRouter } from "next/navigation";
import { Home, Sprout, ArrowLeftRight, Gift, LayoutGrid } from "lucide-react";

const items = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Plan", icon: Sprout, href: "/guardian" },
  { label: "Pay & Transfer", icon: ArrowLeftRight, href: "/paynow", center: true },
  { label: "Rewards", icon: Gift },
  { label: "More", icon: LayoutGrid },
] as const;

export default function BottomNav({ active = "Home" }: { active?: string }) {
  const router = useRouter();
  return (
    <nav className="z-20 flex items-end justify-between border-t border-ocbc-line bg-white px-3 pt-2 pb-5 shadow-nav">
      {items.map((item) => {
        const { label, icon: Icon } = item;
        const href = "href" in item ? item.href : undefined;
        const center = "center" in item ? item.center : false;
        const isActive = label === active;
        return (
          <button
            key={label}
            onClick={() => href && router.push(href)}
            className="flex flex-1 flex-col items-center gap-1 active:opacity-60"
          >
            {center ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ocbc-ink">
                <Icon size={20} strokeWidth={2} className="text-ocbc-ink" />
              </span>
            ) : (
              <Icon
                size={22}
                strokeWidth={2}
                className={isActive ? "text-ocbc-red" : "text-ocbc-ink"}
              />
            )}
            <span
              className={`text-[10.5px] leading-none ${
                isActive ? "font-semibold text-ocbc-red" : "text-ocbc-slate"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
