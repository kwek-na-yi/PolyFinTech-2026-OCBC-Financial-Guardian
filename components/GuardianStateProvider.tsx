"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  account,
  savingsAccount,
  transactions as seedTransactions,
  buildForecast,
  deriveGuardian,
  deriveHealthScore,
  combinedRiskReduction,
  paynowProjection,
  paynowScenario,
  type Forecast,
  type GuardianModel,
  type Transaction,
} from "@/lib/mockData";

/** What the customer decided at the PayNow interception. */
export type Decision = "proceed" | "approve" | null;
type Risk = "Low" | "Medium" | "High";

/**
 * The most recent money move the customer made, so Guardian can acknowledge it
 * on the home card instead of showing an alert that ignores what just happened.
 */
export type Activity =
  | { kind: "save" | "scan" | "pay"; amount: number; merchant?: string }
  | null;

interface GuardianState {
  // --- Live primitives (the single source of truth) ---
  balance: number; // FRANK available balance
  savings: number; // OCBC 360 balance
  transactions: Transaction[];

  // --- Derived live figures (recomputed from the primitives) ---
  healthScore: number;
  risk: Risk;
  projectedMonthEnd: number;
  projectedLow: number; // lowest projected balance before salary
  /** The full 30-day forecast, rebuilt from the live balance. */
  forecast: Forecast;
  /** Guardian's whole read of the situation — alert, briefing, plan. */
  guardian: GuardianModel;

  // --- Journey / learning state ---
  planApproved: boolean;
  approvedCount: number;
  lastRiskReduction: number; // % low-balance risk cut by the last approval
  profileLearned: boolean;
  lastDecision: Decision;
  lastMerchant: string | null;
  lastPayAmount: number;
  /** The customer's most recent money move, for a home-card acknowledgment. */
  lastActivity: Activity;
  /** Amount entered in PayNow, carried into the interception/plan screens. */
  pendingPayNow: number;

  // --- Snapshot captured before the last action (for before/after) ---
  before: {
    healthScore: number;
    risk: Risk;
    monthEnd: number;
    low: number;
    balance: number;
    savings: number;
  };

  // --- Actions (human-approved only; Guardian never auto-executes) ---
  /** Approve the selected Daily-Briefing recommendations. */
  approvePlan: (selectedIds: string[]) => void;
  setPendingPayNow: (amount: number) => void;
  /** Run the mock PayNow transfer the customer confirmed, for the given amount. */
  runPayNow: (decision: "proceed" | "approve", amount: number) => void;
  /** Pay a scanned merchant QR (mock). Deducts balance and updates the forecast. */
  payMerchant: (merchant: string, amount: number) => void;
  /** Move money from the spending account into savings (the Save flow). */
  saveMoney: (amount: number) => void;
  reset: () => void;
}

const Ctx = createContext<GuardianState | null>(null);

type Snapshot = {
  healthScore: number;
  risk: Risk;
  monthEnd: number;
  low: number;
  balance: number;
  savings: number;
};

const today = () =>
  new Date().toLocaleDateString("en-SG", { day: "2-digit", month: "short" });

/**
 * Derive every figure Guardian needs from the two primitives. This is the
 * heart of the redesign: balance and savings are the only stored money state,
 * and the forecast, risk, status score and Guardian's whole read of the
 * situation are all recomputed from them — so any action (spend, transfer,
 * save, PayNow) instantly reshapes every screen, with nothing to keep in sync
 * by hand.
 */
function deriveAll(balance: number, savings: number) {
  const forecast = buildForecast(balance);
  const guardian = deriveGuardian({
    balance,
    savings,
    low: forecast.low,
    lowDay: forecast.lowDay,
    monthEnd: forecast.monthEnd,
  });
  return {
    forecast,
    guardian,
    healthScore: deriveHealthScore(forecast.low),
    risk: guardian.risk,
  };
}

const initialBefore: Snapshot = (() => {
  const d = deriveAll(account.availableBalance, savingsAccount.availableBalance);
  return {
    healthScore: d.healthScore,
    risk: d.risk,
    monthEnd: d.forecast.monthEnd,
    low: d.forecast.low,
    balance: account.availableBalance,
    savings: savingsAccount.availableBalance,
  };
})();

/**
 * Session-scoped, in-memory financial store. Mock actions mutate only the
 * primitives (balance, savings, transactions); the whole app reacts live
 * because every other figure is derived from them. A hard refresh resets the
 * demo.
 */
