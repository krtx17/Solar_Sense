import React, { useState } from 'react';
import { X, Sliders, ChevronDown, ChevronUp, Download, ShieldCheck, Zap } from 'lucide-react';
import { SolarSystem } from '../types/solar';

interface MinimalSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: SolarSystem;
  theme: 'dark' | 'light';
  onShowToast: (msg: string) => void;
}

/**
 * "Actions" modal/panel:
 * 1. "Simulation" section (Panels slider, Battery slider, live "Yield" readout, "Apply" button)
 * 2. Collapsible "Losses" section
 * 3. Collapsible "Export" section (CSV download)
 * Restyled with deep warm near-black backdrop and bold warm amber accents.
 */
export const MinimalSystemModal: React.FC<MinimalSystemModalProps> = ({
  isOpen,
  onClose,
  system,
  theme,
  onShowToast,
}) => {
  const isDark = theme === 'dark';
  const [activeAccordion, setActiveAccordion] = useState<string | null>('simulator');

  const [extraPanels, setExtraPanels] = useState<number>(4);
  const [extraBatteryKwh, setExtraBatteryKwh] = useState<number>(5);

  if (!isOpen) return null;

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleApplySimulation = () => {
    onShowToast(`Simulation configuration applied`);
    onClose();
  };

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Timestamp,Generation_kW,Home_kW,Storage_kW,Grid_kW\n2026-09-25T12:00:00,7.2,1.4,2.6,3.2\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telemetry_${system.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('CSV telemetry exported');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-[#12100E] border-[#2A2420] text-stone-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2420]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-stone-100">Actions</h3>
              <p className="text-[11px] text-stone-400 font-mono">System Parameters & Simulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
              isDark
                ? 'border-[#2A2420] hover:bg-[#1A1714] text-stone-400 hover:text-stone-100'
                : 'border-stone-200 hover:bg-stone-100 text-stone-600'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nested Accordion Content */}
        <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* 1: Simulation Section */}
          <div
            className={`rounded-2xl border transition-all ${
              isDark ? 'border-[#2A2420] bg-[#1A1714]' : 'border-stone-200 bg-stone-50'
            }`}
          >
            <button
              onClick={() => toggleAccordion('simulator')}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs tracking-wide"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-stone-100 font-bold">Simulation</span>
              </div>
              {activeAccordion === 'simulator' ? (
                <ChevronUp className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {activeAccordion === 'simulator' && (
              <div className="px-4 pb-4 space-y-4 pt-1 text-xs border-t border-[#2A2420]/60 font-mono">
                <div>
                  <div className="flex justify-between text-stone-300 mb-1.5">
                    <span>Panels:</span>
                    <span className="text-amber-400 font-bold">+{extraPanels} Units</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="2"
                    value={extraPanels}
                    onChange={(e) => setExtraPanels(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    aria-label="Panels slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-300 mb-1.5">
                    <span>Battery:</span>
                    <span className="text-orange-400 font-bold">+{extraBatteryKwh} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="2.5"
                    value={extraBatteryKwh}
                    onChange={(e) => setExtraBatteryKwh(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    aria-label="Battery slider"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#12100E] border border-[#2A2420] flex justify-between items-center text-xs">
                  <span className="text-stone-400">Yield:</span>
                  <span className="text-amber-400 font-bold">
                    +{(extraPanels * 1.8 + extraBatteryKwh * 0.4).toFixed(1)} kWh/d
                  </span>
                </div>

                <button
                  onClick={handleApplySimulation}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* 2: Losses Section (Collapsible) */}
          <div
            className={`rounded-2xl border transition-all ${
              isDark ? 'border-[#2A2420] bg-[#1A1714]' : 'border-stone-200 bg-stone-50'
            }`}
          >
            <button
              onClick={() => toggleAccordion('losses')}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs tracking-wide"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span className="text-stone-100 font-bold">Losses</span>
              </div>
              {activeAccordion === 'losses' ? (
                <ChevronUp className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {activeAccordion === 'losses' && (
              <div className="px-4 pb-4 space-y-2 pt-1 text-xs border-t border-[#2A2420]/60 font-mono text-stone-300">
                <div className="flex justify-between py-1 border-b border-[#2A2420]">
                  <span className="text-stone-400">Ceiling</span>
                  <span className="text-stone-100 font-bold">34.2 kWh</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2A2420]">
                  <span className="text-stone-400">Weather</span>
                  <span className="text-amber-400">-12.4%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2A2420]">
                  <span className="text-stone-400">Soiling</span>
                  <span className="text-stone-300">-3.2%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Inverter</span>
                  <span className="text-orange-400 font-medium">97.8%</span>
                </div>
              </div>
            )}
          </div>

          {/* 3: Export Section (Collapsible) */}
          <div
            className={`rounded-2xl border transition-all ${
              isDark ? 'border-[#2A2420] bg-[#1A1714]' : 'border-stone-200 bg-stone-50'
            }`}
          >
            <button
              onClick={() => toggleAccordion('export')}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs tracking-wide"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-amber-400" />
                <span className="text-stone-100 font-bold">Export</span>
              </div>
              {activeAccordion === 'export' ? (
                <ChevronUp className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {activeAccordion === 'export' && (
              <div className="px-4 pb-4 pt-1 text-xs border-t border-[#2A2420]/60">
                <button
                  onClick={handleExportData}
                  className="w-full py-2.5 rounded-xl border border-[#2A2420] hover:border-amber-500/50 bg-[#12100E] text-stone-200 hover:text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
