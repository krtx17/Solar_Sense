import React, { useState } from 'react';
import { Sun, ShieldAlert, Cpu, Home, ArrowRight, Info, Check } from 'lucide-react';
import { SolarSystem, DeviationDecomposition } from '../types/solar';

interface EnergyFlowVisualizerProps {
  system: SolarSystem;
  decomposition: DeviationDecomposition;
}

export const EnergyFlowVisualizer: React.FC<EnergyFlowVisualizerProps> = ({ system, decomposition }) => {
  const [selectedNode, setSelectedNode] = useState<'sun' | 'physics' | 'weather' | 'actual'>('actual');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Physical Flow & Evidence Decomposition Pipeline</span>
            <span className="text-xs font-normal text-slate-500">· Deterministic PV Model</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any stage to inspect the physical equations and observed atmospheric measurements.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          System: {system.capacity_kw} kW · {system.tilt_deg}° tilt · {system.azimuth_deg}° S
        </div>
      </div>

      {/* Interactive Process Pipeline */}
      <div className="relative overflow-x-auto py-2 no-scrollbar">
        <div className="min-w-[680px] grid grid-cols-4 gap-3 relative items-stretch">
          {/* Connecting SVG Flow Line */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-200 z-0 pointer-events-none">
            <div className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 w-full opacity-60" />
          </div>

          {/* Stage 1: Solar Irradiance */}
          <button
            onClick={() => setSelectedNode('sun')}
            className={`relative z-10 p-3 rounded-lg border text-left transition-all ${
              selectedNode === 'sun'
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">1. Solar Resource</span>
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sun className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">880 W/m²</div>
            <div className="text-xs text-slate-500 mt-0.5">Satellite GHI Observation</div>
          </button>

          {/* Stage 2: Physical Baseline */}
          <button
            onClick={() => setSelectedNode('physics')}
            className={`relative z-10 p-3 rounded-lg border text-left transition-all ${
              selectedNode === 'physics'
                ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">2. Clear-Sky Baseline</span>
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
              {decomposition.clearsky_kwh} kWh
            </div>
            <div className="text-xs text-slate-500 mt-0.5">pvlib Geometry Max</div>
          </button>

          {/* Stage 3: Weather Derate */}
          <button
            onClick={() => setSelectedNode('weather')}
            className={`relative z-10 p-3 rounded-lg border text-left transition-all ${
              selectedNode === 'weather'
                ? 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">3. Weather Derate</span>
              <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-sm font-bold font-mono text-sky-700 tabular-nums">
              {decomposition.weather_explained_kwh} kWh
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{decomposition.weather_explained_pct}% Explained Deficit</div>
          </button>

          {/* Stage 4: Actual & Anomaly Signal */}
          <button
            onClick={() => setSelectedNode('actual')}
            className={`relative z-10 p-3 rounded-lg border text-left transition-all ${
              selectedNode === 'actual'
                ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">4. Actual & Residue</span>
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-sm font-bold font-mono text-amber-700 tabular-nums">
              {decomposition.actual_kwh} kWh
            </div>
            <div className="text-xs text-amber-900 font-medium mt-0.5">
              {decomposition.unexplained_kwh} kWh Unexplained
            </div>
          </button>
        </div>
      </div>

      {/* Selected Stage Detail Drawer */}
      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {selectedNode === 'sun' && (
          <div>
            <span className="font-semibold text-slate-900">Atmospheric GHI Observation:</span> NOAA GOES-18 satellite feed observed global horizontal irradiance (GHI) averaging 880 W/m² with scattered cloud transients between 11:30 and 13:45 UTC.
          </div>
        )}
        {selectedNode === 'physics' && (
          <div>
            <span className="font-semibold text-slate-900">Physical Clear-Sky Geometric Formulation:</span> Theoretical maximum based purely on solar zenith angle, {system.tilt_deg}° panel tilt, {system.azimuth_deg}° azimuth, and {system.capacity_kw} kW nameplate DC capacity. No ML forecast uncertainty.
          </div>
        )}
        {selectedNode === 'weather' && (
          <div>
            <span className="font-semibold text-slate-900">Deterministic Weather Derate Factor:</span> Multiplies clear-sky geometry by observed cloud fraction (1 - f_cloud × 0.65) to compute expected weather-adjusted output ({decomposition.weather_adjusted_kwh} kWh).
          </div>
        )}
        {selectedNode === 'actual' && (
          <div>
            <span className="font-semibold text-slate-900">Residual Outlier Decomposition:</span> Weather-adjusted expected ({decomposition.weather_adjusted_kwh} kWh) minus actual ({decomposition.actual_kwh} kWh) yields an unexplained residual of {decomposition.unexplained_kwh} kWh, triggering an anomaly check against the 30-day distribution.
          </div>
        )}
        <div className="text-slate-500 shrink-0 font-mono">
          Method: pvlib-standard v0.10.4
        </div>
      </div>
    </div>
  );
};
