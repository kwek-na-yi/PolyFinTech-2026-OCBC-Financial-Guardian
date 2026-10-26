"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Pencil, ShieldCheck, ArrowDown } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PrimaryButton from "@/components/PrimaryButton";
import Keypad from "@/components/Keypad";
import PageTransition from "@/components/PageTransition";
import { useGuardian } from "@/components/GuardianStateProvider";
import {
  account,
  savingsAccount,
  SAFETY_BUFFER,
  formatSGD,
  formatSGD0,
} from "@/lib/mockData";

/** Suggested top-ups, mirroring the quick-amount pattern used in Scan & Pay. */
const suggested = [50, 100, 200, 500];

export default function SavePage() {
  const router = useRouter();
  const { saveMoney, balance, savings, projectedLow } = useGuardian();

  const [step, setStep] = useState<"amount" | "review">("amount");
  const [amount, setAmount] = useState("0");
  const [pristine, setPristine] = useState(true);

  const numericAmount = Number(amount || 0);

  const press = (k: string) => {
    const wasPristine = pristine;
    if (pristine) setPristine(false);
    setAmount((a) => {
      const base = wasPristine ? "0" : a;
      if (k === "del") return base.length <= 1 ? "0" : base.slice(0, -1);
      if (k === ".") return wasPristine ? "0." : base.includes(".") ? base : base + ".";
      const next = base === "0" ? k : base + k;
      const [, dec] = next.split(".");
      if (dec && dec.length > 2) return base;
      return next.length > 7 ? base : next;
    });
  };

  const save = () => {
    saveMoney(numericAmount);
    router.push("/save/success");
  };

  return (
    <PageTransition>
      <AppHeader variant="sub" title="Save to OCBC 360" />

      <div className="no-scrollbar flex-1 overflow-y-auto bg-ocbc-bg">
        {/* From → To, OCBC transfer style */}
        <div className="bg-white px-5 pb-4 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-slate">
            Move money
          </p>
          <div className="mt-2.5 space-y-2">
            <AccountRow
              initials={account.initials}
              name={account.name}
              sub={`${formatSGD(balance)} available`}
            />
            <div className="flex items-center gap-2 pl-3 text-ocbc-slate">
              <ArrowDown size={16} />
              <span className="text-[12px] font-medium">into your savings</span>
            </div>
            <AccountRow
              initials={savingsAccount.initials}
              name={savingsAccount.name}
              sub={`${formatSGD(savings)} saved`}
            />
          </div>
        </div>

        {step === "amount" ? (
          <AmountStep
            amount={amount}
            press={press}
            balance={balance}
            onQuick={(v) => {
              setPristine(false);
              setAmount(String(v));
            }}
            onNext={() => setStep("review")}
            valid={numericAmount > 0 && numericAmount <= balance}
          />
        ) : (
          <ReviewStep
            amount={numericAmount}
            balance={balance}
            savings={savings}
            projectedLow={projectedLow}
            onEdit={() => setStep("amount")}
            onConfirm={save}
          />
        )}
      </div>
    </PageTransition>
  );
}

/* ----------------------------- helpers ----------------------------- */

function AccountRow({
  initials,
  name,
  sub,
}: {
  initials: string;
  name: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-ocbc-bg px-3 py-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ocbc-peach text-[13px] font-bold text-ocbc-redDark">
        {initials}
      </span>
      <div className="flex-1">
        <p className="text-[14.5px] font-bold text-ocbc-ink">{name}</p>
        <p className="text-[12px] text-ocbc-slate">{sub}</p>
      </div>
    </div>
  );
}

/* ----------------------------- Amount step ----------------------------- */

function AmountStep({
  amount,
  press,
  balance,
  onQuick,
  onNext,
  valid,
}: {
  amount: string;
  press: (k: string) => void;
  balance: number;
  onQuick: (v: number) => void;
  onNext: () => void;
  valid: boolean;
}) {
  const over = Number(amount || 0) > balance;
  return (
    <>
      <div className="px-5 py-7 text-center">
        <p className="text-[12.5px] font-medium text-ocbc-slate">Amount to save</p>
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

        {/* Quick amounts */}
        <div className="mt-4 flex justify-center gap-2">
          {suggested.map((v) => (
            <button
              key={v}
              onClick={() => onQuick(v)}
              className="rounded-full border border-ocbc-line bg-white px-3.5 py-1.5 text-[13px] font-bold text-ocbc-ink active:bg-ocbc-bg"
            >
              {formatSGD0(v)}
            </button>
          ))}
        </div>
      </div>

      <Keypad onPress={press} />

      <div className="bg-white px-4 pb-5 pt-4">
        <PrimaryButton onClick={onNext} className={valid ? "" : "pointer-events-none opacity-40"}>
          <span className="flex items-center justify-center gap-1.5">
            Review
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
  balance,
  savings,
  projectedLow,
  onEdit,
  onConfirm,
}: {
  amount: number;
  balance: number;
  savings: number;
  projectedLow: number;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  // Guardian checks the move is comfortable — saving is good, but it shouldn't
  // push the spending account under the cushion before payday.
  const lowAfter = projectedLow - amount;
  const tight = lowAfter < SAFETY_BUFFER;

  const rows = [
    { label: "From", value: account.name },
    { label: "To", value: savingsAccount.name },
    { label: "New savings balance", value: formatSGD(savings + amount) },
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
          <p className="text-[12px] font-medium text-ocbc-slate">You&apos;re saving</p>
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

      {/* Guardian check — always-on, forecast-aware, never blocking */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35 }}
        className={`mt-3 flex items-start gap-2.5 rounded-xl2 p-3.5 ${
          tight ? "bg-amber-50 ring-1 ring-amber-100" : "bg-emerald-50/70"
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ${
            tight ? "text-ocbc-amber" : "text-ocbc-green"
          }`}
        >
          <ShieldCheck size={17} strokeWidth={2.25} />
        </span>
        <div className="flex-1">
          <p className="text-[13.5px] font-bold leading-snug text-ocbc-ink">
            {tight
              ? "Great that you're saving — just a heads-up."
              : "Nice — this is a healthy amount to set aside."}
          </p>
          <p className="mt-0.5 text-[12px] text-ocbc-slate">
            {tight
              ? `Saving this would leave your spending account dipping to about ${formatSGD0(
                  lowAfter
                )} before payday — under your ${formatSGD0(
                  SAFETY_BUFFER
                )} cushion. You can still go ahead.`
              : `Your spending account stays above your ${formatSGD0(
                  SAFETY_BUFFER
                )} cushion before payday.`}
          </p>
        </div>
      </motion.div>

      <div className="mt-4">
        <PrimaryButton onClick={onConfirm}>Save {formatSGD(amount)}</PrimaryButton>
      </div>
    </div>
  );
}
