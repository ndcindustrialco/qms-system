"use client";

interface Props { kpiOk: number; kpiNg: number; kpiPending: number; kpiTotal: number; isTh: boolean }

const LEGEND = (p: Props) => [
  { label: "OK",                              value: p.kpiOk,      dotClass: "bg-emerald-500", barClass: "bg-emerald-500", textClass: "text-emerald-600" },
  { label: "NG",                              value: p.kpiNg,      dotClass: "bg-rose-500",    barClass: "bg-rose-500",    textClass: "text-rose-600"    },
  { label: p.isTh ? "รอ" : "Pending",        value: p.kpiPending, dotClass: "bg-amber-500",   barClass: "bg-amber-500",   textClass: "text-amber-600"   },
];

// Hex literals kept only for the conic-gradient — Tailwind cannot generate
// dynamic conic-gradient values at build time.
const RING_COLORS = { ok: "#10B981", ng: "#EF4444", pending: "#F59E0B" };

export default function DashboardKpiWidget({ kpiOk, kpiNg, kpiPending, kpiTotal, isTh }: Props) {
  if (kpiTotal === 0) {
    return (
      <div className="py-4 text-center">
        <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 mx-auto flex items-center justify-center">
          <span className="text-[11px] text-slate-400">{isTh ? "ไม่มีข้อมูล" : "No data"}</span>
        </div>
      </div>
    );
  }

  const okPct  = (kpiOk / kpiTotal) * 100;
  const ngPct  = ((kpiOk + kpiNg) / kpiTotal) * 100;

  // conic-gradient requires inline style — hex values are isolated here
  const ringStyle = {
    background: `conic-gradient(
      ${RING_COLORS.ok} 0% ${okPct}%,
      ${RING_COLORS.ng} ${okPct}% ${ngPct}%,
      ${RING_COLORS.pending} ${ngPct}% 100%
    )`,
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Ring chart */}
      <div className="relative w-28 h-28 rounded-full flex items-center justify-center" style={ringStyle}>
        {/* Center hole */}
        <div className="absolute w-[72px] h-[72px] rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono text-[#0F1059] leading-none">{kpiTotal}</span>
          <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
            {isTh ? "ทั้งหมด" : "total"}
          </span>
        </div>
      </div>

      {/* Legend bars */}
      <div className="w-full space-y-2.5">
        {LEGEND({ kpiOk, kpiNg, kpiPending, kpiTotal, isTh }).map((item) => (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${item.dotClass}`} />
                <span className="text-xs font-semibold text-slate-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  {kpiTotal ? Math.round((item.value / kpiTotal) * 100) : 0}%
                </span>
                <span className={`text-xs font-mono font-bold w-5 text-right ${item.textClass}`}>
                  {item.value}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${item.barClass}`}
                style={{ width: `${kpiTotal ? (item.value / kpiTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
