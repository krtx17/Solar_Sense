import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowRight, RefreshCw, X } from 'lucide-react';
import { SolarSystem, DataQualityReport } from '../types/solar';
import { validateCsvUpload, uploadTelemetryCsvLive, SAMPLE_CSV_CONTENT } from '../services/solarDataService';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: SolarSystem;
  onDataValidated: (report: DataQualityReport) => void;
}

export const DataUploadModal: React.FC<DataUploadModalProps> = ({
  isOpen,
  onClose,
  system,
  onDataValidated,
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [step, setStep] = useState<'upload' | 'review'>('upload');

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = async (file: File) => {
    setIsProcessing(true);
    // Try live Python backend DataQualityAgent first
    try {
      const liveReport = await uploadTelemetryCsvLive(file);
      if (liveReport) {
        setReport(liveReport);
        setIsProcessing(false);
        setStep('review');
        return;
      }
    } catch {
      // Continue to client-side fallback
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      runValidation(text);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setIsProcessing(true);
    setCsvContent(SAMPLE_CSV_CONTENT);
    runValidation(SAMPLE_CSV_CONTENT);
  };

  const runValidation = (text: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const rep = validateCsvUpload(text, system.capacity_kw);
      setReport(rep);
      setIsProcessing(false);
      setStep('review');
    }, 450);
  };

  const handleConfirmAndProceed = () => {
    if (report) {
      onDataValidated(report);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {step === 'upload' ? 'Upload Solar Generation CSV' : 'Data Quality Agent Validation'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target System: {system.name} ({system.capacity_kw} kW capacity)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === 'upload' ? (
            <div>
              {/* Drag and Drop Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-8 text-center transition-colors bg-slate-50 hover:bg-amber-50/20"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Drag and drop your generation CSV here
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports inverter exports from SolarEdge, Enphase, Fronius, Tesla, or generic CSV (timestamp, kWh).
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <label className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors shadow-xs">
                    <span>Browse CSV File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
                  >
                    Load Sample Test File
                  </button>
                </div>
              </div>

              {/* Data Quality Notice */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Pre-Ingestion Contract: </span>
                Every upload is validated by the rule-based Data Quality Agent before downstream clear-sky or forecasting algorithms touch it. It checks for timestamp monotonic order, gaps, negative sensor spikes, and capacity overflows.
              </div>
            </div>
          ) : (
            report && (
              <div className="space-y-4">
                {/* Result Overview Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    report.passed
                      ? report.has_warnings
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-red-50 border-red-200 text-red-950'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {report.passed ? (
                      report.has_warnings ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">
                      {report.passed
                        ? report.has_warnings
                          ? 'Validation Passed with Flagged Warnings'
                          : 'Validation Passed Successfully'
                        : 'Validation Failed — Issues Require Attention'}
                    </h3>
                    <p className="text-xs mt-0.5 opacity-90">
                      {report.valid_rows} of {report.total_rows} rows parsed cleanly. Flagged data ranges will be visually tagged on downstream charts.
                    </p>
                  </div>
                </div>

                {/* Detected Metadata Grid */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div>
                    <div className="text-slate-500 font-sans">Detected Timezone</div>
                    <div className="font-semibold text-slate-800 font-mono mt-0.5">{report.detected_tz}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-sans">Energy Units</div>
                    <div className="font-semibold text-slate-800 font-mono mt-0.5">{report.detected_unit}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-sans">Date Range</div>
                    <div className="font-semibold text-slate-800 font-mono mt-0.5">
                      {report.date_range_start.split('T')[0]} – {report.date_range_end.split('T')[0]}
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    Detected Quality Issues ({report.issues.length})
                  </h4>

                  {report.issues.length === 0 ? (
                    <div className="text-xs text-emerald-700 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      No gaps, duplicates, or sensor spikes detected. Data is physically pristine.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2">
                      {report.issues.map((iss, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 rounded-md bg-white border border-slate-100 text-xs"
                        >
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                              iss.severity === 'error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {iss.type.replace('_', ' ')}
                          </span>
                          <span className="text-slate-700 flex-1 leading-snug">{iss.description}</span>
                          {iss.row_index && (
                            <span className="text-slate-400 font-mono text-[10px] shrink-0">
                              Row {iss.row_index}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step === 'review' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
              >
                Upload Different File
              </button>

              <button
                type="button"
                onClick={handleConfirmAndProceed}
                disabled={!report?.passed}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs ${
                  report?.passed
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Proceed to System Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
