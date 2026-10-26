// =============================================================
// OCBC Financial Guardian — Mock data (Singapore banking)
// All amounts in SGD. No backend; purely illustrative.
// The projection is engineered so the customer's balance dips
// below the SGD 500 safety buffer before salary credit — this
// is what makes the forecast *predictive* rather than reporting.
// =============================================================

export const SAFETY_BUFFER = 500;

export const formatSGD = (value: number, withSign = false): string => {
  const sign = value < 0 ? "-" : withSign ? "+" : "";
  const abs = Math.abs(value).toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}SGD ${abs}`;
};

/** Compact SGD for chart labels, e.g. SGD 2.3k. */
export const formatSGDk = (value: number): string =>
  `SGD ${(value / 1000).toLocaleString("en-SG", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}k`;

/** Whole-dollar SGD for prose, e.g. "SGD 1,184" / "-SGD 316". Rounds to nearest dollar. */
export const formatSGD0 = (value: number): string => {
  const sign = Math.round(value) < 0 ? "-" : "";
  return `${sign}SGD ${Math.abs(Math.round(value)).toLocaleString("en-SG")}`;
};

/** Day (from today) the monthly salary is credited — anchors the forecast. */
export const SALARY_DAY = 10;

// ---------------------------------------------------------------
// Customer
// ---------------------------------------------------------------
export const customer = {
  firstName: "Jia Hui",
};

// ---------------------------------------------------------------
// Account
// ---------------------------------------------------------------
export const account = {
  name: "OCBC FRANK Account",
  initials: "FRA",
  number: "501-xxxxxx-001",
  availableBalance: 2300.0,
  debitCardNo: "5409 88xx xxxx 1234",
};

// Linked savings — the source Guardian proposes drawing from in its plan.
// A real, finite balance: Guardian must respect what's actually available and
// can never recommend moving more than this. Kept deliberately modest so the
// "savings can't cover everything" scenario is reachable in the demo.
export const savingsAccount = {
  name: "OCBC 360 Account",
  initials: "360",
  number: "601-xxxxxx-360",
  availableBalance: 1200.0,
};

export const accountTabs = ["Accounts", "Cards", "Investments", "Loans"];

// ---------------------------------------------------------------
// Recent transactions
// ---------------------------------------------------------------
export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number; // negative = debit, positive = credit
}

export const transactions: Transaction[] = [
  { id: "t1", merchant: "Salary Credit", category: "Income", date: "01 Jun", amount: 4500.0 },
  { id: "t2", merchant: "NTUC FairPrice", category: "Groceries", date: "03 Jun", amount: -86.4 },
  { id: "t3", merchant: "Grab", category: "Transport", date: "05 Jun", amount: -18.9 },
  { id: "t4", merchant: "Spotify", category: "Subscription", date: "08 Jun", amount: -15.8 },
  { id: "t5", merchant: "ChatGPT", category: "Subscription", date: "10 Jun", amount: -28.0 },
  { id: "t6", merchant: "Starbucks", category: "Dining", date: "12 Jun", amount: -9.6 },
  { id: "t7", merchant: "Insurance Premium", category: "Insurance", date: "15 Jun", amount: -200.0 },
  { id: "t8", merchant: "SP Utilities", category: "Bills", date: "18 Jun", amount: -85.6 },
  { id: "t9", merchant: "PayNow Transfer", category: "Transfer", date: "20 Jun", amount: -120.0 },
];

// ---------------------------------------------------------------
// Screen 1 — Dashboard alert (action-oriented, urgent).
// Replaces the old generic "3 insights detected" teaser.
// ---------------------------------------------------------------
export const guardianAlert = {
  status: "Heads up",
  headline: "You could run low on money in about 9 days",
  subline: "I've already worked out a simple way to keep you topped up.",
  bullets: [
    { icon: "risk" as const, text: "Your money dips low before payday" },
    { icon: "home" as const, text: "Looks like you may be moving home · 87% sure" },
  ],
  recommendationCount: 3,
};

// ---------------------------------------------------------------
// Daily Financial Briefing — the advisor's spoken summary.
// Phrased as an intelligent partner talking to the customer, not
// a data dump. Reduce raw numbers; lead with reasoning.
// ---------------------------------------------------------------
export type BriefingTone = "risk" | "positive" | "info" | "warning" | "signal";

export interface BriefingItem {
  id: string;
  tone: BriefingTone;
  icon: "risk" | "salary" | "payments" | "anomaly" | "home";
  title: string;
  narration: string; // advisor's sentence
  chips?: { label: string; value: string }[];
  href?: string; // optional deep-link to detail
}

export const briefing = {
  date: "Wednesday, 25 June",
  greeting: "Good morning",
  intro:
    "I checked your money this morning — your accounts, bills and spending. Here's what matters today, and what I'd do about it.",
  headline:
    "You're on track to run a little low in about 9 days — but it's an easy fix.",
  summary: { risks: 1, anomalies: 1, actions: 3 },
  items: [
    {
      id: "b1",
      tone: "risk",
      icon: "risk",
      title: "You'll run low just before payday",
      narration:
        "Your money is heading down to about SGD 484 around day 9 — just under the SGD 500 cushion you like to keep. The main reason is a SGD 1,400 rental deposit on day 7, probably for your home move.",
      chips: [
        { label: "Lowest", value: "SGD 484.20" },
        { label: "When", value: "Day 9" },
      ],
      href: "/guardian/cashflow",
    },
    {
      id: "b2",
      tone: "positive",
      icon: "salary",
      title: "Good news — payday is coming",
      narration:
        "Your SGD 4,500 pay lands on day 10 and takes you straight back up to about SGD 4,984. So this dip doesn't last long if we cover it.",
      chips: [
        { label: "Pay", value: "+SGD 4,500" },
        { label: "Lands", value: "Day 10" },
      ],
    },
    {
      id: "b3",
      tone: "info",
      icon: "payments",
      title: "3 payments are due this week",
      narration:
        "Spotify renews tomorrow, ChatGPT Plus in 2 days, and your SGD 200 insurance in 5 days. That's SGD 243.80 leaving your account in total.",
      chips: [{ label: "Total", value: "SGD 243.80" }],
    },
    {
      id: "b4",
      tone: "warning",
      icon: "anomaly",
      title: "Your fun spending is higher than usual",
      narration:
        "You've spent about SGD 430 more on entertainment than your usual month — up 18%. That's the main reason this month feels tighter than normal.",
      chips: [{ label: "Entertainment", value: "+18%" }],
    },
    {
      id: "b5",
      tone: "signal",
      icon: "home",
      title: "Looks like you might be moving home",
      narration:
        "An IKEA buy, more furniture spending and a new utility setup all point to a home move. I'm 87% sure — and OCBC has a few things that could help.",
      chips: [{ label: "How sure", value: "87%" }],
      href: "/guardian/overview",
    },
  ] as BriefingItem[],
};

// ---------------------------------------------------------------
// Screen 2 — Financial Health Score (with contributing factors)
// ---------------------------------------------------------------
export const healthScore = {
  score: 92,
  status: "Excellent",
  delta: 3, // vs last month
  positiveFactors: [
    "Your pay has arrived on time for 12 months",
    "You save a healthy 32% of what you earn",
    "You barely owe anything — just 3% of your income",
  ],
  attentionAreas: [
    "Your fun spending is up 18% this month",
    "SGD 200 insurance is due in 5 days",
  ],
};

export const upcomingRisk = {
  title: "You'll run low",
  detail: "Your balance could dip below SGD 500 in about 9 days.",
  lowestBalance: 484.2,
  onDay: 9,
};

export interface UpcomingPayment {
  id: string;
  merchant: string;
  due: string;
  amount: number;
  icon: "spotify" | "chatgpt" | "insurance";
}

export const upcomingPayments: UpcomingPayment[] = [
  { id: "p1", merchant: "Spotify", due: "Tomorrow", amount: -15.8, icon: "spotify" },
  { id: "p2", merchant: "ChatGPT", due: "2 days", amount: -28.0, icon: "chatgpt" },
  { id: "p3", merchant: "Insurance", due: "5 days", amount: -200.0, icon: "insurance" },
];

// ---------------------------------------------------------------
// Life Event — explainable AI + OCBC business value
// ---------------------------------------------------------------
export interface LifeEventSignal {
  label: string;
  detail: string;
}

export interface OcbcService {
  name: string;
  desc: string;
  tag: string;
}

export const lifeEvent = {
  title: "You might be moving home",
  summary:
    "A few recent purchases look a lot like getting ready to move.",
  confidence: 87,
  why: "I compared your recent spending to what usually happens before a move. Three of those signs showed up in the last two weeks, so I'm 87% sure. This stays between us — I'll never act on it on my own.",
  signals: [
    { label: "IKEA purchase", detail: "SGD 642.00 · 12 Jun" },
    { label: "More furniture spending", detail: "+SGD 1,240 vs last month" },
    { label: "New utilities set up", detail: "SP Group — new address" },
  ] as LifeEventSignal[],
  services: [
    { name: "OCBC Home Loan", desc: "Fixed rates from 3.20% p.a.", tag: "Mortgage" },
    { name: "OCBC Home Insurance", desc: "Cover contents & renovation", tag: "Protect" },
    { name: "OCBC Renovation Loan", desc: "Up to SGD 30,000 · fast approval", tag: "Finance" },
  ] as OcbcService[],
};

// ---------------------------------------------------------------
// Screen 3 — Future cashflow projection (day-indexed)
// Engineered to dip to SGD 484.20 on day 9, then recover.
// ---------------------------------------------------------------
export interface TimelinePoint {
  id: string;
  day: number; // days from today, for proportional x-axis
  when: string;
  label: string;
  amount: number | null; // null for milestone (balance) points
  balance: number; // running balance after this event
  type: "start" | "debit" | "credit" | "end";
  category?: "subscription" | "bill" | "salary" | "transfer";
  lowest?: boolean;
}

export const cashflowTimeline: TimelinePoint[] = [
  { id: "c0", day: 0, when: "Today", label: "Current Balance", amount: null, balance: 2300.0, type: "start" },
  { id: "c1", day: 1, when: "Tomorrow", label: "Spotify", amount: -15.8, balance: 2284.2, type: "debit", category: "subscription" },
  { id: "c2", day: 2, when: "Day 2", label: "ChatGPT Plus", amount: -28.0, balance: 2256.2, type: "debit", category: "subscription" },
  { id: "c3", day: 4, when: "Day 4", label: "NTUC FairPrice", amount: -86.4, balance: 2169.8, type: "debit", category: "bill" },
  { id: "c4", day: 5, when: "Day 5", label: "Insurance Premium", amount: -200.0, balance: 1969.8, type: "debit", category: "bill" },
  { id: "c5", day: 7, when: "Day 7", label: "Rental Deposit", amount: -1400.0, balance: 569.8, type: "debit", category: "transfer" },
  { id: "c6", day: 9, when: "Day 9", label: "SP Utilities", amount: -85.6, balance: 484.2, type: "debit", category: "bill", lowest: true },
  { id: "c7", day: 10, when: "Day 10", label: "Salary Credit", amount: 4500.0, balance: 4984.2, type: "credit", category: "salary" },
  { id: "c8", day: 30, when: "Month End", label: "Projected Balance", amount: null, balance: 3100.0, type: "end" },
];

export const projectedMonthEnd = 3100.0;

// ---------------------------------------------------------------
// Scheduled future events — the upcoming bills, subscriptions,
// rental deposit and salary that the forecast walks through. These
// are the SINGLE source of the day-by-day cashflow: the live
// forecast is rebuilt from the customer's *current* balance plus
// these events, so any spend/transfer/save immediately reshapes the
// projection, its lowest point and every Guardian screen that reads
// it. Mirrors the debit/credit rows in cashflowTimeline above.
// ---------------------------------------------------------------
export interface ScheduledEvent {
  id: string;
  day: number;
  when: string;
  label: string;
  amount: number; // negative = debit, positive = credit
  category: "subscription" | "bill" | "salary" | "transfer";
}

export const scheduledEvents: ScheduledEvent[] = [
  { id: "c1", day: 1, when: "Tomorrow", label: "Spotify", amount: -15.8, category: "subscription" },
  { id: "c2", day: 2, when: "Day 2", label: "ChatGPT Plus", amount: -28.0, category: "subscription" },
  { id: "c3", day: 4, when: "Day 4", label: "NTUC FairPrice", amount: -86.4, category: "bill" },
  { id: "c4", day: 5, when: "Day 5", label: "Insurance Premium", amount: -200.0, category: "bill" },
  { id: "c5", day: 7, when: "Day 7", label: "Rental Deposit", amount: -1400.0, category: "transfer" },
  { id: "c6", day: 9, when: "Day 9", label: "SP Utilities", amount: -85.6, category: "bill" },
  { id: "c7", day: 10, when: "Day 10", label: "Salary Credit", amount: 4500.0, category: "salary" },
];

// Spending analysis (Improvement 5)
export const cashflowAnalysis = {
  projectedSpending: 2850.0,
  monthlyAverage: 2420.0,
  // 2850 vs 2420 ≈ 17.8%, shown rounded as the "18%" used across the briefing.
  differencePct: 18,
  riskLevel: "Medium" as "Low" | "Medium" | "High",
};

export const cashflowInsight =
  "If you keep spending at this pace, you'll end the month about 18% higher than usual. A SGD 1,400 rental deposit on day 7 drops you to SGD 484 — just under your safety cushion — before payday on day 10. It's a short, easy gap to cover.";

// =============================================================
// DERIVATION ENGINE
// Single source of truth. Every recommendation, projection and
// before/after number below is *computed* from the data above —
// change a balance, bill or the timeline and the whole app
// (amounts, explanations, risk, success screens) recomputes.
// =============================================================

const roundUpTo100 = (n: number): number => Math.ceil(n / 100) * 100;

/** The forecast baseline, read straight off the cashflow timeline. */
export const baseline = (() => {
  const start = cashflowTimeline.find((p) => p.type === "start")!.balance;
  const end = cashflowTimeline.find((p) => p.type === "end")!.balance;
  const low = cashflowTimeline.reduce((lo, p) => (p.balance < lo.balance ? p : lo));
  return {
    balance: start, // 2300
    monthEnd: end, // 3100
    lowestBalance: low.balance, // 484.20
    lowestDay: low.day, // 9
  };
})();

/** How far the forecast dips under the safety buffer at its lowest point. */
export const shortfall = Math.max(0, SAFETY_BUFFER - baseline.lowestBalance); // 15.80

/**
 * The un-itemised rest-of-month spending baked into the SGD 3,100 month-end
 * anchor. Derived once so month-end stays at 3,100 for the seed balance, then
 * shifts dollar-for-dollar with any action — never hardcoded per screen.
 *   3100 = 2300 (seed balance) + Σ(scheduledEvents) + REST_OF_MONTH
 */
export const REST_OF_MONTH =
  baseline.monthEnd -
  (account.availableBalance + scheduledEvents.reduce((s, e) => s + e.amount, 0)); // -1884.20

export interface Forecast {
  points: TimelinePoint[];
  low: number; // lowest projected balance before payday
  lowDay: number;
  monthEnd: number;
}

/**
 * Rebuild the 30-day cashflow forecast from a *live* balance. Walking the same
 * scheduled events from wherever the spending account actually stands today is
 * what makes the projection react to every payment, transfer and save — the
 * chart, timeline, lowest point and risk all flow from this one function.
 *
 * At the seed balance (2300) it reproduces the original timeline exactly: a dip
 * to SGD 484.20 on day 9, salary on day 10, month-end SGD 3,100.
 */
export function buildForecast(balance: number, events = scheduledEvents): Forecast {
  const sorted = [...events].sort((a, b) => a.day - b.day);
  const salaryDay = sorted.find((e) => e.category === "salary")?.day ?? SALARY_DAY;

  const points: TimelinePoint[] = [
    { id: "c0", day: 0, when: "Today", label: "Current Balance", amount: null, balance, type: "start" },
  ];
  let running = balance;
  for (const e of sorted) {
    running += e.amount;
    points.push({
      id: e.id,
      day: e.day,
      when: e.when,
      label: e.label,
      amount: e.amount,
      balance: running,
      type: e.amount >= 0 ? "credit" : "debit",
      category: e.category,
    });
  }
  const monthEnd = running + REST_OF_MONTH;
  points.push({
    id: "cEnd",
    day: 30,
    when: "Month End",
    label: "Projected Balance",
    amount: null,
    balance: monthEnd,
    type: "end",
  });

  // Lowest point the spending account reaches *before* payday — the number
  // every risk judgement keys off.
  const preSalary = points.filter((p) => p.type === "debit" && p.day < salaryDay);
  const lowPoint = preSalary.length
    ? preSalary.reduce((lo, p) => (p.balance < lo.balance ? p : lo))
    : points[0];
  for (const p of points) p.lowest = p === lowPoint && p.type === "debit";

  return { points, low: lowPoint.balance, lowDay: lowPoint.day, monthEnd };
}

/**
 * Financial-status score, derived from where the forecast bottoms out. Anchored
 * at 92 for the seed low (~484, just under the cushion); clearing the cushion
 * lifts Guardian's confidence toward the high-90s, while a forecast that keeps
 * sinking pulls it down. Monotonic and clamped — never hardcoded per screen.
 */
export function deriveHealthScore(low: number): number {
  const d = low - baseline.lowestBalance; // 0 at the seed low
  const score = d >= 0 ? 92 + 4 * Math.tanh(d / 500) : 92 + d / 90;
  return Math.round(Math.max(60, Math.min(98, score)));
}

/**
 * Journey A plan math. The transfer is sized to clear the buffer AND keep
 * roughly one week of typical spending in reserve, then rounded up to a
 * clean SGD 100 — so the amount is explainable, not arbitrary.
 */
export const planMath = (() => {
  const weeklyCushion = Math.round(cashflowAnalysis.monthlyAverage / 4); // ~605
  const targetFloor = SAFETY_BUFFER + weeklyCushion; // ~1105
  const transfer = roundUpTo100(Math.max(0, targetFloor - baseline.lowestBalance)); // 700
  return {
    weeklyCushion,
    targetFloor,
    transfer,
    minBefore: baseline.lowestBalance, // 484.20
    minAfter: baseline.lowestBalance + transfer, // 1184.20
    monthEndBefore: baseline.monthEnd, // 3100
    monthEndAfter: baseline.monthEnd + transfer, // 3800
    savingsAfter: savingsAccount.availableBalance - transfer, // 500 (1200 − 700)
  };
})();

/**
 * The inputs Guardian reviews to build a plan. Doubles as (a) the "Analysis"
 * checklist shown on the glanceable plan summary and (b) the reasoning steps
 * the "thinking" sequence ticks through — one source of truth for both so the
 * narration and the checklist can never drift apart.
 */
export const guardianAnalysis = [
  "Your pay and income",
  "Your regular bills",
  "How your spending compares",
  "Your savings cushion",
  "Your next 30 days",
];

/**
 * Guardian's confidence in a plan, as a percentage — derived, never hardcoded.
 * It blends how complete the inputs are (salary history, recurring bills and
 * spending trend are all present and modelled here) with how much head-room the
 * plan leaves above the safety buffer. A plan that clears the buffer comfortably
 * is one Guardian can stand behind; a wafer-thin margin lowers its confidence.
 * Journey A (lifts the low to ~1184) lands ~96%; Journey B (~584) lands lower.
 */
export function planConfidence(lowAfter: number): number {
  const dataCompleteness = 0.94; // salary, bills and trend all observed
  const marginRatio = Math.min(1, Math.max(0, (lowAfter - SAFETY_BUFFER) / SAFETY_BUFFER));
  const conf = dataCompleteness * 100 - 4 + marginRatio * 6;
  return Math.round(Math.max(80, Math.min(98, conf)));
}

/** Investment top-up that strains liquidity mid-cycle (drives r3). */
const investmentTopUp = 200;
/** Entertainment overspend vs the personal average (drives r2). */
const overspend = cashflowAnalysis.projectedSpending - cashflowAnalysis.monthlyAverage; // 430

// ---------------------------------------------------------------
// Screen 4 — Recommendations (current risk → action → outcome)
// Every figure below is derived from the engine above.
// ---------------------------------------------------------------
export const actionSummary =
  "This month is a bit tighter than usual — your fun spending is up and a rental deposit for your home move is coming through. Here's how to stay above your safety cushion. Only say yes to what you're comfortable with.";

export interface Recommendation {
  id: string;
  title: string;
  currentRisk: string;
  recommendedAction: string;
  outcomes: string[];
  riskReduction: number; // percent
  defaultSelected: boolean;
  /** Whether approving this action moves money in the live store. */
  movesMoney: boolean;
  // Before vs After comparison (Improvement 4)
  metric: string; // what is being compared
  before: string;
  after: string;
  // Explainability (Improvement 6)
  why: string;
  // What happens if the customer does nothing
  ifIgnored: string;
}

/**
 * The two behavioural recommendations — easing fun spending and holding the
 * optional investment. These read a spending *pattern* (the 18% overspend, the
 * mid-month auto-invest), not the live balance, so their copy is stable. They
 * always travel alongside whatever money-move Guardian derives below.
 */
const behaviouralRecommendations: Recommendation[] = [
  {
    id: "r2",
    title: "Ease off the fun spending",
    currentRisk: `You're spending ${cashflowAnalysis.differencePct}% more on fun than your usual 6-month average.`,
    recommendedAction: `Spend about ${formatSGD0(150)} less on extras this month`,
    outcomes: [
      `Your spending gets back to your usual ${formatSGD0(cashflowAnalysis.monthlyAverage)}`,
      `Puts ${formatSGD0(150)} back toward your savings`,
    ],
    riskReduction: 42,
    defaultSelected: true,
    movesMoney: false,
    metric: "Spending vs your usual",
    before: `+${cashflowAnalysis.differencePct}% (${formatSGD0(cashflowAnalysis.projectedSpending)})`,
    after: `Back to normal (${formatSGD0(cashflowAnalysis.monthlyAverage)})`,
    why: `Your fun spending (streaming, eating out, events) is ${formatSGD0(overspend)} above a normal month for you. I flag anything that drifts more than 15% from your own usual pattern.`,
    ifIgnored: `If you leave it, this month ends about ${formatSGD0(overspend)} over your usual, which slows down your savings.`,
  },
  {
    id: "r3",
    title: "Keep your savings on track",
    currentRisk: "An optional investment top-up would leave you tight before payday.",
    recommendedAction: `Hold off the ${formatSGD0(investmentTopUp)} investment for 2 weeks`,
    outcomes: [
      "Keeps enough spare cash on hand",
      "Your savings goal stays on track",
    ],
    riskReduction: 35,
    defaultSelected: false,
    movesMoney: false,
    metric: `Spare cash before payday`,
    before: formatSGD0(baseline.lowestBalance - investmentTopUp),
    after: formatSGD0(baseline.lowestBalance),
    why: `Your automatic investment takes out ${formatSGD0(investmentTopUp)} mid-month. Waiting until after payday keeps more cash free during the tightest part of the month.`,
    ifIgnored: `Keeping the top-up now thins your lowest point — even tighter than today.`,
  },
];

