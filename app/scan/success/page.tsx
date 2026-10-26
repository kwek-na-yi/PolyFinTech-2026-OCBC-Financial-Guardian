"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Wallet, Store, ArrowRight } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import PageTransition from "@/components/PageTransition";
import LearningNote from "@/components/LearningNote";
import { useGuardian } from "@/components/GuardianStateProvider";
import { formatSGD } from "@/lib/mockData";

export default function ScanSuccessPage() {
  const router = useRouter();
  const { lastMerchant, lastPayAmount, balance, before } = useGuardian();

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
            Done — you&apos;re all set
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-1.5 text-[14px] leading-snug text-white/90"
          >
            {formatSGD(lastPayAmount)} paid to {lastMerchant ?? "the merchant"}.
          </motion.p>
        </div>

        <div className="space-y-2.5 px-4 pt-4">
          {/* Receipt */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-xl2 bg-white p-4 shadow-card"
          >
            <div className="flex items-center gap-3 border-b border-ocbc-line pb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ocbc-peach text-ocbc-redDark">
                <Store size={20} />
              </span>
              <div className="flex-1">
                <p className="text-[14.5px] font-bold text-ocbc-ink">{lastMerchant ?? "Merchant"}</p>
                <p className="text-[12px] text-ocbc-slate">Scan & Pay · just now</p>
              </div>
              <span className="text-[16px] font-extrabold text-ocbc-ink">
                -{formatSGD(lastPayAmount)}
              </span>
            </div>

            {/* Live balance update */}
            <div className="flex items-center gap-3 pt-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-ocbc-green">
                <Wallet size={20} />
              </span>
              <p className="flex-1 text-[13.5px] font-semibold text-ocbc-ink">
                Your FRANK balance
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-bold text-ocbc-mute line-through">
                  {formatSGD(before.balance)}
                </span>
                <ArrowRight size={13} className="text-ocbc-green" />
                <motion.span
                  key={balance}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[14px] font-extrabold text-ocbc-ink"
                >
                  {formatSGD(balance)}
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* AI learning */}
          <LearningNote
            delay={0.5}
            text="I've logged this to your hawker spending so your weekly budget stays accurate."
          />
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-ocbc-line bg-white px-4 pb-3 pt-3">
        <PrimaryButton onClick={() => router.push("/")}>Back to Home</PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => router.push("/scan")}>
          Scan another
        </PrimaryButton>
      </div>
    </PageTransition>
  );
}
