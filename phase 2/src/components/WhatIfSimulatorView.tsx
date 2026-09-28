import React, { useState } from 'react';
import { Sliders, Sun, Battery, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { SolarSystem } from '../types/solar';

interface WhatIfSimulatorViewProps {
  system: SolarSystem;
  isDarkTheme?: boolean;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({ system, isDarkTheme = true }) => {
  const [addedPanels, setAddedPanels] = useState<number>(2);
  const [hypotheticalTilt, setHypotheticalTilt] = useState<number>(system.tilt_deg);
  const [cleanPanelsToggle, setCleanPanelsToggle] = useState<boolean>(true);
  const [hasBattery, setHasBattery] = useState<boolean>(false);

  // Baseline values
  const currentAnnualKwh = Math.round(system.capacity_kw * 1480);
  const newCapacityKw = Math.round((system.capacity_kw + addedPanels * 0.4) * 10) / 10;

  // Tilt factor: optimal for lat 37.8 is ~30 deg
  const tiltDeltaPct = Math.round((1 - Math.abs(hypotheticalTilt - 30) * 0.005) * 100) / 100;
  const cleaningGainPct = cleanPanelsToggle ? 0.06 : 0; // +6% recovery from clearing soiling
  const batterySelfConsumptionGainPct = hasBattery ? 0.22 : 0;

  const simulatedAnnualKwh = Math.round(
    newCapacityKw * 1480 * tiltDeltaPct * (1 + cleaningGainPct)
  );

  const deltaKwh = simulatedAnnualKwh - currentAnnualKwh;
  const deltaPct = Math.round((deltaKwh / currentAnnualKwh) * 100);
  const estimatedAnnualValue = Math.round(deltaKwh * 0.33);

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6">
      {/* Simulation Mode Header with persistent visual boundary */}
      <div className={`p-4 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
        isDarkTheme
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-950'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <div>
            <h2 className="text-sm font-bold">Simulation Mode Active</h2>
            <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-amber-300' : 'text-amber-900'}`}>
              Hypothetical projections re-run the physical clear-sky model. Projections are never written to real system tables.
            </p>
          </div>
        </div>
        <div className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md shrink-0 border ${
          isDarkTheme
            ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
            : 'bg-amber-200/50 text-amber-800 border-amber-300'
        }`}>
          Isolated Sandbox
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className={`lg:col-span-1 space-y-5 rounded-xl p-5 shadow-xs border transition-all ${
          isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Adjust Hypothetical Variables
          </h3>

          {/* Variable 1: Add Panels */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className={`font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Add Panels (400W each)</span>
              <span className={`font-mono font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>+{addedPanels} modules (+{(addedPanels * 0.4).toFixed(1)} kW)</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={addedPanels}
              onChange={(e) => setAddedPanels(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0 (Current: {system.panel_count})</span>
              <span>+4</span>
              <span>+8 (+3.2 kW)</span>
            </div>
          </div>

          {/* Variable 2: Array Tilt Angle */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className={`font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Rooftop Tilt Angle</span>
              <span className={`font-mono font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{hypotheticalTilt}° (Current: {system.tilt_deg}°)</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="1"
              value={hypotheticalTilt}
              onChange={(e) => setHypotheticalTilt(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>10° (Shallow)</span>
              <span>30° (Latitude optimal)</span>
              <span>45° (Steep)</span>
            </div>
          </div>

          {/* Variable 3: Clean Surface Soiling */}
          <div className={`pt-2 border-t ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className={`text-xs font-medium ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>Clean Panel Surface Soiling</div>
                <div className={`text-[11px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Recovers +6% optical transmittance</div>
              </div>
              <input
                type="checkbox"
                checked={cleanPanelsToggle}
                onChange={(e) => setCleanPanelsToggle(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
              />
            </label>
          </div>

          {/* Variable 4: Add Battery Storage */}
          <div className={`pt-2 border-t ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className={`text-xs font-medium ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>Add 10 kWh Battery Storage</div>
                <div className={`text-[11px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Shifts daytime solar into evening peak rate</div>
              </div>
              <input
                type="checkbox"
                checked={hasBattery}
                onChange={(e) => setHasBattery(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
              />
            </label>
          </div>

          <button
            onClick={() => {
              setAddedPanels(0);
              setHypotheticalTilt(system.tilt_deg);
              setCleanPanelsToggle(false);
              setHasBattery(false);
            }}
            className={`w-full py-1.5 text-xs rounded-lg transition-colors border ${
              isDarkTheme
                ? 'text-slate-300 hover:text-white border-slate-700 bg-slate-900/60 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Reset to Actual System Baseline
          </button>
        </div>

        {/* Results & Comparison Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-xl p-5 shadow-xs border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Projected Generation vs. Current Physical Baseline
            </h3>

            {/* Side-by-side metric tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg border ${
                isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xs text-slate-400">Current Measured Annual Output</div>
                <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  {currentAnnualKwh.toLocaleString()} kWh
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  At {system.capacity_kw} kW capacity · {system.tilt_deg}° tilt
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDarkTheme ? 'bg-amber-500/15 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className={`text-xs font-medium ${isDarkTheme ? 'text-amber-300' : 'text-amber-900'}`}>Simulated Projected Annual Output</div>
                <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${isDarkTheme ? 'text-amber-200' : 'text-amber-950'}`}>
                  {simulatedAnnualKwh.toLocaleString()} kWh
                </div>
                <div className={`text-xs font-semibold mt-1 ${isDarkTheme ? 'text-emerald-400' : 'text-amber-800'}`}>
                  {deltaKwh >= 0 ? `+${deltaKwh.toLocaleString()} kWh (+${deltaPct}%)` : `${deltaKwh.toLocaleString()} kWh`}
                </div>
              </div>
            </div>

            {/* Financial Value Summary */}
            <div className="p-4 bg-slate-900 border border-slate-800 text-white rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-semibold text-amber-400">Estimated Annual Bill Value:</div>
                <div className="text-slate-300 mt-0.5">
                  At standard PG&E rate of $0.33/kWh, this scenario yields ~${estimatedAnnualValue}/year in increased value.
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  +${estimatedAnnualValue} / yr
                </div>
              </div>
            </div>

            {/* Disclosures */}
            <div className={`mt-4 text-[11px] leading-relaxed border-t pt-3 ${isDarkTheme ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
              <span className={`font-semibold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Modeling Assumptions: </span>
              Clear-sky geometric calculation using latitude 37.8° solar irradiance curves. Does not guarantee utility interconnection approval or contractor installation costs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
