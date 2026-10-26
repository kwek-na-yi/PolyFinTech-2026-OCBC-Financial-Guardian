"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Pencil,
  ClipboardList,
  Lock,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PrimaryButton from "@/components/PrimaryButton";
import Keypad from "@/components/Keypad";
import PageTransition from "@/components/PageTransition";
import { useGuardian } from "@/components/GuardianStateProvider";
import {
  paynowScenario,
  paynowProjection,
  paynowAssessment,
  type PayNowTier,
  account,
  formatSGD,
  formatSGD0,
} from "@/lib/mockData";

const { recipient, safetyThreshold } = paynowScenario;

export default function PayNowPage() {
  const router = useRouter();
  const { runPayNow, setPendingPayNow, balance, savings, projectedLow, projectedMonthEnd } =
    useGuardian();

  const [step, setStep] = useState<"amount" | "review">("amount");
  const [amount, setAmount] = useState<string>(String(paynowScenario.amount));
  // The field starts pre-filled with the demo amount; the first keypress
  // should replace it rather than append, so typing "80" gives 80 not 80080.
  const [pristine, setPristine] = useState(true);
  const [intercept, setIntercept] = useState(false);

  const numericAmount = Number(amount || 0);
  // Guardian reads every payment before it leaves; the tier decides whether it
  // simply reassures (clear/steady) or steps in (protect/drawdown).
  const assessment = paynowAssessment(
    numericAmount,
    balance,
    projectedLow,
    projectedMonthEnd,
    savings
  );
  const triggersGuardian = assessment.intercepts;

  const press = (k: string) => {
    const wasPristine = pristine;
    if (pristine) setPristine(false);
    setAmount((a) => {
      const base = wasPristine ? "0" : a;
      if (k === "del") return base.length <= 1 ? "0" : base.slice(0, -1);
      if (k === ".") return wasPristine ? "0." : base.includes(".") ? base : base + ".";
      const next = base === "0" ? k : base + k;
      // keep it sane for a demo keypad
      const [, dec] = next.split(".");
      if (dec && dec.length > 2) return base;
      return next.length > 7 ? base : next;
    });
  };

  const onReviewConfirm = () => {
    if (triggersGuardian) setIntercept(true);
    else handleProceed();
  };

  const handleProceed = () => {
    runPayNow("proceed", numericAmount);
    router.push("/paynow/success");
  };

  return (
    <PageTransition>
      <AppHeader variant="sub" title="PayNow" />

      <div className="no-scrollbar flex-1 overflow-y-auto bg-ocbc-bg">
        {/* Recipient — selected, OCBC PayNow style */}
        <div className="bg-white px-5 pb-4 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-slate">
            Transfer to
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ocbc-peach text-[15px] font-bold text-ocbc-redDark">
              {recipient.initials}
            </span>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-ocbc-ink">{recipient.name}</p>
              <p className="text-[12.5px] text-ocbc-slate">
                {recipient.handle}
              </p>
            </div>
            <span className="rounded-full bg-ocbc-bg px-2.5 py-1 text-[11px] font-bold text-ocbc-slate">
              PayNow
            </span>
          </div>
        </div>

        {step === "amount" ? (
          <AmountStep
            amount={amount}
            press={press}
            balance={balance}
            onNext={() => setStep("review")}
            valid={numericAmount > 0 && numericAmount <= balance}
          />
        ) : (
          <ReviewStep
            amount={numericAmount}
            reassurance={assessment.reassurance}
            balanceAfter={assessment.balanceAfter}
            onEdit={() => setStep("amount")}
            onConfirm={onReviewConfirm}
          />
        )}
      </div>

      {/* Guardian interception — appears naturally before final confirmation */}
      <AnimatePresence>
        {intercept && (
          <InterceptSheet
            amount={numericAmount}
            tier={assessment.tier}
            balanceAfter={assessment.balanceAfter}
            currentLow={projectedLow}
            currentMonthEnd={projectedMonthEnd}
            savings={savings}
            onClose={() => setIntercept(false)}
            onProceed={handleProceed}
            onModify={() => {
              setIntercept(false);
              setStep("amount");
            }}
            onReviewPlan={() => {
              setPendingPayNow(numericAmount);
              router.push("/paynow/plan");
            }}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

/* ----------------------------- Amount step ----------------------------- */

function AmountStep({
  amount,
  press,
  balance,
  onNext,
  valid,
}: {
  amount: string;
  press: (k: string) => void;
  balance: number;
  onNext: () => void;
  valid: boolean;
}) {
  const over = Number(amount || 0) > balance;
  return (
    <>
      <div className="px-5 py-8 text-center">
        <p className="text-[12.5px] font-medium text-ocbc-slate">Amount</p>
        <div className="mt-2 flex items-end justify-center gap-1.5">
          <span className="pb-1.5 text-[20px] font-bold text-ocbc-slate">SGD</span>
          <span className="text-[46px] font-extrabold leading-none tracking-tight text-ocbc-ink">
            {Number(amount || 0).toLocaleString("en-SG", {
              minimumFractionDigits: amount.includes(".") ? 2 : 0,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <p className={`mt-3 text-[12.5px] ${over ? "font-semibold text-ocbc-red" : "text-ocbc-slate"}`}>
          {over
            ? `You only have ${formatSGD(balance)} in this account`
            : `From ${account.name} · ${formatSGD(balance)} available`}
        </p>
      </div>

      <Keypad onPress={press} />

      <div className="bg-white px-4 pb-5 pt-4">
        <PrimaryButton onClick={onNext} className={valid ? "" : "pointer-events-none opacity-40"}>
          <span className="flex items-center justify-center gap-1.5">
            Review Transfer
            <ChevronRight size={18} strokeWidth={2.5} />
          </span>
        </PrimaryButton>
      </div>
    </>
  );
}

/* ----------------------------- Review step ----------------------------- */

function ReviewStep({
  amount,
  reassurance,
  balanceAfter,
  onEdit,
  onConfirm,
}: {
  amount: number;
  reassurance: string;
  balanceAfter: number;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  const rows = [
    { label: "To", value: recipient.name },
    { label: "PayNow", value: recipient.handle },
    { label: "From", value: account.name },
    { label: "Reference", value: recipient.reference },
  ];
  return (
    <div className="px-4 pb-6 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-xl2 bg-white shadow-card"
      >
        <div className="border-b border-ocbc-line px-5 py-5 text-center">
          <p className="text-[12px] font-medium text-ocbc-slate">You&apos;re sending</p>
          <p className="mt-1 text-[34px] font-extrabold leading-none text-ocbc-ink">
            {formatSGD(amount)}
          </p>
          <button
            onClick={onEdit}
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-ocbc-blue"
          >
            <Pencil size={13} /> Edit amount
          </button>
        </div>
        <div className="divide-y divide-ocbc-line px-5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <span className="text-[13px] text-ocbc-slate">{r.label}</span>
              <span className="text-[14px] font-semibold text-ocbc-ink">{r.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Guardian has already checked this payment — reassurance for a safe send */}
      {reassurance && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="mt-3 flex items-start gap-2.5 rounded-xl2 bg-emerald-50 p-3.5 ring-1 ring-emerald-100"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-ocbc-green">
            <ShieldCheck size={17} strokeWidth={2.25} />
          </span>
          <div className="flex-1">
            <p className="text-[13.5px] font-bold leading-snug text-ocbc-ink">{reassurance}</p>
            <p className="mt-0.5 text-[12px] text-ocbc-slate">
              I checked your bills and forecast — you&apos;ll have about{" "}
              {formatSGD0(balanceAfter)} left after this.
            </p>
          </div>
        </motion.div>
      )}

      <p className="mt-3 px-1 text-[12px] leading-snug text-ocbc-mute">
        Transfers via PayNow are immediate and cannot be reversed. Please check the recipient
        details before confirming.
      </p>

      <div className="mt-4">
        <PrimaryButton onClick={onConfirm}>Transfer Now</PrimaryButton>
      </div>
    </div>
  );
}

/* ----------------------- Guardian interception sheet ----------------------- */

function InterceptSheet({
  amount,
  tier,
  balanceAfter,
  currentLow,
  currentMonthEnd,
  savings,
  onClose,
  onProceed,
  onModify,
  onReviewPlan,
}: {
  amount: number;
  tier: PayNowTier;
  balanceAfter: number;
  currentLow: number;
  currentMonthEnd: number;
  savings: number;
  onClose: () => void;
  onProceed: () => void;
  onModify: () => void;
  onReviewPlan: () => void;
}) {
  const proj = paynowProjection(amount, currentLow, currentMonthEnd, savings);
  const isDrawdown = tier === "drawdown";
  // Savings alone can't lift the forecast back above the cushion — Guardian is
  // honest rather than pretending its plan fully fixes things.
  const isShortfall = tier === "shortfall";

  // Conclusion first; copy escalates by how serious the squeeze is.
  const headline = isShortfall
    ? "Your savings alone can't fully cover this."
    : isDrawdown
    ? "This would leave very little in your account."
    : "This would dip you under your cushion before payday.";
  const body = isShortfall
    ? `Sending ${formatSGD0(amount)} would drop your lowest balance before payday to about ${formatSGD0(
        proj.lowIfSent
      )}. I can move your whole ${formatSGD0(
        savings
      )} of savings across, but you'd still be about ${formatSGD0(
        proj.shortfall
      )} short of your ${formatSGD0(safetyThreshold)} cushion. Let's look at the options together.`
    : isDrawdown
    ? `Sending ${formatSGD0(amount)} would leave only about ${formatSGD0(
        balanceAfter
      )} in your spending account today, with bills still due before payday. To send it all safely I'd need to top up ${formatSGD0(
        proj.moveFromSavings
      )} from your savings.`
    : `Sending ${formatSGD0(amount)} today would drop your lowest balance before payday to about ${formatSGD0(
        proj.lowIfSent
      )} — under the ${formatSGD0(safetyThreshold)} cushion you like to keep. I've worked out a way to send it all and still keep you safe.`;
  const evidence: { label: string; value: string; danger?: boolean }[] = isShortfall
    ? [
        { label: "Sending now", value: formatSGD0(amount) },
        { label: "Your savings", value: formatSGD0(savings) },
        { label: "Still short by", value: formatSGD0(proj.shortfall), danger: true },
      ]
    : isDrawdown
    ? [
        { label: "Sending now", value: formatSGD0(amount) },
        { label: "Left in your account", value: formatSGD0(balanceAfter), danger: true },
        { label: "Top-up needed from savings", value: formatSGD0(proj.moveFromSavings), danger: true },
      ]
    : [
        { label: "Lowest before payday now", value: formatSGD0(currentLow) },
        { label: "Lowest if you send it", value: formatSGD0(proj.lowIfSent), danger: true },
        { label: "I'd top up from savings", value: formatSGD0(proj.moveFromSavings) },
      ];
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Scrim */}
      <button
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative max-h-[88%] overflow-y-auto rounded-t-[1.75rem] bg-white pb-5"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-ocbc-line" />

        {/* Guardian header */}
        <div className="ocbc-gradient mx-4 mt-4 rounded-2xl px-4 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <ShieldCheck size={19} strokeWidth={2.25} />
              <motion.span
                className="absolute inset-0 rounded-full ring-2 ring-white/40"
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            </span>
            <div>
              <p className="text-[11px] font-medium text-white/80">
                I just checked your forecast
              </p>
              <p className="text-[15px] font-bold">Financial Guardian</p>
            </div>
          </div>
        </div>

        <div className="px-5 pt-4">
          <p className="text-[16.5px] font-bold leading-snug text-ocbc-ink">
            {headline}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ocbc-slate">{body}</p>

          {/* Evidence — never a conclusion without the reasons */}
          <div className="mt-3.5 space-y-2 rounded-xl2 bg-ocbc-bg p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-slate">
              Why I&apos;m checking
            </p>
            {evidence.map((e, i) => (
              <div
                key={e.label}
                className={`flex items-center justify-between ${
                  i > 0 ? "border-t border-ocbc-line pt-2" : ""
                }`}
              >
                <span className="text-[13px] text-ocbc-slate">{e.label}</span>
                <span
                  className={`text-[14px] font-bold ${
                    e.danger ? "text-ocbc-red" : "text-ocbc-ink"
                  }`}
                >
                  {e.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5">
            <ShieldCheck size={15} className="shrink-0 text-ocbc-red" />
            <p className="text-[12.5px] font-medium text-ocbc-ink">
              {isShortfall
                ? `I can't fully bridge this from savings — but there are a few ways to soften it. Let me show you.`
                : `I've got a plan — send the full ${formatSGD(
                    amount
                  )} and still stay above your ${formatSGD(safetyThreshold)} cushion.`}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-2 px-4">
          <button
            onClick={onReviewPlan}
            className="flex w-full items-center gap-3 rounded-xl2 bg-ocbc-ink px-4 py-3.5 text-left text-white active:opacity-90"
          >
            <ClipboardList size={19} className="shrink-0" />
            <div className="flex-1">
              <p className="text-[14.5px] font-bold">See my plan</p>
              <p className="text-[12px] text-white/75">
                {isShortfall ? "The best way to soften the gap" : "Send it all and stay safe"}
              </p>
            </div>
            <ArrowRight size={18} />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onModify}
              className="rounded-xl2 border border-ocbc-line bg-white py-3 text-[14px] font-bold text-ocbc-ink active:bg-ocbc-bg"
            >
              Change amount
            </button>
            <button
              onClick={onProceed}
              className="rounded-xl2 border border-ocbc-line bg-white py-3 text-[14px] font-bold text-ocbc-slate active:bg-ocbc-bg"
            >
              Send anyway
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 px-4 text-[11.5px] text-ocbc-mute">
          <Lock size={12} /> I never move money on my own. You&apos;re in control.
        </div>
      </motion.div>
    </motion.div>
  );
}
