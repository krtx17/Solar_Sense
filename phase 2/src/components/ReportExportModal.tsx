import React from 'react';
import { FileText, Download, Printer, X, Check, ShieldCheck, Sun } from 'lucide-react';
import { SolarSystem, DeviationDecomposition, HealthComponents } from '../types/solar';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: SolarSystem;
  decomposition: DeviationDecomposition;
  health: HealthComponents;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  system,
  decomposition,
  health,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csvData = `metric,value,unit,disclosure
system_name,"${system.name}",text,grounded
capacity_kw,${system.capacity_kw},kW,nameplate
clearsky_physical_kwh,${decomposition.clearsky_kwh},kWh,pvlib_geometry
weather_adjusted_kwh,${decomposition.weather_adjusted_kwh},kWh,cloud_derate
actual_kwh,${decomposition.actual_kwh},kWh,inverter_measured
unexplained_deficit_kwh,${decomposition.unexplained_kwh},kWh,statistical_outlier
generation_vs_clearsky_ratio,${health.generation_vs_clearsky_pct},%,component_metric
trailing_30d_outlier_frequency,"${health.anomaly_frequency_30d}",count,trailing_residuals
model_score_finding,"soiling (score 0.81)",coarse_label,uncalibrated_vision
report_date,"${new Date().toISOString()}",iso8601,system_generated`;

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SolarSense_Report_${system.id}_${decomposition.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Solar Energy Intelligence Report</h2>
              <p className="text-xs text-slate-500">M1 Automated Verification Document</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <div className="text-lg font-bold text-slate-900">{system.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Location: {system.location_name} ({system.latitude.toFixed(2)}° N, {system.longitude.toFixed(2)}° W)
              </div>
              <div className="text-xs text-slate-500">
                Inverter: {system.inverter_model} · {system.panel_count} modules
              </div>
            </div>
            <div className="text-right text-xs font-mono tabular-nums text-slate-500">
              <div>Date: {decomposition.date}</div>
              <div>Report ID: SSR-2026-0922</div>
            </div>
          </div>

          {/* Section 1: Generation & Physical Baseline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Generation vs. Clear-Sky Physical Baseline
            </h3>
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums text-xs">
              <div>
                <span className="text-slate-500 font-sans">Clear-Sky Geometric Max:</span>
                <div className="text-base font-bold text-slate-900">{decomposition.clearsky_kwh} kWh</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Weather-Adjusted Expected:</span>
                <div className="text-base font-bold text-sky-700">{decomposition.weather_adjusted_kwh} kWh</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Actual Measured Generation:</span>
                <div className="text-base font-bold text-amber-800">{decomposition.actual_kwh} kWh</div>
              </div>
            </div>
          </div>

          {/* Section 2: Deviation Decomposition */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Deterministic Anomaly Decomposition
            </h3>
            <div className="p-3 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="text-slate-600 font-sans">Total Generation Shortfall:</span>
                <span className="font-bold text-slate-900">-5.8 kWh (100%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                <span className="text-sky-700 font-sans">Weather-Explained Deficit (GOES-18 GHI sat feed):</span>
                <span className="font-semibold text-sky-700">-3.4 kWh ({decomposition.weather_explained_pct}%)</span>
              </div>
              <div className="flex justify-between py-1 font-mono">
                <span className="text-amber-800 font-sans font-bold">Unexplained Gap (Statistical Anomaly Signal):</span>
                <span className="font-bold text-amber-800">{decomposition.unexplained_kwh} kWh ({decomposition.unexplained_pct}%)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Evidence Grounding */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              3. Evidence References & Grounded Narration
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed mb-2">
              "{decomposition.narration_text}"
            </div>
            <div className="text-[11px] text-slate-500 italic">
              Cited Evidence: GOES-18 HRRR Satellite Irradiance Model, Sep 12 Handheld Panel Photo (model score 0.81), May 4 Maintenance Log.
            </div>
          </div>

          {/* Section 4: System Health Components */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              4. System Component Measures
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs border border-slate-200 p-3 rounded-lg font-mono">
              <div>
                <span className="text-slate-500 font-sans">Generation vs Baseline:</span>
                <div className="font-bold text-slate-900">{health.generation_vs_clearsky_pct}%</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">30d Anomaly Frequency:</span>
                <div className="font-bold text-slate-900">{health.anomaly_frequency_30d}</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Telemetry Completeness:</span>
                <div className="font-bold text-slate-900">{health.data_completeness_pct}%</div>
              </div>
            </div>
          </div>

          {/* Disclosures & Privacy Notice */}
          <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-3 leading-normal">
            SolarSense AI Verification Standard: All physical baselines computed deterministically via pvlib geometric transposition. No ML predictions are used as anomaly references. Handheld vision scores are coarse corroborating signals, not calibrated probabilities.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
