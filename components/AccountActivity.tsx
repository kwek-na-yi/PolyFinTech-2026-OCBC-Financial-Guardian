"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  Repeat,
  ShoppingBasket,
  Car,
  Coffee,
  ShieldCheck,
  ReceiptText,
  Store,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageTransition from "@/components/PageTransition";
import { useGuardian } from "@/components/GuardianStateProvider";
import {
  account,
  savingsAccount,
  formatSGD,
  type Transaction,
} from "@/lib/mockData";

/** Today's date in the same format the store stamps new transactions with. */
const today = () =>
  new Date().toLocaleDateString("en-SG", { day: "2-digit", month: "short" });

const categoryIcon: Record<string, LucideIcon> = {
  Income: ArrowDownLeft,
  Transfer: ArrowLeftRight,
  Subscription: Repeat,
  Groceries: ShoppingBasket,
  Transport: Car,
  Dining: Coffee,
  Insurance: ShieldCheck,
  Bills: ReceiptText,
  "Scan & Pay": Store,
};

/**
 * Account activity (statement) for a single account, read straight from the
 * live shared transaction list. Every PayNow, Scan, Save and Guardian approval
 * appends a row, so this screen reflects the real state with nothing to keep in
 * sync. The FRANK view shows the full ledger; the savings view shows the same
 * cross-account transfers from the 360's own perspective (sign mirrored).
 */
export default function AccountActivity({
  acct,
}: {
  acct: "frank" | "savings";
}) {
  const { transactions, balance, savings } = useGuardian();
  const isFrank = acct === "frank";
  const meta = isFrank ? account : savingsAccount;
  const liveBalance = isFrank ? balance : savings;

  // The savings account has no standalone ledger — its only movements are the
  // transfers to/from FRANK, shown here from the 360's point of view.
  const rows: Transaction[] = isFrank
    ? transactions
    : transactions
        .filter((t) => t.merchant.includes("OCBC 360"))
        .map((t) => ({
          ...t,
          amount: -t.amount,
          merchant: t.amount < 0 ? "Top-up from FRANK" : "Transfer to FRANK",
          category: "Transfer",
        }));

  // Group consecutive rows by date label (new rows carry today's stamp).
  const groups: { date: string; items: Transaction[] }[] = [];
  for (const t of rows) {
    const last = groups[groups.length - 1];
    if (last && last.date === t.date) last.items.push(t);
    else groups.push({ date: t.date, items: [t] });
  }
  const todayLabel = today();

  return (
    <PageTransition>
      <AppHeader variant="sub" title={meta.name} />

      <div className="no-scrollbar flex-1 overflow-y-auto bg-ocbc-bg pb-8">
        {/* Account summary */}
        <div className="bg-white px-5 pb-5 pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ocbc-peach text-[13px] font-bold text-ocbc-redDark">
              {meta.initials}
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-ocbc-ink">{meta.name}</p>
              <p className="text-[12.5px] text-ocbc-slate">{meta.number}</p>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-[13px] text-ocbc-slate">Available balance</span>
            <motion.span
              key={liveBalance}
              initial={{ opacity: 0.4, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[24px] font-extrabold text-ocbc-ink"
            >
              {formatSGD(liveBalance)}
            </motion.span>
          </div>
        </div>

        {/* Activity list */}
        <div className="px-4 pt-4">
          <p className="px-1 pb-1 text-[12px] font-bold uppercase tracking-wide text-ocbc-slate">
            Activity
          </p>

          {rows.length === 0 ? (
            <div className="mt-2 rounded-xl2 bg-white px-5 py-10 text-center shadow-card">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ocbc-bg text-ocbc-slate">
                <ArrowLeftRight size={22} />
              </span>
              <p className="text-[14px] font-bold text-ocbc-ink">No transfers yet</p>
              <p className="mt-1 text-[12.5px] leading-snug text-ocbc-slate">
                Money you set aside in this account will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((g, gi) => (
                <div key={`${g.date}-${gi}`}>
                  <p className="px-1 pb-1.5 pt-1 text-[11.5px] font-bold uppercase tracking-wide text-ocbc-mute">
                    {g.date === todayLabel ? "Today" : g.date}
                  </p>
                  <div className="overflow-hidden rounded-xl2 bg-white shadow-card">
                    {g.items.map((t, i) => {
                      const Icon = categoryIcon[t.category] ?? CircleDollarSign;
                      const credit = t.amount > 0;
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center gap-3 px-4 py-3 ${
                            i > 0 ? "border-t border-ocbc-line" : ""
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              credit
                                ? "bg-emerald-50 text-ocbc-green"
                                : "bg-ocbc-bg text-ocbc-slate"
                            }`}
                          >
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-ocbc-ink">
                              {t.merchant}
                            </p>
                            <p className="text-[12px] text-ocbc-slate">{t.category}</p>
                          </div>
                          <span
                            className={`shrink-0 text-[14.5px] font-bold ${
                              credit ? "text-ocbc-green" : "text-ocbc-ink"
                            }`}
                          >
                            {formatSGD(t.amount, true)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
