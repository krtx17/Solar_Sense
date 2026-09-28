import React, { useState } from 'react';
import { Sun, Sparkles, Zap, Clock } from 'lucide-react';
import { SolarOrb3D } from './SolarOrb3D';

interface SolarRadialHeroProps {
  capacityKw: number;
  activeHour: number;
  onHourChange: (hour: number) => void;
  theme: 'dark' | 'light';
}

export const SolarRadialHero: React.FC<SolarRadialHeroProps> = ({
  capacityKw,
  activeHour,
  onHourChange,
  theme,
}) => {
  const [focalMode, setFocalMode] = useState<'both' | 'dial' | '3d'>('both');
  const isDark = theme === 'dark';

  // Solar insolation formula based on daytime (6:00 to 18:00)
  const isDaytime = activeHour >= 6 && activeHour <= 18;
  const solarAngle = isDaytime ? ((activeHour - 6) / 12) * Math.PI : 0;
  const insolationFactor = isDaytime ? Math.sin(solarAngle) : 0;

  // Real-time output calculation
  const currentKw = Math.round(capacityKw * 0.74 * insolationFactor * 10) / 10;
  const currentRatioPct = Math.round((currentKw / capacityKw) * 100);

  // Radial Dial Math (radius 86, 240 degree arc)
  const r = 86;
  const circ = 2 * Math.PI * r;
  const gaugeLength = (240 / 360) * circ;
  const strokeOffset = gaugeLength - (currentRatioPct / 100) * gaugeLength;

  const formattedTime =
    activeHour === 12
      ? '12:00 PM'
      : activeHour < 12
      ? `${activeHour}:00 AM`
      : `${activeHour - 12}:00 PM`;

  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 transition-all border ${
        isDark
          ? 'bg-[#0B1322] border-slate-800/80 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Top Header: 1-3 word labels, time slider, clean tags */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Solar Power</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-time system telemetry</p>
          </div>
        </div>

        {/* Time Scrubber (Minimalist, accessible) */}
        <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Time:</span>
          <span className="text-emerald-400 font-bold min-w-[65px]">{formattedTime}</span>
          <input
            type="range"
            min="6"
            max="18"
            step="1"
            value={activeHour}
            onChange={(e) => onHourChange(parseInt(e.target.value))}
            className="w-24 sm:w-28 accent-emerald-500 cursor-pointer ml-1 h-1.5 bg-slate-800 rounded-lg"
            aria-label="Solar Scrubber"
          />
        </div>
      </div>

      {/* Main Focal Area: Luminous Dial + 3D Solar Model */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: The Signature Kris Anfalova Luminous Radial Dial */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Ambient Background Radial Aura */}
            <div className="absolute inset-4 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <svg
              viewBox="0 0 240 240"
              className="w-full h-full -rotate-90 select-none overflow-visible"
            >
              <defs>
                <linearGradient id="anfalovaDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="55%" stopColor="#10E79D" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>

                <filter id="dialLuminescence" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Inactive Track */}
              <circle
                cx="120"
                cy="120"
                r={r}
                fill="none"
                stroke={isDark ? '#1E293B' : '#E2E8F0'}
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={`${gaugeLength} ${circ}`}
                strokeDashoffset="0"
                transform="rotate(150 120 120)"
              />

              {/* Orbit Dashed Ring */}
              <circle
                cx="120"
                cy="120"
                r={r + 15}
                fill="none"
                stroke={isDark ? '#334155' : '#CBD5E1'}
                strokeWidth="1.2"
                strokeDasharray="4 8"
                className="animate-spin-slow origin-center"
              />

              {/* Active Luminous Glowing Arc */}
              <circle
                cx="120"
                cy="120"
                r={r}
                fill="none"
                stroke="url(#anfalovaDialGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${gaugeLength} ${circ}`}
                strokeDashoffset={strokeOffset}
                transform="rotate(150 120 120)"
                filter="url(#dialLuminescence)"
                className="transition-all duration-300 ease-out"
              />
            </svg>

            {/* Dial Center Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1">
                <Sun className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-4xl font-extrabold font-mono tracking-tight tabular-nums">
                {currentKw.toFixed(1)}{' '}
                <span className="text-base font-sans font-medium text-slate-400">kW</span>
              </div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{currentRatioPct}% Capacity</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (Minimalist) */}
          <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-400">
            <div>
              Total: <span className="text-emerald-400 font-semibold">24.8 kWh</span>
            </div>
            <span>•</span>
            <div>
              Peak: <span className="text-amber-400 font-semibold">{capacityKw} kW</span>
            </div>
          </div>
        </div>

        {/* Right: 3D Interactive Photovoltaic Focal Element */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-slate-900/60 to-[#070B14]/80 border border-slate-800/80 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Top Bar Label */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none z-10">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                3D Solar Orbit
              </span>
              <span className="text-emerald-400 font-medium">Interactive Node</span>
            </div>

            {/* 3D WebGL Canvas */}
            <SolarOrb3D
              currentKw={currentKw}
              capacityKw={capacityKw}
              className="w-full h-full"
            />

            {/* Micro Caption */}
            <div className="absolute bottom-3 text-[10px] text-slate-500 font-mono tracking-wide pointer-events-none">
              Interactive 3D Photovoltaic Matrix
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
