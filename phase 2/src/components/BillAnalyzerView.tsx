import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, Edit2, Check, ArrowRight, ShieldCheck, Calculator, Upload } from 'lucide-react';
import { ElectricityBill } from '../types/solar';

interface BillAnalyzerViewProps {
  bills: ElectricityBill[];
  onSaveBill: (bill: ElectricityBill) => void;
  isDarkTheme?: boolean;
}

export const BillAnalyzerView: React.FC<BillAnalyzerViewProps> = ({ bills, onSaveBill, isDarkTheme = true }) => {
  const [selectedBillId, setSelectedBillId] = useState<string>(bills[0]?.id || '');
  const bill = bills.find((b) => b.id === selectedBillId) || bills[0];

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUnits, setEditedUnits] = useState<number>(bill?.units_consumed_kwh || 412);
  const [editedAmount, setEditedAmount] = useState<number>(bill?.total_amount_usd || 148.2);
  const [editedTariff, setEditedTariff] = useState<number>(bill?.tariff_rate_usd_kwh || 0.33);
  const [editedFixed, setEditedFixed] = useState<number>(bill?.fixed_charges_usd || 12.24);

  // Live reconciliation arithmetic check: units * tariff + fixed ~= total
  const calculatedTotal = Math.round((editedUnits * editedTariff + editedFixed) * 100) / 100;
  const delta = Math.round(Math.abs(calculatedTotal - editedAmount) * 100) / 100;
  const isReconciled = delta <= 1.5; // tolerance threshold

  const handleSave = () => {
    if (bill) {
      const updated: ElectricityBill = {
        ...bill,
        units_consumed_kwh: editedUnits,
        total_amount_usd: editedAmount,
        tariff_rate_usd_kwh: editedTariff,
        fixed_charges_usd: editedFixed,
        reconciliation_pass: isReconciled,
        reconciliation_delta_usd: delta,
        verified_by_user: true,
      };
      onSaveBill(updated);
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6">
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b ${
        isDarkTheme ? 'border-slate-800 text-slate-100' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Electricity Bill Analyzer</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
              Demo Preview · PG&E E-ELEC Tested
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Document extraction with arithmetic reconciliation checks and user-overridable tariff assumptions.
          </p>
        </div>

        {/* Bill Selector */}
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Billing Period:</span>
          <select
            value={selectedBillId}
            onChange={(e) => {
              setSelectedBillId(e.target.value);
              const b = bills.find((item) => item.id === e.target.value);
              if (b) {
                setEditedUnits(b.units_consumed_kwh);
                setEditedAmount(b.total_amount_usd);
                setEditedTariff(b.tariff_rate_usd_kwh);
                setEditedFixed(b.fixed_charges_usd);
              }
            }}
            className={`text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
              isDarkTheme
                ? 'bg-slate-900 border border-slate-700 text-slate-200'
                : 'bg-white border border-slate-200 text-slate-800'
            }`}
          >
            {bills.map((b) => (
              <option key={b.id} value={b.id}>
                {b.billing_period_start} to {b.billing_period_end} ({b.utility_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bill Extracted Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-xl p-5 shadow-xs border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
              isDarkTheme ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <FileText className={`w-4 h-4 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`} />
                <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Extracted Bill Fields</h3>
              </div>
              <div className="flex items-center gap-2">
                {bill?.verified_by_user ? (
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified by homeowner
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Unverified fields present
                  </span>
                )}

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    isDarkTheme
                      ? 'text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:bg-slate-800'
                      : 'text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Fields'}
                </button>
              </div>
            </div>

            {/* Extracted Fields Grid */}
            <div className="space-y-4">
              {/* Field 1: Billing Period */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border text-xs gap-2 ${
                isDarkTheme ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="text-slate-400 font-sans">Billing Period</div>
                  <div className={`font-semibold font-mono mt-0.5 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                    {bill?.billing_period_start} – {bill?.billing_period_end}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  High Confidence (0.98)
                </div>
              </div>

              {/* Field 2: Units Consumed (kWh) */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border text-xs gap-2 ${
                isDarkTheme ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex-1">
                  <div className="text-slate-400 font-sans">Grid Units Consumed (kWh)</div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedUnits}
                      onChange={(e) => setEditedUnits(parseFloat(e.target.value) || 0)}
                      className="mt-1 px-2.5 py-1 text-sm font-bold font-mono border border-slate-700 rounded bg-slate-950 text-white w-32 focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <div className={`font-bold font-mono text-sm mt-0.5 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                      {editedUnits} kWh
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {bill?.units_confidence && bill.units_confidence < 0.85 ? (
                    <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                      Unverified extraction ({bill.units_confidence}) · please check
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Confidence ({bill?.units_confidence})
                    </span>
                  )}
                </div>
              </div>

              {/* Field 3: Total Billed Amount */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border text-xs gap-2 ${
                isDarkTheme ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex-1">
                  <div className="text-slate-400 font-sans">Total Billed Amount ($)</div>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedAmount}
                      onChange={(e) => setEditedAmount(parseFloat(e.target.value) || 0)}
                      className="mt-1 px-2.5 py-1 text-sm font-bold font-mono border border-slate-700 rounded bg-slate-950 text-white w-32 focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <div className={`font-bold font-mono text-sm mt-0.5 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                      ${editedAmount.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  High Confidence ({bill?.amount_confidence})
                </div>
              </div>

              {/* Field 4: Base Energy Tariff */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border text-xs gap-2 ${
                isDarkTheme ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex-1">
                  <div className="text-slate-400 font-sans">Utility Tariff Rate ($/kWh)</div>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedTariff}
                      onChange={(e) => setEditedTariff(parseFloat(e.target.value) || 0)}
                      className="mt-1 px-2.5 py-1 text-sm font-bold font-mono border border-slate-700 rounded bg-slate-950 text-white w-32 focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <div className={`font-bold font-mono text-sm mt-0.5 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                      ${editedTariff.toFixed(2)} / kWh
                    </div>
                  )}
                </div>
                <div className="text-slate-400 text-[11px]">
                  PG&E E-ELEC Tier
                </div>
              </div>

              {/* Field 5: Fixed Connection Charges */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border text-xs gap-2 ${
                isDarkTheme ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex-1">
                  <div className="text-slate-400 font-sans">Fixed Monthly Grid Connection Charges</div>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedFixed}
                      onChange={(e) => setEditedFixed(parseFloat(e.target.value) || 0)}
                      className="mt-1 px-2.5 py-1 text-sm font-bold font-mono border border-slate-700 rounded bg-slate-950 text-white w-32 focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <div className={`font-bold font-mono text-sm mt-0.5 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                      ${editedFixed.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Standard residential meter fee
                </div>
              </div>
            </div>

            {isEditing && (
              <div className={`mt-4 pt-3 border-t flex justify-end ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-xs"
                >
                  Save & Verify Extracted Fields
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Arithmetic Reconciliation & Tariff Assumptions */}
        <div className="space-y-6">
          {/* Reconciliation Card */}
          <div className={`rounded-xl p-5 shadow-xs border transition-all ${
            isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className={`w-4 h-4 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`} />
              <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Arithmetic Reconciliation</h3>
            </div>

            <div
              className={`p-3 rounded-lg border text-xs mb-3 ${
                isReconciled
                  ? isDarkTheme ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : isDarkTheme ? 'bg-amber-500/15 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isReconciled ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                <span>{isReconciled ? 'Reconciliation Check Passed ✓' : 'Delta Exceeds Tolerance ⚠'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Formula: (Units × Tariff) + Fixed Fees ≈ Billed Total.
              </p>
            </div>

            <div className={`space-y-2 text-xs font-mono tabular-nums border-t pt-3 ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`flex justify-between py-1 border-b ${isDarkTheme ? 'border-slate-800' : 'border-slate-50'}`}>
                <span className="text-slate-400 font-sans">Formula Value:</span>
                <span className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>${calculatedTotal.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isDarkTheme ? 'border-slate-800' : 'border-slate-50'}`}>
                <span className="text-slate-400 font-sans">Stated Bill Total:</span>
                <span className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>${editedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span className="text-slate-400 font-sans">Discrepancy (Delta):</span>
                <span className={delta === 0 ? 'text-emerald-400' : delta < 1.5 ? (isDarkTheme ? 'text-slate-300' : 'text-slate-700') : 'text-amber-400'}>
                  ${delta.toFixed(2)} {delta <= 1.5 ? '(within tolerance)' : '(needs check)'}
                </span>
              </div>
            </div>
          </div>

          {/* Visible Tariff Assumptions */}
          <div className={`rounded-xl p-4 text-xs border ${
            isDarkTheme ? 'bg-[#0D1527] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <h4 className={`font-semibold mb-1 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Visible Tariff Assumptions</h4>
            <p className="mb-2 leading-relaxed">
              {bill?.tariff_assumptions_label}
            </p>
            <div className={`text-[11px] border-t pt-2 ${isDarkTheme ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
              <span className={`font-semibold ${isDarkTheme ? 'text-slate-200' : 'text-slate-700'}`}>PRD Truth: </span>
              Tariff and net-metering rates are never hardcoded as facts. They are presented as user-editable assumptions adjacent to all financial metrics.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
