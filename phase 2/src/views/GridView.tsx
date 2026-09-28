import React from 'react';
import { Zap, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { SolarSystem, ElectricityBill } from '../types/solar';
import { BillAnalyzerView } from '../components/BillAnalyzerView';

interface GridViewProps {
  system: SolarSystem;
  bills: ElectricityBill[];
  onSaveBill: (bill: ElectricityBill) => void;
  activeHour: number;
}

export const GridView: React.FC<GridViewProps> = ({ system, bills, onSaveBill, activeHour }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Power Grid</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            See electricity coming from or going to the electric grid, and check your utility bill savings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
            <span className="text-slate-400">Utility: </span>
            <span className="font-bold text-slate-900">PG&E</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Metering Credit */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Export Credit Rate</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">+$0.28 / kWh</div>
          <span className="text-xs text-slate-400 mt-1 block">
            Paid to you for extra solar electricity
          </span>
        </div>

        {/* Savings Today */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Today's Savings</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">$4.82</div>
          <span className="text-xs text-slate-400 mt-1 block">
            Earned from sending solar to the grid
          </span>
        </div>

        {/* Monthly Estimate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Monthly Bill Reduction</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">$184.20</div>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            Lower than last year without solar
          </span>
        </div>
      </div>

      {/* 3. Utility Bill Reconciliation Analyzer */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
        <BillAnalyzerView bills={bills} onSaveBill={onSaveBill} isDarkTheme={false} />
      </section>
    </div>
  );
};
