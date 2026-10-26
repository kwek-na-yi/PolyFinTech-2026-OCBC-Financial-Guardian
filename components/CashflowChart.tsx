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
  const yMin = rawMin - span * 0.12;

  const x = (day: number) => padL + (day / maxDay) * (W - padL - padR);
  const y = (bal: number) =>
    padT + (1 - (bal - yMin) / (yMax - yMin)) * (H - padT - padB);

  const pts = timeline.map((p) => ({ ...p, cx: x(p.day), cy: y(p.balance) }));

  // Smooth Catmull-Rom -> cubic bezier path
  const smoothPath = (nodes: { cx: number; cy: number }[]) => {
    if (nodes.length < 2) return "";
    let d = `M ${nodes[0].cx.toFixed(1)} ${nodes[0].cy.toFixed(1)}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const p0 = nodes[i - 1] || nodes[i];
      const p1 = nodes[i];
      const p2 = nodes[i + 1];
      const p3 = nodes[i + 2] || p2;
      const t = 0.18;
      const c1x = p1.cx + (p2.cx - p0.cx) * t;
      const c1y = p1.cy + (p2.cy - p0.cy) * t;
      const c2x = p2.cx - (p3.cx - p1.cx) * t;
      const c2y = p2.cy - (p3.cy - p1.cy) * t;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.cx.toFixed(1)} ${p2.cy.toFixed(1)}`;
    }
    return d;
  };

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].cx.toFixed(1)} ${H - padB} L ${pts[0].cx.toFixed(1)} ${H - padB} Z`;
  const thresholdY = y(SAFETY_BUFFER);

  const lowest = pts.find((p) => p.lowest);
  const salary = pts.find((p) => p.type === "credit");

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
      <text x={padL + 2} y={thresholdY - 4} style={{ fontSize: 8, fontWeight: 700 }} className="fill-ocbc-red">
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
          <text x={lowest.cx} y={lowest.cy + 28} textAnchor="middle" style={{ fontSize: 7.5, fontWeight: 600 }} className="fill-ocbc-red">
            lowest · day {lowest.day}
          </text>
        </motion.g>
      )}

      {/* X-axis day labels */}
      {pts.map((p) => (
        <text
          key={`x-${p.id}`}
          x={p.cx}
          y={H - 8}
          textAnchor={p.day === 0 ? "start" : p.day === maxDay ? "end" : "middle"}
          style={{ fontSize: 7.5, fontWeight: 600 }}
          className="fill-ocbc-mute"
        >
          {p.day === 0 ? "Today" : p.day === maxDay ? "Month end" : `D${p.day}`}
        </text>
      ))}
    </svg>
  );
}
