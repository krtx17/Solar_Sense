import React, { useState, useEffect } from 'react';
import {
  Sun,
  Battery,
  Home,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SolarSystem, DeviationDecomposition } from '../types/solar';

interface SolarRadialMonitoringCardProps {
  system: SolarSystem;
  decomposition: DeviationDecomposition;
  isDarkTheme?: boolean;
}

export const SolarRadialMonitoringCard: React.FC<SolarRadialMonitoringCardProps> = ({
  system,
  decomposition,
  isDarkTheme = true,
}) => {
  const [activeHour, setActiveHour] = useState<number>(13); // 1:00 PM default peak
  const [pulseTick, setPulseTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 360);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Compute dynamic generation based on active hour
  const hourNormalized = Math.max(0, Math.sin(((activeHour - 6) / 12) * Math.PI));
  const currentKw = Math.round(system.capacity_kw * 0.72 * hourNormalized * 10) / 10;
  const currentRatioPct = Math.round((currentKw / system.capacity_kw) * 100);

  // Distribution splits
  const homeConsumptionKw = Math.min(currentKw, 1.4);
  const batteryChargingKw = Math.round(Math.max(0, (currentKw - homeConsumptionKw) * 0.45) * 10) / 10;
  const gridExportKw = Math.round(Math.max(0, currentKw - homeConsumptionKw - batteryChargingKw) * 10) / 10;

  // Arc calculation for SVG gauge: circumference = 2 * PI * r
  const r = 88;
  const circ = 2 * Math.PI * r; // ~553
  // Gauge spans 240 degrees (from 150deg to 390deg)
  const gaugeLength = (240 / 360) * circ; // ~368
  const strokeOffset = gaugeLength - (currentRatioPct / 100) * gaugeLength;

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 transition-all border ${
        isDarkTheme
          ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Real-Time Solar Energy Monitor</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Live Dynamic Dial
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live power generation, battery storage buffer, and load distribution telemetry.
            </p>
          </div>
        </div>

        {/* Time of Day Slider */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Time:</span>
          <span className="text-emerald-400 font-bold">
            {activeHour === 12 ? '12:00 PM' : activeHour < 12 ? `${activeHour}:00 AM` : `${activeHour - 12}:00 PM`}
          </span>
          <input
            type="range"
            min="7"
            max="19"
            step="1"
            value={activeHour}
            onChange={(e) => setActiveHour(parseInt(e.target.value))}
            className="w-20 accent-emerald-500 cursor-pointer ml-1"
          />
        </div>
      </div>

      {/* Main Grid: Radial Dial + Energy Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Signature Luminous Radial Solar Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background Ambient Glow */}
            <div className="absolute inset-4 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

            <svg viewBox="0 0 240 240" className="w-full h-full -rotate-90 select-none overflow-visible">
              <defs>
                {/* Luminous Neon Gradient */}
                <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#10E79D" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>

                <filter id="dialGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background Inactive Track */}
              <circle
                cx="120"
                cy="120"
                r={r}
                fill="none"
                stroke="#1E293B"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${gaugeLength} ${circ}`}
                strokeDashoffset="0"
                transform="rotate(150 120 120)"
              />

              {/* Outer Subtle Orbit Dashes */}
              <circle
                cx="120"
                cy="120"
                r={r + 14}
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                className="animate-spin-slow"
              />

              {/* Active Luminous Progress Arc */}
              <circle
                cx="120"
                cy="120"
                r={r}
                fill="none"
                stroke="url(#dialGradient)"
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray={`${gaugeLength} ${circ}`}
                strokeDashoffset={strokeOffset}
                transform="rotate(150 120 120)"
                filter="url(#dialGlow)"
                className="transition-all duration-300"
              />
            </svg>

            {/* Dial Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1 animate-pulse">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums">
                {currentKw.toFixed(1)} <span className="text-sm font-sans font-medium text-slate-400">kW</span>
              </div>
              <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Generating {currentRatioPct}% capacity</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Nameplate: {system.capacity_kw} kW · {system.panel_count} modules
              </div>
            </div>
          </div>

          {/* Quick Summary Pill below Dial */}
          <div className="flex items-center gap-3 mt-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Today: 20.8 kWh</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span>Peak: 7.8 kW</span>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Flow Distribution Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
            <span>Dynamic Power Distribution Flow</span>
            <span className="text-emerald-400 font-mono">Active Feed: 100% Green Solar</span>
          </div>

          {/* 3 Flow Distribution Cards with Animated Circuit Beams */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Flow 1: Home Load */}
            <div className="bg-[#0F1A2E] border border-slate-800 hover:border-slate-700 p-4 rounded-xl relative overflow-hidden transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Direct Home Load</span>
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Home className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {homeConsumptionKw.toFixed(1)} <span className="text-xs text-slate-400 font-sans">kW</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <span>82% self-sufficient</span>
              </div>
              {/* Traveling Bottom Glow Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500/20 overflow-hidden">
                <div className="h-full bg-sky-400 w-1/3 rounded-full animate-beam-slide shadow-[0_0_8px_#38bdf8]" />
              </div>
            </div>

            {/* Flow 2: Battery Storage Buffer */}
            <div className="bg-[#0F1A2E] border border-slate-800 hover:border-slate-700 p-4 rounded-xl relative overflow-hidden transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Battery Storage</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                +{batteryChargingKw.toFixed(1)} <span className="text-xs text-slate-400 font-sans">kW</span>
              </div>
              <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
                <span>84% Charged (10.4 kWh)</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/20 overflow-hidden">
                <div className="h-full bg-amber-400 w-1/3 rounded-full animate-beam-slide shadow-[0_0_8px_#fbbf24]" />
              </div>
            </div>

            {/* Flow 3: Utility Grid Export */}
            <div className="bg-[#0F1A2E] border border-slate-800 hover:border-slate-700 p-4 rounded-xl relative overflow-hidden transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Grid Feed-In (Export)</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {gridExportKw.toFixed(1)} <span className="text-xs text-slate-400 font-sans">kW</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <span>Earning $0.33/kWh</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/20 overflow-hidden">
                <div className="h-full bg-emerald-400 w-1/3 rounded-full animate-beam-slide shadow-[0_0_8px_#34d399]" />
              </div>
            </div>
          </div>

          {/* Anomaly & Physical Reference Bar */}
          <div className="bg-[#0D1527] border border-slate-800/90 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Physical Clear-Sky Benchmark:</span>
              <span className="text-slate-400 font-mono">
                {decomposition.clearsky_kwh} kWh geometric ceiling · {decomposition.weather_explained_pct}% weather derate
              </span>
            </div>
            <div className="text-amber-400 font-mono font-bold">
              Unexplained: {decomposition.unexplained_kwh} kWh
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
