"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Check,
  Wallet,
  PiggyBank,
  CalendarMinus,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import HoldToApprove from "@/components/HoldToApprove";
import PageTransition from "@/components/PageTransition";
import { GuardianExecution } from "@/components/GuardianSequence";
import { useGuardian } from "@/components/GuardianStateProvider";
import {
  paynowScenario,
  paynowProjection,
  planConfidence,
  deriveHealthScore,
  SAFETY_BUFFER,
  formatSGD,
  formatSGD0,
} from "@/lib/mockData";

const stepIcon = [Wallet, PiggyBank, CalendarMinus];

const riskWord = (low: number): "Low" | "Medium" | "High" =>
  low < 0 ? "High" : low < SAFETY_BUFFER ? "Medium" : "Low";

export default function PayNowPlanPage() {
  const router = useRouter();
  const {
    runPayNow,
    pendingPayNow,
    projectedLow,
    projectedMonthEnd,
    healthScore,
    risk,
    savings,
  } = useGuardian();
  const { recipient, safetyThreshold } = paynowScenario;
  const amount = pendingPayNow;
  // The plan is built against the customer's real, live savings — so it can
  // never promise to move more than they actually have.
  const proj = paynowProjection(amount, projectedLow, projectedMonthEnd, savings);
  const sufficient = proj.sufficient; // savings fully clears the cushion
  const confidence = planConfidence(proj.lowAfterPlan);
  const [executing, setExecuting] = useState(false);
  const [execSteps, setExecSteps] = useState<string[]>([]);

  const approve = () => {
    // Freeze the step labels from the plan the customer just saw — runPayNow
    // mutates the forecast on this same click, so capture before it does.
    setExecSteps([
      "Checking your balance",
      `Topping up ${formatSGD0(proj.moveFromSavings)} from your savings`,
      `Sending ${formatSGD0(amount)} to ${recipient.name}`,
      "Updating your forecast",
      "Keeping you above your cushion",
    ]);
    runPayNow("approve", amount);
    setExecuting(true);
  };
  const proceed = () => {
    runPayNow("proceed", amount);
    router.push("/paynow/success");
  };

  const summary = sufficient
    ? `Send ${recipient.name} the full ${formatSGD0(
        amount
      )} today, and I'll briefly top up from your savings to keep your month healthy.`
    : `Send ${recipient.name} the full ${formatSGD0(
        amount
      )} today. I'll move your whole ${formatSGD0(
        savings
      )} of savings across to soften the dip — but you'd still be about ${formatSGD0(
        proj.shortfall
      )} under your cushion, so easing off this week would close the gap.`;

  const steps = [
    {
      title: `Send ${formatSGD0(amount)} to ${recipient.name} now`,
      detail: "It all goes through now — nothing's held back.",
      tone: "neutral" as const,
    },
    {
      title: sufficient
        ? `Top up ${formatSGD0(proj.moveFromSavings)} from your savings`
        : `Move your whole ${formatSGD0(proj.moveFromSavings)} of savings across`,
      detail: sufficient
        ? `Goes into your spending account so your lowest point stays above your ${formatSGD0(
            safetyThreshold
          )} cushion.`
        : `That's everything in savings — it lifts your lowest point to about ${formatSGD0(
            proj.lowAfterPlan
          )}, still ${formatSGD0(proj.shortfall)} under your ${formatSGD0(
            safetyThreshold
          )} cushion.`,
      tone: "action" as const,
    },
    {
      title: sufficient ? "Go a little easy this week" : `Ease off about ${formatSGD0(proj.shortfall)} this week`,
      detail: sufficient
        ? "Optional — gives you some extra breathing room before payday."
        : "This closes the remaining gap and keeps you above your cushion until payday.",
      tone: "action" as const,
    },
  ];

  // Compared against the customer's current forecast (entry state) — the same
  // baseline the success screen uses, so the two always agree. Every "after"
  // is derived from what the plan can actually achieve, not assumed.
  const compare = [
    {
      label: "Lowest before payday",
      before: formatSGD(projectedLow),
      after: formatSGD(proj.lowAfterPlan),
    },
    {
      label: "Chance of running low",
      before: risk,
      after: riskWord(proj.lowAfterPlan),
    },
    {
      label: "Your status",
      before: String(healthScore),
      after: String(deriveHealthScore(proj.lowAfterPlan)),
    },
  ];

  return (
    <PageTransition>
      <AnimatePresence>
        {executing && (
          <GuardianExecution
            title="Sending — and protecting your month"
            finalLabel="Sent — and you're protected"
            steps={execSteps}
            onDone={() => router.push("/paynow/success")}
          />
        )}
      </AnimatePresence>

      <AppHeader variant="sub" title="Your Plan" />

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-ocbc-bg px-4 pb-44 pt-3">
        {/* Guardian intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-xl2 bg-white shadow-card"
        >
          <div className="ocbc-gradient flex items-center gap-2.5 px-4 py-3 text-white">
            <ShieldCheck size={19} strokeWidth={2.25} />
            <p className="flex-1 text-[14.5px] font-bold">Here&apos;s what I&apos;d do</p>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
              {confidence}% sure
            </span>
          </div>
          <p className="px-4 py-3.5 text-[14px] leading-relaxed text-ocbc-ink">{summary}</p>
        </motion.div>

        {/* Why a plan is needed — the counterfactual, for context */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-start gap-2.5 rounded-xl2 bg-rose-50 p-3.5 ring-1 ring-rose-100"
        >
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-ocbc-red" />
          <p className="text-[13px] leading-snug text-ocbc-ink">
            If you just send it, your lowest point before payday drops to about{" "}
            <span className="font-bold text-ocbc-red">{formatSGD0(proj.lowIfSent)}</span> — under
            your {formatSGD0(safetyThreshold)} cushion.
          </p>
        </motion.div>

        {/* Plan steps */}
        <div className="space-y-2.5">
          {steps.map((s, i) => {
            const Icon = stepIcon[i] ?? Check;
            const isAction = s.tone === "action";
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-3 rounded-xl2 bg-white p-4 shadow-card ring-1 ring-black/[0.03]"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isAction ? "bg-rose-50 text-ocbc-red" : "bg-emerald-50 text-ocbc-green"
                  }`}
                >
                  <Icon size={19} strokeWidth={2.1} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ocbc-ink text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="text-[14.5px] font-bold text-ocbc-ink">{s.title}</p>
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-ocbc-slate">{s.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Expected result */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-xl2 bg-white p-4 shadow-card"
        >
          <div className="mb-3 flex items-center gap-1.5">
            <TrendingUp size={15} className="text-ocbc-green" />
            <p className="text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
              What you&apos;ll get
            </p>
          </div>
          <div className="space-y-2">
            {compare.map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <span className="flex-1 text-[13px] text-ocbc-slate">{c.label}</span>
                <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-[12.5px] font-bold text-ocbc-slate line-through decoration-ocbc-mute/50">
                  {c.before}
                </span>
                <ArrowRight size={14} className="shrink-0 text-ocbc-green" />
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12.5px] font-extrabold text-ocbc-ink">
                  {c.after}
                </span>
              </div>
            ))}
          </div>
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 ${
              sufficient ? "bg-emerald-50/70" : "bg-amber-50"
            }`}
          >
            {sufficient ? (
              <Check size={15} strokeWidth={3} className="shrink-0 text-ocbc-green" />
            ) : (
              <AlertTriangle size={15} className="shrink-0 text-ocbc-amber" />
            )}
            <p className="text-[13px] font-semibold text-ocbc-ink">
              {sufficient
                ? `${recipient.name} gets the full ${formatSGD0(
                    amount
                  )}, and your lowest point holds at ${formatSGD0(
                    proj.lowAfterPlan
                  )} — above your ${formatSGD0(safetyThreshold)} cushion.`
                : `${recipient.name} gets the full ${formatSGD0(
                    amount
                  )}. Your lowest point rises to ${formatSGD0(
                    proj.lowAfterPlan
                  )} — still ${formatSGD0(
                    proj.shortfall
                  )} under your cushion, so go a little easy until payday.`}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Sticky CTAs */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-ocbc-line bg-white px-4 pb-3 pt-3">
        <HoldToApprove label="Hold to send" onApprove={approve} />
        <p className="text-center text-[11.5px] text-ocbc-mute">
          Press and hold to confirm — nothing moves until you do.
        </p>
        <button
          onClick={proceed}
          className="w-full rounded-full py-3 text-[14px] font-bold text-ocbc-slate active:bg-ocbc-bg"
        >
          Send {formatSGD0(amount)} without the plan
        </button>
      </div>
    </PageTransition>
  );
}
