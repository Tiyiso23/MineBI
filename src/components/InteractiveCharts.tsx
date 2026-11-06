import React, { useState } from 'react';
import { TrendPoint } from '../types/mining';

interface ProductionChartProps {
  data: TrendPoint[];
  height?: number;
}

export function ProductionVelocityChart({ data, height = 280 }: ProductionChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-slate-800 rounded-lg">
        No production trend data available for selected filter
      </div>
    );
  }

  // Calculate scales
  const maxTons = Math.max(...data.map(d => Math.max(d.actual_tons, d.target_tons))) * 1.15;
  const minTons = Math.max(0, Math.min(...data.map(d => Math.min(d.actual_tons, d.target_tons))) * 0.85);

  const padding = { top: 20, right: 30, bottom: 40, left: 65 };
  const width = 800; // SVG viewBox coordinate width
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minTons) / (maxTons - minTons || 1)) * chartHeight;

  // Build SVG paths
  const actualPoints = data.map((d, i) => `${getX(i)},${getY(d.actual_tons)}`);
  const actualPath = `M ${actualPoints.join(' L ')}`;
  const actualArea = `${actualPath} L ${getX(data.length - 1)},${padding.top + chartHeight} L ${getX(0)},${padding.top + chartHeight} Z`;

  const targetPoints = data.map((d, i) => `${getX(i)},${getY(d.target_tons)}`);
  const targetPath = `M ${targetPoints.join(' L ')}`;

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
    const val = minTons + ratio * (maxTons - minTons);
    return {
      val: Math.round(val),
      y: getY(val),
    };
  });

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Subtle grid lines */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={t.y}
              x2={width - padding.right}
              y2={t.y}
              stroke="rgba(148, 163, 184, 0.12)"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 12}
              y={t.y + 4}
              textAnchor="end"
              className="text-[11px] fill-slate-400 font-mono"
            >
              {(t.val / 1000).toFixed(0)}k t
            </text>
          </g>
        ))}

        {/* Area fill for actual tons */}
        <path d={actualArea} fill="url(#actualGradient)" />

        {/* Target line (Dashed White / Slate) */}
        <path
          d={targetPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5 5"
          className="opacity-75"
        />

        {/* Actual line (Amber) */}
        <path
          d={actualPath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels (Sparse) */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) {
            return (
              <text
                key={i}
                x={getX(i)}
                y={height - 10}
                textAnchor="middle"
                className="text-[11px] fill-slate-400 font-mono"
              >
                {d.date.slice(5)}
              </text>
            );
          }
          return null;
        })}

        {/* Hover interaction points and vertical guide */}
        {hoverIndex !== null && (
          <g>
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={padding.top + chartHeight}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-70"
            />
            {/* Target point indicator */}
            <circle
              cx={getX(hoverIndex)}
              cy={getY(data[hoverIndex].target_tons)}
              r="4.5"
              fill="#0f172a"
              stroke="#94a3b8"
              strokeWidth="2"
            />
            {/* Actual point indicator */}
            <circle
              cx={getX(hoverIndex)}
              cy={getY(data[hoverIndex].actual_tons)}
              r="5.5"
              fill="#f59e0b"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Invisible mouse hover trigger rectangles for precision hit detection */}
        {data.map((_, i) => {
          const x = getX(i) - chartWidth / (data.length * 2);
          const w = chartWidth / data.length;
          return (
            <rect
              key={i}
              x={x}
              y={padding.top}
              width={w}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
            />
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {activePoint && hoverIndex !== null && (
        <div
          className="pointer-events-none absolute top-4 z-20 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-md shadow-xl text-xs space-y-1 transform -translate-x-1/2 backdrop-blur-md"
          style={{
            left: `${(getX(hoverIndex) / width) * 100}%`,
          }}
        >
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
            {activePoint.date}
          </div>
          <div className="flex items-center justify-between gap-4 text-amber-400">
            <span>Actual Output:</span>
            <span className="font-mono font-medium">{activePoint.actual_tons.toLocaleString()} t</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Target Plan:</span>
            <span className="font-mono font-medium">{activePoint.target_tons.toLocaleString()} t</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 font-mono text-[11px]">
            <span className="text-slate-400">Variance:</span>
            <span className={activePoint.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {activePoint.variance > 0 ? '+' : ''}
              {activePoint.variance.toLocaleString()} t ({activePoint.achievement_pct.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      {/* Chart Legend */}
      <div className="flex items-center justify-end gap-6 pt-2 px-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-amber-500 rounded-full inline-block" />
          <span>Actual Production</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 border-b border-dashed border-slate-400 inline-block" />
          <span>Target Plan</span>
        </div>
      </div>
    </div>
  );
}

// Production Variance Divergence Bar Chart
export function VarianceBarChart({ data }: { data: TrendPoint[] }) {
  if (!data || data.length === 0) return null;

  const maxAbsVariance = Math.max(...data.map(d => Math.abs(d.variance)), 1000);
  const height = 160;
  const padding = { top: 15, right: 15, bottom: 25, left: 50 };
  const width = 800;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const zeroY = padding.top + chartHeight / 2;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Zero baseline */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={width - padding.right}
          y2={zeroY}
          stroke="rgba(148, 163, 184, 0.4)"
          strokeWidth="1.5"
        />

        {/* Baseline text */}
        <text
          x={padding.left - 8}
          y={zeroY + 3}
          textAnchor="end"
          className="text-[10px] fill-slate-400 font-mono"
        >
          0 t
        </text>

        {data.map((d, i) => {
          const x = padding.left + (i / data.length) * chartWidth + 2;
          const barWidth = Math.max(3, chartWidth / data.length - 4);
          const barHeight = (Math.abs(d.variance) / maxAbsVariance) * (chartHeight / 2);
          const isPositive = d.variance >= 0;
          const y = isPositive ? zeroY - barHeight : zeroY;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(1, barHeight)}
                fill={isPositive ? '#10b981' : '#f43f5e'}
                rx="1"
                className="transition-all hover:opacity-80"
              >
                <title>{`${d.date}: ${d.variance > 0 ? '+' : ''}${d.variance.toLocaleString()} t`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1">
        <span>Variance Divergence (Actual - Target)</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" /> Surplus (+ tons)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-xs bg-rose-500 inline-block" /> Deficit (- tons)
          </span>
        </div>
      </div>
    </div>
  );
}

// Equipment Availability Donut Gauge
export function AvailabilityDonut({
  availabilityPct,
  operatingPct,
  downtimePct,
  size = 140,
}: {
  availabilityPct: number;
  operatingPct: number;
  downtimePct: number;
  size?: number;
}) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Safe clamps
  const safeAvail = Math.min(100, Math.max(0, availabilityPct));
  const dashOffset = circumference - (safeAvail / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(51, 65, 85, 0.4)"
          strokeWidth={strokeWidth}
        />
        {/* Active progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={safeAvail >= 85 ? '#10b981' : safeAvail >= 75 ? '#f59e0b' : '#ef4444'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono tracking-tight text-slate-100">
          {availabilityPct.toFixed(1)}%
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Avail</span>
      </div>
    </div>
  );
}