/**
 * Build the money-move recommendation from the *live* forecast. The amount is
 * sized to clear the cushion with about a week of spending spare, then capped
 * to what savings actually holds via savingsBridge — so Guardian can never
 * recommend moving more money than the customer has. When savings can't fully
 * cover the gap, the copy stays honest rather than promising a clean fix.
 */
function buildMoneyMoveRec(
  low: number,
  lowDay: number,
  savings: number,
  monthEnd: number
): Recommendation {
  const idealTransfer = roundUpTo100(Math.max(0, planMath.targetFloor - low));
  const bridge = savingsBridge(idealTransfer, savings);
  const moved = bridge.moved;
  const minAfter = low + moved;
  const monthEndAfter = monthEnd + moved;
  const sufficient = minAfter >= SAFETY_BUFFER;
  const gap = Math.max(0, SAFETY_BUFFER - low);
  const remainingGap = Math.max(0, SAFETY_BUFFER - minAfter);

  if (sufficient) {
    return {
      id: "r1",
      title: "Stop yourself running low",
      currentRisk: `Your money drops to ${formatSGD0(low)} around day ${lowDay} — under the ${formatSGD0(SAFETY_BUFFER)} cushion you like to keep.`,
      recommendedAction: `Move ${formatSGD0(moved)} from your savings into your spending account`,
      outcomes: [
        `Your lowest point goes up to ${formatSGD0(minAfter)}`,
        `You'd finish the month with about ${formatSGD0(monthEndAfter)}`,
      ],
      riskReduction: 78,
      defaultSelected: true,
      movesMoney: true,
      metric: "Your lowest balance",
      before: formatSGD0(low),
      after: formatSGD0(minAfter),
      why: `Your lowest point is ${formatSGD0(low)} around day ${lowDay} — about ${formatSGD0(gap)} under your ${formatSGD0(SAFETY_BUFFER)} cushion. I picked an amount that clears the cushion and still leaves about a week of spending (~${formatSGD0(planMath.weeklyCushion)}) spare, then rounded it to ${formatSGD0(moved)} — lifting your lowest point to ${formatSGD0(minAfter)}. Your savings (${formatSGD0(savings)}) can cover it while keeping ${formatSGD0(savings - moved)} aside.`,
      ifIgnored: `If you skip this, your money touches ${formatSGD0(low)} around day ${lowDay} — under your cushion — leaving no room for a surprise charge before payday on day ${SALARY_DAY}.`,
    };
  }

  // Savings can't fully bridge the gap — be honest, and never propose more than
  // the customer actually has.
  return {
    id: "r1",
    title: savings > 0 ? "Top up what you can from savings" : "Ease off until payday",
    currentRisk: `Your money drops to ${formatSGD0(low)} around day ${lowDay} — well under your ${formatSGD0(SAFETY_BUFFER)} cushion, and your savings can't fully cover it.`,
    recommendedAction:
      savings > 0
        ? `Move your whole ${formatSGD0(savings)} of savings across, then ease off about ${formatSGD0(remainingGap)} this week`
        : `Your savings are empty — keep spending light until payday on day ${SALARY_DAY}`,
    outcomes:
      savings > 0
        ? [
            `Lifts your lowest point to about ${formatSGD0(minAfter)}`,
            `Still about ${formatSGD0(remainingGap)} under your cushion — going easy this week closes the gap`,
          ]
        : [
            `Keeps day-to-day spending light until payday`,
            `Your pay lands on day ${SALARY_DAY} and lifts you back up`,
          ],
    riskReduction: savings > 0 ? 55 : 30,
    defaultSelected: true,
    movesMoney: savings > 0,
    metric: "Your lowest balance",
    before: formatSGD0(low),
    after: formatSGD0(minAfter),
    why: `Clearing your cushion would take about ${formatSGD0(gap)}, but you only have ${formatSGD0(savings)} in savings. I never move more than you actually have, so I'd move all of it and be honest that you'd still be about ${formatSGD0(remainingGap)} short — best closed by easing off your spending until payday.`,
    ifIgnored: `Without any change, your money sits around ${formatSGD0(low)} before payday on day ${SALARY_DAY} — with little room for anything unexpected.`,
  };
}

