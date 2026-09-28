import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ClimanovaHome, ClimanovaBattery, ClimanovaGrid } from './ClimanovaIcons';

interface MinimalEnergyFlowProps {
  currentKw: number;
  theme: 'dark' | 'light';
}

/**
 * Energy Routing section with three cards:
 * 1. Home Load: icon, kW value, "Self-Powered" status label, progress bar
 * 2. Storage: icon, kW value, "84% Charged" status label, progress bar
 * 3. Grid Export: icon, kW value, "Feed-in Active" status label, progress bar
 * Sub-options expand on click (progressive disclosure).
 */
export const MinimalEnergyFlow: React.FC<MinimalEnergyFlowProps> = ({
  currentKw,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Dynamic flow splits
  const homeLoadKw = Math.min(1.4, Math.max(0.6, Math.round(currentKw * 0.35 * 10) / 10));
  const batteryChargingKw = Math.round(Math.max(0, (currentKw - homeLoadKw) * 0.55) * 10) / 10;
  const gridExportKw = Math.round(Math.max(0, currentKw - homeLoadKw - batteryChargingKw) * 10) / 10;

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400 px-1">
        <span>Energy Routing</span>
        <span className="text-amber-400 font-mono font-medium">Kinetic Matrix</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Card 1: Home Load */}
        <div
          onClick={() => toggleExpand('home')}
          className={`group rounded-3xl p-6 sm:p-7 border cursor-pointer transition-all duration-200 relative overflow-hidden ${
            isDark
              ? 'bg-[#12100E] border-[#2A2420] hover:border-orange-500/50 text-stone-100'
              : 'bg-white border-stone-200 hover:border-orange-300 text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-400 tracking-wide uppercase">Home Load</span>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <ClimanovaHome size={22} />
            </div>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums">
            {homeLoadKw.toFixed(1)} <span className="text-xs font-sans font-normal text-stone-400">kW</span>
          </div>

          <div className="text-xs text-orange-400 font-semibold mt-2 flex items-center justify-between">
            <span>Self-Powered</span>
            {expandedCard === 'home' ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400 opacity-60 group-hover:opacity-100" />
            )}
          </div>

          {/* Progressive Disclosure Sub-options */}
          {expandedCard === 'home' && (
            <div className="mt-4 pt-4 border-t border-[#2A2420] text-xs font-mono space-y-2 text-stone-400 animate-fadeIn">
              <div className="flex justify-between">
                <span>Phase Voltage</span>
                <span className="text-stone-100">238 V</span>
              </div>
              <div className="flex justify-between">
                <span>Standby Base</span>
                <span className="text-stone-100">0.3 kW</span>
              </div>
            </div>
          )}

          {/* Progress Bar with animated beam */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500/20 overflow-hidden">
            <div className="h-full bg-orange-500 w-1/3 rounded-full animate-beam-slide shadow-[0_0_8px_#f97316]" />
          </div>
        </div>

        {/* Card 2: Battery Storage */}
        <div
          onClick={() => toggleExpand('battery')}
          className={`group rounded-3xl p-6 sm:p-7 border cursor-pointer transition-all duration-200 relative overflow-hidden ${
            isDark
              ? 'bg-[#12100E] border-[#2A2420] hover:border-amber-500/50 text-stone-100'
              : 'bg-white border-stone-200 hover:border-amber-300 text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-400 tracking-wide uppercase">Storage</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ClimanovaBattery size={22} />
            </div>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums">
            +{batteryChargingKw.toFixed(1)}{' '}
            <span className="text-xs font-sans font-normal text-stone-400">kW</span>
          </div>

          <div className="text-xs text-amber-400 font-semibold mt-2 flex items-center justify-between">
            <span>84% Charged</span>
            {expandedCard === 'battery' ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400 opacity-60 group-hover:opacity-100" />
            )}
          </div>

          {/* Progressive Disclosure Sub-options */}
          {expandedCard === 'battery' && (
            <div className="mt-4 pt-4 border-t border-[#2A2420] text-xs font-mono space-y-2 text-stone-400 animate-fadeIn">
              <div className="flex justify-between">
                <span>Stored Energy</span>
                <span className="text-stone-100">10.4 kWh</span>
              </div>
              <div className="flex justify-between">
                <span>Cell Health</span>
                <span className="text-amber-400">98% SOH</span>
              </div>
            </div>
          )}

          {/* Progress Bar with animated beam */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/20 overflow-hidden">
            <div className="h-full bg-amber-400 w-1/3 rounded-full animate-beam-slide shadow-[0_0_8px_#fbbf24]" />
          </div>
        </div>

        {/* Card 3: Grid Feed-In */}
        <div
          onClick={() => toggleExpand('grid')}
          className={`group rounded-3xl p-6 sm:p-7 border cursor-pointer transition-all duration-200 relative overflow-hidden ${
            isDark
              ? 'bg-[#12100E] border-[#2A2420] hover:border-amber-400/50 text-stone-100'
              : 'bg-white border-stone-200 hover:border-amber-300 text-stone-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-400 tracking-wide uppercase">Grid Export</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ClimanovaGrid size={22} />
            </div>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums">
            {gridExportKw.toFixed(1)}{' '}
            <span className="text-xs font-sans font-normal text-stone-400">kW</span>
          </div>

          <div className="text-xs text-amber-300 font-semibold mt-2 flex items-center justify-between">
            <span>Feed-in Active</span>
            {expandedCard === 'grid' ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400 opacity-60 group-hover:opacity-100" />
            )}
          </div>

          {/* Progressive Disclosure Sub-options */}
          {expandedCard === 'grid' && (
            <div className="mt-4 pt-4 border-t border-[#2A2420] text-xs font-mono space-y-2 text-stone-400 animate-fadeIn">
              <div className="flex justify-between">
                <span>Feed-in Tariff</span>
                <span className="text-stone-100">$0.32 / kWh</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Credit</span>
                <span className="text-amber-400">+$4.80</span>
              </div>
            </div>
          )}

          {/* Progress Bar with animated beam */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/20 overflow-hidden">
            <div className="h-full bg-amber-300 w-1/3 rounded-full animate-beam-slide shadow-[0_0_8px_#fde047]" />
          </div>
        </div>
      </div>
    </div>
  );
};
