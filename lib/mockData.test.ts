import { describe, expect, it } from "vitest";
import {
  REST_OF_MONTH,
  SAFETY_BUFFER,
  account,
  buildForecast,
  combinedRiskReduction,
  deriveGuardian,
  deriveHealthScore,
  paynowAssessment,
  paynowProjection,
  planConfidence,
  savingsAccount,
  savingsBridge,
  scanAssessment,
  type ScheduledEvent,
} from "./mockData";

const SEED_BALANCE = account.availableBalance; // 2300
const SEED_SAVINGS = savingsAccount.availableBalance; // 1200
const SEED_LOW = 484.2;

/** Guardian's read for a given balance/savings, via the real forecast. */
const guardianFor = (balance: number, savings: number) =>
  deriveGuardian({ balance, savings, ...buildForecast(balance) });

const event = (
  id: string,
  day: number,
  amount: number,
  category: ScheduledEvent["category"] = "bill"
): ScheduledEvent => ({ id, day, when: `Day ${day}`, label: id, amount, category });

describe("buildForecast", () => {
  it("reproduces the seed forecast: low of SGD 484.20 on day 9, month-end SGD 3,100", () => {
    const f = buildForecast(SEED_BALANCE);
    expect(f.low).toBeCloseTo(SEED_LOW, 2);
    expect(f.lowDay).toBe(9);
    expect(f.monthEnd).toBeCloseTo(3100, 2);
  });

  it("walks every scheduled event from today to a day-30 month-end point", () => {
    const f = buildForecast(SEED_BALANCE);
    expect(f.points[0]).toMatchObject({ day: 0, type: "start", balance: SEED_BALANCE });
    expect(f.points.at(-1)).toMatchObject({ day: 30, type: "end" });
    expect(f.points).toHaveLength(9); // start + 7 scheduled events + month end
    expect(f.points.filter((p) => p.lowest)).toHaveLength(1);
  });

  it("shifts the low and month-end dollar-for-dollar with the starting balance", () => {
    const f = buildForecast(SEED_BALANCE + 700);
    expect(f.low).toBeCloseTo(SEED_LOW + 700, 2);
    expect(f.monthEnd).toBeCloseTo(3800, 2);
  });

  it("applies custom events in day order regardless of input order", () => {
    const f = buildForecast(1000, [
      event("salary", 5, 1000, "salary"),
      event("rent", 3, -600),
      event("phone", 1, -50),
    ]);
    expect(f.points.map((p) => p.day)).toEqual([0, 1, 3, 5, 30]);
    expect(f.low).toBeCloseTo(350, 2);
    expect(f.lowDay).toBe(3);
    expect(f.monthEnd).toBeCloseTo(1000 - 50 - 600 + 1000 + REST_OF_MONTH, 2);
  });

  it("ignores debits after payday when finding the pre-payday low", () => {
    const f = buildForecast(1000, [
      event("rent", 2, -300),
      event("salary", 10, 4500, "salary"),
      event("holiday", 12, -5000),
    ]);
    expect(f.low).toBeCloseTo(700, 2);
    expect(f.lowDay).toBe(2);
  });

  it("falls back to today's balance when nothing is due before payday", () => {
    const f = buildForecast(800, [event("salary", 10, 4500, "salary")]);
    expect(f.low).toBe(800);
    expect(f.lowDay).toBe(0);
  });

  it("projects a negative low from a zero balance", () => {
    expect(buildForecast(0).low).toBeCloseTo(SEED_LOW - SEED_BALANCE, 2);
  });
});