/**
 * Combined low-balance risk reduction across the selected actions
 * (probabilities compounded, capped — illustrative). Operates on whatever
 * recommendation set is live, so the Action Centre, success screen and briefing
 * always agree.
 */
export function combinedRiskReduction(
  recs: Recommendation[],
  selectedIds: string[]
): number {
  const remaining = recs.reduce(
    (acc, r) => (selectedIds.includes(r.id) ? acc * (1 - r.riskReduction / 100) : acc),
    1
  );
  return Math.round((1 - remaining) * 100);
}

// ---------------------------------------------------------------
// THE GUARDIAN ENGINE — one derived view-model for every Guardian
// surface. Given the live financial state it produces the dashboard
// alert, the daily briefing, the recommendation set and the plan
// numbers. Nothing here is hardcoded per screen: change the balance
// or savings and Guardian's whole read of the situation changes.
// ---------------------------------------------------------------
export type GuardianStatus = "healthy" | "watch" | "risk";

export interface GuardianBullet {
  icon: "risk" | "home" | "shield";
  text: string;
}

export interface GuardianAlert {
  tone: "ok" | "warn";
  status: string;
  headline: string;
  subline: string;
  bullets: GuardianBullet[];
  recommendationCount: number;
}

export interface GuardianModel {
  status: GuardianStatus;
  belowCushion: boolean;
  risk: "Low" | "Medium" | "High";
  low: number;
  lowDay: number;
  confidence: number;
  recommendations: Recommendation[];
  /** The derived money-move (sized + capped to real savings); 0 when healthy. */
  transfer: number;
  minAfter: number;
  monthEndAfter: number;
  sufficient: boolean;
  alert: GuardianAlert;
  briefing: {
    date: string;
    greeting: string;
    intro: string;
    headline: string;
    summary: { risks: number; anomalies: number; actions: number };
    items: BriefingItem[];
  };
}

