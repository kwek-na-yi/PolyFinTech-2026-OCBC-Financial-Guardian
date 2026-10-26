"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Home as HomeIcon,
  Music2,
  Bot,
  ShieldCheck,
  Check,
  Search,
  TrendingUp,
  Plug,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import SectionCard from "@/components/SectionCard";
import HealthScoreRing from "@/components/HealthScoreRing";
import PrimaryButton from "@/components/PrimaryButton";
import PageTransition from "@/components/PageTransition";
import WhyThis from "@/components/WhyThis";
import { useGuardian } from "@/components/GuardianStateProvider";
import {
  healthScore,
  upcomingPayments,
  lifeEvent,
  SAFETY_BUFFER,
  formatSGD,
  formatSGD0,
} from "@/lib/mockData";

const payIcon = {
  spotify: Music2,
  chatgpt: Bot,
  insurance: ShieldCheck,
} as const;

// Icons mapped to each explainability signal
const signalIcon = [Search, TrendingUp, Plug];

// Defensible outlook bands the customer can read at a glance — the number is
// only supporting evidence behind the status, never the headline.
const scoreStatus = (s: number): string =>
  s >= 90 ? "Looking great" : s >= 75 ? "Healthy" : s >= 60 ? "A bit tight" : "Needs attention";

export default function GuardianAnalysisPage() {
  const router = useRouter();
  const { healthScore: liveScore, projectedLow, forecast, risk } = useGuardian();
  const scoreDelta = liveScore - (healthScore.score - healthScore.delta);
  const belowCushion = projectedLow < SAFETY_BUFFER;

  return (
    <PageTransition>
      <AppHeader variant="sub" title="Full Details" />

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-ocbc-bg px-4 pb-28 pt-3">
        {/* Intro line */}
        <p className="text-[13px] leading-snug text-ocbc-slate">
          The detail behind today&apos;s check-in — your status, what to watch, what&apos;s due, and
          what I&apos;m keeping an eye on. You&apos;re always in control.
        </p>

        {/* Health score + contributing factors */}
        <SectionCard
          title="Today's Financial Status"
          icon={<Activity size={18} className="text-ocbc-red" />}
        >
          <HealthScoreRing
            score={liveScore}
            status={scoreStatus(liveScore)}
            delta={scoreDelta}
          />

          <div className="mt-4 grid grid-cols-1 gap-3">
            {/* Positive factors */}
            <div className="rounded-xl bg-emerald-50/70 p-3">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ocbc-green">
                What&apos;s going well
              </p>
              <div className="space-y-1.5">
                {healthScore.positiveFactors.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-ocbc-green" />
                    <span className="text-[13px] text-ocbc-ink">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attention areas */}
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-amber-700">
                Worth watching
              </p>
              <div className="space-y-1.5">
                {healthScore.attentionAreas.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-ocbc-amber" />
                    <span className="text-[13px] text-ocbc-ink">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Upcoming risks — derived live from the current forecast */}
        <SectionCard
          title="Something to Watch"
          icon={
            belowCushion ? (
              <AlertTriangle size={18} className="text-ocbc-amber" />
            ) : (
              <Check size={18} strokeWidth={3} className="text-ocbc-green" />
            )
          }
          delay={0.05}
        >
          {belowCushion ? (
            <div className="flex gap-3 rounded-xl bg-amber-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle size={18} className="text-ocbc-amber" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ocbc-ink">
                  Your balance could dip below {formatSGD0(SAFETY_BUFFER)} in about{" "}
                  {forecast.lowDay} days.
                </p>
                <p className="mt-0.5 text-[12.5px] text-ocbc-slate">
                  Lowest point: {formatSGD(projectedLow)} around day {forecast.lowDay}.
                  {risk === "High"
                    ? " This one's tight — let's look at your options together."
                    : " I've got a plan to keep you above your cushion."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 rounded-xl bg-emerald-50/70 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Check size={18} strokeWidth={3} className="text-ocbc-green" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ocbc-ink">
                  Nothing to watch right now — you&apos;re staying above your cushion.
                </p>
                <p className="mt-0.5 text-[12.5px] text-ocbc-slate">
                  Your lowest point before payday is {formatSGD(projectedLow)} around day{" "}
                  {forecast.lowDay}, comfortably above your {formatSGD0(SAFETY_BUFFER)} cushion.
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Upcoming payments */}
        <SectionCard
          title="Coming Out Soon"
          icon={<CalendarClock size={18} className="text-ocbc-red" />}
          delay={0.1}
        >
          <div className="divide-y divide-ocbc-line">
            {upcomingPayments.map((p) => {
              const Icon = payIcon[p.icon];
              return (
                <div key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ocbc-bg">
                    <Icon size={18} className="text-ocbc-ink" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-ocbc-ink">{p.merchant}</p>
                    <p className="text-[12px] text-ocbc-slate">Due {p.due}</p>
                  </div>
                  <span className="text-[14px] font-bold text-ocbc-ink">
                    {formatSGD(p.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Life event signal — explainable AI + business value */}
        <SectionCard
          title="Something I Noticed"
          icon={<HomeIcon size={18} className="text-ocbc-red" />}
          delay={0.15}
        >
          <div className="rounded-xl bg-gradient-to-br from-rose-50 to-white p-3.5 ring-1 ring-rose-100">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ocbc-red/10">
                <HomeIcon size={22} className="text-ocbc-red" />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-ocbc-ink">{lifeEvent.title}</p>
                <p className="text-[12px] text-ocbc-slate">{lifeEvent.summary}</p>
              </div>
            </div>

            {/* Explainability — signals observed */}
            <div className="mt-3.5">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
                What I spotted
              </p>
              <div className="space-y-2">
                {lifeEvent.signals.map((s, i) => {
                  const Icon = signalIcon[i] ?? Check;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 + i * 0.09 }}
                      className="flex items-center gap-2.5 rounded-lg bg-white/80 px-2.5 py-2"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocbc-red/10 text-ocbc-red">
                        <Icon size={14} strokeWidth={2.25} />
                      </span>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-ocbc-ink">{s.label}</p>
                        <p className="text-[11.5px] text-ocbc-slate">{s.detail}</p>
                      </div>
                      <Check size={15} strokeWidth={3} className="text-ocbc-green" />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[12px] font-semibold">
                <span className="text-ocbc-slate">How sure I am</span>
                <span className="text-ocbc-red">{lifeEvent.confidence}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-rose-100">
                <motion.div
                  className="ocbc-gradient h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${lifeEvent.confidence}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <WhyThis text={lifeEvent.why} />
            </div>

            {/* Business value — recommended OCBC services */}
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-ocbc-red" />
                <p className="text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
                  OCBC could help with
                </p>
              </div>
              <div className="space-y-2">
                {lifeEvent.services.map((svc, i) => (
                  <motion.button
                    key={svc.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center gap-3 rounded-xl border border-ocbc-line bg-white px-3 py-2.5 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ocbc-red text-white">
                      <HomeIcon size={17} />
                    </span>
                    <div className="flex-1">
                      <p className="text-[13.5px] font-bold text-ocbc-ink">{svc.name}</p>
                      <p className="text-[11.5px] text-ocbc-slate">{svc.desc}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ocbc-red">
                      {svc.tag}
                    </span>
                    <ChevronRight size={16} className="text-ocbc-mute" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Sticky CTA */}
      <div className="absolute inset-x-0 bottom-0 border-t border-ocbc-line bg-white px-4 py-3">
        <PrimaryButton onClick={() => router.push("/guardian/cashflow")}>
          <span className="flex items-center justify-center gap-1.5">
            See your money forecast
            <ChevronRight size={18} strokeWidth={2.5} />
          </span>
        </PrimaryButton>
      </div>
    </PageTransition>
  );
}
