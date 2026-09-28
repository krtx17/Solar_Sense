import React, { useState } from 'react';
import {
  BarChart2,
  UploadCloud,
  FileDown,
} from 'lucide-react';
import { SolarSystem, DeviationDecomposition, NextBestAction } from '../types/solar';
import { EchoTwinEnergyEngine } from '../components/EchoTwinEnergyEngine';
import { DecompositionBar } from '../components/DecompositionBar';
import { NextBestActionCard } from '../components/NextBestActionCard';
import { DataUploadModal } from '../components/DataUploadModal';
import { ReportExportModal } from '../components/ReportExportModal';

interface AnalyticsViewProps {
  system: SolarSystem;
  decomposition: DeviationDecomposition;
  nextActions: NextBestAction[];
  onOpenAnomalyModal?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  system,
  decomposition,
  nextActions,
  onOpenAnomalyModal,
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn font-sans">
      {/* 1. Header: Pure Blue Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center font-bold border border-sky-200/60 shadow-xs">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-[#0B2545] tracking-tight">Energy Analytics</h1>
          </div>
          <p className="text-xs text-[#1E3A8A]/75 font-medium mt-0.5">
            Understand where your electricity flows and see suggestions to get the most from your solar system.
          </p>
        </div>

        {/* Action Buttons: Pure Blue Theme */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-sky-50 border border-sky-200/80 text-[#134074] text-xs font-bold shadow-xs transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Upload Data</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0B2545] via-[#0284C7] to-[#38BDF8] hover:from-[#081C33] hover:via-[#0369A1] hover:to-[#0EA5E9] text-white text-xs font-bold shadow-[0_4px_16px_rgba(2,132,199,0.25)] border border-sky-300/30 transition-all active:scale-95"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Save Report</span>
          </button>
        </div>
      </div>

      {/* 2. EchoTwin Interactive Energy Flow Engine */}
      <section>
        <EchoTwinEnergyEngine
          system={system}
          decomposition={decomposition}
          onDrillAnomaly={onOpenAnomalyModal}
        />
      </section>

      {/* 3. Drop Investigation Bar: "Why Did Output Drop?" */}
      <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-sky-100/80 p-5 shadow-[0_6px_25px_rgba(2,132,199,0.05)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0B2545]">Why Did Generation Change?</h2>
            <p className="text-xs text-[#1E3A8A]/75 font-medium">
              Blue shows normal cloud weather effects; amber shows actionable issues like dust or shade.
            </p>
          </div>
          {onOpenAnomalyModal && (
            <button
              onClick={onOpenAnomalyModal}
              className="text-xs font-bold text-[#0284C7] hover:underline transition-colors"
            >
              See details →
            </button>
          )}
        </div>

        <DecompositionBar
          weatherExplainedKwh={decomposition.weather_explained_kwh}
          weatherExplainedPct={decomposition.weather_explained_pct}
          unexplainedKwh={decomposition.unexplained_kwh}
          unexplainedPct={decomposition.unexplained_pct}
          totalDeficitKwh={Math.abs(decomposition.clearsky_kwh - decomposition.actual_kwh)}
          size="lg"
        />
      </section>

      {/* 4. Next Best Actions (Suggestions to save money) */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[#0B2545]">Recommended Steps to Save More</h2>
          <p className="text-xs text-[#1E3A8A]/75 font-medium">
            Ranked by how much electricity and money you can recover.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {nextActions.map((action) => (
            <NextBestActionCard
              key={action.id}
              action={action}
              onInspectEvidence={() => {
                if (onOpenAnomalyModal) onOpenAnomalyModal();
              }}
              isDarkTheme={false}
            />
          ))}
        </div>
      </section>

      {/* Data Upload Modal */}
      <DataUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        system={system}
        onDataValidated={() => {
          setIsUploadOpen(false);
        }}
      />

      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        system={system}
        decomposition={decomposition}
        health={{
          generation_vs_clearsky_pct: 92.4,
          anomaly_frequency_30d: '1 event in 30d',
          is_provisional_prior: false,
          open_findings_count: 1,
          inverter_clipping_loss_pct: 0.8,
          data_completeness_pct: 99.8,
        }}
      />
    </div>
  );
};