export function deriveGuardian(state: {
  balance: number;
  savings: number;
  low: number;
  lowDay: number;
  monthEnd: number;
}): GuardianModel {
  const { savings, low, lowDay, monthEnd } = state;
  const belowCushion = low < SAFETY_BUFFER;
  const overdraft = low < 0;
  const risk: "Low" | "Medium" | "High" = overdraft ? "High" : belowCushion ? "Medium" : "Low";
  const status: GuardianStatus = overdraft ? "risk" : belowCushion ? "watch" : "healthy";

  // Money-move recommendation only exists when the forecast dips under the
  // cushion. When healthy, Guardian reassures and proposes no transfer.
  const moneyMove = belowCushion ? buildMoneyMoveRec(low, lowDay, savings, monthEnd) : null;
  const recommendations = moneyMove
    ? [moneyMove, ...behaviouralRecommendations]
    : [...behaviouralRecommendations];

  const transfer = moneyMove?.movesMoney ? roundUpTo100Cap(low, savings) : 0;
  const minAfter = low + transfer;
  const monthEndAfter = monthEnd + transfer;
  const sufficient = !belowCushion || minAfter >= SAFETY_BUFFER;
  const confidence = planConfidence(belowCushion ? minAfter : low);

  const alert: GuardianAlert = belowCushion
    ? {
        tone: "warn",
        status: "Heads up",
        headline: overdraft
          ? "You're set to run out before payday"
          : `You could run low on money in about ${lowDay} days`,
        subline: transfer > 0
          ? "I've already worked out a simple way to keep you topped up."
          : "Let's look at the best way through it together.",
        bullets: [
          { icon: "risk", text: "Your money dips low before payday" },
          { icon: "home", text: "Looks like you may be moving home · 87% sure" },
        ],
        recommendationCount: recommendations.length,
      }
    : {
        tone: "ok",
        status: "All good",
        headline: "Everything's looking healthy",
        subline: "I've checked your bills and forecast — you're set until payday. I'm keeping watch.",
        bullets: [
          { icon: "shield", text: `You stay above your ${formatSGD0(SAFETY_BUFFER)} cushion before payday` },
          { icon: "home", text: "Looks like you may be moving home · 87% sure" },
        ],
        recommendationCount: recommendations.length,
      };

  const items: BriefingItem[] = [
    belowCushion
      ? {
          id: "b1",
          tone: "risk",
          icon: "risk",
          title: "You'll run low just before payday",
          narration: `Your money is heading down to about ${formatSGD0(low)} around day ${lowDay} — just under the ${formatSGD0(SAFETY_BUFFER)} cushion you like to keep. The main reason is a SGD 1,400 rental deposit on day 7, probably for your home move.`,
          chips: [
            { label: "Lowest", value: formatSGD(low) },
            { label: "When", value: `Day ${lowDay}` },
          ],
          href: "/guardian/cashflow",
        }
      : {
          id: "b1",
          tone: "positive",
          icon: "salary",
          title: "You're staying above your cushion",
          narration: `Good news — your lowest point before payday is about ${formatSGD0(low)}, comfortably above the ${formatSGD0(SAFETY_BUFFER)} cushion you like to keep. Nothing needs doing right now.`,
          chips: [
            { label: "Lowest", value: formatSGD(low) },
            { label: "When", value: `Day ${lowDay}` },
          ],
          href: "/guardian/cashflow",
        },
    {
      id: "b2",
      tone: "positive",
      icon: "salary",
      title: "Good news — payday is coming",
      narration: `Your SGD 4,500 pay lands on day ${SALARY_DAY} and lifts you back up to about ${formatSGD0(low + 4500)}. So this dip doesn't last long.`,
      chips: [
        { label: "Pay", value: "+SGD 4,500" },
        { label: "Lands", value: `Day ${SALARY_DAY}` },
      ],
    },
    // Pattern-based signals (independent of the live balance).
    briefing.items[3],
    briefing.items[4],
  ];

  return {
    status,
    belowCushion,
    risk,
    low,
    lowDay,
    confidence,
    recommendations,
    transfer,
    minAfter,
    monthEndAfter,
    sufficient,
    alert,
    briefing: {
      date: briefing.date,
      greeting: briefing.greeting,
      intro: briefing.intro,
      headline: belowCushion
        ? overdraft
          ? `Heads up — you're set to run out before payday on day ${SALARY_DAY}. Let's fix it.`
          : `You're on track to run a little low in about ${lowDay} days${transfer > 0 ? " — but it's an easy fix." : " — let's plan around it."}`
        : "You're on track to stay above your cushion through payday — nicely done.",
      summary: {
        risks: belowCushion ? 1 : 0,
        anomalies: 1,
        actions: recommendations.length,
      },
      items,
    },
  };
}

