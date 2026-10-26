"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";

/**
 * Explainability disclosure — "Why am I seeing this?".
 * Smoothly reveals the AI's reasoning so insights are never a black box.
 */
export default function WhyThis({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 text-[12.5px] font-semibold text-ocbc-blue"
      >
        <HelpCircle size={14} />
        Why am I seeing this?
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-2 rounded-xl bg-sky-50 p-3 text-[12.5px] leading-relaxed text-ocbc-slate">
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
