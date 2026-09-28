import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Camera, ShieldAlert, ArrowRight, Check } from 'lucide-react';
import { DeviationDecomposition, PanelInspection } from '../types/solar';

interface ReviewQueueViewProps {
  decomposition: DeviationDecomposition;
  inspections: PanelInspection[];
  onConfirmAnomaly: (id: string) => void;
  onDismissAnomaly: (id: string) => void;
  onUpdateInspection: (id: string, outcome: 'confirmed' | 'rejected') => void;
  onInspectAnomalyDetail: () => void;
  isDarkTheme?: boolean;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  decomposition,
  inspections,
  onConfirmAnomaly,
  onDismissAnomaly,
  onUpdateInspection,
  onInspectAnomalyDetail,
  isDarkTheme = true,
}) => {
  const pendingInspections = inspections.filter((i) => !i.reviewed_by_user);
  const reviewedInspections = inspections.filter((i) => i.reviewed_by_user);

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b ${
        isDarkTheme ? 'border-slate-800 text-slate-100' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Human-in-the-Loop Review Queue</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
              1 Anomaly · 1 Photo Pending
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Confirmed findings feed future causal attribution. Rejected findings are removed from LLM evidence references.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Flagged Energy Anomaly Queue */}
        <div className={`rounded-xl p-5 shadow-xs border transition-all ${
          isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between ${
            isDarkTheme ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span>1. Pending Energy Anomaly Reviews</span>
            <span className={isDarkTheme ? 'text-slate-500 font-normal' : 'text-slate-400 font-normal'}>Ranked by unexplained_pct</span>
          </h2>

          <div className={`p-4 rounded-xl border ${
            isDarkTheme ? 'border-amber-500/40 bg-amber-500/10' : 'border-amber-300 bg-amber-50/30'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    isDarkTheme ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {decomposition.status.toUpperCase()}
                  </span>
                  <h3 className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                    Tuesday Sep 22: -2.4 kWh Unexplained Drop (41% of deficit)
                  </h3>
                </div>
                <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                  Statistical outlier relative to trailing 30-day residuals. Corroborates Sep 12 handheld soiling finding.
                </p>
              </div>

              <div className="text-right shrink-0 font-mono text-xs">
                <span className="text-slate-400 font-sans">Clear-Sky: </span>
                <span className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>{decomposition.clearsky_kwh} kWh</span>
                <span className="mx-1 text-slate-600">·</span>
                <span className="text-slate-400 font-sans">Actual: </span>
                <span className="font-bold text-amber-400">{decomposition.actual_kwh} kWh</span>
              </div>
            </div>

            <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-xs ${
              isDarkTheme ? 'border-amber-500/20' : 'border-amber-200/60'
            }`}>
              <button
                onClick={onInspectAnomalyDetail}
                className="font-medium text-amber-400 hover:text-amber-300 underline decoration-dotted flex items-center gap-1"
              >
                <span>Open Full Deterministic Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDismissAnomaly(decomposition.id)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    isDarkTheme
                      ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Dismiss Anomaly
                </button>
                <button
                  onClick={() => onConfirmAnomaly(decomposition.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition-colors shadow-xs"
                >
                  Confirm as Genuine Anomaly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Flagged Photo Findings Queue */}
        <div className={`rounded-xl p-5 shadow-xs border transition-all ${
          isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            2. Handheld Vision Findings Awaiting Verification
          </h2>

          <div className="space-y-3">
            {pendingInspections.map((insp) => (
              <div key={insp.id} className={`p-4 rounded-xl border ${
                isDarkTheme ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{insp.panel_label}</div>
                      <div className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                        Date: {insp.date} · Finding: <span className={`font-semibold capitalize ${isDarkTheme ? 'text-slate-200' : ''}`}>{insp.finding_label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded border border-purple-500/30">
                    model score: {insp.model_score} (uncalibrated)
                  </div>
                </div>

                <p className={`text-xs mb-3 p-2.5 rounded border leading-relaxed ${
                  isDarkTheme ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'
                }`}>
                  {insp.image_description}
                </p>

                <div className={`flex items-center justify-end gap-2 pt-2 border-t text-xs ${
                  isDarkTheme ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <button
                    onClick={() => onUpdateInspection(insp.id, 'rejected')}
                    className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      isDarkTheme
                        ? 'border-red-500/30 text-red-300 bg-red-500/10 hover:bg-red-500/20'
                        : 'border-red-200 text-red-700 hover:bg-red-50'
                    }`}
                  >
                    Reject Finding
                  </button>
                  <button
                    onClick={() => onUpdateInspection(insp.id, 'confirmed')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition-colors shadow-xs"
                  >
                    Confirm Finding
                  </button>
                </div>
              </div>
            ))}

            {reviewedInspections.map((insp) => (
              <div key={insp.id} className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                isDarkTheme ? 'border-slate-800 bg-slate-900/40 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className={`font-semibold ${isDarkTheme ? 'text-white' : ''}`}>{insp.panel_label}:</span>
                  <span className="capitalize">{insp.finding_label}</span>
                  <span className="text-slate-400 font-mono">(score {insp.model_score})</span>
                </div>
                <span className="text-emerald-400 font-medium">Reviewed: {insp.review_outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
