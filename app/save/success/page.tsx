"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Wallet, PiggyBank, ArrowRight } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import PageTransition from "@/components/PageTransition";
import LearningNote from "@/components/LearningNote";
import { useGuardian } from "@/components/GuardianStateProvider";
import { savingsAccount, account, formatSGD, formatSGD0 } from "@/lib/mockData";

export default function SaveSuccessPage() {
  const router = useRouter();
  const { balance, savings, before, lastPayAmount } = useGuardian();
  const amount = lastPayAmount;
  const savingsBefore = before.savings;

  const rows = [
    {
      icon: PiggyBank,
      label: savingsAccount.name,
      before: formatSGD(savingsBefore),
      after: formatSGD(savings),
      good: true,
    },
    {
      icon: Wallet,
      label: account.name,
      before: formatSGD(before.balance),
      after: formatSGD(balance),
      good: true,
    },
  ];

  return (
    <PageTransition>
      <div className="no-scrollbar flex-1 overflow-y-auto bg-ocbc-bg pb-32">
        {/* Success hero */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 pb-8 pt-10 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 16 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
              <Check size={32} strokeWidth={3} className="text-emerald-600" />
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-[21px] font-extrabold leading-tight"
          >
            {formatSGD(amount)} saved
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-1.5 text-[14px] leading-snug text-white/90"
          >
            Moved into your {savingsAccount.name}.
          </motion.p>
        </div>

        <div className="space-y-2.5 px-4 pt-4">
          {/* Guardian confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-xl2 bg-emerald-50/70 p-3.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-ocbc-green">
              <PiggyBank size={17} />
            </span>
            <p className="text-[13.5px] leading-snug text-ocbc-ink">
              <span className="font-bold">Guardian: </span>
              You&apos;ve set aside {formatSGD0(amount)} more in your savings. It&apos;s safe in
              your {savingsAccount.name} — and it&apos;s exactly what I&apos;d top up from if a
              week runs tight before payday.
            </p>
          </motion.div>

          <p className="px-1 pt-1 text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
            What changed
          </p>

          {rows.map((it, i) => {
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
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-ocbc-green">
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
                  <ArrowRight size={16} className="shrink-0 text-ocbc-green" />
                  <div className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ocbc-green">
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
            delay={0.6}
            text="I've noted your bigger savings reserve — it's the first place I'll look if you ever need a top-up."
          />
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-ocbc-line bg-white px-4 pb-3 pt-3">
        <PrimaryButton onClick={() => router.push("/")}>Back to Home</PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => router.push("/save")}>
          Save more
        </PrimaryButton>
      </div>
    </PageTransition>
  );
}
