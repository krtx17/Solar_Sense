import React from 'react';
import { ArrowRight, Droplets, Clock, ExternalLink, Zap } from 'lucide-react';
import { NextBestAction } from '../types/solar';

interface NextBestActionCardProps {
  action: NextBestAction;
  onInspectEvidence: (evidenceId: string) => void;
  onOpenActionPlan?: () => void;
  isDarkTheme?: boolean;
}

export const NextBestActionCard: React.FC<NextBestActionCardProps> = ({
  action,
  onInspectEvidence,
  onOpenActionPlan,
  isDarkTheme = false,
}) => {
  const isCleaning = action.category === 'cleaning';
  const buttonLabel = isCleaning ? 'Cleaning Guide & Timing' : 'Schedule Appliance Shift';

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 ${
        isDarkTheme
          ? 'bg-slate-900/90 border-slate-700/80 text-white shadow-[0_4px_25px_rgba(0,0,0,0.3)]'
          : 'bg-white/95 backdrop-blur-md border-sky-200/80 text-[#0B2545] shadow-[0_4px_20px_rgba(2,132,199,0.06)] hover:border-sky-300 hover:shadow-[0_8px_30px_rgba(2,132,199,0.12)]'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Category Icon, Title, Context, Supporting Evidence */}
        <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isCleaning
                ? 'bg-gradient-to-br from-sky-400 to-[#0284C7] text-white shadow-[0_3px_12px_rgba(2,132,199,0.3)]'
                : 'bg-gradient-to-br from-[#134074] to-[#0B2545] text-white shadow-[0_3px_12px_rgba(11,37,69,0.25)]'
            }`}
          >
            {isCleaning ? <Droplets className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header Tag / Tier */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isDarkTheme
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'bg-sky-50 text-[#0284C7] border border-sky-200/80'
                }`}
              >
                Recommended Action
              </span>
              <span className="text-sky-300 text-xs">·</span>
              <span
                className={`text-xs font-medium ${
                  isDarkTheme ? 'text-slate-400' : 'text-[#1E3A8A]/70'
                }`}
              >
                {action.confidence_tier === 'modeled' ? 'Modeled from historical residuals' : 'Fact-verified'}
              </span>
            </div>

            {/* Action Title */}
            <h4
              className={`text-base sm:text-lg font-bold mt-1 tracking-tight leading-snug ${
                isDarkTheme ? 'text-white' : 'text-[#0B2545]'
              }`}
            >
              {action.title}
            </h4>

            {/* Why Context */}
            <p
              className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                isDarkTheme ? 'text-slate-300' : 'text-[#1E3A8A]/85'
              }`}
            >
              <strong className={isDarkTheme ? 'text-white font-semibold' : 'text-[#0B2545] font-semibold'}>
                Why this action:{' '}
              </strong>
              {action.why_context}
            </p>

            {/* Supporting Evidence Chips */}
            {action.evidence_ref_ids && action.evidence_ref_ids.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-sky-100/70">
                <span
                  className={`text-[11px] font-semibold ${
                    isDarkTheme ? 'text-slate-400' : 'text-[#1E3A8A]/60'
                  }`}
                >
                  Supporting evidence:
                </span>
                {action.evidence_ref_ids.map((id) => (
                  <button
                    key={id}
                    onClick={() => onInspectEvidence(id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      isDarkTheme
                        ? 'bg-slate-800 border-slate-700 text-sky-300 hover:bg-slate-700'
                        : 'bg-sky-50/90 hover:bg-sky-100 border-sky-200/80 text-[#0284C7]'
                    }`}
                  >
                    <span>
                      {id === 'ev-panel-soiling-01'
                        ? '📷 Sep 12 Panel Photo (Score 0.81)'
                        : id === 'ev-maint-01'
                        ? '🔧 141 Days Since Wash'
                        : '📊 Weather Deficit'}
                    </span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Estimated Recovery Metrics & Action Button */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 pt-3 lg:pt-0 border-sky-100/80 shrink-0 gap-3 min-w-[200px]">
          <div className="text-left lg:text-right">
            <div
              className={`text-[11px] uppercase tracking-wider font-semibold ${
                isDarkTheme ? 'text-slate-400' : 'text-[#1E3A8A]/60'
              }`}
            >
              Estimated Output Recovery
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#0284C7] tabular-nums tracking-tight">
              +{action.estimated_gain_kwh_per_month} <span className="text-sm font-sans font-semibold">kWh/mo</span>
            </div>
            <div
              className={`text-[11px] font-medium ${
                isDarkTheme ? 'text-slate-400' : 'text-[#1E3A8A]/65'
              }`}
            >
              ~${Math.round(action.estimated_gain_kwh_per_month * 0.33)}/mo at $0.33/kWh
            </div>
          </div>

          <button
            onClick={onOpenActionPlan}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#0B2545] via-[#0284C7] to-[#38BDF8] hover:from-[#081C33] hover:via-[#0369A1] hover:to-[#0EA5E9] text-white shadow-[0_3px_12px_rgba(2,132,199,0.25)] border border-sky-300/30 transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
