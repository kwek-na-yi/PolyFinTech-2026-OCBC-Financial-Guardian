"use client";

import { motion } from "framer-motion";
import { SAFETY_BUFFER, formatSGD, formatSGDk } from "@/lib/mockData";
import { useGuardian } from "@/components/GuardianStateProvider";

/**
 * Hero predictive cashflow chart.
 * Plots the *live* projected running balance over the next 30 days on a
 * proportional time axis, with a SGD 500 safety-buffer threshold and a
 * highlighted dip where the forecast breaches it. Reads the same forecast every
 * other screen does, so after any payment, transfer or save the curve, its
 * lowest point and the danger zone all move with it.
 */
export default function CashflowChart() {
  const { forecast } = useGuardian();
  const timeline = forecast.points;

  const W = 360;
  const H = 208;
  const padL = 14;
  const padR = 14;
  const padT = 26;
  const padB = 30;

  const maxDay = timeline[timeline.length - 1].day;

  // Scale the y-axis to the live data so big spends (or negative balances) stay
  // on-chart and the cushion line is always visible.
  const balances = timeline.map((p) => p.balance);
  const rawMax = Math.max(...balances, SAFETY_BUFFER);
  const rawMin = Math.min(...balances, 0);
  const span = rawMax - rawMin || 1000;
  const yMax = rawMax + span * 0.16;
  // Extra bottom head-room keeps the two-line lowest-point callout clear of the
  // x-axis labels, even when the low is the chart minimum (e.g. negative).
  const yMin = rawMin - span * 0.25;

  const x = (day: number) => padL + (day / maxDay) * (W - padL - padR);
  const y = (bal: number) =>
    padT + (1 - (bal - yMin) / (yMax - yMin)) * (H - padT - padB);

  const pts = timeline.map((p) => ({ ...p, cx: x(p.day), cy: y(p.balance) }));

  // Monotone cubic (Fritsch–Carlson) path. Unlike a Catmull-Rom spline it never
  // overshoots between points, so the curve can't dip below the marked lowest
  // balance or bend backwards in time on the steep rise to payday.
  const smoothPath = (nodes: { cx: number; cy: number }[]) => {
    if (nodes.length < 2) return "";
    const n = nodes.length;
    const h = nodes.slice(1).map((p, i) => p.cx - nodes[i].cx);
    const s = nodes.slice(1).map((p, i) => (p.cy - nodes[i].cy) / (h[i] || 1));
    const m = nodes.map((_, i) => {
      if (i === 0) return s[0];
      if (i === n - 1) return s[n - 2];
      const [s0, s1, h0, h1] = [s[i - 1], s[i], h[i - 1], h[i]];
      if (s0 * s1 <= 0) return 0; // local peak or trough: flat tangent
      const p = (s0 * h1 + s1 * h0) / (h0 + h1);
      return (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
    });
    let d = `M ${nodes[0].cx.toFixed(1)} ${nodes[0].cy.toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
      const dx = h[i] / 3;
      const p1 = nodes[i];
      const p2 = nodes[i + 1];
      d += ` C ${(p1.cx + dx).toFixed(1)} ${(p1.cy + m[i] * dx).toFixed(1)}, ${(p2.cx - dx).toFixed(1)} ${(p2.cy - m[i + 1] * dx).toFixed(1)}, ${p2.cx.toFixed(1)} ${p2.cy.toFixed(1)}`;
    }
    return d;
  };

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].cx.toFixed(1)} ${H - padB} L ${pts[0].cx.toFixed(1)} ${H - padB} Z`;
  const thresholdY = y(SAFETY_BUFFER);

  const lowest = pts.find((p) => p.lowest);
  const salary = pts.find((p) => p.type === "credit");

  // Weekly x-axis ticks on the proportional time scale. Events cluster in the
  // first ten days (often a day apart), so labelling every event overlaps;
  // each event keeps its node, and the low point and payday have callouts.
  const ticks = Array.from(new Set([0, 7, 14, 21, maxDay])).filter((d) => d <= maxDay);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EC0000" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#EC0000" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A30000" />
          <stop offset="55%" stopColor="#EC0000" />
          <stop offset="100%" stopColor="#EC0000" />
        </linearGradient>
      </defs>

      {/* Danger zone below safety buffer */}
      <rect
        x={padL}
        y={thresholdY}
        width={W - padL - padR}
        height={Math.max(0, H - padB - thresholdY)}
        fill="#EC0000"
        opacity={0.05}
      />
      <line
        x1={padL}
        x2={W - padR}
        y1={thresholdY}
        y2={thresholdY}
        stroke="#EC0000"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.55}
      />
      {/* Right-aligned: the pre-payday dip crosses the cushion on the left. */}
      <text x={W - padR - 2} y={thresholdY - 4} textAnchor="end" style={{ fontSize: 8, fontWeight: 700 }} className="fill-ocbc-red">
        SGD 500 safety cushion
      </text>

      {/* Area + line */}
      <motion.path
        d={areaPath}
        fill="url(#areaGrad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: "easeInOut" }}
      />

      {/* Nodes */}
      {pts.map((p, i) => {
        const isMilestone = p.type === "start" || p.type === "end";
        const isCredit = p.type === "credit";
        const color = p.lowest
          ? "#EC0000"
          : isCredit
          ? "#13A05B"
          : isMilestone
          ? "#1A1A1A"
          : "#C40000";
        return (
          <g key={p.id}>
            {p.lowest && (
              <motion.circle
                cx={p.cx}
                cy={p.cy}
                r={9}
                fill="#EC0000"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <motion.circle
              cx={p.cx}
              cy={p.cy}
              r={p.lowest || isMilestone ? 5 : 3.5}
              fill="#fff"
              stroke={color}
              strokeWidth={2.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
            />
          </g>
        );
      })}

      {/* Salary peak callout */}
      {salary && (
        <motion.text
          key={`lbl-${salary.id}`}
          x={salary.cx}
          y={salary.cy - 10}
          textAnchor="middle"
          style={{ fontSize: 8.5, fontWeight: 800 }}
          className="fill-ocbc-green"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          {formatSGDk(salary.amount ?? 4500)} payday
        </motion.text>
      )}

      {/* Start + end balance labels */}
      <text x={pts[0].cx} y={pts[0].cy - 10} textAnchor="start" style={{ fontSize: 8.5, fontWeight: 800 }} className="fill-ocbc-ink">
        {formatSGDk(pts[0].balance)}
      </text>
      <text x={pts[pts.length - 1].cx} y={pts[pts.length - 1].cy - 10} textAnchor="end" style={{ fontSize: 8.5, fontWeight: 800 }} className="fill-ocbc-ink">
        {formatSGDk(pts[pts.length - 1].balance)}
      </text>

      {/* Lowest-point callout */}
      {lowest && (
        <motion.g
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <text x={lowest.cx} y={lowest.cy + 18} textAnchor="middle" style={{ fontSize: 8.5, fontWeight: 800 }} className="fill-ocbc-red">
            {formatSGD(lowest.balance)}
          </text>
          <text x={lowest.cx} y={lowest.cy + 29} textAnchor="middle" style={{ fontSize: 7.5, fontWeight: 600 }} className="fill-ocbc-red">
            lowest · day {lowest.day}
          </text>
        </motion.g>
      )}

      {/* X-axis weekly ticks */}
      {ticks.map((d) => (
        <g key={`x-${d}`}>
          <line x1={x(d)} x2={x(d)} y1={H - padB} y2={H - padB + 3} stroke="#9AA0A6" strokeWidth={0.75} />
          <text
            x={x(d)}
            y={H - 12}
            textAnchor={d === 0 ? "start" : d === maxDay ? "end" : "middle"}
            style={{ fontSize: 8, fontWeight: 600 }}
            className="fill-ocbc-mute"
          >
            {d === 0 ? "Today" : d === maxDay ? "Month end" : `Day ${d}`}
          </text>
        </g>
      ))}
    </svg>
  );
}