/** The money-move amount, sized to clear the cushion and capped to savings. */
function roundUpTo100Cap(low: number, savings: number): number {
  const ideal = roundUpTo100(Math.max(0, planMath.targetFloor - low));
  return savingsBridge(ideal, savings).moved;
}

// ---------------------------------------------------------------
// Mock PayNow — the agentic interception scenario.
// The customer opens the existing OCBC PayNow flow to send a large
// weekend transfer. Before they confirm, Guardian steps in with a
// reasoned, evidence-backed alternative — but never acts on its own.
// All numbers are mock; nothing leaves any real account.
// ---------------------------------------------------------------
export const paynowScenario = {
  recipient: {
    name: "Marcus Tan",
    handle: "+65 9123 4567",
    initials: "MT",
    bank: "DBS/POSB",
    reference: "Weekend trip",
  },
  amount: 800,
  // The cushion the customer likes to keep — referenced in copy as their floor,
  // never as a payment-size cut-off (Guardian judges the forward position).
  safetyThreshold: SAFETY_BUFFER,
};

/**
 * Clamp a proposed savings transfer to what's actually in savings. Guardian can
 * never move more than the customer really has — one shared helper so the plan
 * math, interception copy and live store all agree on the same capped figure.
 * Returns what Guardian *wanted* to move, what it *can* move, and any leftover
 * gap it cannot bridge from savings alone.
 */
