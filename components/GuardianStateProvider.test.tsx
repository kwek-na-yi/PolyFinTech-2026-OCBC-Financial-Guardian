// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import GuardianStateProvider, { useGuardian } from "./GuardianStateProvider";

const wrapper = ({ children }: { children: ReactNode }) => (
  <GuardianStateProvider>{children}</GuardianStateProvider>
);
const setup = () => renderHook(() => useGuardian(), { wrapper }).result;

describe("GuardianStateProvider", () => {
  it("starts from the seed state", () => {
    const g = setup().current;
    expect(g.balance).toBe(2300);
    expect(g.savings).toBe(1200);
    expect(g.transactions).toHaveLength(9);
    expect(g.projectedLow).toBeCloseTo(484.2, 2);
    expect(g.risk).toBe("Medium");
  });

  it("runs the approved PayNow plan: top-up from savings, then the full transfer", () => {
    const r = setup();
    act(() => r.current.runPayNow("approve", 800));

    expect(r.current.balance).toBe(2400);
    expect(r.current.savings).toBe(300);
    expect(r.current.projectedLow).toBeCloseTo(584.2, 2);
    expect(r.current.risk).toBe("Low");
    expect(r.current.transactions.slice(0, 2)).toMatchObject([
      { merchant: "Transfer from OCBC 360", amount: 900 },
      { merchant: "PayNow · Marcus Tan", amount: -800 },
    ]);
    expect(r.current.before).toMatchObject({ balance: 2300, savings: 1200, risk: "Medium" });
  });

  it("sends anyway without touching savings, and the forecast takes the hit", () => {
    const r = setup();
    act(() => r.current.runPayNow("proceed", 800));

    expect(r.current.balance).toBe(1500);
    expect(r.current.savings).toBe(1200);
    expect(r.current.risk).toBe("High");
    expect(r.current.transactions).toHaveLength(10);
    expect(r.current.lastDecision).toBe("proceed");
  });

  it("approves the briefing plan and moves the sized top-up", () => {
    const r = setup();
    act(() => r.current.approvePlan(["r1", "r2"]));

    expect(r.current.balance).toBe(3000);
    expect(r.current.savings).toBe(500);
    expect(r.current.lastRiskReduction).toBe(87);
    expect(r.current.planApproved).toBe(true);
    expect(r.current.transactions[0]).toMatchObject({ merchant: "Transfer from OCBC 360", amount: 700 });
  });

  it("approves behavioural steps without moving money", () => {
    const r = setup();
    act(() => r.current.approvePlan(["r2"]));

    expect(r.current.balance).toBe(2300);
    expect(r.current.savings).toBe(1200);
    expect(r.current.transactions).toHaveLength(9);
    expect(r.current.lastRiskReduction).toBe(42);
  });

  it("compounds actions: an earlier top-up shrinks the PayNow bridge", () => {
    const r = setup();
    act(() => r.current.approvePlan(["r1"])); // balance 3000, savings 500, low 1184.20
    act(() => r.current.runPayNow("approve", 800)); // low 384.20 → bridge only SGD 200

    expect(r.current.transactions[0]).toMatchObject({ merchant: "Transfer from OCBC 360", amount: 200 });
    expect(r.current.balance).toBe(2400);
    expect(r.current.savings).toBe(300);
  });

  it("deducts a Scan & Pay merchant payment and logs it", () => {
    const r = setup();
    act(() => r.current.payMerchant("Tian Tian Chicken Rice", 6.5));

    expect(r.current.balance).toBeCloseTo(2293.5, 2);
    expect(r.current.transactions[0]).toMatchObject({
      merchant: "Tian Tian Chicken Rice",
      category: "Scan & Pay",
      amount: -6.5,
    });
  });

  it("moves money to savings, never more than the spending balance", () => {
    const r = setup();
    act(() => r.current.saveMoney(5000));

    expect(r.current.balance).toBe(0);
    expect(r.current.savings).toBe(3500);
    expect(r.current.transactions[0]).toMatchObject({ merchant: "Transfer to OCBC 360", amount: -2300 });
  });

  it("resets to the seed state", () => {
    const r = setup();
    act(() => r.current.runPayNow("approve", 800));
    act(() => r.current.reset());

    expect(r.current.balance).toBe(2300);
    expect(r.current.savings).toBe(1200);
    expect(r.current.transactions).toHaveLength(9);
    expect(r.current.planApproved).toBe(false);
  });

  it("throws a clear error when used outside the provider", () => {
    // React and jsdom both report the thrown render error; keep the output clean.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const swallow = (e: ErrorEvent) => e.preventDefault();
    window.addEventListener("error", swallow);
    expect(() => renderHook(() => useGuardian())).toThrow(
      "useGuardian must be used within GuardianStateProvider"
    );
    window.removeEventListener("error", swallow);
    consoleError.mockRestore();
  });
});
