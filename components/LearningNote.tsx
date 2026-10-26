"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * The "AI learning" moment shown after a customer decision — Guardian
 * acknowledges the choice and tells the customer it will shape future advice.
 * Reinforces that the assistant adapts, without ever acting on its own.
 */
export default function LearningNote({
  text = "I'll keep today's choice in mind next time.",
  delay = 0,
}: {
  text?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="overflow-hidden rounded-xl2 bg-white shadow-card ring-1 ring-black/[0.04]"
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocbc-red/10 text-ocbc-red">
          <Sparkles size={17} strokeWidth={2.25} />
          <motion.span
            className="absolute inset-0 rounded-full ring-2 ring-ocbc-red/30"
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-ocbc-ink">
            I&apos;ve learned from this
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-ocbc-slate">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}
