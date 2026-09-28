import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, CheckCircle2, AlertTriangle, CloudSun, Camera, Wrench, RefreshCw } from 'lucide-react';
import { DeviationDecomposition, EvidenceRef } from '../types/solar';
import { DecompositionBar } from './DecompositionBar';

interface WhyDidItDropViewProps {
  decomposition: DeviationDecomposition;
  onBack: () => void;
  onConfirmFinding?: () => void;
  isDarkTheme?: boolean;
}

export const WhyDidItDropView: React.FC<WhyDidItDropViewProps> = ({
  decomposition,
  onBack,
  onConfirmFinding,
  isDarkTheme = true,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRef | null>(decomposition.evidence_refs[1]); // Default to photo inspection
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [isLlmDegraded, setIsLlmDegraded] = useState<boolean>(false);

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b ${
        isDarkTheme ? 'border-slate-800 text-slate-100' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkTheme ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Why Did My Solar Drop?
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Tuesday, Sep 22
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Deterministic deviation decomposition against the physical clear-sky reference baseline.
            </p>
          </div>
        </div>

        {/* Demo degraded toggle */}
        <button
          onClick={() => setIsLlmDegraded(!isLlmDegraded)}
          className={`text-xs underline decoration-dotted transition-colors self-start sm:self-auto ${
            isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Simulate LLM API timeout/outage to verify resilient fallback UI"
        >
          {isLlmDegraded ? 'Restore LLM Narration' : 'Simulate LLM Offline'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Arithmetic Breakdown & Narration */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Arithmetic Decomposition Card */}
          <div className={`rounded-xl p-4 sm:p-5 border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-sm' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              1. Deterministic Physical Decomposition (Arithmetic First)
            </h2>

            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-lg mb-4 text-center font-mono tabular-nums border ${
              isDarkTheme ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className="text-[11px] font-sans text-slate-400">Clear-Sky Physical Max</div>
                <div className={`text-lg font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>{decomposition.clearsky_kwh} kWh</div>
                <div className="text-[10px] font-sans text-slate-500">Theoretical limit</div>
              </div>
              <div>
                <div className="text-[11px] font-sans text-slate-400">Weather-Adjusted Exp</div>
                <div className="text-lg font-bold text-sky-400">{decomposition.weather_adjusted_kwh} kWh</div>
                <div className="text-[10px] font-sans text-slate-500">Clouds derated</div>
              </div>
              <div>
                <div className="text-[11px] font-sans text-slate-400">Actual Measured</div>
                <div className="text-lg font-bold text-amber-400">{decomposition.actual_kwh} kWh</div>
                <div className="text-[10px] font-sans text-slate-500">Total shortfall: -5.8 kWh</div>
              </div>
            </div>

            {/* Decomposition Bar */}
            <div className="mb-2">
              <DecompositionBar
                weatherExplainedKwh={decomposition.weather_explained_kwh}
                weatherExplainedPct={decomposition.weather_explained_pct}
                unexplainedKwh={decomposition.unexplained_kwh}
                unexplainedPct={decomposition.unexplained_pct}
                size="lg"
              />
            </div>
            <p className={`text-[11px] mt-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Only the unexplained residual (-2.4 kWh) feeds statistical outlier detection. Weather fluctuations do not trigger false maintenance alarms.
            </p>
          </div>

          {/* 2. Plain Language Explanation (LLM Narration layer) */}
          <div className={`rounded-xl p-5 border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-sm' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-xs font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                2. Evidence-Grounded Explanation
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {isLlmDegraded ? 'Deterministic Fallback' : 'Model Narrated · Grounded in Evidence'}
              </span>
            </div>

            {isLlmDegraded ? (
              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                <span className="font-semibold text-amber-300">Explanation narration is temporarily unavailable</span> — the underlying numbers, clear-sky physics, and deterministic decomposition above remain fully functional and unaffected.
              </div>
            ) : (
              <div className={`p-4 rounded-lg border text-sm leading-relaxed ${
                isDarkTheme ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                "{decomposition.narration_text}"
              </div>
            )}

            {/* Supporting Evidence Chips */}
            <div className={`mt-4 pt-3 border-t ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`text-xs font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Supporting Evidence (Click to inspect):</div>
              <div className="flex flex-wrap gap-2">
                {decomposition.evidence_refs.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvidence(ev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      selectedEvidence?.id === ev.id
                        ? 'bg-amber-400/20 border-amber-400/50 font-semibold text-amber-300 shadow-xs'
                        : isDarkTheme
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {ev.type === 'weather' && <CloudSun className="w-3.5 h-3.5 text-sky-400" />}
                    {ev.type === 'inspection' && <Camera className="w-3.5 h-3.5 text-indigo-400" />}
                    {ev.type === 'maintenance' && <Wrench className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{ev.title}</span>
                    {ev.model_score && (
                      <span className="text-[10px] text-purple-300 font-mono">
                        (score {ev.model_score})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Action */}
            {decomposition.action_recommendation && (
              <div className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                <span className="font-bold text-emerald-200">Next Action: </span>
                {decomposition.action_recommendation}
              </div>
            )}

            {/* Feedback for Human-In-The-Loop loop */}
            <div className={`flex items-center justify-between mt-4 pt-3 border-t text-xs ${
              isDarkTheme ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
            }`}>
              <span>Was this explanation helpful & accurate?</span>
              <div className="flex items-center gap-2">
                {feedbackGiven ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Feedback recorded for model evaluation
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => setFeedbackGiven('yes')}
                      className={`px-2.5 py-1 rounded border flex items-center gap-1 transition-colors ${
                        isDarkTheme
                          ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => setFeedbackGiven('no')}
                      className={`px-2.5 py-1 rounded border flex items-center gap-1 transition-colors ${
                        isDarkTheme
                          ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>No</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Evidence Inspector Detail Sheet */}
        <div className="space-y-6">
          <div className={`rounded-xl p-5 border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-sm' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Evidence Detail Sheet
            </h2>

            {selectedEvidence ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDarkTheme ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedEvidence.type === 'weather' && <CloudSun className="w-4 h-4 text-sky-400" />}
                    {selectedEvidence.type === 'inspection' && <Camera className="w-4 h-4 text-indigo-400" />}
                    {selectedEvidence.type === 'maintenance' && <Wrench className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{selectedEvidence.title}</h3>
                    <div className="text-[11px] text-slate-500">{selectedEvidence.timestamp}</div>
                  </div>
                </div>

                <p className={`text-xs mb-4 leading-relaxed p-3 rounded-lg border ${
                  isDarkTheme ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}>
                  {selectedEvidence.summary}
                </p>

                {/* Model Score Honesty Callout */}
                {selectedEvidence.model_score && (
                  <div className="mb-4 p-3 bg-purple-500/15 border border-purple-500/30 rounded-lg text-xs text-purple-200">
                    <div className="font-semibold text-purple-300">{selectedEvidence.score_label}</div>
                    <div className="text-[11px] text-purple-300/80 mt-0.5">
                      Model Score: <span className="font-mono font-bold text-white">{selectedEvidence.model_score}</span>. Explicitly labeled as a coarse corroborating signal — not an authoritative probability diagnosis.
                    </div>
                  </div>
                )}

                {/* Key Attributes Grid */}
                {selectedEvidence.details && (
                  <div className={`space-y-2 border-t pt-3 ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
                    {Object.entries(selectedEvidence.details).map(([key, val]) => (
                      <div key={key} className={`flex items-center justify-between text-xs py-1 border-b ${
                        isDarkTheme ? 'border-slate-800/60' : 'border-slate-50'
                      }`}>
                        <span className="text-slate-400">{key}</span>
                        <span className={`font-mono font-medium ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedEvidence.type === 'inspection' && onConfirmFinding && (
                  <div className={`mt-4 pt-3 border-t ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                      onClick={onConfirmFinding}
                      className="w-full py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
                    >
                      Confirm Soiling Finding in Review Queue
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-8 text-center">
                Select an evidence chip to inspect its raw data points.
              </div>
            )}
          </div>

          {/* Theoretical Baseline Rule Callout */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span className={`font-semibold ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>Architectural Rule: </span>
            The physical clear-sky baseline is derived from pvlib solar position equations and system geometry. ML forecasts are never used as the anomaly reference, preventing self-fulfilling error loops.
          </div>
        </div>
      </div>
    </div>
  );
};

