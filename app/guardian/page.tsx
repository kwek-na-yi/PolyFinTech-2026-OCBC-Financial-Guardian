"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  TrendingUp,
  Home as HomeIcon,
  TrendingDown,
  ChevronRight,
  Sparkles,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PrimaryButton from "@/components/PrimaryButton";
import PageTransition from "@/components/PageTransition";
import RecommendationBody from "@/components/RecommendationBody";
import { GuardianThinking } from "@/components/GuardianSequence";
import { useGuardian } from "@/components/GuardianStateProvider";
import { customer, type BriefingTone } from "@/lib/mockData";

const itemIcon = {
  risk: AlertTriangle,
  salary: ArrowUpRight,
  payments: CalendarClock,
  anomaly: TrendingUp,
  home: HomeIcon,
} as const;

const toneStyle: Record<
  BriefingTone,
  { accent: string; chipBg: string; iconBg: string; iconText: string }
> = {
  risk: { accent: "bg-ocbc-red", chipBg: "bg-rose-50", iconBg: "bg-rose-50", iconText: "text-ocbc-red" },
  positive: { accent: "bg-ocbc-green", chipBg: "bg-emerald-50", iconBg: "bg-emerald-50", iconText: "text-ocbc-green" },
  info: { accent: "bg-ocbc-blue", chipBg: "bg-sky-50", iconBg: "bg-sky-50", iconText: "text-ocbc-blue" },
  warning: { accent: "bg-ocbc-amber", chipBg: "bg-amber-50", iconBg: "bg-amber-50", iconText: "text-ocbc-amber" },
  signal: { accent: "bg-ocbc-red", chipBg: "bg-rose-50", iconBg: "bg-rose-50", iconText: "text-ocbc-red" },
};

