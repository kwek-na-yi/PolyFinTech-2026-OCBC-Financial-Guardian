"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check } from "lucide-react";

/**
 * Press-and-hold consent gesture — the physical "human in control" moment.
 *
 * Guardian never moves money on its own; the customer must deliberately hold
 * to approve. A filling ring + sweep + haptic make consent tangible (and
 * demo-memorable) rather than a casual tap. Works with mouse, touch and pen
 * via pointer events. Fires `onApprove` exactly once when the hold completes.
 */
export default function HoldToApprove({
  label,
  onApprove,
  holdMs = 1050,
  disabled = false,
}: {
  label: string;
  onApprove: () => void;
  holdMs?: number;
  disabled?: boolean;
}) {
  const [progress, setProgress] = useState(0); // 0..1
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const doneRef = useRef(false);

  const buzz = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        /* haptics unsupported — ignore */
      }
    }
  };

  const stopRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopRaf();
    setHolding(false);
    setDone(true);
    setProgress(1);
    buzz([12, 40, 18]);
    // Let the fill + checkmark land before navigating away.
    window.setTimeout(onApprove, 360);
  }, [onApprove]);

  const tick = useCallback(() => {
    const p = Math.min(1, (performance.now() - startRef.current) / holdMs);
    setProgress(p);
    if (p >= 1) {
      complete();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [holdMs, complete]);

  const start = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (doneRef.current || disabled) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setHolding(true);
    startRef.current = performance.now();
    buzz(10);
    stopRaf();
    rafRef.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (doneRef.current) return;
    stopRaf();
    setHolding(false);
    setProgress(0); // CSS transition (below) eases it back down
  };

  useEffect(() => () => stopRaf(), []);

  const R = 13;
  const C = 2 * Math.PI * R;

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      aria-disabled={disabled}
      className={`relative w-full select-none overflow-hidden rounded-full py-3.5 shadow-[0_6px_16px_rgba(236,0,0,0.28)] outline-none ${
        disabled ? "pointer-events-none opacity-40" : ""
      }`}
      style={{ touchAction: "none" }}
    >
      {/* Base gradient */}
      <span className="absolute inset-0 ocbc-gradient" />

      {/* Hold progress sweep — brighter wash that fills left→right */}
      <span
        className="absolute inset-y-0 left-0 bg-white/25"
        style={{
          width: `${progress * 100}%`,
          transition: holding ? "none" : "width 300ms ease-out",
        }}
      />

      {/* Foreground content */}
      <span className="relative flex items-center justify-center gap-2 text-[15px] font-bold tracking-wide text-white">
        {/* Consent ring */}
        <span className="relative flex h-7 w-7 items-center justify-center">
          <svg className="h-7 w-7 -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r={R} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <circle
              cx="16"
              cy="16"
              r={R}
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              style={{ transition: holding ? "none" : "stroke-dashoffset 300ms ease-out" }}
            />
          </svg>
          <span className="absolute">
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 360, damping: 18 }}
                >
                  <Check size={14} strokeWidth={3.5} />
                </motion.span>
              ) : (
                <motion.span key="shield" exit={{ scale: 0, opacity: 0 }}>
                  <ShieldCheck size={14} strokeWidth={2.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </span>

        {done ? "Approved" : holding ? "Keep holding…" : label}
      </span>
    </button>
  );
}
