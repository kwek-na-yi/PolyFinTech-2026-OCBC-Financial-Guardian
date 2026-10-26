"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Check, Loader2, Sparkles } from "lucide-react";

/**
 * The moment Guardian visibly *works* — a short, calm sequence that ticks
 * through its reasoning (before a recommendation) or its execution (after the
 * customer approves). This is what turns the prototype from an analytics
 * dashboard into an agent that thinks, plans and acts: the customer watches the
 * AI do the work, not just present a result. Apple-Wallet calm, never flashy,
 * always skippable so it never slows a live demo.
 */

interface SequenceProps {
  steps: string[];
  onDone: () => void;
  title: string;
  caption: string;
  finalLabel: string;
  tone: "analyse" | "execute";
  stepMs?: number;
  skippable?: boolean;
}

function GuardianSequence({
  steps,
  onDone,
  title,
  caption,
  finalLabel,
  tone,
  stepMs = 300,
  skippable = true,
}: SequenceProps) {
  const [active, setActive] = useState(0);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    if (active >= steps.length) {
      const t = window.setTimeout(finish, 760);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setActive((a) => a + 1), stepMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, steps.length, stepMs]);

  const allDone = active >= steps.length;
  const isExec = tone === "execute";
  const progress = (Math.min(active, steps.length) / steps.length) * 100;

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/55 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative m-3 rounded-[1.75rem] bg-white p-5 shadow-float"
      >
        {/* Guardian header */}
        <div className="flex items-center gap-3">
          <span
            className={`relative flex h-11 w-11 items-center justify-center rounded-full text-white ${
              isExec ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "ocbc-gradient"
            }`}
          >
            <ShieldCheck size={22} strokeWidth={2.25} />
            <motion.span
              className="absolute inset-0 rounded-full ring-2 ring-white/40"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ocbc-mute">
              {caption}
            </p>
            <p className="text-[16px] font-extrabold leading-tight text-ocbc-ink">{title}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ocbc-bg">
          <motion.div
            className={`h-full rounded-full ${isExec ? "bg-ocbc-green" : "ocbc-gradient"}`}
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
          />
        </div>

        {/* Steps cascade in, each resolving to a check as the next begins */}
        <div className="mt-3.5 space-y-0.5">
          {steps.map((s, i) => {
            if (i > active) return null;
            const complete = i < active;
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 py-1.5"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    complete
                      ? isExec
                        ? "bg-ocbc-green text-white"
                        : "bg-emerald-50 text-ocbc-green"
                      : "bg-ocbc-bg text-ocbc-mute"
                  }`}
                >
                  {complete ? (
                    <Check size={13} strokeWidth={3} />
                  ) : (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                </span>
                <span
                  className={`text-[13.5px] ${
                    complete ? "font-semibold text-ocbc-ink" : "text-ocbc-slate"
                  }`}
                >
                  {s}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Resolution */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 ${
                isExec ? "bg-emerald-50" : "bg-rose-50"
              }`}
            >
              {isExec ? (
                <Check size={16} strokeWidth={3} className="text-ocbc-green" />
              ) : (
                <Sparkles size={15} className="text-ocbc-red" />
              )}
              <p
                className={`text-[13.5px] font-bold ${
                  isExec ? "text-ocbc-green" : "text-ocbc-red"
                }`}
              >
                {finalLabel}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {skippable && !allDone && (
          <button
            onClick={finish}
            className="mt-3 w-full text-center text-[12px] font-semibold text-ocbc-mute active:opacity-60"
          >
            Skip
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Guardian reasoning through the customer's finances before it recommends. */
export function GuardianThinking({
  onDone,
  steps,
  title = "Checking your money",
  caption = "Financial Guardian",
  finalLabel = "Here's what I found",
}: {
  onDone: () => void;
  steps?: string[];
  title?: string;
  caption?: string;
  finalLabel?: string;
}) {
  return (
    <GuardianSequence
      tone="analyse"
      stepMs={290}
      onDone={onDone}
      title={title}
      caption={caption}
      finalLabel={finalLabel}
      steps={
        steps ?? [
          "Checking your pay",
          "Looking at your next 30 days",
          "Going through your bills",
          "Checking your savings cushion",
          "Working out where you'll land",
        ]
      }
    />
  );
}

/** Guardian carrying out the plan the customer just approved. */
export function GuardianExecution({
  onDone,
  steps,
  title = "Setting up your plan",
  caption = "Financial Guardian",
  finalLabel = "All done",
}: {
  onDone: () => void;
  steps?: string[];
  title?: string;
  caption?: string;
  finalLabel?: string;
}) {
  return (
    <GuardianSequence
      tone="execute"
      stepMs={300}
      onDone={onDone}
      title={title}
      caption={caption}
      finalLabel={finalLabel}
      steps={
        steps ?? [
          "Checking your balance",
          "Moving the money",
          "Updating your forecast",
          "Refreshing your next 30 days",
          "Keeping you above your cushion",
        ]
      }
    />
  );
}
