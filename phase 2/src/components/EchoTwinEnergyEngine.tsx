import React, { useState, useEffect } from 'react';
import {
  Activity,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Sun,
  Zap,
  CloudSun,
  ShieldAlert,
  Home,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { SolarSystem, DeviationDecomposition } from '../types/solar';

interface EchoTwinEnergyEngineProps {
  system: SolarSystem;
  decomposition: DeviationDecomposition;
  onDrillAnomaly?: () => void;
}

type SimulationScenario = 'benchmark' | 'peak' | 'cloud';

export const EchoTwinEnergyEngine: React.FC<EchoTwinEnergyEngineProps> = ({
  system,
  onDrillAnomaly,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [scenario, setScenario] = useState<SimulationScenario>('benchmark');
  const [selectedNode, setSelectedNode] = useState<'sun' | 'physics' | 'weather' | 'core' | 'residual' | 'home'>('core');
  const [telemetryTick, setTelemetryTick] = useState<number>(0);

  // Real-time animation clock ticker for radar sweeps & particle cadence
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTelemetryTick((prev) => (prev + 1) % 360);
    }, 45);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Scenario telemetry state data
  const currentTelemetry = {
    benchmark: {
      title: 'Sep 22 Baseline Anomaly (08:24 AM)',
      status: 'Outlier Detected',
      statusColor: '#F59E0B',
      ghi: '840 W/m²',
      clearsky: '7.80 kW',
      weatherGap: '-0.30 kW',
      unexplainedGap: '-1.40 kW',
      acOutput: '6.10 kW',
      gridExport: '+4.2 kW',
      flowSpeed: 'fast',
      waveformFreq: '60.02 Hz',
      summary: 'Deterministic arithmetic identified 1.40 kW shortfall decoupled from cloud cover. Soiling remediation recommended.',
    },
    peak: {
      title: 'Nominal Peak Generation (12:30 PM)',
      status: 'Optimal Flow',
      statusColor: '#0284C7',
      ghi: '985 W/m²',
      clearsky: '9.45 kW',
      weatherGap: '-0.15 kW',
      unexplainedGap: '-0.10 kW',
      acOutput: '9.20 kW',
      gridExport: '+7.1 kW',
      flowSpeed: 'fastest',
      waveformFreq: '59.98 Hz',
      summary: 'Array performing at 97.4% of theoretical clear-sky ceiling. Zero action required.',
    },
    cloud: {
      title: 'Transient Cloud Cover Event (03:15 PM)',
      status: 'Atmospheric Derate',
      statusColor: '#0EA5E9',
      ghi: '410 W/m²',
      clearsky: '5.20 kW',
      weatherGap: '-3.80 kW',
      unexplainedGap: '-0.05 kW',
      acOutput: '1.35 kW',
      gridExport: '0.0 kW (Import 1.2 kW)',
      flowSpeed: 'slow',
      waveformFreq: '60.00 Hz',
      summary: 'Solar zenith exceeding 82°. System transitioning to grid-import mode.',
    },
  }[scenario];

  return (
    <div className="bg-white/85 backdrop-blur-md text-[#0B2545] rounded-3xl border border-sky-100/90 shadow-[0_12px_40px_rgba(2,132,199,0.08)] overflow-hidden mb-6 transition-all font-sans">
      {/* 1. Top Header Bar: Pure Blue Shades Theme */}
      <div className="px-4 sm:px-6 py-4 border-b border-sky-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span
              className="absolute w-3.5 h-3.5 rounded-full animate-ping opacity-75"
              style={{ backgroundColor: currentTelemetry.statusColor }}
            />
            <span
              className="relative w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentTelemetry.statusColor }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-[#0B2545] flex items-center gap-1.5">
                <span>SolarSense EchoTwin™ Energy Engine</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100/80 text-[#0284C7] border border-sky-200/80">
                Real-Time Telemetry Twin
              </span>
            </div>
            <p className="text-xs text-[#1E3A8A]/75 font-medium mt-0.5">
              Live physics-grounded energy flow animation & deterministic deviation decomposition.
            </p>
          </div>
        </div>

        {/* Play / Pause & Scenario Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap items-center bg-sky-50/80 border border-sky-200/80 p-1 rounded-xl text-xs gap-1">
            <button
              onClick={() => setScenario('benchmark')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all whitespace-nowrap font-bold text-xs ${
                scenario === 'benchmark'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                  : 'text-[#134074] hover:text-[#0284C7]'
              }`}
            >
              Sep 22 Anomaly
            </button>
            <button
              onClick={() => setScenario('peak')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all whitespace-nowrap font-bold text-xs ${
                scenario === 'peak'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-xs'
                  : 'text-[#134074] hover:text-[#0284C7]'
              }`}
            >
              Peak Noon
            </button>
            <button
              onClick={() => setScenario('cloud')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all whitespace-nowrap font-bold text-xs ${
                scenario === 'cloud'
                  ? 'bg-gradient-to-r from-sky-400 to-[#0284C7] text-white shadow-xs'
                  : 'text-[#134074] hover:text-[#0284C7]'
              }`}
            >
              Passing Cloud
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 text-[#134074] hover:text-[#0284C7] bg-white hover:bg-sky-50 rounded-xl border border-sky-200/80 transition-colors shadow-xs"
              title={isPlaying ? 'Pause Animation' : 'Play Animation'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-[#134074] hover:text-[#0284C7] bg-white hover:bg-sky-50 rounded-xl border border-sky-200/80 transition-colors shadow-xs"
              title={isExpanded ? 'Collapse' : 'Expand View'}
              aria-label="Toggle Full View"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Stage: Daytime Cloudy Sky Canvas */}
      <div className={`relative w-full ${isExpanded ? 'h-[460px] sm:h-[540px]' : 'h-[270px] sm:h-[370px]'} bg-gradient-to-b from-[#EBF5FD] via-[#F4F9FD] to-[#FFFFFF] overflow-hidden select-none transition-all`}>
        {/* Background Coordinate Tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c712_1px,transparent_1px),linear-gradient(to_bottom,#0284c712_1px,transparent_1px)] bg-[size:32px_32px] opacity-70 pointer-events-none" />

        {/* Ambient Radial Lighting Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full blur-[90px] opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: currentTelemetry.statusColor }}
        />

        {/* Circuit SVG Layer */}
        <svg viewBox="0 0 960 480" className="w-full h-full object-contain overflow-visible">
          <defs>
            {/* Luminous Gradients */}
            <linearGradient id="sunStream" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="physicsStream" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="actualStream" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing Core Filter */}
            <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ================= CONNECTING FLOW CONDUITS ================= */}
          {/* Path 1: Sun Node (x:130, y:240) to Physics Baseline Node (x:300, y:140) */}
          <path d="M 130 240 C 200 240, 220 140, 300 140" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <path
            d="M 130 240 C 200 240, 220 140, 300 140"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            className={isPlaying ? 'animate-dash-flow' : ''}
            strokeDasharray="6 6"
            opacity="0.85"
          />

          {/* Path 2: Sun Node (x:130, y:240) to Weather Derate Node (x:300, y:340) */}
          <path d="M 130 240 C 200 240, 220 340, 300 340" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <path
            d="M 130 240 C 200 240, 220 340, 300 340"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2"
            className={isPlaying ? 'animate-dash-flow' : ''}
            strokeDasharray="6 6"
            opacity="0.85"
          />

          {/* Path 3: Physics Node (x:300, y:140) to Central EchoTwin Core (x:480, y:240) */}
          <path d="M 300 140 C 380 140, 400 240, 480 240" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <path
            d="M 300 140 C 380 140, 400 240, 480 240"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2"
            className={isPlaying ? 'animate-dash-flow' : ''}
            strokeDasharray="6 6"
            opacity="0.85"
          />

          {/* Path 4: Weather Derate Node (x:300, y:340) to Central EchoTwin Core (x:480, y:240) */}
          <path d="M 300 340 C 380 340, 400 240, 480 240" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <path
            d="M 300 340 C 380 340, 400 240, 480 240"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            className={isPlaying ? 'animate-dash-flow' : ''}
            strokeDasharray="6 6"
            opacity="0.85"
          />

          {/* Path 5: Central Core (x:480, y:240) to Residual Anomaly Node (x:660, y:140) */}
          <path d="M 480 240 C 560 240, 580 140, 660 140" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <path
            d="M 480 240 C 560 240, 580 140, 660 140"
            fill="none"
            stroke={scenario === 'benchmark' ? '#F59E0B' : '#10B981'}
            strokeWidth="2.5"
            className={isPlaying ? 'animate-dash-flow' : ''}
            strokeDasharray="6 6"
            opacity="0.9"
          />

          {/* Path 6: Central Core (x:480, y:240) to Home / Grid Node (x:660, y:340) */}
          <path d="M 480 240 C 560 240, 580 340, 660 340" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <path
            d="M 480 240 C 560 240, 580 340, 660 340"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            className={isPlaying ? 'animate-dash-flow' : ''}
            strokeDasharray="6 6"
            opacity="0.85"
          />

          {/* Path 7: Residual Anomaly to Output Telemetry (x:660, y:140) -> (x:830, y:240) */}
          <path d="M 660 140 C 740 140, 760 240, 830 240" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <path
            d="M 660 140 C 740 140, 760 240, 830 240"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            className={isPlaying ? 'animate-dash-flow' : ''}
            strokeDasharray="6 6"
            opacity="0.8"
          />

          {/* Path 8: Home/Grid (x:660, y:340) -> (x:830, y:240) */}
          <path d="M 660 340 C 740 340, 760 240, 830 240" fill="none" stroke="#BAE6FD" strokeWidth="2.5" />
          <path
            d="M 660 340 C 740 340, 760 240, 830 240"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            className={isPlaying ? 'animate-dash-flow' : ''}
            strokeDasharray="6 6"
            opacity="0.8"
          />

          {/* ================= CENTRAL ECHOTWIN PROCESSING CORE ================= */}
          <g
            transform="translate(480, 240)"
            className="cursor-pointer"
            onClick={() => setSelectedNode('core')}
          >
            {/* Outer Pulsing Aura */}
            <circle
              r="76"
              fill="#0284C7"
              fillOpacity="0.08"
              className={isPlaying ? 'animate-pulse-glow' : ''}
            />

            {/* Counter-rotating dashed radar ring 1 */}
            <circle
              r="68"
              fill="none"
              stroke="#BAE6FD"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              className={isPlaying ? 'animate-spin-slow' : ''}
            />

            {/* Rotating dashed orbital ring 2 */}
            <circle
              r="54"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
              strokeDasharray="14 10 4 10"
              className={isPlaying ? 'animate-spin-slow-reverse' : ''}
              strokeOpacity="0.7"
            />

            {/* Radar scan sweep line */}
            {isPlaying && (
              <g transform={`rotate(${telemetryTick})`}>
                <line x1="0" y1="0" x2="52" y2="0" stroke="#0284C7" strokeWidth="1.5" strokeOpacity="0.8" />
                <circle cx="52" cy="0" r="2.5" fill="#0284C7" />
              </g>
            )}

            {/* Inner Core Surface */}
            <circle
              r="42"
              fill="#FFFFFF"
              stroke={selectedNode === 'core' ? '#0284C7' : '#BAE6FD'}
              strokeWidth="2.5"
              filter="url(#coreGlow)"
            />

            {/* Central Microprocessor Core Icon */}
            <g transform="translate(-14, -14)">
              <rect width="28" height="28" rx="6" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
              <path
                d="M 9 14 L 19 14 M 14 9 L 14 19 M 6 10 L 8 10 M 6 14 L 8 14 M 6 18 L 8 18 M 20 10 L 22 10 M 20 14 L 22 14 M 20 18 L 22 18"
                stroke="#0284C7"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </g>

            {/* Core Label */}
            <text
              y="23"
              textAnchor="middle"
              fill="#0B2545"
              fontSize="8"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              PV-TWIN CORE
            </text>
          </g>

          {/* ================= STAGE 1: SUNLIGHT & SATELLITE GHI ================= */}
          <g
            transform="translate(130, 240)"
            className="cursor-pointer"
            onClick={() => setSelectedNode('sun')}
          >
            <circle r="40" fill="#FFFFFF" stroke="#F59E0B" strokeWidth={selectedNode === 'sun' ? '2.5' : '1.5'} />
            <circle r="46" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 5" className={isPlaying ? 'animate-spin-slow' : ''} opacity="0.6" />
            <g transform="translate(-10, -18)">
              <circle cx="10" cy="10" r="6" fill="#F59E0B" />
              <line x1="10" y1="1" x2="10" y2="3" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="10" y1="17" x2="10" y2="19" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="1" y1="10" x2="3" y2="10" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="17" y1="10" x2="19" y2="10" stroke="#F59E0B" strokeWidth="1.5" />
            </g>
            <text y="7" textAnchor="middle" fill="#0B2545" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              {currentTelemetry.ghi}
            </text>
            <text y="19" textAnchor="middle" fill="#134074" fontSize="7" fontFamily="sans-serif" fontWeight="semibold">
              Solar Irradiance
            </text>
          </g>

          {/* ================= STAGE 2: PHYSICAL CLEAR-SKY GEOMETRY ================= */}
          <g
            transform="translate(300, 140)"
            className="cursor-pointer"
            onClick={() => setSelectedNode('physics')}
          >
            <circle r="36" fill="#FFFFFF" stroke="#0284C7" strokeWidth={selectedNode === 'physics' ? '2.5' : '1.5'} strokeDasharray="4 2" />
            <text y="-8" textAnchor="middle" fill="#0284C7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
              pvlib Baseline
            </text>
            <text y="6" textAnchor="middle" fill="#0B2545" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              {currentTelemetry.clearsky}
            </text>
            <text y="18" textAnchor="middle" fill="#1E3A8A" fontSize="7" fontFamily="sans-serif">
              Geometry Max
            </text>
          </g>

          {/* ================= STAGE 3: ATMOSPHERIC CLOUD DERATE ================= */}
          <g
            transform="translate(300, 340)"
            className="cursor-pointer"
            onClick={() => setSelectedNode('weather')}
          >
            <circle r="36" fill="#FFFFFF" stroke="#38BDF8" strokeWidth={selectedNode === 'weather' ? '2.5' : '1.5'} />
            <text y="-8" textAnchor="middle" fill="#0284C7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
              Cloud Derate
            </text>
            <text y="6" textAnchor="middle" fill="#0B2545" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              {currentTelemetry.weatherGap}
            </text>
            <text y="18" textAnchor="middle" fill="#1E3A8A" fontSize="7" fontFamily="sans-serif">
              Atmospheric Loss
            </text>
          </g>

          {/* ================= STAGE 4: RESIDUAL ANOMALY DECOMPOSITION ================= */}
          <g
            transform="translate(660, 140)"
            className="cursor-pointer"
            onClick={() => setSelectedNode('residual')}
          >
            <circle
              r="38"
              fill="#FFFFFF"
              stroke={scenario === 'benchmark' ? '#F59E0B' : '#10B981'}
              strokeWidth={selectedNode === 'residual' ? '2.5' : '1.5'}
            />
            {scenario === 'benchmark' && (
              <circle
                r="44"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.5"
                className={isPlaying ? 'animate-ping-subtle' : ''}
              />
            )}
            <text y="-8" textAnchor="middle" fill={scenario === 'benchmark' ? '#F59E0B' : '#10B981'} fontSize="8" fontFamily="sans-serif" fontWeight="bold">
              {scenario === 'benchmark' ? 'Unexplained Signal' : 'Nominal Residue'}
            </text>
            <text y="6" textAnchor="middle" fill="#0B2545" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              {currentTelemetry.unexplainedGap}
            </text>
            <text y="18" textAnchor="middle" fill="#134074" fontSize="7" fontFamily="sans-serif">
              {scenario === 'benchmark' ? 'Soiling Outlier' : 'Within Tolerance'}
            </text>
          </g>

          {/* ================= STAGE 5: HOME & GRID INVERTER FLOW ================= */}
          <g
            transform="translate(660, 340)"
            className="cursor-pointer"
            onClick={() => setSelectedNode('home')}
          >
            <circle r="36" fill="#FFFFFF" stroke="#10B981" strokeWidth={selectedNode === 'home' ? '2.5' : '1.5'} />
            <text y="-8" textAnchor="middle" fill="#059669" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
              AC Generation
            </text>
            <text y="6" textAnchor="middle" fill="#0B2545" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              {currentTelemetry.acOutput}
            </text>
            <text y="18" textAnchor="middle" fill="#134074" fontSize="7" fontFamily="sans-serif">
              Grid: {currentTelemetry.gridExport}
            </text>
          </g>

          {/* ================= STAGE 6: DECISION & ACTION TERMINAL ================= */}
          <g
            transform="translate(830, 240)"
            className="cursor-pointer"
            onClick={() => {
              if (onDrillAnomaly) onDrillAnomaly();
            }}
          >
            <rect x="-42" y="-32" width="84" height="64" rx="12" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.8" />
            <text y="-12" textAnchor="middle" fill="#134074" fontSize="8" fontFamily="sans-serif" fontWeight="semibold">
              Action Verdict
            </text>
            <text y="4" textAnchor="middle" fill={scenario === 'benchmark' ? '#D97706' : '#059669'} fontSize="9" fontFamily="sans-serif" fontWeight="bold">
              {scenario === 'benchmark' ? 'Rinse Panels' : 'Optimal Grid'}
            </text>
            <text y="18" textAnchor="middle" fill="#0284C7" fontSize="7" fontFamily="sans-serif" fontWeight="bold">
              Tap to Inspect →
            </text>
          </g>
        </svg>

        {/* Floating Telemetry Waveform Oscilloscope HUD (Bottom Left) */}
        <div className="absolute bottom-3 left-4 bg-white/90 border border-sky-200/80 rounded-xl p-2.5 backdrop-blur-md hidden sm:block text-[11px] shadow-xs">
          <div className="flex items-center justify-between gap-4 text-[#134074] mb-1 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-[#0B2545]">
              <Activity className="w-3 h-3 text-[#0284C7]" />
              <span>AC Grid Inverter Telemetry</span>
            </span>
            <span className="text-emerald-600 font-bold">{currentTelemetry.waveformFreq}</span>
          </div>
          {/* Animated Mini Oscilloscope Canvas */}
          <div className="w-48 h-6 flex items-center overflow-hidden">
            <svg viewBox="0 0 200 30" className="w-full h-full">
              <path
                d="M 0 15 Q 25 0, 50 15 T 100 15 T 150 15 T 200 15"
                fill="none"
                stroke="#0284C7"
                strokeWidth="1.8"
                className={isPlaying ? 'animate-dash-flow-fast' : ''}
                strokeDasharray="4 2"
              />
            </svg>
          </div>
        </div>

        {/* Live Active Scenario Banner (Top Right HUD - hidden on small mobile) */}
        <div className="absolute top-3 right-4 bg-white/90 border border-sky-200/80 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 backdrop-blur-md text-[11px] sm:text-xs hidden sm:flex items-center gap-1.5 sm:gap-2 shadow-xs">
          <span className="text-[#134074] font-medium">Simulation:</span>
          <span className="font-bold text-[#0B2545] truncate max-w-[200px]">{currentTelemetry.title}</span>
        </div>
      </div>

      {/* 3. Interactive Detail Drawer for Selected Node: Pure Blue Theme */}
      <div className="p-3.5 sm:p-5 bg-sky-50/70 border-t border-sky-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-sky-200/80 flex items-center justify-center shrink-0 mt-0.5 text-[#0284C7] shadow-xs">
            {selectedNode === 'core' && <Cpu className="w-4 h-4 text-[#0284C7]" />}
            {selectedNode === 'sun' && <Sun className="w-4 h-4 text-amber-500" />}
            {selectedNode === 'physics' && <Zap className="w-4 h-4 text-[#0284C7]" />}
            {selectedNode === 'weather' && <CloudSun className="w-4 h-4 text-[#0284C7]" />}
            {selectedNode === 'residual' && <ShieldAlert className="w-4 h-4 text-amber-500" />}
            {selectedNode === 'home' && <Home className="w-4 h-4 text-emerald-600" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0B2545] capitalize text-sm">
                {selectedNode === 'core' ? 'SolarSense EchoTwin Engine' : `${selectedNode} Telemetry Node`}
              </span>
              <span className="text-sky-300">·</span>
              <span className="text-[#1E3A8A]/80 font-medium">
                {selectedNode === 'core' && 'Deterministic Arithmetic Model'}
                {selectedNode === 'sun' && 'GOES-18 Satellite GHI Feed'}
                {selectedNode === 'physics' && `pvlib Geometric Formulation (${system.tilt_deg}° tilt, ${system.azimuth_deg}° Azimuth)`}
                {selectedNode === 'weather' && 'Atmospheric Cloud Transmittance Filter'}
                {selectedNode === 'residual' && 'Statistical Outlier Decomposition'}
                {selectedNode === 'home' && 'SolarEdge Grid Inverter Feed'}
              </span>
            </div>
            <p className="text-[#134074] mt-1 max-w-3xl leading-relaxed font-medium">
              {currentTelemetry.summary}
            </p>
          </div>
        </div>

        {/* Drill-down CTA */}
        {onDrillAnomaly && (
          <button
            onClick={onDrillAnomaly}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B2545] via-[#0284C7] to-[#38BDF8] hover:from-[#081C33] hover:via-[#0369A1] hover:to-[#0EA5E9] text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-[0_4px_16px_rgba(2,132,199,0.25)] active:scale-95"
          >
            <span>Inspect Tuesday Breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