export default function GuardianStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [balance, setBalance] = useState(account.availableBalance);
  const [savings, setSavings] = useState(savingsAccount.availableBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);

  const [planApproved, setPlanApproved] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [lastRiskReduction, setLastRiskReduction] = useState(0);
  const [profileLearned, setProfileLearned] = useState(false);
  const [lastDecision, setLastDecision] = useState<Decision>(null);
  const [lastMerchant, setLastMerchant] = useState<string | null>(null);
  const [lastPayAmount, setLastPayAmount] = useState(0);
  const [lastActivity, setLastActivity] = useState<Activity>(null);
  const [pendingPayNow, setPendingPayNow] = useState(paynowScenario.amount);
  const [before, setBefore] = useState<Snapshot>(initialBefore);

  // Everything money-related, recomputed from the two primitives.
  const derived = useMemo(() => deriveAll(balance, savings), [balance, savings]);

  /** Capture the current derived picture before an action mutates it. */
  const snapshot = () => {
    const d = deriveAll(balance, savings);
    setBefore({
      healthScore: d.healthScore,
      risk: d.risk,
      monthEnd: d.forecast.monthEnd,
      low: d.forecast.low,
      balance,
      savings,
    });
  };

  // ----- Journey A: approve the Daily-Briefing plan -----
  const approvePlan = (selectedIds: string[]) => {
    snapshot();
    const { guardian } = deriveAll(balance, savings);
    const reduction = combinedRiskReduction(guardian.recommendations, selectedIds);
    const movesMoney = guardian.recommendations.some(
      (r) => r.movesMoney && selectedIds.includes(r.id)
    );

    if (movesMoney) {
      // The low-balance fix moves money 360 Savings → FRANK. The amount is
      // already sized and capped to real savings by the engine, so it can
      // never exceed what's there. The forecast, risk and status all re-derive
      // automatically from the new balances.
      const moved = Math.min(guardian.transfer, Math.max(0, savings));
      if (moved > 0) {
        setSavings((v) => v - moved);
        setBalance((v) => v + moved);
        setTransactions((t) => [
          {
            id: `gp-${Date.now()}`,
            merchant: "Transfer from OCBC 360",
            category: "Transfer",
            date: today(),
            amount: moved,
          },
          ...t,
        ]);
      }
    }

    setPlanApproved(true);
    setApprovedCount(selectedIds.length);
    setLastRiskReduction(reduction);
    setProfileLearned(true);
  };

  // ----- Journey B: PayNow interception -----
  const runPayNow = (decision: "proceed" | "approve", amount: number) => {
    snapshot();
    const { forecast } = deriveAll(balance, savings);
    // The plan draws on the *live* savings balance, so it can never move more
    // than the customer actually has.
    const proj = paynowProjection(amount, forecast.low, forecast.monthEnd, savings);
    const now = today();

    const newTxns: Transaction[] = [
      {
        id: `pn-${Date.now()}`,
        merchant: `PayNow · ${paynowScenario.recipient.name}`,
        category: "Transfer",
        date: now,
        amount: -amount,
      },
    ];

    if (decision === "approve") {
      // Top up FRANK from savings (capped at what savings holds), then send the
      // full transfer. The forecast, risk and status re-derive from the new
      // balances — if savings couldn't fully bridge, they reflect the real,
      // still-tight outcome rather than pretending the shortfall away.
      if (proj.moveFromSavings > 0) {
        newTxns.unshift({
          id: `sv-${Date.now()}`,
          merchant: "Transfer from OCBC 360",
          category: "Transfer",
          date: now,
          amount: proj.moveFromSavings,
        });
      }
      setSavings((v) => v - proj.moveFromSavings);
      setBalance((v) => v + proj.moveFromSavings - amount);
    } else {
      // Sent in full without the plan — just the real deduction; the forecast
      // takes the honest hit and risk follows.
      setBalance((v) => v - amount);
    }

    setTransactions((t) => [...newTxns, ...t]);
    setPlanApproved(decision === "approve");
    setProfileLearned(true);
    setLastDecision(decision);
    setLastMerchant(paynowScenario.recipient.name);
    setLastPayAmount(amount);
    setLastActivity({ kind: "pay", amount, merchant: paynowScenario.recipient.name });
  };

  // ----- Scan & Pay a merchant QR -----
  const payMerchant = (merchant: string, amount: number) => {
    snapshot();
    const now = today();
    setBalance((v) => v - amount);
    setTransactions((t) => [
      {
        id: `scan-${Date.now()}`,
        merchant,
        category: "Scan & Pay",
        date: now,
        amount: -amount,
      },
      ...t,
    ]);
    setProfileLearned(true);
    setLastMerchant(merchant);
    setLastPayAmount(amount);
    setLastActivity({ kind: "scan", amount, merchant });
  };

  // ----- Save flow: move money from the spending account into savings -----
  const saveMoney = (amount: number) => {
    snapshot();
    const now = today();
    // Can't save more than is in the spending account.
    const moved = Math.min(Math.max(0, amount), Math.max(0, balance));

    setBalance((v) => v - moved);
    setSavings((v) => v + moved);
    setTransactions((t) => [
      {
        id: `save-${Date.now()}`,
        merchant: "Transfer to OCBC 360",
        category: "Transfer",
        date: now,
        amount: -moved,
      },
      ...t,
    ]);

    setProfileLearned(true);
    setLastMerchant(savingsAccount.name);
    setLastPayAmount(moved);
    setLastActivity({ kind: "save", amount: moved });
  };

  const reset = () => {
    setBalance(account.availableBalance);
    setSavings(savingsAccount.availableBalance);
    setTransactions(seedTransactions);
    setPlanApproved(false);
    setApprovedCount(0);
    setLastRiskReduction(0);
    setProfileLearned(false);
    setLastDecision(null);
    setLastMerchant(null);
    setLastPayAmount(0);
    setLastActivity(null);
    setPendingPayNow(paynowScenario.amount);
    setBefore(initialBefore);
  };

  const value = useMemo(
    () => ({
      balance,
      savings,
      transactions,
      healthScore: derived.healthScore,
      risk: derived.risk,
      projectedMonthEnd: derived.forecast.monthEnd,
      projectedLow: derived.forecast.low,
      forecast: derived.forecast,
      guardian: derived.guardian,
      planApproved,
      approvedCount,
      lastRiskReduction,
      profileLearned,
      lastDecision,
      lastMerchant,
      lastPayAmount,
      lastActivity,
      pendingPayNow,
      before,
      approvePlan,
      setPendingPayNow,
      runPayNow,
      payMerchant,
      saveMoney,
      reset,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      balance,
      savings,
      transactions,
      derived,
      planApproved,
      approvedCount,
      lastRiskReduction,
      profileLearned,
      lastDecision,
      lastMerchant,
      lastPayAmount,
      lastActivity,
      pendingPayNow,
      before,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGuardian() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGuardian must be used within GuardianStateProvider");
  return ctx;
}
