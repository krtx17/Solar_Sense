import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { SolarSystem, DeviationDecomposition, PanelInspection } from '../types/solar';
import { WhatIfSimulatorView } from '../components/WhatIfSimulatorView';
import { SolarPotentialView } from '../components/SolarPotentialView';
import { ReviewQueueView } from '../components/ReviewQueueView';

interface SettingsViewProps {
  systems: SolarSystem[];
  activeSystemId: string;
  onSelectSystemId: (id: string) => void;
  decomposition: DeviationDecomposition;
  inspections: PanelInspection[];
  onUpdateInspection: (id: string, outcome: 'confirmed' | 'rejected') => void;
  onConfirmAnomaly: (id: string) => void;
  onDismissAnomaly: (id: string) => void;
  onOpenAnomalyModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  systems,
  activeSystemId,
  onSelectSystemId,
  decomposition,
  inspections,
  onUpdateInspection,
  onConfirmAnomaly,
  onDismissAnomaly,
  onOpenAnomalyModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'systems' | 'simulator' | 'potential' | 'queue'>('systems');
  const activeSystem = systems.find((s) => s.id === activeSystemId) || systems[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">System Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch your solar property profile or test upgrades with the simulator.
          </p>
        </div>

        {/* Sub-tabs - scrollable on mobile */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium overflow-x-auto max-w-full gap-0.5">
          {[
            { id: 'systems', label: 'My Systems' },
            { id: 'simulator', label: 'What-If Simulator' },
            { id: 'potential', label: 'Solar Estimator' },
            { id: 'queue', label: 'Findings Queue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: SYSTEMS */}
      {activeSubTab === 'systems' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systems.map((sys) => {
            const isSelected = sys.id === activeSystemId;
            return (
              <div
                key={sys.id}
                onClick={() => onSelectSystemId(sys.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/40 border-amber-500 shadow-xs ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {sys.id}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-0.5">{sys.name}</h3>
                <div className="text-xs text-slate-500 mb-3">{sys.location_name}</div>

                <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Solar capacity</span>
                    <span className="font-semibold text-slate-800">{sys.capacity_kw} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Roof tilt</span>
                    <span className="font-semibold text-slate-700">{sys.tilt_deg}° South</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inverter</span>
                    <span className="font-semibold text-slate-700">{sys.inverter_model}</span>
                  </div>
                </div>

                {sys.history_days < 30 && (
                  <div className="mt-3 p-2 rounded-xl bg-amber-100/70 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>New installation. Standard baseline active.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: WHAT-IF SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
          <WhatIfSimulatorView system={activeSystem} isDarkTheme={false} />
        </section>
      )}

      {/* SUB-TAB 3: SOLAR POTENTIAL ESTIMATOR */}
      {activeSubTab === 'potential' && (
        <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
          <SolarPotentialView
            onSetupSystem={() => setActiveSubTab('systems')}
            onOpenSimulator={() => setActiveSubTab('simulator')}
            isDarkTheme={false}
          />
        </section>
      )}

      {/* SUB-TAB 4: FINDINGS REVIEW QUEUE */}
      {activeSubTab === 'queue' && (
        <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
          <ReviewQueueView
            decomposition={decomposition}
            inspections={inspections}
            onConfirmAnomaly={onConfirmAnomaly}
            onDismissAnomaly={onDismissAnomaly}
            onUpdateInspection={onUpdateInspection}
            onInspectAnomalyDetail={onOpenAnomalyModal}
            isDarkTheme={false}
          />
        </section>
      )}
    </div>
  );
};
