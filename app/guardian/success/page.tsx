"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Activity,
  ShieldCheck,
  Wallet,
  TrendingUp,
  ArrowRight,
  Home as HomeIcon,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import PageTransition from "@/components/PageTransition";
import LearningNote from "@/components/LearningNote";
import { useGuardian } from "@/components/GuardianStateProvider";
import { formatSGD } from "@/lib/mockData";

export default function SuccessPage() {
  const router = useRouter();
  const {
    before,
    healthScore,
    risk,
    projectedMonthEnd,
    projectedLow,
    approvedCount,
    lastRiskReduction,
  } = useGuardian();

  // Build the before/after rows from live state, so the success screen always
  // matches whatever the customer actually approved.
  const rows: {
    icon: LucideIcon;
    label: string;
    before: string;
    after: string;
    badge: string;
    good: boolean;
  }[] = [
    {
      icon: Activity,
      label: "Your financial status",
      before: String(before.healthScore),
      after: String(healthScore),
      badge: `▲ ${healthScore - before.healthScore}`,
      good: healthScore >= before.healthScore,
    },
    {
      icon: ShieldCheck,
      label: "Chance of running low",
      before: before.risk,
      after: risk,
      badge:
        risk !== before.risk
          ? lastRiskReduction > 0
            ? `-${lastRiskReduction}%`
            : "Better"
          : "Watching",
      good: risk !== before.risk,
    },
    {
      icon: Wallet,
      label: "Money at month-end",
      before: formatSGD(before.monthEnd),
      after: formatSGD(projectedMonthEnd),
      badge:
        projectedMonthEnd > before.monthEnd
          ? `+${formatSGD(projectedMonthEnd - before.monthEnd)}`
          : "Unchanged",
      good: projectedMonthEnd > before.monthEnd,
    },
    {
      icon: TrendingUp,
      label: "Your lowest point",
      before: formatSGD(before.low),
      after: formatSGD(projectedLow),
      badge: projectedLow > before.low ? "Above cushion" : "Still tight",
      good: projectedLow > before.low,
    },
  ];

  return (
    <PageTransition>
      <div className="no-scrollbar flex-1 overflow-y-auto bg-ocbc-bg pb-32">
        {/* Success hero */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 pb-8 pt-10 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 16 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
              <Check size={32} strokeWidth={3} className="text-emerald-600" />
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-[21px] font-extrabold leading-tight"
          >
            {approvedCount} step{approvedCount === 1 ? "" : "s"} done
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-1.5 text-[14px] leading-snug text-white/90"
          >
            All set. Here&apos;s the difference it makes.
          </motion.p>
        </div>

        {/* Improvements */}
        <div className="space-y-2.5 px-4 pt-4">
          <p className="px-1 text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
            What&apos;s better now
          </p>

          {rows.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
                className="rounded-xl2 bg-white p-4 shadow-card"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      it.good ? "bg-emerald-50 text-ocbc-green" : "bg-ocbc-bg text-ocbc-slate"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <p className="flex-1 text-[14px] font-bold text-ocbc-ink">{it.label}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      it.good ? "bg-emerald-100 text-ocbc-green" : "bg-ocbc-bg text-ocbc-slate"
                    }`}
                  >
                    {it.badge}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 rounded-lg bg-ocbc-bg px-3 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ocbc-mute">
                      Before
                    </p>
                    <p className="mt-0.5 text-[14px] font-extrabold text-ocbc-slate line-through decoration-ocbc-mute/50">
                      {it.before}
                    </p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-ocbc-green" />
                  <div className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ocbc-green">
                      After
                    </p>
                    <p className="mt-0.5 text-[14px] font-extrabold text-ocbc-ink">{it.after}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* AI learning beat */}
          <LearningNote
            delay={0.78}
            text="I'll keep today's choice in mind when I plan your next few weeks."
          />

          {/* Continuing-care note + OCBC follow-up */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.85 }}
            className="rounded-xl2 bg-white p-4 shadow-card"
          >
            <p className="text-[13px] leading-snug text-ocbc-slate">
              I&apos;ll keep watching your accounts and give you a heads-up before anything comes
              up. Your home move is saved — check out OCBC&apos;s help whenever you&apos;re ready.
            </p>
            <button
              onClick={() => router.push("/guardian/overview")}
              className="mt-3 flex w-full items-center gap-3 rounded-xl border border-ocbc-line bg-white px-3 py-2.5 text-left active:bg-ocbc-bg/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ocbc-red text-white">
                <HomeIcon size={17} />
              </span>
              <div className="flex-1">
                <p className="text-[13.5px] font-bold text-ocbc-ink">Home-move help</p>
                <p className="text-[11.5px] text-ocbc-slate">Home Loan · Insurance · Renovation</p>
              </div>
              <ChevronRight size={16} className="text-ocbc-mute" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-ocbc-line bg-white px-4 pb-3 pt-3">
        <PrimaryButton onClick={() => router.push("/")}>Back to Home</PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => router.push("/guardian")}>
          See your updated check-in
        </PrimaryButton>
      </div>
    </PageTransition>
  );
}
