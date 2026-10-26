"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Flag,
  Sparkles,
  Gauge,
  ChevronRight,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import SectionCard from "@/components/SectionCard";
import CashflowChart from "@/components/CashflowChart";
import PrimaryButton from "@/components/PrimaryButton";
import PageTransition from "@/components/PageTransition";
import { useGuardian } from "@/components/GuardianStateProvider";
import {
  cashflowAnalysis,
  SAFETY_BUFFER,
  formatSGD,
  formatSGD0,
} from "@/lib/mockData";

const dotStyle = {
  start: "bg-ocbc-ink",
  debit: "bg-ocbc-red",
  credit: "bg-ocbc-green",
  end: "bg-ocbc-ink",
} as const;

const riskTone = {
  Low: { text: "text-ocbc-green", bg: "bg-emerald-50", bar: "bg-ocbc-green", w: "33%" },
  Medium: { text: "text-ocbc-amber", bg: "bg-amber-50", bar: "bg-ocbc-amber", w: "66%" },
  High: { text: "text-ocbc-red", bg: "bg-rose-50", bar: "bg-ocbc-red", w: "100%" },
} as const;

export default function CashflowPage() {
  const router = useRouter();
  const { projectedMonthEnd, projectedLow, forecast, lastDecision, planApproved, lastActivity, risk } =
    useGuardian();
  // Any money move — a PayNow decision, an approved plan, a save or a scan —
  // reshapes the forecast, so all of them flag the projection as freshly updated.
  const updated = lastDecision !== null || planApproved || lastActivity !== null;
  const aboveCushion = projectedLow >= SAFETY_BUFFER;
  const tone = riskTone[risk];

  // Insight derived from the live forecast, so it never contradicts the chart.
  const cashflowInsight =
    projectedLow < SAFETY_BUFFER
      ? `A SGD 1,400 rental deposit on day 7 drops you to about ${formatSGD0(
          projectedLow
        )} around day ${forecast.lowDay} — just under your ${formatSGD0(
          SAFETY_BUFFER
        )} cushion — before payday on day 10. It's a short, easy gap to cover.`
      : `You stay above your ${formatSGD0(
          SAFETY_BUFFER
        )} cushion all the way to payday — your lowest point is about ${formatSGD0(
          projectedLow
        )} around day ${forecast.lowDay}. Nicely managed.`;

  return (
    <PageTransition>
      <AppHeader variant="sub" title="Money You'll Have Left" />

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-ocbc-bg px-4 pb-28 pt-3">
        {/* Projected month-end highlight */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="ocbc-gradient overflow-hidden rounded-xl2 p-4 text-white shadow-card"
        >
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-medium text-white/85">
              What you&apos;ll have at month-end
            </p>
            {updated && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                Updated
              </span>
            )}
          </div>
          <motion.p
            key={projectedMonthEnd}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-[30px] font-extrabold leading-none"
          >
            {formatSGD(projectedMonthEnd)}
          </motion.p>
          <p className="mt-2 text-[12px] text-white/80">
            {updated
              ? aboveCushion
                ? "Updated after your last move — you're comfortably above your cushion."
                : "Updated after your last move — tap below to see how to stay above your cushion."
              : "Based on your pay, your bills and how you're spending right now."}
          </p>
        </motion.div>

        {/* Hero predictive chart */}
        <SectionCard title="Your Balance · Next 30 Days">
          <CashflowChart />
          <div className="mt-1 flex items-center justify-center gap-4 text-[11px] font-semibold text-ocbc-slate">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ocbc-red" /> Money out
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ocbc-green" /> Payday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm bg-ocbc-red/20" /> Below cushion
            </span>
          </div>
        </SectionCard>

        {/* Spending analysis (Improvement 5) */}
        <SectionCard
          title="Your Spending This Month"
          icon={<Gauge size={18} className="text-ocbc-red" />}
          delay={0.05}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-ocbc-bg p-3">
              <p className="text-[11.5px] font-medium text-ocbc-slate">On track to spend</p>
              <p className="mt-0.5 text-[18px] font-extrabold text-ocbc-ink">
                {formatSGD(cashflowAnalysis.projectedSpending)}
              </p>
            </div>
            <div className="rounded-xl bg-ocbc-bg p-3">
              <p className="text-[11.5px] font-medium text-ocbc-slate">Your usual month</p>
              <p className="mt-0.5 text-[18px] font-extrabold text-ocbc-ink">
                {formatSGD(cashflowAnalysis.monthlyAverage)}
              </p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3">
              <p className="text-[11.5px] font-medium text-ocbc-slate">More than usual</p>
              <p className="mt-0.5 text-[18px] font-extrabold text-ocbc-red">
                +{cashflowAnalysis.differencePct}%
              </p>
            </div>
            <div className={`rounded-xl ${tone.bg} p-3`}>
              <p className="text-[11.5px] font-medium text-ocbc-slate">Risk</p>
              <p className={`mt-0.5 text-[18px] font-extrabold ${tone.text}`}>
                {risk}
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
                <motion.div
                  className={`h-full rounded-full ${tone.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: tone.w }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Timeline */}
        <SectionCard title="What's Coming Up" delay={0.1}>
          <div className="relative pl-1">
            <div className="absolute left-[14px] top-2 bottom-2 w-px bg-ocbc-line" />
            <div className="space-y-1">
              {forecast.points.map((point, i) => {
                const isMilestone = point.type === "start" || point.type === "end";
                const isCredit = point.type === "credit";
                return (
                  <motion.div
                    key={point.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.07 }}
                    className={`relative flex items-center gap-3 rounded-lg py-2 ${
                      point.lowest ? "bg-rose-50 px-2" : ""
                    }`}
                  >
                    <span
                      className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${dotStyle[point.type]}`}
                    >
                      {point.type === "start" && <Wallet size={14} className="text-white" />}
                      {point.type === "end" && <Flag size={14} className="text-white" />}
                      {point.type === "credit" && <ArrowUpRight size={15} className="text-white" />}
                      {point.type === "debit" && <ArrowDownRight size={15} className="text-white" />}
                    </span>

                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-ocbc-mute">
                          {point.when}
                          {point.lowest && (
                            <span className="ml-1.5 rounded-full bg-ocbc-red px-1.5 py-0.5 text-[9px] text-white">
                              LOWEST
                            </span>
                          )}
                        </p>
                        <p className="text-[14px] font-bold text-ocbc-ink">{point.label}</p>
                      </div>
                      <div className="text-right">
                        {point.amount !== null ? (
                          <p
                            className={`text-[14px] font-bold ${
                              isCredit ? "text-ocbc-green" : "text-ocbc-red"
                            }`}
                          >
                            {formatSGD(point.amount, isCredit)}
                          </p>
                        ) : (
                          <p className="text-[14px] font-extrabold text-ocbc-ink">
                            {formatSGD(point.balance)}
                          </p>
                        )}
                        {!isMilestone && (
                          <p
                            className={`text-[11px] ${
                              point.lowest ? "font-bold text-ocbc-red" : "text-ocbc-mute"
                            }`}
                          >
                            Bal {formatSGD(point.balance)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* AI insight card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="rounded-xl2 border border-rose-100 bg-rose-50/60 p-4"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ocbc-red">
              <Sparkles size={15} className="text-white" />
            </span>
            <p className="text-[13px] font-bold text-ocbc-red">Here&apos;s what I see</p>
          </div>
          <p className="mt-2 text-[14px] leading-snug text-ocbc-ink">{cashflowInsight}</p>
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <div className="absolute inset-x-0 bottom-0 border-t border-ocbc-line bg-white px-4 py-3">
        <PrimaryButton onClick={() => router.push("/guardian/actions")}>
          <span className="flex items-center justify-center gap-1.5">
            See what I&apos;d do
            <ChevronRight size={18} strokeWidth={2.5} />
          </span>
        </PrimaryButton>
      </div>
    </PageTransition>
  );
}