export default function DailyBriefingPage() {
  const router = useRouter();
  const { planApproved, healthScore, lastRiskReduction, guardian } = useGuardian();
  // The briefing, recommendations and confidence all come straight from the
  // live Guardian model, so this screen reflects whatever just happened.
  const { briefing, recommendations, confidence } = guardian;
  // Guardian "thinks" once on entry — it reviewed everything before you opened
  // the app. Already-approved plans skip straight to the (updated) briefing.
  const [analysing, setAnalysing] = useState(!planApproved);

  return (
    <PageTransition>
      <AnimatePresence>
        {analysing && <GuardianThinking onDone={() => setAnalysing(false)} />}
      </AnimatePresence>

      <AppHeader variant="sub" title="Your Money Today" />

      <div className="no-scrollbar flex-1 overflow-y-auto bg-ocbc-bg pb-40">
        {/* Advisor hero */}
        <div className="ocbc-gradient px-5 pb-6 pt-5 text-white">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <ShieldCheck size={24} strokeWidth={2.25} />
              <motion.span
                className="absolute inset-0 rounded-full ring-2 ring-white/40"
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </span>
            <div>
              <p className="text-[12px] font-medium text-white/80">
                Financial Guardian · {briefing.date}
              </p>
              <h1 className="text-[20px] font-extrabold leading-tight">
                {briefing.greeting}, {customer.firstName}
              </h1>
            </div>
          </div>

          {/* Advisor message bubble */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 rounded-2xl rounded-tl-sm bg-white/15 p-3.5 backdrop-blur"
          >
            <p className="text-[14px] leading-relaxed text-white">{briefing.intro}</p>
          </motion.div>

          {/* At-a-glance summary */}
          <div className="mt-3 flex gap-2">
            <SummaryChip label="To watch" value={briefing.summary.risks} tone="risk" />
            <SummaryChip label="Unusual" value={briefing.summary.anomalies} tone="anomaly" />
            <SummaryChip label="To do" value={briefing.summary.actions} tone="action" />
          </div>
        </div>

        {/* Plan-active banner (post approval) */}
        {planApproved && (
          <div className="px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="-mt-4 mb-1 flex items-center gap-2.5 rounded-xl2 bg-emerald-600 p-3.5 text-white shadow-card"
            >
              <CheckCircle2 size={20} className="shrink-0" />
              <p className="text-[13.5px] font-semibold leading-snug">
                Your plan&apos;s on — {lastRiskReduction}% less chance of running low. Your status
                is now {healthScore}.
              </p>
            </motion.div>
          </div>
        )}

        {/* Headline takeaway */}
        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className={`flex items-start gap-3 rounded-xl2 bg-white p-4 shadow-card ring-1 ring-black/[0.04] ${
              planApproved ? "" : "-mt-4"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-ocbc-red">
              <TrendingDown size={18} strokeWidth={2.25} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-red">
                The main thing
              </p>
              <p className="mt-0.5 text-[14.5px] font-semibold leading-snug text-ocbc-ink">
                {briefing.headline}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Briefing items — advisor narration */}
        <div className="mt-3 space-y-2.5 px-4">
          <p className="px-1 text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
            What I noticed
          </p>
          {briefing.items.map((item, i) => {
            const Icon = itemIcon[item.icon];
            const t = toneStyle[item.tone];
            const clickable = Boolean(item.href);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                onClick={() => item.href && router.push(item.href)}
                className={`relative overflow-hidden rounded-xl2 bg-white p-3.5 pl-4 shadow-card ring-1 ring-black/[0.03] ${
                  clickable ? "cursor-pointer active:bg-ocbc-bg/40" : ""
                }`}
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${t.accent}`} />
                <div className="flex items-start gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.iconBg} ${t.iconText}`}>
                    <Icon size={18} strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="flex-1 text-[14.5px] font-bold text-ocbc-ink">{item.title}</p>
                      {clickable && <ChevronRight size={16} className="shrink-0 text-ocbc-mute" />}
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-ocbc-slate">
                      {item.narration}
                    </p>
                    {item.chips && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {item.chips.map((c) => (
                          <span
                            key={c.label}
                            className={`rounded-lg ${t.chipBg} px-2 py-1 text-[11.5px] font-semibold text-ocbc-ink`}
                          >
                            <span className="text-ocbc-slate">{c.label}: </span>
                            {c.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recommended plan */}
        <div className="mt-5 space-y-2.5 px-4">
          <div className="flex items-center gap-1.5 px-1">
            <Sparkles size={15} className="text-ocbc-red" />
            <p className="flex-1 text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
              What I&apos;d do
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-ocbc-green">
              {confidence}% sure
            </span>
          </div>

          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
              className="overflow-hidden rounded-xl2 bg-white p-4 shadow-card ring-1 ring-ocbc-line"
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-[15px] font-bold text-ocbc-ink">{rec.title}</p>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-ocbc-green">
                  <TrendingUp size={12} /> {rec.riskReduction}% safer
                </span>
              </div>
              <RecommendationBody rec={rec} />
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-3 grid grid-cols-2 gap-2.5 px-4">
          <button
            onClick={() => router.push("/guardian/cashflow")}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-left shadow-card ring-1 ring-ocbc-line active:bg-ocbc-bg/40"
          >
            <BarChart3 size={18} className="text-ocbc-red" />
            <span className="text-[12.5px] font-bold leading-tight text-ocbc-ink">
              Money Forecast
            </span>
          </button>
          <button
            onClick={() => router.push("/guardian/overview")}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-left shadow-card ring-1 ring-ocbc-line active:bg-ocbc-bg/40"
          >
            <ClipboardList size={18} className="text-ocbc-red" />
            <span className="text-[12.5px] font-bold leading-tight text-ocbc-ink">
              Full Details
            </span>
          </button>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="absolute inset-x-0 bottom-0 border-t border-ocbc-line bg-white px-4 py-3">
        <PrimaryButton onClick={() => router.push("/guardian/actions")}>
          <span className="flex items-center justify-center gap-1.5">
            See the plan
            <ChevronRight size={18} strokeWidth={2.5} />
          </span>
        </PrimaryButton>
      </div>
    </PageTransition>
  );
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "risk" | "anomaly" | "action";
}) {
  const dot =
    tone === "risk" ? "bg-white" : tone === "anomaly" ? "bg-amber-200" : "bg-emerald-200";
  return (
    <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-[18px] font-extrabold leading-none text-white">{value}</span>
      <span className="text-[11.5px] font-medium text-white/85">{label}</span>
    </div>
  );
}
