"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Activity,
  ShieldCheck,
  Wallet,
  ArrowRight,
  PiggyBank,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import PageTransition from "@/components/PageTransition";
import LearningNote from "@/components/LearningNote";
import { useGuardian } from "@/components/GuardianStateProvider";
import {
  paynowScenario,
  paynowProjection,
  paynowAssessment,
  SAFETY_BUFFER,
  formatSGD,
  formatSGD0,
} from "@/lib/mockData";

export default function PayNowSuccessPage() {
  const router = useRouter();
  const { before, healthScore, risk, projectedLow, lastDecision, lastPayAmount } =
    useGuardian();
  const approved = lastDecision === "approve";
  const { recipient } = paynowScenario;
  const amount = lastPayAmount;
  // The amount Guardian actually bridged from savings — capped at what savings
  // held before the transfer, so it matches the live store exactly.
  const movedFromSavings = paynowProjection(
    amount,
    before.low,
    before.monthEnd,
    before.savings
  ).moveFromSavings;

  // Re-derive how Guardian read THIS payment from the pre-send snapshot — the
  // same assessment the customer just saw on the review/intercept screens — so
  // the success screen can never contradict it. The month's baseline already
  // dips under the cushion before payday, so a small, "cleared" send must still
  // land as a calm receipt rather than an alarming below-cushion warning.
  const intercepted = paynowAssessment(
    amount,
    before.balance,
    before.low,
    before.monthEnd,
    before.savings
  ).intercepts;
  const belowBuffer = projectedLow < SAFETY_BUFFER;
  // Approving only "protects" the month if savings could fully clear the cushion.
  const fullyProtected = approved && !belowBuffer;
  const partial = approved && belowBuffer; // savings helped but couldn't fully cover
  const scary = intercepted && belowBuffer && !approved; // big send, no plan
  const showBreakdown = approved || (intercepted && belowBuffer); // breakdown vs simple receipt

  const rows: { icon: LucideIcon; label: string; before: string; after: string; good: boolean }[] = [
    {
      icon: Activity,
      label: "Your financial status",
      before: String(before.healthScore),
      after: String(healthScore),
      good: healthScore >= before.healthScore,
    },
    {
      icon: ShieldCheck,
      label: "Chance of running low",
      before: before.risk,
      after: risk,
      good: risk === "Low",
    },
    {
      icon: Wallet,
      label: "Lowest before payday",
      before: formatSGD(before.low),
      after: formatSGD(projectedLow),
      good: projectedLow >= before.low,
    },
  ];

  return (
    <PageTransition>
      <div className="no-scrollbar flex-1 overflow-y-auto bg-ocbc-bg pb-32">
        {/* Success hero */}
        <div
          className={`px-6 pb-8 pt-10 text-center text-white ${
            scary || partial
              ? "ocbc-gradient"
              : "bg-gradient-to-br from-emerald-600 to-emerald-700"
          }`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 16 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
              <Check
                size={32}
                strokeWidth={3}
                className={scary || partial ? "text-ocbc-red" : "text-emerald-600"}
              />
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-[21px] font-extrabold leading-tight"
          >
            {formatSGD(amount)} sent to {recipient.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-1.5 text-[14px] leading-snug text-white/90"
          >
            {fullyProtected
              ? "Done — money sent, and your month's protected."
              : partial
              ? "Sent. I moved your savings to soften it — keep things easy until payday."
              : scary
              ? "Sent. I'll keep an eye on your balance this month."
              : "Sent — you're on track for the rest of the month."}
          </motion.p>
        </div>

        <div className="space-y-2.5 px-4 pt-4">
          {approved && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl2 bg-white p-4 shadow-card"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-ocbc-green">
                <PiggyBank size={18} />
              </span>
              <p className="flex-1 text-[13.5px] font-semibold text-ocbc-ink">
                Topped up from your savings
              </p>
              <span className="text-[17px] font-extrabold text-ocbc-green">
                {formatSGD0(movedFromSavings)}
              </span>
            </motion.div>
          )}

          {(scary || partial) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl2 bg-amber-50 p-3.5 ring-1 ring-amber-100"
            >
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-ocbc-amber" />
              <p className="text-[13px] leading-snug text-ocbc-ink">
                {partial
                  ? `Your lowest point before payday is now ${formatSGD(
                      projectedLow
                    )} — still under your safety cushion. I've moved all your savings across, so easing off your spending this week is the best way to stay safe until payday.`
                  : `Your lowest point before payday is now ${formatSGD(
                      projectedLow
                    )} — under your safety cushion. I've got a plan ready if you'd like to top up before the weekend.`}
              </p>
            </motion.div>
          )}

          {/* Simple receipt for an in-pattern transfer (no scary breakdown) */}
          {!showBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 rounded-xl2 bg-white p-4 shadow-card"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-ocbc-green">
                <Wallet size={18} />
              </span>
              <p className="flex-1 text-[13.5px] font-semibold text-ocbc-ink">
                Your FRANK balance
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-bold text-ocbc-mute line-through">
                  {formatSGD(before.balance)}
                </span>
                <ArrowRight size={13} className="text-ocbc-green" />
                <span className="text-[14px] font-extrabold text-ocbc-ink">
                  {formatSGD(before.balance - amount)}
                </span>
              </div>
            </motion.div>
          )}

          {showBreakdown && (
            <p className="px-1 pt-1 text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
              {approved ? "What's better" : "What changed"}
            </p>
          )}

          {showBreakdown &&
          rows.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="rounded-xl2 bg-white p-4 shadow-card"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      it.good ? "bg-emerald-50 text-ocbc-green" : "bg-rose-50 text-ocbc-red"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <p className="flex-1 text-[14px] font-bold text-ocbc-ink">{it.label}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 rounded-lg bg-ocbc-bg px-3 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ocbc-mute">
                      Before
                    </p>
                    <p className="mt-0.5 text-[14px] font-extrabold text-ocbc-slate">{it.before}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 ${it.good ? "text-ocbc-green" : "text-ocbc-red"}`}
                  />
                  <div
                    className={`flex-1 rounded-lg px-3 py-2 text-center ${
                      it.good ? "bg-emerald-50" : "bg-rose-50"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wide ${
                        it.good ? "text-ocbc-green" : "text-ocbc-red"
                      }`}
                    >
                      After
                    </p>
                    <p className="mt-0.5 text-[14px] font-extrabold text-ocbc-ink">{it.after}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* AI learning */}
          <LearningNote
            delay={0.65}
            text={
              approved
                ? "I'll remember that you prefer to send in full and top up from savings when things get tight."
                : "I'll remember you were comfortable going ahead this time, and adjust how often I step in."
            }
          />
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-ocbc-line bg-white px-4 pb-3 pt-3">
        <PrimaryButton onClick={() => router.push("/")}>Back to Home</PrimaryButton>
        {!approved && (
          <PrimaryButton variant="outline" onClick={() => router.push("/paynow/plan")}>
            See my plan
          </PrimaryButton>
        )}
      </div>
    </PageTransition>
  );
}