export function savingsBridge(needed: number, savingsAvailable: number) {
  const want = Math.max(0, needed);
  const moved = Math.min(want, Math.max(0, savingsAvailable));
  const shortfall = Math.max(0, want - moved);
  return { needed: want, moved, shortfall, sufficient: shortfall === 0 };
}

/**
 * PayNow interception math, grounded in the SAME forecast baseline as the
 * Daily Briefing. Sending a large amount today pushes the *lowest point
 * before salary* (already SGD 484) further down; Guardian sizes a top-up
 * from savings to lift it back above the buffer — but never more than savings
 * actually holds. Everything derives from the entered amount and the live
 * savings balance, so the intercept, plan and success screens always agree.
 */
export function paynowProjection(
  amount: number,
  currentLow: number = baseline.lowestBalance,
  currentMonthEnd: number = baseline.monthEnd,
  savingsAvailable: number = savingsAccount.availableBalance
) {
  const lowIfSent = currentLow - amount; // e.g. 484 - 800 = -316
  const monthEndIfSent = currentMonthEnd - amount; // e.g. 3100 - 800 = 2300
  // Ideally top up enough to clear the buffer, rounded to a clean SGD 100 —
  // then cap it to what savings can actually cover.
  const neededTopUp = Math.max(0, roundUpTo100(SAFETY_BUFFER - lowIfSent)); // 900
  const bridge = savingsBridge(neededTopUp, savingsAvailable);
  const moveFromSavings = bridge.moved; // capped at savings (e.g. 900)
  const shortfall = bridge.shortfall; // unbridged gap if savings ran out
  const sufficient = bridge.sufficient; // savings fully covers the top-up
  const lowAfterPlan = lowIfSent + moveFromSavings; // 584 (or below buffer if short)
  const monthEndAfterPlan = monthEndIfSent + moveFromSavings; // 3200
  return {
    lowIfSent,
    monthEndIfSent,
    neededTopUp,
    moveFromSavings,
    shortfall,
    sufficient,
    lowAfterPlan,
    monthEndAfterPlan,
  };
}

