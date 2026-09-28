import React, { useState } from 'react';
import {
  BatteryCharging,
  Zap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { SolarSystem } from '../types/solar';

interface BatteryViewProps {
  system: SolarSystem;
  activeHour: number;
}

export const BatteryView: React.FC<BatteryViewProps> = ({ system, activeHour }) => {
  const [reservePct, setReservePct] = useState<number>(20);
  const [includeHVAC, setIncludeHVAC] = useState<boolean>(true);
  const [includeKitchen, setIncludeKitchen] = useState<boolean>(true);
  const [includeEV, setIncludeEV] = useState<boolean>(false);

  // Simulated Battery SoC
  let batteryPct = 68;
  if (activeHour >= 6 && activeHour < 12) {
    batteryPct = Math.round(52 + ((activeHour - 6) / 6) * 32);
  } else if (activeHour >= 12 && activeHour < 16) {
    batteryPct = Math.round(84 + ((activeHour - 12) / 4) * 14);
  } else if (activeHour >= 16 && activeHour < 22) {
    batteryPct = Math.round(98 - ((activeHour - 16) / 6) * 36);
  } else {
    batteryPct = Math.round(62 - ((activeHour >= 22 ? activeHour - 22 : activeHour + 2) / 8) * 16);
  }

  // Backup load calculation in kW
  const baseLoadKw = 0.3;
  const hvacLoadKw = includeHVAC ? 0.75 : 0;
  const kitchenLoadKw = includeKitchen ? 0.45 : 0;
  const evLoadKw = includeEV ? 1.8 : 0;
  const totalLoadKw = baseLoadKw + hvacLoadKw + kitchenLoadKw + evLoadKw;

  const usableCapacityKwh = 13.5 * ((batteryPct - reservePct) / 100);
  const backupHours = Math.max(0, Math.round((usableCapacityKwh / totalLoadKw) * 10) / 10);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Home Battery</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Store clean solar energy during the day to power your home through the evening and night.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
            <span className="text-slate-400">Battery capacity: </span>
            <span className="font-bold text-slate-900">13.5 kWh</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Battery Representation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Charge Level */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Battery Charge</span>
            <div className="text-3xl font-bold text-emerald-600 mt-1">{batteryPct}%</div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {((batteryPct / 100) * 13.5).toFixed(1)} kWh available
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${batteryPct}%` }}
            />
          </div>
        </div>

        {/* Battery Health */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Battery Health</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">99.4%</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Excellent condition</span>
            </div>
          </div>
          <span className="text-xs text-slate-400">82 charge cycles completed</span>
        </div>

        {/* Blackout Runtime */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Power Outage Protection</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">
              {backupHours} <span className="text-sm font-normal text-slate-400">hours</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              At current critical home load
            </span>
          </div>
          <span className="text-xs text-emerald-600 font-medium">
            Solar refills battery tomorrow morning
          </span>
        </div>
      </div>

      {/* 3. Blackout / Power Outage Simulator */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Blackout Emergency Simulator</h2>
          <p className="text-xs text-slate-500">
            Choose which appliances you want to run if the power grid goes down.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Emergency reserve</span>
                <span>{reservePct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={reservePct}
                onChange={(e) => setReservePct(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Keeps this percentage saved exclusively for storm outages.
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">
                Appliances to power during an outage
              </span>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">Refrigerator & basic lights</div>
                  <div className="text-slate-400 text-[11px]">Always protected (0.3 kW)</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-semibold text-slate-800">Heating / Air Conditioning</div>
                  <div className="text-slate-400 text-[11px]">Comfort cooling/heating (0.75 kW)</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeHVAC}
                  onChange={(e) => setIncludeHVAC(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
              </label>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-semibold text-slate-800">Kitchen & Water Pump</div>
                  <div className="text-slate-400 text-[11px]">Microwave, kettle, pump (0.45 kW)</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeKitchen}
                  onChange={(e) => setIncludeKitchen(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
              </label>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-semibold text-slate-800">Car Charging (EV)</div>
                  <div className="text-slate-400 text-[11px]">Emergency car top-up (1.8 kW)</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeEV}
                  onChange={(e) => setIncludeEV(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
              </label>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Estimated Protection Time</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 mt-2">
                {backupHours} <span className="text-lg font-normal text-slate-500">hours</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                With your selected appliances using <strong>{totalLoadKw.toFixed(2)} kW</strong>, your battery provides continuous power without grid electricity.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-200/60 text-xs space-y-1">
              <span className="font-semibold text-slate-800">Automatic Solar Refill</span>
              <p className="text-[11px] text-slate-500 leading-normal">
                If the blackout continues into the next day, your solar panels automatically recharge the battery once the sun rises.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
