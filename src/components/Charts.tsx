import { useMemo } from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  unit?: string;
  goalLine?: number;
}

export function LineChart({ data, color = '#16a34a', height = 220, unit = 'kg', goalLine }: LineChartProps) {
  const width = 640;
  const padding = { top: 20, right: 20, bottom: 36, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { points, maxVal, minVal } = useMemo(() => {
    if (data.length === 0) return { points: [], maxVal: 0, minVal: 0 };
    const values = data.map((d) => d.value);
    const max = Math.max(...values, ...goalLine ? [goalLine] : []);
    const min = Math.min(...values);
    const range = max - min || 1;
    const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;
    const vals = data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartH - ((d.value - min) / range) * chartH,
      ...d,
    }));
    return { points: vals, maxVal: max, minVal: min };
  }, [data, chartW, chartH, goalLine]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400" style={{ height }}>
        No data yet. Log activities to see trends.
      </div>
    );
  }

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;
  const gridLines = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...Array(gridLines + 1)].map((_, i) => {
        const y = padding.top + (chartH / gridLines) * i;
        const val = maxVal - ((maxVal - (minVal || 0)) / gridLines) * i;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
              {Math.round(val)}
            </text>
          </g>
        );
      })}
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {goalLine !== undefined && maxVal > 0 && (
        <g>
          <line
            x1={padding.left}
            y1={padding.top + chartH - ((goalLine - (minVal || 0)) / (maxVal - (minVal || 0) || 1)) * chartH}
            x2={width - padding.right}
            y2={padding.top + chartH - ((goalLine - (minVal || 0)) / (maxVal - (minVal || 0) || 1)) * chartH}
            stroke="#eab308"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        </g>
      )}
      {points.map((p, i) => (
        <g key={i} className="group">
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2.5" />
          <text x={p.x} y={padding.top + chartH + 18} textAnchor="middle" className="fill-slate-500 text-[10px]">
            {p.label}
          </text>
          <rect x={p.x - 30} y={p.y - 30} width="60" height="20" rx="4" fill="#0f172a" opacity="0" className="group-hover:opacity-100 transition-opacity" />
          <text x={p.x} y={p.y - 18} textAnchor="middle" className="fill-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            {p.value} {unit}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, size = 180, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const innerRadius = radius * 0.62;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400" style={{ height: size }}>
        No breakdown yet.
      </div>
    );
  }

  const segments = [];
  let cumulative = 0;
  for (const slice of data) {
    if (slice.value === 0) continue;
    const fraction = slice.value / total;
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += fraction;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy + innerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy + innerRadius * Math.sin(startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    segments.push(<path key={slice.label} d={path} fill={slice.color} className="hover:opacity-80 transition-opacity" />);
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {segments}
        {(centerValue || centerLabel) && (
          <>
            <text x={cx} y={cy - 2} textAnchor="middle" className="fill-slate-900 text-[20px] font-bold">
              {centerValue}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" className="fill-slate-400 text-[10px] uppercase tracking-wide">
              {centerLabel}
            </text>
          </>
        )}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {data.filter((d) => d.value > 0).map((d) => (
          <div key={d.label} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  unit?: string;
}

export function BarChart({ data, height = 200, unit = '' }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1.5">
            <div className="relative w-full">
              <div
                className="mx-auto w-full max-w-[36px] rounded-t-lg transition-all hover:opacity-80"
                style={{
                  height: `${(d.value / maxVal) * (height - 40)}px`,
                  backgroundColor: d.color || '#16a34a',
                  minHeight: d.value > 0 ? '4px' : 0,
                }}
              />
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
                {d.value}{unit}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