/**
 * Share of the customer's emergency reserve (savings) that a rescue may consume
 * before Guardian considers a payment worth stepping in for. A *position-relative*
 * risk policy — "would this drain a big chunk of your safety net?" — not a fixed
 * judgement on the payment's size.
 */
export const EMERGENCY_RESERVE_STRAIN = 0.4;

/**
 * How Guardian reads a PayNow *before* the money leaves — like an advisor, not a
 * rule engine. It does NOT classify by the payment's size; it simulates the
 * customer's whole position *after* the payment and grades the outcome:
 *
 *   balance after  →  upcoming bills/subscriptions  →  lowest balance before
 *   payday  →  emergency reserve (savings) remaining  →  risk level
 *
 * Every boundary is derived from that forward simulation against the customer's
 * own cushion and savings — so the same SGD payment is "fine" for a healthy
 * position and "step in" for a stretched one, and a transfer made earlier in the
 * session (which already moved the live balance/low) compounds into this read.
 *
 *  • clear    — even the tightest day before payday still clears the cushion.
 *  • steady   — dips a little under the cushion, but comfortably absorbed: the
 *               account stays liquid today and a rescue would barely touch savings.
 *  • protect  — the low sinks toward zero, or restoring the cushion would draw a
 *               large share of the emergency reserve: Guardian offers the
 *               savings-bridge plan (the SGD 800 hero lands here).
 *  • drawdown — the account itself is left thin *today*, leaning hard on savings.
 *  • shortfall— even moving every dollar of savings can't lift the pre-payday
 *               low back over the cushion: Guardian is honest it can't fully cover.
 */
