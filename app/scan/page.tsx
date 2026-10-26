"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Pencil,
  ShieldCheck,
  CheckCircle2,
  Store,
  Zap,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PrimaryButton from "@/components/PrimaryButton";
import Keypad from "@/components/Keypad";
import FakeQR from "@/components/FakeQR";
import PageTransition from "@/components/PageTransition";
import { useGuardian } from "@/components/GuardianStateProvider";
import { scanMerchant, scanAssessment, account, formatSGD } from "@/lib/mockData";

type Step = "scanning" | "amount" | "review";

export default function ScanPage() {
  const router = useRouter();
  const { payMerchant, balance, projectedLow } = useGuardian();

  const [step, setStep] = useState<Step>("scanning");
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

  const pay = () => {
    payMerchant(scanMerchant.name, numericAmount);
    router.push("/scan/success");
  };

  return (
    <PageTransition>
      <AppHeader variant="sub" title="Scan & Pay" />

      <AnimatePresence mode="wait">
        {step === "scanning" ? (
          <Scanner key="scan" onDetected={() => setStep("amount")} />
        ) : (
          <motion.div
            key="pay"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="no-scrollbar flex-1 overflow-y-auto bg-ocbc-bg"
          >
            {/* Merchant detected banner */}
            <div className="bg-white px-5 pb-4 pt-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-ocbc-green">
                <CheckCircle2 size={13} /> PayNow QR detected
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ocbc-peach text-ocbc-redDark">
                  <Store size={22} />
                </span>
                <div className="flex-1">
                  <p className="text-[16px] font-bold text-ocbc-ink">{scanMerchant.name}</p>
                  <p className="text-[12.5px] text-ocbc-slate">
                    {scanMerchant.location} · UEN {scanMerchant.uen}
                  </p>
                </div>
              </div>
            </div>

            {step === "amount" ? (
              <AmountStep
                amount={amount}
                press={press}
                balance={balance}
                onNext={() => setStep("review")}
                onQuick={(v) => {
                  setPristine(false);
                  setAmount(String(v));
                }}
                valid={numericAmount > 0 && numericAmount <= balance}
              />
            ) : (
              <ReviewStep
                amount={numericAmount}
                balance={balance}
                projectedLow={projectedLow}
                onEdit={() => setStep("amount")}
                onPay={pay}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

/* ------------------------------- Scanner ------------------------------- */

function Scanner({ onDetected }: { onDetected: () => void }) {
  const [locked, setLocked] = useState(false);

  // Auto-detect after a beat so the demo flows on its own; tap also works.
  useEffect(() => {
    const t = setTimeout(() => detect(), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detect = () => {
    if (locked) return;
    setLocked(true);
    setTimeout(onDetected, 650);
  };

  return (
    <motion.div
      key="scanner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex-1 overflow-hidden bg-[#0E0F12]"
    >
      {/* faux camera vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="relative flex h-full flex-col items-center justify-center px-8">
        <p className="mb-6 text-center text-[13px] font-medium text-white/70">
          Point your camera at a PayNow QR
        </p>

        {/* Viewfinder */}
        <button onClick={detect} className="relative" aria-label="Simulate scan">
          <div className="relative flex h-[260px] w-[260px] items-center justify-center rounded-[2rem] bg-white/[0.03]">
            {/* The QR being scanned */}
            <motion.div
              animate={locked ? { scale: 1.04 } : { scale: 1 }}
              className="rounded-2xl bg-white p-3 shadow-float"
            >
              <FakeQR size={168} />
            </motion.div>

            {/* Corner brackets */}
            {[
              "left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-2xl",
              "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-2xl",
              "left-0 bottom-0 border-l-[3px] border-b-[3px] rounded-bl-2xl",
              "right-0 bottom-0 border-r-[3px] border-b-[3px] rounded-br-2xl",
            ].map((c) => (
              <span
                key={c}
                className={`absolute h-9 w-9 ${c} ${
                  locked ? "border-ocbc-green" : "border-white"
                } transition-colors`}
              />
            ))}

            {/* Scan line */}
            {!locked && (
              <motion.span
                className="absolute left-3 right-3 h-[2px] rounded-full bg-ocbc-red shadow-[0_0_12px_2px_rgba(236,0,0,0.7)]"
                initial={{ top: 18 }}
                animate={{ top: [18, 224, 18] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Locked check */}
            <AnimatePresence>
              {locked && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-black/40 backdrop-blur-[1px]"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ocbc-green text-white">
                    <CheckCircle2 size={36} strokeWidth={2.5} />
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </button>

        <div className="mt-7 flex items-center gap-1.5 text-[12px] text-white/55">
          <Zap size={13} /> {locked ? "QR detected" : "Tap the code to simulate a scan"}
        </div>
      </div>
    </motion.div>
  );
}

/* ----------------------------- Amount step ----------------------------- */

function AmountStep({
  amount,
  press,
  balance,
  onNext,
  onQuick,
  valid,
}: {
  amount: string;
  press: (k: string) => void;
  balance: number;
  onNext: () => void;
  onQuick: (v: number) => void;
  valid: boolean;
}) {
  const over = Number(amount || 0) > balance;
  return (
    <>
      <div className="px-5 py-7 text-center">
        <p className="text-[12.5px] font-medium text-ocbc-slate">Amount to pay</p>
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
          {scanMerchant.suggested.map((v) => (
            <button
              key={v}
              onClick={() => onQuick(v)}
              className="rounded-full border border-ocbc-line bg-white px-3.5 py-1.5 text-[13px] font-bold text-ocbc-ink active:bg-ocbc-bg"
            >
              {formatSGD(v)}
            </button>
          ))}
        </div>
      </div>

      <Keypad onPress={press} />

      <div className="bg-white px-4 pb-5 pt-4">
        <PrimaryButton onClick={onNext} className={valid ? "" : "pointer-events-none opacity-40"}>
          <span className="flex items-center justify-center gap-1.5">
            Review Payment
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
  projectedLow,
  onEdit,
  onPay,
}: {
  amount: number;
  balance: number;
  projectedLow: number;
  onEdit: () => void;
  onPay: () => void;
}) {
  const { tone, message } = scanAssessment(amount, balance, projectedLow);
  const cautious = tone === "caution";
  const soft = tone === "note";
  return (
    <div className="px-4 pb-6 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl2 bg-white shadow-card"
      >
        <div className="border-b border-ocbc-line px-5 py-5 text-center">
          <p className="text-[12px] font-medium text-ocbc-slate">You're paying</p>
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
          <Row label="To" value={scanMerchant.name} />
          <Row label="Stall" value={scanMerchant.location} />
          <Row label="From" value={account.name} />
          <Row label="Method" value="PayNow QR" />
        </div>
      </motion.div>

      {/* Guardian reassurance / soft nudge — always-on, forecast-aware, never blocking */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`mt-3 flex items-start gap-2.5 rounded-xl2 p-3.5 ${
          cautious
            ? "bg-rose-50 ring-1 ring-rose-100"
            : soft
            ? "bg-amber-50 ring-1 ring-amber-100"
            : "bg-emerald-50/70"
        }`}
      >
        <ShieldCheck
          size={17}
          className={`mt-0.5 shrink-0 ${
            cautious ? "text-ocbc-red" : soft ? "text-ocbc-amber" : "text-ocbc-green"
          }`}
        />
        <p className="text-[13px] leading-snug text-ocbc-ink">
          <span className="font-bold">Guardian:</span> {message}
        </p>
      </motion.div>

      <div className="mt-4">
        <PrimaryButton onClick={onPay}>Pay {formatSGD(amount)}</PrimaryButton>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="shrink-0 text-[13px] text-ocbc-slate">{label}</span>
      <span className="text-right text-[14px] font-semibold text-ocbc-ink">{value}</span>
    </div>
  );
}
