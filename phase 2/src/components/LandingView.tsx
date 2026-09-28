import React from 'react';
import { ArrowRight, Sun, Zap, Shield, Cpu, Sparkles, Sliders } from 'lucide-react';
import { VoltaHero3D } from './VoltaHero3D';
import { ClimanovaSun, ClimanovaBattery, ClimanovaGrid } from './ClimanovaIcons';

interface LandingViewProps {
  theme: 'dark' | 'light';
  capacityKw: number;
  activeHour: number;
  onHourChange: (hour: number) => void;
  onNavigate: (view: 'monitor' | 'analytics' | 'system') => void;
  onOpenActions: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  theme,
  capacityKw,
  activeHour,
  onHourChange,
  onNavigate,
  onOpenActions,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-24 sm:space-y-36 animate-fadeIn">
      {/* HERO SECTION: Confident Bold Headline & Warm Solar Accents (Ref B & Ref A) */}
      <section className="relative text-center sm:text-left space-y-8 max-w-5xl mx-auto pt-4 sm:pt-10">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Autonomous Clean Energy Architecture</span>
        </div>

        {/* Large, Confident Headline (Dribbble Ref B) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] uppercase text-stone-100">
          Harness Pure Solar.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300">
            Total Independence.
          </span>
        </h1>

        <p className="text-stone-400 text-base sm:text-xl font-normal max-w-2xl leading-relaxed">
          Real-time kinetic solar tracking, intelligent battery routing, and sub-second hardware telemetry.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('monitor')}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-200"
          >
            <span>Launch Live Monitor</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('system')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 ${
              isDark
                ? 'border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-200 hover:text-white'
                : 'border-stone-300 bg-white hover:bg-stone-100 text-stone-800 shadow-sm'
            }`}
          >
            <span>System Hardware</span>
          </button>

          <button
            onClick={onOpenActions}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 ${
              isDark
                ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300'
                : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 shadow-sm'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Simulate Yield</span>
          </button>
        </div>
      </section>

      {/* STATS ROW: Clean High-Impact Metrics (Ref B) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#12100E] border-[#2A2420] text-stone-100'
              : 'bg-white border-stone-200 text-stone-900 shadow-sm'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Peak Array Output</span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400 mt-2">
            {capacityKw} <span className="text-xs font-sans text-stone-400 font-normal">kW</span>
          </div>
          <div className="text-xs font-mono text-stone-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Monocrystalline PERC</span>
          </div>
        </div>

        <div
          className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#12100E] border-[#2A2420] text-stone-100'
              : 'bg-white border-stone-200 text-stone-900 shadow-sm'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Optimal Yield</span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-orange-400 mt-2">
            92%
          </div>
          <div className="text-xs font-mono text-stone-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span>Solar Insolation Peak</span>
          </div>
        </div>

        <div
          className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#12100E] border-[#2A2420] text-stone-100'
              : 'bg-white border-stone-200 text-stone-900 shadow-sm'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Monthly Offset</span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-300 mt-2">
            $184
          </div>
          <div className="text-xs font-mono text-stone-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            <span>Grid Avoided Cost</span>
          </div>
        </div>

        <div
          className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#12100E] border-[#2A2420] text-stone-100'
              : 'bg-white border-stone-200 text-stone-900 shadow-sm'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Carbon Abatement</span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-orange-300 mt-2">
            4.8 T
          </div>
          <div className="text-xs font-mono text-stone-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-300" />
            <span>Annual CO₂ Reduction</span>
          </div>
        </div>
      </section>

      {/* 3D FOCAL HERO STAGE: Volta Solar Restrained 3D Element */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Interactive 3D Stage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Live Insolation & Photovoltaic Matrix
            </h2>
          </div>
          <button
            onClick={() => onNavigate('monitor')}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Full Monitor View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <VoltaHero3D
          capacityKw={capacityKw}
          activeHour={activeHour}
          onHourChange={onHourChange}
          theme={theme}
        />
      </section>

      {/* FEATURE ROW: 3 Minimalist Pillars with Warm Accents (Ref B) */}
      <section className="space-y-6">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            System Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Engineered For Zero Energy Waste
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div
            onClick={() => onNavigate('monitor')}
            className={`group p-8 rounded-3xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
              isDark
                ? 'bg-[#12100E] border-[#2A2420] hover:border-amber-500/50 text-stone-100'
                : 'bg-white border-stone-200 hover:border-amber-400 text-stone-900 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
              <ClimanovaSun size={26} />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2">Kinetic 3D Solar Matrix</h3>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Continuous solar angle computation mapped to real-time photovoltaic output.
            </p>
            <div className="flex items-center gap-1 text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect generation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 2 */}
          <div
            onClick={() => onNavigate('monitor')}
            className={`group p-8 rounded-3xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
              isDark
                ? 'bg-[#12100E] border-[#2A2420] hover:border-orange-500/50 text-stone-100'
                : 'bg-white border-stone-200 hover:border-orange-400 text-stone-900 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform">
              <ClimanovaBattery size={26} />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2">Dynamic Power Routing</h3>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Prioritizes residential load, buffers excess in storage, and feeds surplus to grid.
            </p>
            <div className="flex items-center gap-1 text-xs font-mono text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>View power flows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3 */}
          <div
            onClick={() => onNavigate('system')}
            className={`group p-8 rounded-3xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
              isDark
                ? 'bg-[#12100E] border-[#2A2420] hover:border-amber-500/50 text-stone-100'
                : 'bg-white border-stone-200 hover:border-amber-400 text-stone-900 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2">Hardware Telemetry</h3>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Single-item 3D wireframe carousel inspecting modules, inverter, and LFP battery.
            </p>
            <div className="flex items-center gap-1 text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Explore hardware</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA: Volta & Dribbble Confident Close */}
      <section
        className={`p-8 sm:p-14 rounded-3xl border text-center space-y-6 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-b from-[#161310] to-[#0D0C0A] border-[#2A2420]'
            : 'bg-gradient-to-b from-amber-50/50 to-white border-stone-200 shadow-sm'
        }`}
      >
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none blur-2xl" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-stone-100">
            Real-Time Solar Control
          </h2>
          <p className="text-stone-400 text-sm sm:text-base">
            Take full command of your energy generation, distribution metrics, and hardware health.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('monitor')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              Open Live Monitor
            </button>
            <button
              onClick={onOpenActions}
              className={`px-7 py-3.5 rounded-2xl border text-sm font-bold tracking-wide transition-all active:scale-95 ${
                isDark
                  ? 'border-stone-800 bg-stone-900/80 text-stone-200 hover:text-white'
                  : 'border-stone-300 bg-white text-stone-800'
              }`}
            >
              Configure Parameters
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