export type PayNowTier = "clear" | "steady" | "protect" | "drawdown" | "shortfall";

export function paynowAssessment(
  amount: number,
  currentBalance: number = account.availableBalance,
  currentLow: number = baseline.lowestBalance,
  currentMonthEnd: number = baseline.monthEnd,
  savingsAvailable: number = savingsAccount.availableBalance
) {
  const proj = paynowProjection(amount, currentLow, currentMonthEnd, savingsAvailable);
  const balanceAfter = currentBalance - amount; // liquidity left today
  const lowAfter = proj.lowIfSent; // projected lowest balance before payday, after sending
  // How much of the emergency reserve restoring the cushion would consume.
  const reserveStrain =
    savingsAvailable > 0 ? proj.neededTopUp / savingsAvailable : proj.neededTopUp > 0 ? Infinity : 0;

  // Grade the *outcome* first (where the position lands), then layer in whether
  // the savings reserve can rescue it — so an empty reserve doesn't turn a
  // shallow, still-solvent dip into a false alarm.
  const dipsUnderCushion = lowAfter < SAFETY_BUFFER; // breaches the preferred floor
  const serious = lowAfter < 0; // would actually run out before payday without help
  const thinToday = balanceAfter < SAFETY_BUFFER; // little left in the account today

  let tier: PayNowTier;
  if (!dipsUnderCushion) {
    // Even the tightest day before payday still clears the cushion — safe.
    tier = "clear";
  } else if (serious && !proj.sufficient) {
    // Would run out before payday and savings can't fully bridge it — be honest.
    tier = "shortfall";
  } else if (thinToday) {
    // The spending account itself is left thin today, leaning on savings.
    tier = "drawdown";
  } else if (serious || (savingsAvailable > 0 && reserveStrain >= EMERGENCY_RESERVE_STRAIN)) {
    // Heads toward running out, or rescuing it would drain a big slice of the
    // safety net — worth stepping in with the bridge plan.
    tier = "protect";
  } else {
    // A shallow dip under the cushion that's comfortably absorbed (or simply
    // ridden out to payday when there's no reserve to lean on).
    tier = "steady";
  }

  const intercepts = tier === "protect" || tier === "drawdown" || tier === "shortfall";

  // Conclusion-first reassurance for the safe tiers (no intercept needed).
  const reassurance =
    tier === "clear"
      ? `You'll stay above your ${formatSGD0(SAFETY_BUFFER)} cushion all the way to payday.`
      : tier === "steady"
      ? "You'll still have enough for everything due before payday."
      : "";

  return { tier, intercepts, balanceAfter, lowAfter, reserveStrain, reassurance, savingsAvailable, ...proj };
}

// ---------------------------------------------------------------
// Mock Scan & Pay — a PayNow merchant QR the customer scans to pay.
// Fully mock; the QR graphic is decorative and not really scannable.
// ---------------------------------------------------------------
export const scanMerchant = {
  name: "Tian Tian Chicken Rice",
  location: "Maxwell Food Centre · Stall 10",
  uen: "53••••••8K",
  category: "Hawker",
  suggested: [5.5, 6.5, 12, 24],
};

/**
 * How Guardian reads a Scan & Pay before the customer taps — never blocking
 * (Scan is always one tap to proceed), and judged by what the payment does to
 * the customer's position rather than its size. It walks the same forward
 * simulation as PayNow: what's left today, and where the forecast bottoms out
 * before payday — so an everyday meal is waved through, while a tap that would
 * genuinely leave the month tight gets an honest heads-up.
 */
export function scanAssessment(
  amount: number,
  currentBalance: number = account.availableBalance,
  currentLow: number = baseline.lowestBalance
) {
  const balanceAfter = currentBalance - amount; // left today
  const lowAfter = currentLow - amount; // projected lowest before payday, after paying
  let tone: "ok" | "note" | "caution";
  let message: string;

  if (balanceAfter < SAFETY_BUFFER || lowAfter < 0) {
    // Leaves the account under the cushion today, or pushes the forecast to the
    // bone before payday.
    tone = "caution";
    message = `heads-up — this leaves you tight before payday, with about ${formatSGD0(
      balanceAfter
    )} left in your account.`;
  } else if (balanceAfter < SAFETY_BUFFER * 2) {
    // Takes a real bite — still fine, but worth a gentle note.
    tone = "note";
    message = `a bigger bite than usual, but your bills are still covered — about ${formatSGD0(
      balanceAfter
    )} left.`;
  } else {
    tone = "ok";
    message = "this is everyday spending — you've got plenty of room.";
  }

  return { tone, message, balanceAfter };
}

// Dashboard alert once the plan has been approved (success state)
export const guardianAlertResolved = {
  status: "All set",
  headline: "You're back on track",
  subline: "I've set up your plan and I'm keeping watch.",
  nextReview: "7 days",
  bullets: [
    { icon: "shield" as const, text: "Your money stays above your safety cushion" },
    { icon: "home" as const, text: "Home-move help saved for whenever you're ready" },
  ],
};
