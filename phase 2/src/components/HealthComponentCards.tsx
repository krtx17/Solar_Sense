import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, Gauge, Camera, ShieldCheck } from 'lucide-react';
import { HealthComponents } from '../types/solar';

interface HealthComponentCardsProps {
  health: HealthComponents;
  onOpenFindings?: () => void;
  isDarkTheme?: boolean;
}

export const HealthComponentCards: React.FC<HealthComponentCardsProps> = ({ health, onOpenFindings, isDarkTheme = true }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>System Health Components</h3>
          <p className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Transparent component measures (no arbitrary composite score or unexplained weights).
          </p>
        </div>
        <div className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
          Trailing 30-day evaluation window
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Clear-Sky Physical Ratio */}
        <div className={`rounded-xl p-4 border transition-all ${
          isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-sm' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Generation vs. Clear-Sky</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {health.generation_vs_clearsky_pct}%
          </div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nominal solar conversion</span>
          </div>
        </div>

        {/* Card 2: Outlier Frequency with Cold-Start Fallback Disclosure */}
        <div className={`rounded-xl p-4 border transition-all ${
          isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-sm' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Anomaly Frequency</span>
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {health.anomaly_frequency_30d}
          </div>
          <div className="text-xs mt-1">
            {health.is_provisional_prior ? (
              <span className="text-amber-400 font-medium">Provisional population prior (&lt;30d)</span>
            ) : (
              <span className={isDarkTheme ? 'text-slate-400' : 'text-slate-500'}>Relative to trailing 30d residuals</span>
            )}
          </div>
        </div>

        {/* Card 3: Open Corroborating Findings */}
        <div className={`rounded-xl p-4 border transition-all ${
          isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-sm' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Open Corroborating Findings</span>
            <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {health.open_findings_count}
            </div>
            {onOpenFindings && (
              <button
                onClick={onOpenFindings}
                className="text-xs font-medium text-sky-400 hover:text-sky-300"
              >
                Inspect photo →
              </button>
            )}
          </div>
          <div className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>Sep 12 surface soiling (score 0.81)</span>
          </div>
        </div>

        {/* Card 4: Clipping & Telemetry Completeness */}
        <div className={`rounded-xl p-4 border transition-all ${
          isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-sm' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Inverter & Data Integrity</span>
            <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {health.data_completeness_pct}%
          </div>
          <div className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>Clipping loss: {health.inverter_clipping_loss_pct}% (nominal)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
