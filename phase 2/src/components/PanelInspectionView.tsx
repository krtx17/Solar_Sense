import React, { useState } from 'react';
import { Camera, AlertCircle, CheckCircle2, XCircle, Info, Upload, Check, Eye } from 'lucide-react';
import { PanelInspection, SolarSystem } from '../types/solar';

interface PanelInspectionViewProps {
  inspections: PanelInspection[];
  system: SolarSystem;
  onUpdateInspection: (id: string, outcome: 'confirmed' | 'rejected') => void;
  onOpenAnomaly?: (anomalyId: string) => void;
  isDarkTheme?: boolean;
}

export const PanelInspectionView: React.FC<PanelInspectionViewProps> = ({
  inspections,
  system,
  onUpdateInspection,
  onOpenAnomaly,
  isDarkTheme = true,
}) => {
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(inspections[0]?.id || '');
  const active = inspections.find((i) => i.id === selectedInspectionId) || inspections[0];

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6">
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b ${
        isDarkTheme ? 'border-slate-800 text-slate-100' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Panel Image Analyzer & Findings</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
              Corroborating Signal Layer
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Handheld rooftop photos provide coarse corroboration for unexplained energy deficits. Not standalone diagnoses.
          </p>
        </div>

        <div className={`text-xs font-mono ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
          Hardware telemetry: {system.has_panel_level_data ? 'Microinverter module-level data' : 'String-level aggregate (default)'}
        </div>
      </div>

      {/* Mandatory Architectural Guardrail Banner */}
      <div className={`mb-6 p-4 rounded-xl text-xs flex items-start gap-3 border ${
        isDarkTheme
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          : 'bg-amber-50/70 border-amber-200 text-amber-950'
      }`}>
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">Guardrail & Language Standard: </span>
          Handheld rooftop vision models are reported with <span className="font-mono font-bold">model score</span> language (e.g. 0.81) rather than calibrated percentages. Vision findings never trigger standalone alerts; they only surface alongside energy-side anomalies as corroborating physical evidence.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inspection List & Photo Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-xl p-5 shadow-xs border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Inspection Findings Queue ({inspections.length})
            </h3>

            <div className="space-y-3">
              {inspections.map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => setSelectedInspectionId(insp.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedInspectionId === insp.id
                      ? isDarkTheme
                        ? 'border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                        : 'border-indigo-400 bg-indigo-50/20 ring-2 ring-indigo-500/10'
                      : isDarkTheme
                      ? 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                        isDarkTheme ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {insp.finding_label}
                      </span>
                      <span className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{insp.panel_label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-mono font-bold">
                        model score: {insp.model_score}
                      </span>
                      <span className="text-xs text-slate-400">{insp.date}</span>
                    </div>
                  </div>

                  <p className={`text-xs mb-3 leading-relaxed ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                    {insp.image_description}
                  </p>

                  <div className={`flex items-center justify-between pt-2 border-t text-xs ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div>
                      {insp.reviewed_by_user ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Review outcome: {insp.review_outcome}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium">Pending homeowner review</span>
                      )}
                    </div>

                    {insp.corroborates_anomaly_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAnomaly && insp.corroborates_anomaly_id) {
                            onOpenAnomaly(insp.corroborates_anomaly_id);
                          }
                        }}
                        className="text-xs font-medium text-amber-400 hover:text-amber-300 underline decoration-dotted"
                      >
                        Corroborates Sep 22 anomaly →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Inspection Visual Inspector & Review Controls */}
        <div className="space-y-6">
          <div className={`rounded-xl p-5 shadow-xs border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Photo Visual Inspection
            </h3>

            {active && (
              <div>
                {/* Styled Technical Inspection SVG/Canvas Frame */}
                <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center mb-4">
                  {/* Visual Simulation of Rooftop Solar Panel with Soiling Band */}
                  <svg viewBox="0 0 400 300" className="w-full h-full select-none">
                    {/* Sky & Roof Tiles background */}
                    <rect width="400" height="300" fill="#1E293B" />
                    <pattern id="tiles" width="40" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="20" x2="40" y2="20" stroke="#334155" strokeWidth="1" />
                      <line x1="20" y1="0" x2="20" y2="20" stroke="#334155" strokeWidth="0.5" />
                    </pattern>
                    <rect width="400" height="300" fill="url(#tiles)" opacity="0.6" />

                    {/* Solar PV Modules Grid */}
                    <g transform="translate(40, 30) skewX(-8)">
                      {/* Module 1 */}
                      <rect x="10" y="10" width="140" height="100" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
                      {/* Solar Cell Lines */}
                      <line x1="10" y1="35" x2="150" y2="35" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.4" />
                      <line x1="10" y1="60" x2="150" y2="60" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.4" />
                      <line x1="10" y1="85" x2="150" y2="85" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.4" />
                      {/* Dust / Soiling Accumulation Gradient on Bottom */}
                      <rect x="10" y="80" width="140" height="30" fill="#D97706" fillOpacity="0.45" />

                      {/* Module 2 */}
                      <rect x="165" y="10" width="140" height="100" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
                      <line x1="165" y1="35" x2="305" y2="35" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.4" />
                      <line x1="165" y1="60" x2="305" y2="60" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.4" />
                      <line x1="165" y1="85" x2="305" y2="85" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.4" />
                      <rect x="165" y="80" width="140" height="30" fill="#D97706" fillOpacity="0.4" />

                      {/* Module 3 (Bottom Row) */}
                      <rect x="10" y="125" width="140" height="100" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
                      <rect x="10" y="195" width="140" height="30" fill="#D97706" fillOpacity="0.6" />

                      {/* Module 4 (Bottom Row) */}
                      <rect x="165" y="125" width="140" height="100" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
                      <rect x="165" y="195" width="140" height="30" fill="#D97706" fillOpacity="0.55" />

                      {/* Bounding Box on Soiling Finding */}
                      <rect x="5" y="190" width="305" height="40" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x="10" y="185" fill="#FBBF24" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                        Target Soiling Band (score: 0.81)
                      </text>
                    </g>
                  </svg>

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                    RGB Rooftop Photo · Sep 12
                  </div>
                </div>

                {/* Finding Details */}
                <div className="space-y-2 text-xs">
                  <div className={`flex justify-between py-1 border-b ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span className="text-slate-400">Coarse Classification:</span>
                    <span className={`font-semibold capitalize ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>{active.finding_label}</span>
                  </div>
                  <div className={`flex justify-between py-1 border-b ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span className="text-slate-400">Score Representation:</span>
                    <span className="font-mono font-bold text-purple-400">model score: {active.model_score}</span>
                  </div>
                  <div className={`flex justify-between py-1 border-b ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span className="text-slate-400">Calibrated Probability:</span>
                    <span className={isDarkTheme ? 'text-slate-300' : 'text-slate-600'}>No (uncalibrated vision classifier)</span>
                  </div>
                </div>

                {/* Review Action Controls */}
                <div className={`mt-4 pt-3 border-t ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div className={`text-xs font-semibold mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Reviewer Action:</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateInspection(active.id, 'confirmed')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                        active.review_outcome === 'confirmed'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : isDarkTheme
                          ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Finding</span>
                    </button>
                    <button
                      onClick={() => onUpdateInspection(active.id, 'rejected')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                        active.review_outcome === 'rejected'
                          ? 'bg-red-500 text-white font-bold'
                          : isDarkTheme
                          ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30'
                          : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Finding</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
