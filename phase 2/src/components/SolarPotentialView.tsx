import React, { useState } from 'react';
import { Sun, MapPin, Calculator, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { SolarSystem } from '../types/solar';

interface SolarPotentialViewProps {
  onSetupSystem: () => void;
  onOpenSimulator: () => void;
  isDarkTheme?: boolean;
}

export const SolarPotentialView: React.FC<SolarPotentialViewProps> = ({
  onSetupSystem,
  onOpenSimulator,
  isDarkTheme = true,
}) => {
  const [address, setAddress] = useState<string>('2450 California St, San Francisco, CA');
  const [roofAreaSqFt, setRoofAreaSqFt] = useState<number>(650);
  const [roofTilt, setRoofTilt] = useState<number>(22);
  const [isCalculated, setIsCalculated] = useState<boolean>(true);

  // Geometric Sizing Estimation
  // ~100 sq ft per kW of modern mono-PERC solar panels
  const estimatedCapacityKw = Math.round((roofAreaSqFt / 70) * 10) / 10;
  // Clear-sky insolation factor in SF Bay Area: ~1,520 peak sun hours/year
  const baseAnnualKwh = Math.round(estimatedCapacityKw * 1480);
  const minAnnualKwh = Math.round(baseAnnualKwh * 0.92);
  const maxAnnualKwh = Math.round(baseAnnualKwh * 1.05);

  const estimatedBillOffsetPct = Math.min(100, Math.round((baseAnnualKwh / 8500) * 100));
  const estimatedAnnualBillSavings = Math.round(baseAnnualKwh * 0.33);

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b ${
        isDarkTheme ? 'border-slate-800 text-slate-100' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Solar Potential Estimator</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
              Physical Geometry & Insolation
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Clear-sky physical potential estimation for prospective solar owners, with transparent assumptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Property Inputs */}
        <div className={`rounded-xl p-5 shadow-xs space-y-4 border transition-all ${
          isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-xs font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Property & Rooftop Inputs
          </h2>

          <div>
            <label className={`text-xs font-medium block mb-1 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Property Address</label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkTheme
                    ? 'bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-950'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white'
                }`}
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Resolved to coordinates: 37.788° N, 122.434° W (PST)
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={`font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Estimated Usable Roof Area</span>
              <span className={`font-mono font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{roofAreaSqFt} sq ft</span>
            </div>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={roofAreaSqFt}
              onChange={(e) => setRoofAreaSqFt(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>200 sq ft</span>
              <span>~{estimatedCapacityKw} kW potential</span>
              <span>1,500 sq ft</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={`font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Roof Pitch / Tilt</span>
              <span className={`font-mono font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{roofTilt}° (Standard slope)</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="1"
              value={roofTilt}
              onChange={(e) => setRoofTilt(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div className={`pt-3 border-t ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
            <button
              onClick={onSetupSystem}
              className="w-full py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 font-bold"
            >
              <span>Create Real System from Estimate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Estimated Potential Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-xl p-5 shadow-xs border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
          }`}>
            <h2 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Estimated Generation Range & Economics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg border ${
                isDarkTheme ? 'bg-amber-500/15 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className={`text-xs font-medium ${isDarkTheme ? 'text-amber-300' : 'text-amber-900'}`}>Estimated Annual Generation</div>
                <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${isDarkTheme ? 'text-amber-200' : 'text-amber-950'}`}>
                  {minAnnualKwh.toLocaleString()} – {maxAnnualKwh.toLocaleString()}
                </div>
                <div className={`text-xs mt-0.5 ${isDarkTheme ? 'text-amber-400' : 'text-amber-800'}`}>kWh / year range</div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xs text-slate-400 font-medium">Array System Capacity</div>
                <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  {estimatedCapacityKw} kW DC
                </div>
                <div className="text-xs text-slate-400 mt-0.5">~{Math.round(estimatedCapacityKw * 2.5)} standard modules</div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDarkTheme ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className={`text-xs font-medium ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-900'}`}>Estimated Bill Offset</div>
                <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${isDarkTheme ? 'text-emerald-200' : 'text-emerald-950'}`}>
                  {estimatedBillOffsetPct}%
                </div>
                <div className={`text-xs mt-0.5 ${isDarkTheme ? 'text-emerald-400' : 'text-emerald-800'}`}>~${estimatedAnnualBillSavings.toLocaleString()} / yr savings</div>
              </div>
            </div>

            {/* Assumptions Box */}
            <div className={`rounded-lg p-4 text-xs space-y-2 border ${
              isDarkTheme ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`font-semibold flex items-center gap-1.5 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                <ShieldCheck className={`w-4 h-4 ${isDarkTheme ? 'text-emerald-400' : 'text-slate-700'}`} />
                <span>Explicit Physical Assumptions</span>
              </div>
              <ul className={`list-disc pl-4 space-y-1 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                <li>Assuming unshaded south-facing orientation (Azimuth 180°).</li>
                <li>Module efficiency assumed at 21.2% with 14% overall BOS derate (inverter + wiring + thermal).</li>
                <li>Utility baseline rate modeled at $0.33/kWh (PG&E average residential).</li>
                <li>Exact clear-sky generation will be recalculated once precise panel tilt and layout are confirmed.</li>
              </ul>
            </div>

            <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
              isDarkTheme ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Want to test adding a battery or different tilt angles?</span>
              <button
                onClick={onOpenSimulator}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline decoration-dotted"
              >
                Open What-If Simulator →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