describe("deriveGuardian — risk levels", () => {
  const at = (low: number) =>
    deriveGuardian({ balance: 0, savings: SEED_SAVINGS, low, lowDay: 9, monthEnd: 3000 });

  it("is Low/healthy at or above the SGD 500 cushion", () => {
    expect(at(SAFETY_BUFFER)).toMatchObject({ risk: "Low", status: "healthy", belowCushion: false });
  });

  it("is Medium/watch just below the cushion and at zero", () => {
    expect(at(499.99)).toMatchObject({ risk: "Medium", status: "watch" });
    expect(at(0)).toMatchObject({ risk: "Medium", status: "watch" });
  });

  it("is High/risk once the low goes negative", () => {
    expect(at(-0.01)).toMatchObject({ risk: "High", status: "risk" });
  });
});

describe("deriveGuardian — recommendations", () => {
  it("proposes no money move for a healthy forecast", () => {
    const g = guardianFor(3000, SEED_SAVINGS);
    expect(g.transfer).toBe(0);
    expect(g.recommendations.map((r) => r.id)).toEqual(["r2", "r3"]);
    expect(g.alert.tone).toBe("ok");
  });

  it("sizes the seed top-up to SGD 700 (cushion + ~1 week, rounded to SGD 100)", () => {
    const g = guardianFor(SEED_BALANCE, SEED_SAVINGS);
    expect(g.recommendations.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
    expect(g.transfer).toBe(700);
    expect(g.minAfter).toBeCloseTo(1184.2, 2);
    expect(g.sufficient).toBe(true);
    expect(g.alert.tone).toBe("warn");
  });

  it("caps the top-up at available savings and says when it is not enough", () => {
    // Balance 1500 → low −315.80; ideal top-up 1500, but only 500 in savings.
    const g = guardianFor(1500, 500);
    expect(g.transfer).toBe(500);
    expect(g.sufficient).toBe(false);
    expect(g.recommendations[0].title).toBe("Top up what you can from savings");
  });

  it("switches to a no-transfer recommendation when savings are empty", () => {
    const g = guardianFor(1500, 0);
    expect(g.transfer).toBe(0);
    expect(g.recommendations[0]).toMatchObject({ title: "Ease off until payday", movesMoney: false });
  });

  it("never proposes moving more than savings holds", () => {
    for (const balance of [0, 500, 1500, 2300, 2400, 4000]) {
      for (const savings of [0, 50, 300, 1200, 10_000]) {
        const g = guardianFor(balance, savings);
        expect(g.transfer).toBeGreaterThanOrEqual(0);
        expect(g.transfer).toBeLessThanOrEqual(savings);
      }
    }
  });
});

describe("deriveHealthScore", () => {
  it("anchors at 92 for the seed low", () => {
    expect(deriveHealthScore(SEED_LOW)).toBe(92);
  });

  it("never decreases as the low improves and stays within 60–98", () => {
    let prev = -Infinity;
    for (let low = -20_000; low <= 20_000; low += 250) {
      const s = deriveHealthScore(low);
      expect(s).toBeGreaterThanOrEqual(prev);
      expect(s).toBeGreaterThanOrEqual(60);
      expect(s).toBeLessThanOrEqual(98);
      prev = s;
    }
  });
});

describe("combinedRiskReduction and planConfidence", () => {
  const recs = guardianFor(SEED_BALANCE, SEED_SAVINGS).recommendations;

  it("compounds the selected risk reductions", () => {
    expect(combinedRiskReduction(recs, [])).toBe(0);
    expect(combinedRiskReduction(recs, ["r1"])).toBe(78);
    expect(combinedRiskReduction(recs, ["r1", "r2"])).toBe(87); // 1 − 0.22 × 0.58
  });

  it("matches the confidence figures shown for the two demo plans", () => {
    expect(planConfidence(1184.2)).toBe(96); // Journey A plan
    expect(planConfidence(584.2)).toBe(91); // PayNow plan
  });

  it("ranges from 90 (no margin above the cushion) to 96 (a full cushion of margin)", () => {
    expect(planConfidence(-10_000)).toBe(90);
    expect(planConfidence(SAFETY_BUFFER)).toBe(90);
    expect(planConfidence(SAFETY_BUFFER * 2)).toBe(96);
    expect(planConfidence(1_000_000)).toBe(96);
  });
});

describe("savingsBridge", () => {
  it("moves the full amount when savings cover it", () => {
    expect(savingsBridge(900, 1200)).toEqual({ needed: 900, moved: 900, shortfall: 0, sufficient: true });
  });

  it("caps at savings and reports the remaining shortfall", () => {
    expect(savingsBridge(900, 500)).toEqual({ needed: 900, moved: 500, shortfall: 400, sufficient: false });
  });

  it("treats negative inputs as zero", () => {
    expect(savingsBridge(-100, 1200).moved).toBe(0);
    expect(savingsBridge(900, -50)).toMatchObject({ moved: 0, shortfall: 900 });
  });
});

describe("paynowProjection", () => {
  it("computes the demo SGD 800 transfer and SGD 900 savings bridge", () => {
    const p = paynowProjection(800);
    expect(p.lowIfSent).toBeCloseTo(-315.8, 2);
    expect(p.neededTopUp).toBe(900);
    expect(p.moveFromSavings).toBe(900);
    expect(p.lowAfterPlan).toBeCloseTo(584.2, 2);
    expect(p.monthEndIfSent).toBeCloseTo(2300, 2);
    expect(p.monthEndAfterPlan).toBeCloseTo(3200, 2);
  });
});

describe("paynowAssessment — tiers", () => {
  const assess = (amount: number, opts: Partial<{ balance: number; low: number; savings: number }> = {}) =>
    paynowAssessment(
      amount,
      opts.balance ?? SEED_BALANCE,
      opts.low ?? SEED_LOW,
      3100,
      opts.savings ?? SEED_SAVINGS
    );

  it("intercepts the demo SGD 800 transfer with the protect tier", () => {
    expect(assess(800)).toMatchObject({ tier: "protect", intercepts: true });
  });

  it("clears a payment that keeps the low above the cushion", () => {
    const a = assess(100, { balance: 3000, low: 1184.2 });
    expect(a).toMatchObject({ tier: "clear", intercepts: false });
    expect(a.reassurance).not.toBe("");
  });

  it("treats a shallow, cheaply-rescued dip as steady", () => {
    expect(assess(10)).toMatchObject({ tier: "steady", intercepts: false });
  });

  it("steps in when restoring the cushion would use 40% or more of savings", () => {
    // 300 → top-up 400 (33% of 1200): steady. 400 → top-up 500 (42%): protect.
    expect(assess(300).tier).toBe("steady");
    expect(assess(400)).toMatchObject({ tier: "protect", intercepts: true });
  });

  it("flags drawdown when the account is left thin today but savings can bridge it", () => {
    expect(assess(1900, { savings: 5000 })).toMatchObject({ tier: "drawdown", intercepts: true });
  });

  it("is honest about a shortfall savings cannot cover", () => {
    const a = assess(1500);
    expect(a).toMatchObject({ tier: "shortfall", intercepts: true, sufficient: false });
    expect(a.shortfall).toBeGreaterThan(0);
  });

  it("does not raise a false alarm for a shallow dip when savings are empty", () => {
    expect(assess(10, { savings: 0 })).toMatchObject({ tier: "steady", intercepts: false });
  });
});

describe("scanAssessment", () => {
  it("waves through everyday spending", () => {
    expect(scanAssessment(6.5).tone).toBe("ok");
  });

  it("adds a note when less than SGD 1,000 would be left", () => {
    expect(scanAssessment(1500, 2300, 2000)).toMatchObject({ tone: "note", balanceAfter: 800 });
  });

  it("cautions when the account drops under the cushion today", () => {
    expect(scanAssessment(1900, 2300, 5000).tone).toBe("caution");
  });

  it("cautions when the pre-payday low would go negative", () => {
    expect(scanAssessment(600, 2300, SEED_LOW).tone).toBe("caution");
  });
});
