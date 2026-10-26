"use client";

import { Delete } from "lucide-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];

/** Shared numeric amount keypad for PayNow and Scan & Pay. */
export default function Keypad({ onPress }: { onPress: (k: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden bg-ocbc-line">
      {KEYS.map((k) => (
        <button
          key={k}
          onClick={() => onPress(k)}
          className="flex h-14 items-center justify-center bg-white text-[22px] font-semibold text-ocbc-ink active:bg-ocbc-bg"
        >
          {k === "del" ? <Delete size={22} className="text-ocbc-slate" /> : k}
        </button>
      ))}
    </div>
  );
}
