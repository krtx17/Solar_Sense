import React, { useState } from 'react';
import { Table, BarChart2, AlertCircle, Info } from 'lucide-react';
import { ReadingPoint, DaySummary, ForecastPoint } from '../types/solar';

type ChartTimeRange = 'today' | 'week' | 'forecast';

interface GenerationChartProps {
  timeRange: ChartTimeRange;
  onTimeRangeChange: (range: ChartTimeRange) => void;
  todayReadings: ReadingPoint[];
  weekDays: DaySummary[];
  forecastPoints: ForecastPoint[];
  onSelectAnomaly: (anomalyId: string) => void;
  isDarkTheme?: boolean;
}

export const GenerationChart: React.FC<GenerationChartProps> = ({
  timeRange,
  onTimeRangeChange,
  todayReadings,
  weekDays,
  forecastPoints,
  onSelectAnomaly,
  isDarkTheme = true,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTableView, setShowTableView] = useState<boolean>(false);

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  // Render chart data based on active range
  if (timeRange === 'today') {
    // 24 hours readings
    const maxVal = Math.max(8, ...todayReadings.map((r) => Math.max(r.clearsky_kwh, r.weather_adjusted_kwh, r.kwh))) * 1.15;
    const xStep = chartW / (todayReadings.length - 1);

    const getX = (idx: number) => padding.left + idx * xStep;
    const getY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

    const clearskyPoints = todayReadings.map((r, i) => `${getX(i)},${getY(r.clearsky_kwh)}`).join(' ');
    const weatherPoints = todayReadings.map((r, i) => `${getX(i)},${getY(r.weather_adjusted_kwh)}`).join(' ');
    const actualPoints = todayReadings.map((r, i) => `${getX(i)},${getY(r.kwh)}`).join(' ');

    const actualArea = `${actualPoints} ${padding.left + chartW},${padding.top + chartH} ${padding.left},${padding.top + chartH}`;

    const activeItem = hoverIndex !== null ? todayReadings[hoverIndex] : todayReadings[13]; // Default to 1 PM

    return (
      <div className={`rounded-xl p-5 border transition-all ${
        isDarkTheme
          ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.3)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Generation vs. Clear-Sky Physical Baseline</h3>
              <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>· Today (Hourly kW/kWh)</span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Comparing observed output against the geometric clear-sky ceiling and weather derate.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Range Selector */}
            <div className={`flex items-center p-0.5 rounded-lg border ${
              isDarkTheme ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => onTimeRangeChange('today')}
                className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                  isDarkTheme ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white text-slate-900 font-medium shadow-xs'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => onTimeRangeChange('week')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past 7 Days
              </button>
              <button
                onClick={() => onTimeRangeChange('forecast')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Forecast
              </button>
            </div>

            {/* Table Toggle */}
            <button
              onClick={() => setShowTableView(!showTableView)}
              className={`p-1.5 rounded-md border transition-colors ${
                isDarkTheme
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={showTableView ? 'Switch to chart' : 'Switch to accessible table'}
              aria-label="Toggle accessible table view"
            >
              {showTableView ? <BarChart2 className="w-4 h-4" /> : <Table className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs mb-3 pb-2 border-b border-slate-100 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-500" />
            <span>Clear-Sky Physical Baseline (pvlib)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-sky-500" />
            <span>Weather-Adjusted Expected (Cloud Derate)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1.5 rounded-xs bg-emerald-500" />
            <span>Actual Generation (kWh)</span>
          </div>
        </div>

        {/* Chart or Table View */}
        {showTableView ? (
          <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2 text-right">Actual kWh</th>
                  <th className="px-3 py-2 text-right">Weather Expected</th>
                  <th className="px-3 py-2 text-right">Clear-Sky Baseline</th>
                  <th className="px-3 py-2 text-right">Cloud Cover</th>
                  <th className="px-3 py-2 text-right">Peak kW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {todayReadings.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="px-3 py-1.5 font-sans">{r.local_time_label}</td>
                    <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{r.kwh.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right text-sky-700">{r.weather_adjusted_kwh.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right text-slate-600">{r.clearsky_kwh.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right text-slate-500">{r.cloud_cover_pct}%</td>
                    <td className="px-3 py-1.5 text-right text-slate-800">{r.kw_peak.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Y Gridlines & Labels */}
              {[0, 2, 4, 6, 8].map((val) => {
                if (val > maxVal) return null;
                const y = getY(val);
                return (
                  <g key={val}>
                    <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={padding.left - 8} y={y + 3.5} textAnchor="end" className="text-[10px] fill-slate-400 font-mono tabular-nums">
                      {val} kW
                    </text>
                  </g>
                );
              })}

              {/* X Axis Ticks */}
              {todayReadings.map((r, i) => {
                if (i % 3 !== 0) return null;
                const x = getX(i);
                return (
                  <g key={i}>
                    <line x1={x} y1={padding.top + chartH} x2={x} y2={padding.top + chartH + 5} stroke="#CBD5E1" strokeWidth="1" />
                    <text x={x} y={padding.top + chartH + 16} textAnchor="middle" className="text-[10px] fill-slate-500">
                      {r.local_time_label}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area for Actual */}
              <polygon points={actualArea} fill="#22C55E" fillOpacity="0.12" />

              {/* Clear-Sky Line (Dashed Slate) */}
              <polyline points={clearskyPoints} fill="none" stroke="#64748B" strokeWidth="1.8" strokeDasharray="4 4" />

              {/* Weather-Adjusted Line (Sky Blue) */}
              <polyline points={weatherPoints} fill="none" stroke="#0284C7" strokeWidth="2" />

              {/* Actual Output Line (Bold Emerald) */}
              <polyline points={actualPoints} fill="none" stroke="#16A34A" strokeWidth="2.4" />

              {/* Interactive Hover Columns & Markers */}
              {todayReadings.map((r, i) => {
                const x = getX(i);
                return (
                  <rect
                    key={i}
                    x={x - xStep / 2}
                    y={padding.top}
                    width={xStep}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                  />
                );
              })}

              {/* Active Crosshair */}
              {hoverIndex !== null && (
                <g>
                  <line
                    x1={getX(hoverIndex)}
                    y1={padding.top}
                    x2={getX(hoverIndex)}
                    y2={padding.top + chartH}
                    stroke="#94A3B8"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                  <circle cx={getX(hoverIndex)} cy={getY(todayReadings[hoverIndex].kwh)} r="4" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
                </g>
              )}
            </svg>

            {/* Hover Tooltip Card */}
            {activeItem && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="font-semibold text-slate-800">{activeItem.local_time_label} Snapshot:</div>
                <div className="flex items-center gap-4 font-mono tabular-nums">
                  <div>
                    <span className="text-slate-500 font-sans">Actual: </span>
                    <span className="font-bold text-emerald-700">{activeItem.kwh.toFixed(2)} kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Weather Exp: </span>
                    <span className="font-bold text-sky-700">{activeItem.weather_adjusted_kwh.toFixed(2)} kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Clear-Sky: </span>
                    <span className="font-bold text-slate-700">{activeItem.clearsky_kwh.toFixed(2)} kWh</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-slate-500 font-sans">Clouds: </span>
                    <span>{activeItem.cloud_cover_pct}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // PAST 7 DAYS VIEW WITH TUESDAY BENCHMARK ANOMALY
  // -------------------------------------------------------------------------
  if (timeRange === 'week') {
    const maxVal = Math.max(30, ...weekDays.map((d) => Math.max(d.clearsky_kwh, d.weather_adjusted_kwh, d.actual_kwh))) * 1.15;
    const xStep = chartW / (weekDays.length - 1);

    const getX = (idx: number) => padding.left + idx * xStep;
    const getY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

    const clearskyPoints = weekDays.map((d, i) => `${getX(i)},${getY(d.clearsky_kwh)}`).join(' ');
    const weatherPoints = weekDays.map((d, i) => `${getX(i)},${getY(d.weather_adjusted_kwh)}`).join(' ');
    const actualPoints = weekDays.map((d, i) => `${getX(i)},${getY(d.actual_kwh)}`).join(' ');

    const actualArea = `${actualPoints} ${padding.left + chartW},${padding.top + chartH} ${padding.left},${padding.top + chartH}`;
    const activeItem = hoverIndex !== null ? weekDays[hoverIndex] : weekDays[4]; // Default to Tuesday anomaly

    return (
      <div className={`rounded-xl p-5 border transition-all ${
        isDarkTheme
          ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.3)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>7-Day Trailing Generation & Anomaly Flags</h3>
              <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>· Daily Totals (kWh)</span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Notice Tuesday Sep 22: -2.4 kWh unexplained statistical outlier flagging a panel soiling condition.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center p-0.5 rounded-lg border ${
              isDarkTheme ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => onTimeRangeChange('today')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => onTimeRangeChange('week')}
                className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                  isDarkTheme ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white text-slate-900 font-medium shadow-xs'
                }`}
              >
                Past 7 Days
              </button>
              <button
                onClick={() => onTimeRangeChange('forecast')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Forecast
              </button>
            </div>

            <button
              onClick={() => setShowTableView(!showTableView)}
              className={`p-1.5 rounded-md border transition-colors ${
                isDarkTheme
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={showTableView ? 'Switch to chart' : 'Switch to accessible table'}
              aria-label="Toggle accessible table view"
            >
              {showTableView ? <BarChart2 className="w-4 h-4" /> : <Table className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs mb-3 pb-2 border-b border-slate-100 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-500" />
            <span>Clear-Sky Baseline (pvlib physics reference)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-sky-500" />
            <span>Weather-Adjusted Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1.5 rounded-xs bg-emerald-500" />
            <span>Actual Generation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300" />
            <span className="font-medium text-amber-900">Unexplained Anomaly Flag</span>
          </div>
        </div>

        {showTableView ? (
          <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">Actual kWh</th>
                  <th className="px-3 py-2 text-right">Weather Exp</th>
                  <th className="px-3 py-2 text-right">Clear-Sky</th>
                  <th className="px-3 py-2 text-right">Weather Gap</th>
                  <th className="px-3 py-2 text-right">Unexplained Gap</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {weekDays.map((d, i) => (
                  <tr key={i} className={`hover:bg-slate-50/80 ${d.is_anomaly ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-3 py-1.5 font-sans font-medium">{d.day_label}</td>
                    <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{d.actual_kwh.toFixed(1)}</td>
                    <td className="px-3 py-1.5 text-right text-sky-700">{d.weather_adjusted_kwh.toFixed(1)}</td>
                    <td className="px-3 py-1.5 text-right text-slate-600">{d.clearsky_kwh.toFixed(1)}</td>
                    <td className="px-3 py-1.5 text-right text-sky-800">{d.weather_explained_kwh.toFixed(1)} kWh</td>
                    <td className={`px-3 py-1.5 text-right font-bold ${d.is_anomaly ? 'text-amber-800' : 'text-slate-500'}`}>
                      {d.unexplained_kwh.toFixed(1)} kWh
                    </td>
                    <td className="px-3 py-1.5 text-center font-sans">
                      {d.is_anomaly ? (
                        <button
                          onClick={() => d.anomaly_id && onSelectAnomaly(d.anomaly_id)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded transition-colors"
                        >
                          Inspect Anomaly →
                        </button>
                      ) : (
                        <span className="text-slate-400">Nominal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => setHoverIndex(null)}
            >
              {[0, 10, 20, 25, 30].map((val) => {
                if (val > maxVal) return null;
                const y = getY(val);
                return (
                  <g key={val}>
                    <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={padding.left - 8} y={y + 3.5} textAnchor="end" className="text-[10px] fill-slate-400 font-mono tabular-nums">
                      {val} kWh
                    </text>
                  </g>
                );
              })}

              {weekDays.map((d, i) => {
                const x = getX(i);
                return (
                  <g key={i}>
                    <line x1={x} y1={padding.top + chartH} x2={x} y2={padding.top + chartH + 5} stroke="#CBD5E1" strokeWidth="1" />
                    <text x={x} y={padding.top + chartH + 16} textAnchor="middle" className="text-[10px] fill-slate-600 font-medium">
                      {d.day_label.split(',')[0]}
                    </text>
                  </g>
                );
              })}

              <polygon points={actualArea} fill="#22C55E" fillOpacity="0.12" />
              <polyline points={clearskyPoints} fill="none" stroke="#64748B" strokeWidth="1.8" strokeDasharray="4 4" />
              <polyline points={weatherPoints} fill="none" stroke="#0284C7" strokeWidth="2" />
              <polyline points={actualPoints} fill="none" stroke="#16A34A" strokeWidth="2.4" />

              {/* Anomaly Marker on Tuesday */}
              {weekDays.map((d, i) => {
                const x = getX(i);
                const y = getY(d.actual_kwh);
                if (!d.is_anomaly) return null;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => d.anomaly_id && onSelectAnomaly(d.anomaly_id)}>
                    <circle cx={x} cy={y} r="10" fill="#F59E0B" fillOpacity="0.25" className="animate-ping" />
                    <circle cx={x} cy={y} r="6" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
                    <text x={x} y={y - 12} textAnchor="middle" className="text-[10px] font-bold fill-amber-900 bg-white">
                      -2.4 kWh Unexplained ⚠
                    </text>
                  </g>
                );
              })}

              {/* Hover Rectangles */}
              {weekDays.map((d, i) => {
                const x = getX(i);
                return (
                  <rect
                    key={i}
                    x={x - xStep / 2}
                    y={padding.top}
                    width={xStep}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                  />
                );
              })}

              {hoverIndex !== null && (
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={padding.top + chartH}
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
              )}
            </svg>

            {activeItem && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{activeItem.day_label}:</span>{' '}
                  <span className="text-slate-600">
                    {activeItem.is_anomaly ? 'Outlier flagged: Unexplained drop exceeds 30-day statistical threshold.' : 'Nominal operation tracking weather.'}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono tabular-nums">
                  <div>
                    <span className="text-slate-500 font-sans">Actual: </span>
                    <span className="font-bold text-emerald-700">{activeItem.actual_kwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Clear-Sky: </span>
                    <span className="font-bold text-slate-700">{activeItem.clearsky_kwh} kWh</span>
                  </div>
                  {activeItem.is_anomaly && (
                    <button
                      onClick={() => activeItem.anomaly_id && onSelectAnomaly(activeItem.anomaly_id)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors font-sans shadow-xs"
                    >
                      Why did this happen? →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 7-DAY FORECAST VIEW WITH PREDICTION INTERVALS
  // -------------------------------------------------------------------------
  const maxVal = Math.max(30, ...forecastPoints.map((f) => Math.max(f.clearsky_kwh, f.predicted_kwh_high))) * 1.15;
  const xStep = chartW / (forecastPoints.length - 1);
  const getX = (idx: number) => padding.left + idx * xStep;
  const getY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

  const clearskyPoints = forecastPoints.map((f, i) => `${getX(i)},${getY(f.clearsky_kwh)}`).join(' ');
  const forecastMeanPoints = forecastPoints.map((f, i) => `${getX(i)},${getY(f.predicted_kwh)}`).join(' ');

  // Prediction interval polygon: top edge (high) + bottom edge reversed (low)
  const highPoints = forecastPoints.map((f, i) => `${getX(i)},${getY(f.predicted_kwh_high)}`);
  const lowPointsReversed = forecastPoints
    .map((f, i) => `${getX(i)},${getY(f.predicted_kwh_low)}`)
    .reverse();
  const intervalPolygon = `${highPoints.join(' ')} ${lowPointsReversed.join(' ')}`;

  const activeForecast = hoverIndex !== null ? forecastPoints[hoverIndex] : forecastPoints[0];

  return (
    <div className={`rounded-xl p-5 border transition-all ${
      isDarkTheme
        ? 'bg-[#0B1322] border-slate-800 text-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.3)]'
        : 'bg-white border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>7-Day ML Generation Forecast & Prediction Intervals</h3>
            <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>· Future Estimates</span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Calibrated prediction intervals [10th–90th percentile] from weather-vintage gradient boosted models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isDarkTheme ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => onTimeRangeChange('today')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onTimeRangeChange('week')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => onTimeRangeChange('forecast')}
              className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                isDarkTheme ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white text-slate-900 font-medium shadow-xs'
              }`}
            >
              7-Day Forecast
            </button>
          </div>

          <button
            onClick={() => setShowTableView(!showTableView)}
            className={`p-1.5 rounded-md border transition-colors ${
              isDarkTheme
                ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle table view"
            aria-label="Toggle accessible table view"
          >
            {showTableView ? <BarChart2 className="w-4 h-4" /> : <Table className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-3 pb-2 border-b border-slate-100 text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-500" />
          <span>Clear-Sky Physical Max (Theoretical Limit)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-amber-500" />
          <span>ML Point Forecast (Expected Value)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-amber-400/20 border border-amber-400/40 rounded-xs" />
          <span>Calibrated Prediction Interval (10%–90% Coverage)</span>
        </div>
      </div>

      {showTableView ? (
        <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Predicted (Mean)</th>
                <th className="px-3 py-2 text-right">10% Low Bound</th>
                <th className="px-3 py-2 text-right">90% High Bound</th>
                <th className="px-3 py-2 text-right">Clear-Sky Reference</th>
                <th className="px-3 py-2">Best Appliance Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {forecastPoints.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50/80">
                  <td className="px-3 py-1.5 font-sans font-medium">{f.day_label}</td>
                  <td className="px-3 py-1.5 text-right font-bold text-amber-700">{f.predicted_kwh.toFixed(1)} kWh</td>
                  <td className="px-3 py-1.5 text-right text-slate-500">{f.predicted_kwh_low.toFixed(1)} kWh</td>
                  <td className="px-3 py-1.5 text-right text-slate-500">{f.predicted_kwh_high.toFixed(1)} kWh</td>
                  <td className="px-3 py-1.5 text-right text-slate-700">{f.clearsky_kwh.toFixed(1)} kWh</td>
                  <td className="px-3 py-1.5 font-sans text-slate-700 font-medium">{f.recommended_appliance_window}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {[0, 10, 20, 25, 30].map((val) => {
              if (val > maxVal) return null;
              const y = getY(val);
              return (
                <g key={val}>
                  <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
                  <text x={padding.left - 8} y={y + 3.5} textAnchor="end" className="text-[10px] fill-slate-400 font-mono tabular-nums">
                    {val} kWh
                  </text>
                </g>
              );
            })}

            {forecastPoints.map((f, i) => {
              const x = getX(i);
              return (
                <g key={i}>
                  <line x1={x} y1={padding.top + chartH} x2={x} y2={padding.top + chartH + 5} stroke="#CBD5E1" strokeWidth="1" />
                  <text x={x} y={padding.top + chartH + 16} textAnchor="middle" className="text-[10px] fill-slate-600 font-medium">
                    {f.day_label.split(',')[0]}
                  </text>
                </g>
              );
            })}

            {/* Shaded Prediction Interval Band */}
            <polygon points={intervalPolygon} fill="#F59E0B" fillOpacity="0.15" />

            {/* Clear-Sky Upper Limit (Dashed Slate) */}
            <polyline points={clearskyPoints} fill="none" stroke="#64748B" strokeWidth="1.8" strokeDasharray="4 4" />

            {/* Forecast Mean Line (Amber) */}
            <polyline points={forecastMeanPoints} fill="none" stroke="#D97706" strokeWidth="2.2" />

            {/* Hover Target Columns */}
            {forecastPoints.map((f, i) => {
              const x = getX(i);
              return (
                <rect
                  key={i}
                  x={x - xStep / 2}
                  y={padding.top}
                  width={xStep}
                  height={chartH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              );
            })}

            {hoverIndex !== null && (
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + chartH}
                stroke="#94A3B8"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
            )}
          </svg>

          {activeForecast && (
            <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-amber-950">{activeForecast.day_label}: </span>
                <span className="text-amber-900">
                  Predicted {activeForecast.predicted_kwh} kWh (Interval: {activeForecast.predicted_kwh_low} – {activeForecast.predicted_kwh_high} kWh)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-800">Best Solar Window:</span>
                <span className="px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded font-medium">
                  {activeForecast.recommended_appliance_window}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
