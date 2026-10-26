"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  QrCode,
  ScanLine,
  FileText,
  Settings,
  Eye,
  ChevronRight,
  Plus,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GuardianCard from "@/components/GuardianCard";
import PageTransition from "@/components/PageTransition";
import { useGuardian } from "@/components/GuardianStateProvider";
import { account, savingsAccount, accountTabs, formatSGD } from "@/lib/mockData";

const quickActions = [
  { label: "PayNow", icon: QrCode, href: "/paynow" },
  { label: "Scan & Pay", icon: ScanLine, href: "/scan" },
  { label: "Statements", icon: FileText },
  { label: "Customise", icon: Settings },
];

export default function HomePage() {
  const router = useRouter();
  const { balance, savings } = useGuardian();

  return (
    <PageTransition>
      <AppHeader variant="home" />

      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        {/* Welcome banner with red curve */}
        <div className="relative overflow-hidden">
          <div className="ocbc-gradient relative px-5 pb-24 pt-5">
            <h1 className="text-[34px] font-extrabold leading-tight text-white">
              Welcome
            </h1>
            <p className="mt-1 max-w-[230px] text-[14px] font-medium leading-snug text-white/90">
              Score S$20 cash for every friend you refer to OCBC FRANK!
            </p>
            <button className="mt-1 flex items-center gap-1 text-[14px] font-semibold text-white">
              There&apos;s no limit! <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Floating quick actions */}
          <div className="relative -mt-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-stretch rounded-2xl bg-white px-2 py-3 shadow-float"
            >
              {quickActions.map(({ label, icon: Icon, href }, i) => (
                <button
                  key={label}
                  onClick={() => href && router.push(href)}
                  className={`flex flex-1 flex-col items-center gap-1.5 px-1 active:opacity-60 ${
                    i === quickActions.length - 1
                      ? "border-l border-ocbc-line"
                      : ""
                  }`}
                >
                  <Icon size={23} strokeWidth={1.9} className="text-ocbc-ink" />
                  <span className="text-[11.5px] font-medium text-ocbc-ink">
                    {label}
                  </span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Account tabs */}
        <div className="mt-5 flex items-center gap-2.5 px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ocbc-slate shadow-card">
            <Eye size={16} />
          </span>
          <div className="h-5 w-px bg-ocbc-line" />
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            {accountTabs.map((tab, i) => (
              <button
                key={tab}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] font-semibold ${
                  i === 0
                    ? "bg-ocbc-red text-white"
                    : "border border-ocbc-line bg-white text-ocbc-ink"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* FRANK account card */}
        <div className="mt-3 px-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-xl2 bg-ocbc-card p-4 shadow-card"
          >
            <button
              onClick={() => router.push("/account/frank")}
              className="flex w-full items-center gap-3 text-left active:opacity-70"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ocbc-peach text-[13px] font-bold text-ocbc-redDark">
                {account.initials}
              </span>
              <h2 className="flex-1 text-[18px] font-bold text-ocbc-ink">
                {account.name}
              </h2>
              <ChevronRight size={20} className="text-ocbc-slate" />
            </button>
            <p className="mt-1 pl-14 text-[13px] text-ocbc-slate">{account.number}</p>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[14px] text-ocbc-slate">Available balance</span>
              <motion.span
                key={balance}
                initial={{ opacity: 0.4, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-[20px] font-extrabold text-ocbc-ink"
              >
                {formatSGD(balance)}
              </motion.span>
            </div>
            <div className="my-3 h-px bg-ocbc-line" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-ocbc-slate">Debit card no.</span>
              <span className="text-[14px] font-semibold text-ocbc-ink">
                {account.debitCardNo}
              </span>
            </div>
          </motion.div>
        </div>

        {/* OCBC 360 savings card — live balance, with a quick Save action */}
        <div className="mt-3 px-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl2 bg-ocbc-card p-4 shadow-card"
          >
            <button
              onClick={() => router.push("/account/savings")}
              className="flex w-full items-center gap-3 text-left active:opacity-70"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ocbc-peach text-[13px] font-bold text-ocbc-redDark">
                {savingsAccount.initials}
              </span>
              <h2 className="flex-1 text-[18px] font-bold text-ocbc-ink">
                {savingsAccount.name}
              </h2>
              <ChevronRight size={20} className="text-ocbc-slate" />
            </button>
            <p className="mt-1 pl-14 text-[13px] text-ocbc-slate">{savingsAccount.number}</p>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[14px] text-ocbc-slate">Available balance</span>
              <motion.span
                key={savings}
                initial={{ opacity: 0.4, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-[20px] font-extrabold text-ocbc-ink"
              >
                {formatSGD(savings)}
              </motion.span>
            </div>

            <button
              onClick={() => router.push("/save")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-ocbc-line bg-white py-2.5 text-[14px] font-bold text-ocbc-ink active:bg-ocbc-bg"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ocbc-green text-white">
                <Plus size={13} strokeWidth={3} />
              </span>
              Save to this account
            </button>
          </motion.div>
        </div>

        {/* Promo cards row */}
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          <div className="min-w-[225px] rounded-xl2 bg-ocbc-cream p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-slate">
              Savings Goal
            </p>
            <p className="mt-1 text-[15px] font-bold leading-snug text-ocbc-ink">
              Stay on track and make your dreams a reality
            </p>
            <button className="mt-2 text-[13px] font-semibold text-ocbc-blue">
              View/manage goals
            </button>
          </div>
          <div className="min-w-[225px] rounded-xl2 bg-ocbc-peach p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ocbc-slate">
              Money Insights
            </p>
            <p className="mt-1 text-[15px] font-bold leading-snug text-ocbc-ink">
              Set budgets and see your spending breakdown
            </p>
            <button className="mt-2 text-[13px] font-semibold text-ocbc-blue">
              Take control
            </button>
          </div>
        </div>

        {/* Financial Guardian feature card */}
        <div className="mt-4 px-4">
          <GuardianCard />
        </div>
      </div>

      <BottomNav active="Home" />
    </PageTransition>
  );
}
