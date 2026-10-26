"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  ChevronDown,
} from "lucide-react";
import type { Recommendation } from "@/lib/mockData";
import WhyThis from "@/components/WhyThis";

/**
 * The reusable anatomy of a Guardian recommendation. Kept glanceable: the
 * customer sees the Recommended Action and Expected Outcome at a glance, and
 * can expand the full reasoning (current situation, before/after, why, and the
 * cost of doing nothing) only if they want it. Shared by the Daily Briefing
 * (read-only) and the Action Centre.
 */
export default function RecommendationBody({ rec }: { rec: Recommendation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2.5">
      {/* Recommended action — the headline */}
      <div className="flex gap-2.5 rounded-xl bg-rose-50 p-3">
        <ArrowRight size={16} className="mt-0.5 shrink-0 text-ocbc-red" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-red">
            What I&apos;d do
          </p>
          <p className="text-[13px] font-semibold text-ocbc-ink">{rec.recommendedAction}</p>
        </div>
      </div>

      {/* Expected outcome */}
      <div className="flex gap-2.5 rounded-xl bg-emerald-50/70 p-3">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ocbc-green" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-green">
            What you&apos;ll get
          </p>
          <div className="mt-0.5 space-y-1">
            {rec.outcomes.map((o) => (
              <div key={o} className="flex items-start gap-1.5">
                <Check size={13} strokeWidth={3} className="mt-0.5 shrink-0 text-ocbc-green" />
                <span className="text-[13px] text-ocbc-ink">{o}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reasoning — collapsed by default to keep the card glanceable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 text-[12.5px] font-semibold text-ocbc-blue"
      >
        Why?
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
            <div className="space-y-2.5 pt-0.5">
              {/* Current situation */}
              <div className="flex gap-2.5 rounded-xl bg-amber-50 p-3">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-ocbc-amber" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                    Right now
                  </p>
                  <p className="text-[13px] text-ocbc-ink">{rec.currentRisk}</p>
                </div>
              </div>

              {/* Before vs After */}
              <div className="rounded-xl border border-ocbc-line p-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ocbc-slate">
                  {rec.metric}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg bg-rose-50 px-3 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ocbc-red">
                      Before
                    </p>
                    <p className="mt-0.5 text-[13px] font-extrabold text-ocbc-ink">{rec.before}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-ocbc-mute" />
                  <div className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ocbc-green">
                      After
                    </p>
                    <p className="mt-0.5 text-[13px] font-extrabold text-ocbc-ink">{rec.after}</p>
                  </div>
                </div>
              </div>

              {/* Explainability */}
              <WhyThis text={rec.why} />

              {/* What happens if you do nothing */}
              <div className="flex gap-2 rounded-xl bg-ocbc-bg px-3 py-2.5">
                <Clock size={14} className="mt-0.5 shrink-0 text-ocbc-slate" />
                <p className="text-[12px] leading-snug text-ocbc-slate">
                  <span className="font-bold text-ocbc-ink">If you do nothing: </span>
                  {rec.ifIgnored}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
