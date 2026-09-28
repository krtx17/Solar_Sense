import React, { useState } from 'react';

interface MinimalSplineChartProps {
  theme: 'dark' | 'light';
}

/**
 * Output Trend chart:
 * - A big total number (kWh/kW)
 * - Today / Week / Month toggle
 * - Line/area chart with day labels on the x-axis
 * - Restyled with warm glowing amber & solar orange gradient fill
 */
export const MinimalSplineChart: React.FC<MinimalSplineChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const [range, setRange] = useState<'today' | 'week' | 'month'>('week');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dataMap = {
    today: [
      { label: '06:00', value: 0.2 },
      { label: '08:00', value: 1.4 },
      { label: '10:00', value: 4.8 },
      { label: '12:00', value: 7.2 },
      { label: '14:00', value: 6.9 },
      { label: '16:00', value: 3.8 },
      { label: '18:00', value: 0.8 },
    ],
    week: [
      { label: 'Mon', value: 24.2 },
      { label: 'Tue', value: 28.6 },
      { label: 'Wed', value: 21.4 },
      { label: 'Thu', value: 31.0 },
      { label: 'Fri', value: 29.8 },
      { label: 'Sat', value: 33.2 },
      { label: 'Sun', value: 27.5 },
    ],
    month: [
      { label: 'W1', value: 182.4 },
      { label: 'W2', value: 196.8 },
      { label: 'W3', value: 210.1 },
      { label: 'W4', value: 204.6 },
    ],
  };

  const points = dataMap[range];
  const maxVal = Math.max(...points.map((p) => p.value)) * 1.15;

  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 30;
  const paddingY = 24;

  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const coords = points.map((p, i) => {
    const x = paddingX + (i / (points.length - 1)) * chartW;
    const y = paddingY + chartH - (p.value / maxVal) * chartH;
    return { x, y, ...p };
  });

  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const current = coords[i];
    const next = coords[i + 1];
    const cpX = (current.x + next.x) / 2;
    pathD += ` C ${cpX} ${current.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${svgHeight} L ${coords[0].x} ${svgHeight} Z`;
  const total = points.reduce((acc, curr) => acc + curr.value, 0).toFixed(1);
  const unit = range === 'today' ? 'kW' : 'kWh';

  return (
    <div
      className={`rounded-3xl p-6 sm:p-10 transition-all border ${
        isDark
          ? 'bg-[#12100E] border-[#2A2420] text-stone-100 shadow-sm'
          : 'bg-white border-stone-200 text-stone-900 shadow-sm'
      }`}
    >
      {/* Header: Minimal labels & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Output Trend
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1 text-stone-100">
            {total} <span className="text-xs font-sans font-normal text-stone-400">{unit}</span>
          </div>
        </div>

        {/* Range Selector: Today / Week / Month button group */}
        <div className="flex items-center gap-1 bg-[#1A1714] border border-[#2A2420] p-1 rounded-xl self-start sm:self-auto">
          {(['today', 'week', 'month'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                range === r
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Waveform Area with warm amber glow */}
      <div className="relative w-full h-[180px] sm:h-[220px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="solarSplineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#FF6B00" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#12100E" stopOpacity="0" />
            </linearGradient>
            <filter id="solarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Area Fill */}
          <path d={fillD} fill="url(#solarSplineGrad)" />

          {/* Line Stroke with glowing amber filter */}
          <path
            d={pathD}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#solarGlow)"
          />

          {/* Interactive Scrub Points */}
          {coords.map((c, i) => (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r={hoverIndex === i ? 6 : 4}
                className="fill-[#12100E] stroke-amber-400 transition-all duration-150"
                strokeWidth={hoverIndex === i ? 3 : 2}
              />

              {hoverIndex === i && (
                <g>
                  <rect
                    x={c.x - 30}
                    y={c.y - 32}
                    width="60"
                    height="22"
                    rx="6"
                    className="fill-stone-900 stroke-[#2A2420]"
                    strokeWidth="1"
                  />
                  <text
                    x={c.x}
                    y={c.y - 18}
                    textAnchor="middle"
                    className="text-[11px] font-mono fill-amber-400 font-bold"
                  >
                    {c.value}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* X-Axis Day / Time Labels */}
        <div className="flex justify-between items-center mt-3 px-3 text-xs font-mono text-stone-500">
          {points.map((p, i) => (
            <span
              key={i}
              className={hoverIndex === i ? 'text-amber-400 font-bold' : ''}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
