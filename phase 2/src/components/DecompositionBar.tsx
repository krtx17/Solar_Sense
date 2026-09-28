import React from 'react';

interface DecompositionBarProps {
  weatherExplainedKwh: number;
  weatherExplainedPct: number;
  unexplainedKwh: number;
  unexplainedPct: number;
  totalDeficitKwh?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const DecompositionBar: React.FC<DecompositionBarProps> = ({
  weatherExplainedKwh,
  weatherExplainedPct,
  unexplainedKwh,
  unexplainedPct,
  totalDeficitKwh,
  size = 'md',
}) => {
  const barHeight = size === 'sm' ? 'h-3' : size === 'lg' ? 'h-6' : 'h-4';
  const total = Math.abs(weatherExplainedKwh) + Math.abs(unexplainedKwh);

  return (
    <div className="w-full">
      {/* Horizontal Stacked Bar */}
      <div className={`w-full ${barHeight} rounded-md overflow-hidden flex bg-slate-100 border border-slate-200`}>
        {/* Weather Explained Segment */}
        <div
          style={{ width: `${Math.max(5, weatherExplainedPct)}%` }}
          className="bg-sky-500 hover:bg-sky-600 transition-all flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
          title={`Weather-explained deficit: ${weatherExplainedKwh.toFixed(1)} kWh (${weatherExplainedPct}%)`}
        >
          {weatherExplainedPct >= 20 && size !== 'sm' && `${weatherExplainedPct}%`}
        </div>

        {/* Unexplained Residual Segment (Anomaly Signal) */}
        <div
          style={{ width: `${Math.max(5, unexplainedPct)}%` }}
          className="bg-amber-500 hover:bg-amber-600 transition-all flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
          title={`Unexplained anomaly deficit: ${unexplainedKwh.toFixed(1)} kWh (${unexplainedPct}%)`}
        >
          {unexplainedPct >= 20 && size !== 'sm' && `${unexplainedPct}%`}
        </div>
      </div>

      {/* Metric Labels with explicit units */}
      <div className="flex items-center justify-between mt-2 text-xs font-mono tabular-nums">
        <div className="flex items-center gap-1.5 text-sky-800">
          <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 shrink-0" aria-hidden="true" />
          <span className="font-sans text-slate-600">Weather-Explained: </span>
          <span className="font-semibold">{weatherExplainedKwh.toFixed(1)} kWh</span>
          <span className="text-slate-400 font-sans">({weatherExplainedPct}%)</span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-900">
          <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0" aria-hidden="true" />
          <span className="font-sans text-slate-600">Unexplained (Anomaly): </span>
          <span className="font-semibold">{unexplainedKwh.toFixed(1)} kWh</span>
          <span className="text-slate-400 font-sans">({unexplainedPct}%)</span>
        </div>
      </div>
    </div>
  );
};
