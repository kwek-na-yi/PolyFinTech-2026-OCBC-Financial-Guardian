"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  Home as HomeIcon,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { guardianAlertResolved, formatSGD0 } from "@/lib/mockData";
import { useGuardian, type Activity } from "@/components/GuardianStateProvider";

/**
 * Guardian's one-line acknowledgment of the customer's most recent money move,
 * so the home card reacts to recent activity instead of repeating a stale alert.
 */
function activityNote(a: Activity): string | null {
  if (!a) return null;
  const amt = formatSGD0(a.amount);
  const to = a.merchant ? ` to ${a.merchant}` : "";
  if (a.kind === "save")
    return `I set aside ${amt} in your savings — I'll keep it ready in case a week runs tight.`;
  if (a.kind === "scan")
    return `I logged your ${amt} payment${to} — your budget's up to date.`;
  return `I saw you sent ${amt}${to} — I'm keeping an eye on the rest of your month.`;
}

const bulletIcon = {
  risk: TrendingDown,
  home: HomeIcon,
  shield: ShieldCheck,
} as const;

export default function GuardianCard() {
  const router = useRouter();
  const { planApproved, healthScore, before, risk, guardian, lastActivity } =
    useGuardian();
  const alert = guardian.alert;
  const healthy = alert.tone === "ok";
  const ack = activityNote(lastActivity);

  if (planApproved)
    return (
      <GuardianCardSuccess
        onClick={() => router.push("/guardian")}
        scoreBefore={before.healthScore}
        scoreAfter={healthScore}
        bufferSecured={risk === "Low"}
      />
    );

  return (
    <motion.button
      onClick={() => router.push("/guardian")}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="block w-full overflow-hidden rounded-xl2 bg-white text-left shadow-card ring-1 ring-black/[0.04]"
    >
      {/* Header band */}
      <div className="ocbc-gradient relative px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <ShieldCheck size={22} className="text-white" strokeWidth={2.25} />
            <motion.span
              className="absolute inset-0 rounded-full ring-2 ring-white/50"
              animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-white">Financial Guardian</h3>
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                AI
              </span>
            </div>
            <p className="text-[12px] font-medium text-white/85">
              I keep an eye on your money
            </p>
          </div>
        </div>
      </div>

      {/* Recent-activity acknowledgment — Guardian reacts to what you just did */}
      {ack && (
        <div className="flex items-start gap-2 border-b border-ocbc-line bg-rose-50/40 px-4 py-2">
          <Sparkles size={13} className="mt-0.5 shrink-0 text-ocbc-red" />
          <p className="text-[12px] font-medium leading-snug text-ocbc-slate">{ack}</p>
        </div>
      )}

      {/* Status banner — calm when healthy, urgent when the forecast dips */}
      <div className={`flex items-center gap-2 px-4 py-2.5 ${healthy ? "bg-emerald-50" : "bg-amber-50"}`}>
        <motion.span
          animate={healthy ? undefined : { scale: [1, 1.12, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className={`flex h-6 w-6 items-center justify-center rounded-full ${healthy ? "bg-ocbc-green" : "bg-ocbc-amber"}`}
        >
          {healthy ? (
            <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
          ) : (
            <AlertTriangle size={14} className="text-white" strokeWidth={2.5} />
          )}
        </motion.span>
        <span className={`text-[12.5px] font-extrabold uppercase tracking-wide ${healthy ? "text-emerald-700" : "text-amber-700"}`}>
          {alert.status}
        </span>
      </div>

      {/* Headline */}
      <div className="px-4 pb-3 pt-3">
        <p className="text-[16px] font-bold leading-snug text-ocbc-ink">
          {alert.headline}
        </p>

        <div className="mt-3 space-y-2">
          {alert.bullets.map((b) => {
            const Icon = bulletIcon[b.icon];
            return (
              <div key={b.text} className="flex items-center gap-2.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    healthy ? "bg-emerald-50 text-ocbc-green" : "bg-rose-50 text-ocbc-red"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.25} />
                </span>
                <span className="text-[13.5px] font-medium text-ocbc-slate">{b.text}</span>
              </div>
            );
          })}
        </div>

        {/* Recommendation count chip */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-ocbc-bg px-3 py-2">
          <span
            className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] font-bold text-white ${
              healthy ? "bg-ocbc-green" : "bg-ocbc-red"
            }`}
          >
            {alert.recommendationCount}
          </span>
          <span className="text-[13px] font-semibold text-ocbc-ink">
            {healthy ? "things I'm keeping an eye on" : "things I'd suggest doing"}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="ocbc-gradient flex items-center justify-center gap-1 py-3.5 text-[15px] font-bold text-white">
        {healthy ? "See your check-in" : "See what I found"}
        <ChevronRight size={18} strokeWidth={2.5} />
      </div>
    </motion.button>
  );
}

/** Post-approval success state shown on the dashboard. */
function GuardianCardSuccess({
  onClick,
  scoreBefore,
  scoreAfter,
  bufferSecured,
}: {
  onClick: () => void;
  scoreBefore: number;
  scoreAfter: number;
  bufferSecured: boolean;
}) {
  const bullets = bufferSecured
    ? guardianAlertResolved.bullets
    : [
        { icon: "shield" as const, text: "Your spending is back to normal" },
        guardianAlertResolved.bullets[1],
      ];
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="block w-full overflow-hidden rounded-xl2 bg-white text-left shadow-card ring-1 ring-black/[0.04]"
    >
      {/* Header band */}
      <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <ShieldCheck size={22} className="text-white" strokeWidth={2.25} />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-white">Financial Guardian</h3>
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {guardianAlertResolved.status}
              </span>
            </div>
            <p className="text-[12px] font-medium text-white/85">{guardianAlertResolved.subline}</p>
          </div>
        </div>
      </div>

      {/* Success banner */}
      <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ocbc-green">
          <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
        </span>
        <span className="text-[12.5px] font-extrabold uppercase tracking-wide text-emerald-700">
          You&apos;re all set
        </span>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
          Next check · {guardianAlertResolved.nextReview}
        </span>
      </div>

      <div className="px-4 pb-3 pt-3">
        <p className="text-[15.5px] font-bold leading-snug text-ocbc-ink">
          {guardianAlertResolved.headline}
        </p>

        <div className="mt-3 space-y-2">
          {bullets.map((b) => {
            const Icon = bulletIcon[b.icon];
            return (
              <div key={b.text} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-ocbc-green">
                  <Icon size={15} strokeWidth={2.25} />
                </span>
                <span className="text-[13.5px] font-medium text-ocbc-slate">{b.text}</span>
              </div>
            );
          })}
        </div>

        {/* Health score uplift chip */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-ocbc-bg px-3 py-2">
          <span className="text-[12px] font-semibold text-ocbc-slate">Your status</span>
          <span className="text-[13px] font-bold text-ocbc-ink">
            {scoreBefore} → {scoreAfter}
          </span>
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-ocbc-green">
            ▲ {scoreAfter - scoreBefore}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 bg-gradient-to-br from-emerald-600 to-emerald-700 py-3.5 text-[15px] font-bold text-white">
        Open Guardian
        <ChevronRight size={18} strokeWidth={2.5} />
      </div>
    </motion.button>
  );
}
