"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Check, Lock, TrendingUp, ArrowRight } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import HoldToApprove from "@/components/HoldToApprove";
import PageTransition from "@/components/PageTransition";
import RecommendationBody from "@/components/RecommendationBody";
import { GuardianExecution } from "@/components/GuardianSequence";
import { useGuardian } from "@/components/GuardianStateProvider";
import {
  combinedRiskReduction,
  planConfidence,
  guardianAnalysis,
  formatSGD,
} from "@/lib/mockData";

export default function ActionCentrePage() {
  const router = useRouter();
  const { approvePlan, guardian, projectedMonthEnd } = useGuardian();
  // The selectable plan IS the live Guardian recommendation set, so it always
  // matches the customer's current situation.
  const recommendations = guardian.recommendations;
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(recommendations.map((r) => [r.id, r.defaultSelected]))
  );
  const [executing, setExecuting] = useState(false);

  const toggle = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  const selectedIds = useMemo(
    () => recommendations.filter((r) => selected[r.id]).map((r) => r.id),
    [recommendations, selected]
  );
  const selectedCount = selectedIds.length;

  // Live impact of the current selection — drives the headline + ring. Derived
  // from the live recommendation set and forecast, never hardcoded.
  const impact = useMemo(() => {
    const movesMoney = recommendations.some(
      (r) => r.movesMoney && selectedIds.includes(r.id)
    );
    return {
      movesMoney,
      riskReduction: combinedRiskReduction(recommendations, selectedIds),
      newMinimumBalance: movesMoney ? guardian.minAfter : guardian.low,
      newMonthEndBalance: movesMoney ? guardian.monthEndAfter : projectedMonthEnd,
    };
  }, [recommendations, selectedIds, guardian, projectedMonthEnd]);
  const combinedRisk = impact.riskReduction;
  const confidence = planConfidence(impact.newMinimumBalance);

  const handleApprove = () => {
    // Money moves now (the "before" snapshot is captured inside approvePlan);
    // Guardian then visibly executes before the success screen reveals.
    approvePlan(selectedIds);
    setExecuting(true);
  };

  return (
    <PageTransition>
      <AnimatePresence>
        {executing && (
          <GuardianExecution onDone={() => router.push("/guardian/success")} />
        )}
      </AnimatePresence>

      <AppHeader variant="sub" title="Your Plan" />

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-ocbc-bg px-4 pb-44 pt-3">
        {/* Glanceable plan summary — Analysis ✓ → Confidence → Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-xl2 bg-white shadow-card"
        >
          <div className="ocbc-gradient flex items-center gap-2 px-4 py-3">
            <Sparkles size={18} className="text-white" />
            <p className="flex-1 text-[14px] font-bold text-white">Your plan&apos;s ready</p>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
              {confidence}% sure
            </span>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-slate">
              I looked at
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {guardianAnalysis.map((a) => (
                <div key={a} className="flex items-center gap-1.5">
                  <Check size={13} strokeWidth={3} className="shrink-0 text-ocbc-green" />
                  <span className="text-[12px] leading-tight text-ocbc-ink">{a}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5">
              <ArrowRight size={15} className="shrink-0 text-ocbc-red" />
              <p className="text-[13px] font-semibold text-ocbc-ink">
                My suggestion: stay above your safety cushion every week with the steps below.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Projected impact headline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="rounded-xl2 bg-white p-4 shadow-card"
        >
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
            If you say yes
          </p>
          <div className="flex items-center gap-3">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="27" fill="none" stroke="#F0E4E2" strokeWidth="7" />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  stroke="#13A05B"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 27}
                  initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 27 * (1 - combinedRisk / 100),
                  }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[16px] font-extrabold leading-none text-ocbc-green">
                  {combinedRisk}%
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-ocbc-ink">Less chance of running low</p>
              <p className="mt-0.5 text-[12.5px] text-ocbc-slate">
                {impact.movesMoney
                  ? `Lowest ${formatSGD(impact.newMinimumBalance)} · month-end ${formatSGD(
                      impact.newMonthEndBalance
                    )}`
                  : selectedCount === 0
                  ? "Pick a step to see what changes"
                  : "Your spending stays on track — without the money move, your cushion is the same"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Structured recommendations */}
        <p className="px-1 pt-1 text-[13px] font-bold text-ocbc-ink">
          Steps to take · tap to include
        </p>

        {recommendations.map((rec, i) => {
          const isOn = selected[rec.id];
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className={`overflow-hidden rounded-xl2 bg-white shadow-card transition-shadow ${
                isOn ? "ring-2 ring-ocbc-red" : "ring-1 ring-ocbc-line"
              }`}
            >
              {/* Header + select toggle */}
              <button
                onClick={() => toggle(rec.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-ocbc-ink">{rec.title}</p>
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-ocbc-green">
                    <TrendingUp size={12} /> {rec.riskReduction}% safer
                  </span>
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isOn
                      ? "border-ocbc-red bg-ocbc-red"
                      : "border-ocbc-mute bg-white"
                  }`}
                >
                  {isOn && <Check size={14} strokeWidth={3} className="text-white" />}
                </span>
              </button>

              <div className="px-4 pb-4">
                <RecommendationBody rec={rec} />
              </div>
            </motion.div>
          );
        })}

        {/* Control reassurance */}
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-[12.5px] text-ocbc-slate shadow-card">
          <Lock size={15} className="shrink-0 text-ocbc-green" />
          I never move money on my own. Nothing happens until you say so.
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-ocbc-line bg-white px-4 pb-3 pt-3">
        <HoldToApprove
          label={
            selectedCount === 0
              ? "Pick a step first"
              : `Hold to say yes to ${selectedCount} step${selectedCount === 1 ? "" : "s"}`
          }
          onApprove={handleApprove}
          disabled={selectedCount === 0}
        />
        <p className="text-center text-[11.5px] text-ocbc-mute">
          Press and hold to confirm — nothing moves until you do.
        </p>
      </div>
    </PageTransition>
  );
}
