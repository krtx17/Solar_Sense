import React, { useState } from 'react';
import { Sun, CheckCircle2, AlertTriangle, ArrowUpRight, Check, Eye } from 'lucide-react';
import { SolarSystem, ReadingPoint, DaySummary, ForecastPoint, PanelInspection } from '../types/solar';

interface SolarViewProps {
  system: SolarSystem;
  todayReadings: ReadingPoint[];
  weekDays: DaySummary[];
  forecastPoints: ForecastPoint[];
  inspections: PanelInspection[];
  onUpdateInspection: (id: string, outcome: 'confirmed' | 'rejected') => void;
  onSelectAnomaly: (anomalyId: string) => void;
}

export const SolarView: React.FC<SolarViewProps> = ({
  system,
  todayReadings,
  weekDays,
  forecastPoints,
  inspections,
  onUpdateInspection,
  onSelectAnomaly,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'forecast'>('today');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // SVG Chart Dimensions
  const svgWidth = 720;
  const svgHeight = 220;
  const pad = { top: 20, right: 20, bottom: 35, left: 40 };
  const chartW = svgWidth - pad.left - pad.right;
  const chartH = svgHeight - pad.top - pad.bottom;

  // Chart Data based on range
  let maxVal = 8;
  let pointsStr = '';
  let areaStr = '';
  let labels: string[] = [];
  let currentVal = 0;

  if (timeRange === 'today') {
    maxVal = Math.max(8, ...todayReadings.map((r) => r.kwh)) * 1.15;
    const xStep = chartW / (todayReadings.length - 1);
    const pts = todayReadings.map((r, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + chartH - (r.kwh / maxVal) * chartH;
      return `${x},${y}`;
    });
    pointsStr = pts.join(' ');
    areaStr = `${pointsStr} ${pad.left + chartW},${pad.top + chartH} ${pad.left},${pad.top + chartH}`;
    labels = ['12 AM', '6 AM', '12 PM', '6 PM', '11 PM'];
    const active = hoverIndex !== null ? todayReadings[hoverIndex] : todayReadings[13];
    currentVal = active ? active.kwh : 4.8;
  } else if (timeRange === 'week') {
    maxVal = Math.max(25, ...weekDays.map((d) => d.actual_kwh)) * 1.15;
    const xStep = chartW / (weekDays.length - 1);
    const pts = weekDays.map((d, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + chartH - (d.actual_kwh / maxVal) * chartH;
      return `${x},${y}`;
    });
    pointsStr = pts.join(' ');
    areaStr = `${pointsStr} ${pad.left + chartW},${pad.top + chartH} ${pad.left},${pad.top + chartH}`;
    labels = weekDays.map((d) => d.day_label.split(',')[0]);
    const active = hoverIndex !== null ? weekDays[hoverIndex] : weekDays[weekDays.length - 1];
    currentVal = active ? active.actual_kwh : 22.4;
  } else {
    maxVal = Math.max(25, ...forecastPoints.map((f) => f.predicted_kwh)) * 1.15;
    const xStep = chartW / (forecastPoints.length - 1);
    const pts = forecastPoints.map((f, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + chartH - (f.predicted_kwh / maxVal) * chartH;
      return `${x},${y}`;
    });
    pointsStr = pts.join(' ');
    areaStr = `${pointsStr} ${pad.left + chartW},${pad.top + chartH} ${pad.left},${pad.top + chartH}`;
    labels = forecastPoints.map((f) => f.day_label.split(',')[0]);
    const active = hoverIndex !== null ? forecastPoints[hoverIndex] : forecastPoints[0];
    currentVal = active ? active.predicted_kwh : 21.8;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* 1. Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sun className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Solar Energy</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            See how much clean electricity your roof panels are producing.
          </p>
        </div>

        {/* Quick Array Summary Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
            <span className="text-slate-400">System size: </span>
            <span className="font-bold text-slate-900">{system.capacity_kw} kW</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
            <span className="text-slate-400">Panels: </span>
            <span className="font-bold text-slate-900">{system.panel_count}</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Solar Array & Generation Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Current Production</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">4.82 kW</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Producing normally</span>
          </div>
        </div>

        {/* Total Today */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Generated Today</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">12.4 kWh</div>
          <span className="text-xs text-slate-400 mt-1 block">
            Expected total: ~23 kWh
          </span>
        </div>

        {/* Health */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Panel Condition</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">Clean</div>
          <span className="text-xs text-slate-500 mt-1 block">
            98.5% optical sunlight absorption
          </span>
        </div>
      </div>

      {/* 3. Clean Redesigned Solar Generation Chart */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Solar Generation Chart</h2>
            <p className="text-xs text-slate-500">
              Electricity produced over time ({timeRange === 'today' ? 'Hourly' : 'Daily'}).
            </p>
          </div>

          {/* Simple Time Filter */}
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium self-start sm:self-auto gap-0.5">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === 'today' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === 'week' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('forecast')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === 'forecast' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Next 3 Days
            </button>
          </div>
        </div>

        {/* Clean SVG Graph - Scalable vector graphic adapts fluidly to all screens */}
        <div className="w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto"
          >
            {/* Subtle horizontal grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = pad.top + chartH * (1 - ratio);
              const val = (maxVal * ratio).toFixed(0);
              return (
                <g key={i}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={pad.left + chartW}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={pad.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-sans"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Gradient Fill */}
            <defs>
              <linearGradient id="solarGraphGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            {areaStr && <polygon points={areaStr} fill="url(#solarGraphGrad)" />}

            {/* Main Solar Line */}
            {pointsStr && (
              <polyline
                points={pointsStr}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* X-Axis Labels */}
            {labels.map((lbl, idx) => {
              const x = pad.left + (chartW / (labels.length - 1)) * idx;
              return (
                <text
                  key={idx}
                  x={x}
                  y={pad.top + chartH + 18}
                  textAnchor="middle"
                  className="text-[11px] fill-slate-500 font-sans"
                >
                  {lbl}
                </text>
              );
            })}
          </svg>
        </div>
      </section>

      {/* 4. Panel Inspections & Physical Health */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Panel Condition & Photos</h2>
          <p className="text-xs text-slate-500">
            Recent rooftop checks to ensure panels are clean and free of dust or shade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inspections.map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{ins.panel_label}</div>
                  <div className="text-[11px] text-slate-500">{ins.date} · {ins.image_type.toUpperCase()} scan</div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    ins.finding_label === 'soiling'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {ins.finding_label === 'soiling' ? 'Dust Detected' : 'Clear'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ins.image_description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-[11px] text-slate-500">
                  Status: {ins.reviewed_by_user ? 'Reviewed' : 'Awaiting Review'}
                </span>

                {!ins.reviewed_by_user && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateInspection(ins.id, 'confirmed')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => onUpdateInspection(ins.id, 'rejected')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
