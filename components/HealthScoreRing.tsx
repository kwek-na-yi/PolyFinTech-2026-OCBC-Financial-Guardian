"use client";

import { motion } from "framer-motion";

interface HealthScoreRingProps {
  score: number; // 0 - 100
  status: string;
  delta?: number; // change vs last month
}

export default function HealthScoreRing({ score, status, delta }: HealthScoreRingProps) {
  const size = 132;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - score / 100);

  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F0E4E2"
            strokeWidth={stroke}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC0000" />
              <stop offset="100%" stopColor="#A30000" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-[38px] font-extrabold leading-none text-ocbc-ink"
          >
            {score}
          </motion.span>
          <span className="mt-0.5 text-[11px] font-semibold text-ocbc-mute">/ 100</span>
        </div>
      </div>

      <div className="flex-1">
        {/* Status leads — the defensible word the customer reads first */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ocbc-green" />
          <span className="text-[18px] font-extrabold leading-tight text-ocbc-ink">{status}</span>
        </div>
        {typeof delta === "number" && (
          <span className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-1 text-[12px] font-bold text-ocbc-green">
            ▲ {delta} since last month
          </span>
        )}
        <p className="mt-2 text-[12.5px] leading-snug text-ocbc-slate">
          Based on 6 live things — your pay, bills, spending, savings cushion and your next 30
          days.
        </p>
      </div>
    </div>
  );
}
