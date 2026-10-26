"use client";

import { useRouter } from "next/navigation";
import { Bell, ChevronLeft, ScanLine } from "lucide-react";

interface AppHeaderProps {
  /** Home shows scan + bell + Logout; sub-screens show back arrow + title. */
  variant?: "home" | "sub";
  title?: string;
}

export default function AppHeader({ variant = "home", title }: AppHeaderProps) {
  const router = useRouter();

  if (variant === "sub") {
    return (
      <header className="z-20 flex items-center gap-2 bg-white px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ocbc-ink active:bg-ocbc-bg"
        >
          <ChevronLeft size={26} strokeWidth={2.25} />
        </button>
        <h1 className="text-[19px] font-bold text-ocbc-ink">{title}</h1>
      </header>
    );
  }

  return (
    <header className="z-20 flex items-center justify-between bg-white px-5 py-3">
      <button
        aria-label="Scan & Pay"
        onClick={() => router.push("/scan")}
        className="flex h-9 w-9 items-center justify-center rounded-md text-ocbc-ink active:bg-ocbc-bg"
      >
        <ScanLine size={24} strokeWidth={2} />
      </button>
      <div className="flex items-center gap-5">
        <button aria-label="Notifications" className="relative text-ocbc-ink">
          <Bell size={24} strokeWidth={2} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ocbc-red" />
        </button>
        <button className="text-[16px] font-semibold text-ocbc-blue">Logout</button>
      </div>
    </header>
  );
}
