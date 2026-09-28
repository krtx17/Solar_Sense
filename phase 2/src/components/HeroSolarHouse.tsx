import React, { useState, useEffect } from 'react';
import {
  Sun,
  Home as HomeIcon,
  BatteryCharging,
  Zap,
  RotateCw,
  Play,
  Pause,
  TrendingUp,
  X,
  ChevronRight,
  CheckCircle2,
  Box,
} from 'lucide-react';
import { ThreeHouseScene } from './ThreeHouseScene';
import { SolarSystem, DeviationDecomposition } from '../types/solar';
import { calculateClearSkyKwh } from '../services/solarDataService';

interface HeroSolarHouseProps {
  system: SolarSystem;
  decomposition: DeviationDecomposition;
  activeHour: number;
  onHourChange: (hour: number) => void;
  onNavigateTab: (tab: 'home' | 'solar' | 'battery' | 'grid' | 'analytics' | 'settings') => void;
  onOpenDecompositionModal?: () => void;
  isCopilotOpen?: boolean;
  onCloseCopilot?: () => void;
}

export const HeroSolarHouse: React.FC<HeroSolarHouseProps> = ({
  system,
  decomposition,
  activeHour,
  onHourChange,
  onNavigateTab,
  onOpenDecompositionModal,
  isCopilotOpen,
  onCloseCopilot,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [activeDrawer, setActiveDrawer] = useState<'solar' | 'house' | 'battery' | 'grid' | 'today' | null>(null);

  // Close active drawer if Copilot is opened to avoid overlapping
  useEffect(() => {
    if (isCopilotOpen) {
      setActiveDrawer(null);
    }
  }, [isCopilotOpen]);

  // Open drawer and ensure Copilot is closed
  const handleOpenDrawer = (drawer: 'solar' | 'house' | 'battery' | 'grid' | 'today') => {
    if (onCloseCopilot) onCloseCopilot();
    setActiveDrawer(drawer);
  };

  // Time formatting (e.g. 8.4 -> "08:24 AM")
  const formatTime = (hourFloat: number) => {
    const totalMinutes = Math.round(hourFloat * 60);
    let hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const strHours = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
    return `${strHours}:${strMinutes} ${ampm}`;
  };

  // Automatic daylight cycle animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onHourChange((activeHour + 0.1) % 24);
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying, activeHour, onHourChange]);

  // Real-time Solar Physics Calculations
  const isDay = activeHour >= 5.75 && activeHour <= 19.25;
  const clearskyKw = calculateClearSkyKwh(system.capacity_kw, system.tilt_deg, Math.floor(activeHour));
  const fraction = activeHour - Math.floor(activeHour);
  const nextClearskyKw = calculateClearSkyKwh(system.capacity_kw, system.tilt_deg, (Math.floor(activeHour) + 1) % 24);
  const baseSolarKw = clearskyKw + (nextClearskyKw - clearskyKw) * fraction;
  const solarGenKw = isDay ? Math.max(0, Math.round(baseSolarKw * 0.88 * 100) / 100) : 0;

  // Typical Residential Home Usage Profile
  let homeUsageKw = 1.9;
  if (activeHour >= 6.5 && activeHour <= 9.0) {
    homeUsageKw = 2.1;
  } else if (activeHour > 9.0 && activeHour < 16.5) {
    homeUsageKw = 1.8;
  } else if (activeHour >= 16.5 && activeHour <= 21.5) {
    homeUsageKw = 3.3;
  } else {
    homeUsageKw = 0.9;
  }

  // Energy distribution: Solar -> Home -> Battery -> Grid
  const surplus = solarGenKw - homeUsageKw;
  let batteryChargingKw = 0;
  let batteryDischargingKw = 0;
  let gridExportKw = 0;
  let gridImportKw = 0;

  // Battery State of Charge (SoC) %
  let batteryPct = 68;
  if (activeHour >= 6 && activeHour < 12) {
    batteryPct = Math.round(52 + ((activeHour - 6) / 6) * 32);
  } else if (activeHour >= 12 && activeHour < 16) {
    batteryPct = Math.round(84 + ((activeHour - 12) / 4) * 14);
  } else if (activeHour >= 16 && activeHour < 22) {
    batteryPct = Math.round(98 - ((activeHour - 16) / 6) * 36);
  } else {
    batteryPct = Math.round(62 - ((activeHour >= 22 ? activeHour - 22 : activeHour + 2) / 8) * 16);
  }

  if (surplus > 0) {
    if (batteryPct < 98) {
      batteryChargingKw = Math.min(surplus * 0.45, 3.5);
      gridExportKw = Math.max(0, Math.round((surplus - batteryChargingKw) * 100) / 100);
    } else {
      gridExportKw = Math.round(surplus * 100) / 100;
    }
  } else {
    const deficit = Math.abs(surplus);
    if (batteryPct > 20) {
      batteryDischargingKw = Math.min(deficit * 0.75, 3.2);
      gridImportKw = Math.max(0, Math.round((deficit - batteryDischargingKw) * 100) / 100);
    } else {
      gridImportKw = Math.round(deficit * 100) / 100;
    }
  }

  const cumulativeTodayKwh = Math.round((Math.min(activeHour / 14, 1.0) * 21.4 + 1.2) * 10) / 10;

  // Day & Night atmospheric sky colors
  const isNight = activeHour < 5.5 || activeHour > 20.0;
  const isSunset = activeHour >= 17.5 && activeHour <= 20.0;
  const isMorning = activeHour >= 5.5 && activeHour < 10.5;

  let skyGradient = 'from-[#EBF3FA] via-[#F4F8FC] to-[#FAF8F5]';
  if (isNight) {
    skyGradient = 'from-[#0B1322] via-[#0D1728] to-[#080E18]';
  } else if (isSunset) {
    skyGradient = 'from-[#FBCFE8]/50 via-[#FED7AA]/60 to-[#FFEDD5]/80';
  } else if (isMorning) {
    skyGradient = 'from-[#E0EFFE] via-[#F0F7FF] to-[#FFFBEB]';
  } else {
    skyGradient = 'from-[#BAE6FD]/40 via-[#E0F2FE]/50 to-[#F8FAFC]';
  }

  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] min-h-[560px] sm:min-h-[620px] overflow-hidden select-none bg-[#FAF8F5] transition-colors duration-700 flex flex-col justify-between">
      {/* 1. HERO SOLAR HOUSE VISUAL - FULL FRAME (Edge-to-edge, matching SolarSense warm daylight palette) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {!is3DMode ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Clean Solar House Visual - Fills entire frame seamlessly without side margins */}
            <img
              src="/solar-house-clean.jpg"
              alt="SolarSense Solar House"
              className="w-full h-full object-cover object-center pointer-events-none transition-all duration-1000"
              style={{
                filter: isNight
                  ? 'brightness(0.55) contrast(1.15) saturate(0.85)'
                  : isSunset
                  ? 'brightness(0.95) contrast(1.05) saturate(1.22) sepia(0.18)'
                  : 'brightness(1.0) contrast(1.0) saturate(1.0)',
              }}
            />

            {/* Dynamic atmospheric color tint overlay for seamless daylight transitions */}
            <div
              className={`absolute inset-0 transition-all duration-1000 pointer-events-none ${
                isNight
                  ? 'bg-[#090F1D]/65 mix-blend-multiply'
                  : isSunset
                  ? 'bg-gradient-to-t from-orange-500/25 via-amber-400/10 to-transparent mix-blend-overlay'
                  : isMorning
                  ? 'bg-gradient-to-b from-sky-400/10 via-amber-100/10 to-transparent mix-blend-soft-light'
                  : 'bg-transparent'
              }`}
            />

            {/* Nighttime Warm Window Interior Illumination */}
            {isNight && (
              <>
                {/* Ground floor window warm glow */}
                <div
                  className="absolute pointer-events-none rounded-sm transition-opacity duration-1000"
                  style={{
                    left: '52%',
                    top: '60%',
                    width: '9%',
                    height: '9%',
                    background: 'radial-gradient(circle, rgba(255, 185, 75, 0.95) 0%, rgba(255, 135, 35, 0.4) 65%, transparent 100%)',
                    filter: 'blur(10px)',
                    mixBlendMode: 'screen',
                  }}
                />
                {/* Second floor panoramic glass balcony warm glow */}
                <div
                  className="absolute pointer-events-none rounded-sm transition-opacity duration-1000"
                  style={{
                    left: '53.5%',
                    top: '43.5%',
                    width: '13%',
                    height: '11%',
                    background: 'radial-gradient(circle, rgba(255, 195, 90, 0.92) 0%, rgba(255, 145, 40, 0.45) 70%, transparent 100%)',
                    filter: 'blur(12px)',
                    mixBlendMode: 'screen',
                  }}
                />
                {/* Outdoor Patio Battery Status Glow at Night */}
                <div
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    left: '60.5%',
                    top: '63%',
                    width: '28px',
                    height: '36px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.95) 0%, transparent 75%)',
                    filter: 'blur(6px)',
                    mixBlendMode: 'screen',
                  }}
                />
              </>
            )}

            {/* Animated Energy Flow Pulses along Overhead Power Lines (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1000 580"
              preserveAspectRatio="none"
            >
              {/* Electric Plasma Pulses along Power Lines from House (x:560, y:230) to Pole (x:788, y:220) */}
              <path
                d="M 560 236 Q 674 250 788 220"
                fill="none"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                className={gridExportKw > 0 ? 'animate-dash-flow' : ''}
              />
            </svg>

            {/* Clickable Hotspot Zones for Direct House Inspection */}
            <button
              onClick={() => handleOpenDrawer('solar')}
              className="absolute left-[33%] top-[23%] w-[21%] h-[20%] cursor-pointer group focus:outline-none"
              title="Inspect Solar Panel Array"
            >
              <div className="w-full h-full rounded-2xl border border-transparent group-hover:border-amber-400/50 group-hover:bg-amber-400/10 transition-all duration-200" />
            </button>

            <button
              onClick={() => handleOpenDrawer('house')}
              className="absolute left-[47%] top-[40%] w-[18%] h-[26%] cursor-pointer group focus:outline-none"
              title="Inspect Home Electricity Usage"
            >
              <div className="w-full h-full rounded-2xl border border-transparent group-hover:border-sky-400/50 group-hover:bg-sky-400/10 transition-all duration-200" />
            </button>

            <button
              onClick={() => handleOpenDrawer('battery')}
              className="absolute left-[58%] top-[57%] w-[7%] h-[15%] cursor-pointer group focus:outline-none"
              title="Inspect Home Battery Storage"
            >
              <div className="w-full h-full rounded-xl border border-transparent group-hover:border-emerald-400/60 group-hover:bg-emerald-400/15 transition-all duration-200" />
            </button>

            <button
              onClick={() => handleOpenDrawer('grid')}
              className="absolute left-[77%] top-[28%] w-[7%] h-[34%] cursor-pointer group focus:outline-none"
              title="Inspect Grid Connection"
            >
              <div className="w-full h-full rounded-2xl border border-transparent group-hover:border-indigo-400/50 group-hover:bg-indigo-400/10 transition-all duration-200" />
            </button>
          </div>
        ) : (
          // ================== INTERACTIVE 3D WEBGL ORBIT MODE ==================
          <div className="w-full h-full relative">
            <ThreeHouseScene
              activeHour={activeHour}
              isRotating={isRotating}
              onSelectObject={(objId) => handleOpenDrawer(objId)}
              className="w-full h-full"
            />
            {/* 3D Mode Hint Pill - responsive text prevents mobile overflow */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs font-mono shadow-lg flex items-center gap-1.5 sm:gap-2 pointer-events-none max-w-[90vw] truncate">
              <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin-slow shrink-0" />
              <span className="hidden sm:inline">Interactive 3D Active · Click & Drag to Orbit · Scroll to Zoom</span>
              <span className="sm:hidden">3D Active · Drag to Orbit</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. FLOATING HUD METRICS (Streamlined & Clear of Left Dock and Header) */}
      <div className="relative z-10 w-full pointer-events-none px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="max-w-7xl mx-auto md:pl-40 lg:pl-48">
          {/* Top Row: Streamlined frosted pills that wrap neatly on mobile without obscuring house */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Pill 1: SOLAR GENERATION */}
            <div
              onClick={() => handleOpenDrawer('solar')}
              className="pointer-events-auto cursor-pointer group transition-transform duration-150 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/92 hover:bg-white backdrop-blur-md border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-md transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-[11px] sm:text-xs text-[#134074] font-medium">Solar</span>
                  <span className="text-xs sm:text-sm font-bold text-[#0B2545] font-mono">
                    {solarGenKw > 0 ? `${solarGenKw.toFixed(2)} kW` : '0.00 kW'}
                  </span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    solarGenKw > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                  }`}
                  title={solarGenKw > 0 ? 'Generating' : 'Standby'}
                />
              </div>
            </div>

            {/* Pill 2: HOME USAGE */}
            <div
              onClick={() => handleOpenDrawer('house')}
              className="pointer-events-auto cursor-pointer group transition-transform duration-150 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/92 hover:bg-white backdrop-blur-md border border-sky-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-md transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center shrink-0">
                  <HomeIcon className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-[11px] sm:text-xs text-[#134074] font-medium">Home</span>
                  <span className="text-xs sm:text-sm font-bold text-[#0B2545] font-mono">
                    {homeUsageKw.toFixed(1)} kW
                  </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              </div>
            </div>

            {/* Pill 3: GRID STATUS */}
            <div
              onClick={() => handleOpenDrawer('grid')}
              className="pointer-events-auto cursor-pointer group transition-transform duration-150 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/92 hover:bg-white backdrop-blur-md border border-sky-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-md transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-[11px] sm:text-xs text-[#134074] font-medium">Grid</span>
                  <span className="text-xs sm:text-sm font-bold text-[#0B2545] font-mono">
                    {gridExportKw > 0 ? `+${gridExportKw.toFixed(1)} kW` : `-${gridImportKw.toFixed(1)} kW`}
                  </span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    gridExportKw > 0 ? 'bg-indigo-500' : 'bg-amber-500'
                  }`}
                  title={gridExportKw > 0 ? 'Exporting to grid' : 'Drawing from grid'}
                />
              </div>
            </div>

            {/* Pill 4: BATTERY STATE */}
            <div
              onClick={() => handleOpenDrawer('battery')}
              className="pointer-events-auto cursor-pointer group transition-transform duration-150 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/92 hover:bg-white backdrop-blur-md border border-emerald-200/60 shadow-[0_4px_20px_rgba(16,185,129,0.08)] hover:shadow-md transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-[11px] sm:text-xs text-[#134074] font-medium">Battery</span>
                  <span className="text-xs sm:text-sm font-bold text-[#0B2545] font-mono">
                    {batteryPct}%
                  </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CONTROLS ROW (Today's Energy + Day Slider + 3D Toggle) */}
      <div className="relative z-10 w-full pointer-events-none px-3 sm:px-6 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-8 pt-2 sm:pt-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 md:pl-40 lg:pl-48">
          {/* Mobile Top Sub-Row: Today's Energy Card + 3D Orbit Button paired side-by-side */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {/* Card: Today's Energy Performance */}
            <div
              onClick={() => onOpenDecompositionModal ? onOpenDecompositionModal() : handleOpenDrawer('today')}
              className="pointer-events-auto cursor-pointer group transition-transform duration-150 hover:scale-105 active:scale-95 flex-1 sm:flex-initial"
            >
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/92 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-md transition-all">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-[#134074] leading-tight">Today's Energy</div>
                  <div className="text-xs sm:text-base font-bold text-[#0B2545] leading-tight font-mono">
                    {cumulativeTodayKwh.toFixed(1)} kWh
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-emerald-600 leading-tight">
                    ↑ +18%
                  </div>
                </div>
                {/* Mini Sparkline - visible on screens >= 400px */}
                <div className="hidden min-[400px]:flex items-end gap-1 h-6 sm:h-7 pl-2 border-l border-sky-100">
                  {[20, 35, 55, 75, 95, 80, 60, 40].map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 sm:w-1 rounded-t-sm bg-gradient-to-t from-sky-400 to-emerald-400"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile-only 3D Toggle button placed beside Today's Energy pill */}
            <div className="pointer-events-auto sm:hidden shrink-0">
              <button
                onClick={() => {
                  setIs3DMode(!is3DMode);
                  if (!is3DMode) setIsRotating(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-[#0B2545] via-[#0284C7] to-[#38BDF8] text-white text-xs font-bold tracking-wide shadow-[0_4px_16px_rgba(2,132,199,0.3)] border border-sky-300/30 backdrop-blur-md transition-all active:scale-95"
                title="Toggle interactive 3D Orbit view"
              >
                {is3DMode ? (
                  <>
                    <Box className="w-3.5 h-3.5" />
                    <span>Photo</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>3D Orbit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Center: Draggable Floating Day/Night Timeline Controller (Stretches fluidly on mobile) */}
          <div className="pointer-events-auto w-full sm:w-auto min-w-0 sm:min-w-[380px] lg:min-w-[440px]">
            <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/92 backdrop-blur-md border border-sky-100/80 shadow-[0_8px_30px_rgba(2,132,199,0.08)]">
              {/* Play / Pause Cycle Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0284C7] flex items-center justify-center transition-colors shrink-0 focus:outline-none"
                title={isPlaying ? 'Pause day cycle' : 'Play day cycle animation'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                {/* Labels and Time Pill - abbreviated on narrow screens to prevent overlap */}
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#134074]">
                  <button
                    onClick={() => onHourChange(8.4)}
                    className={`hover:text-[#0284C7] transition-colors truncate ${
                      activeHour >= 6 && activeHour < 11 ? 'text-[#0284C7] font-bold' : ''
                    }`}
                  >
                    ☀ <span className="hidden min-[420px]:inline">Morning</span>
                  </button>

                  <button
                    onClick={() => onHourChange(12.5)}
                    className={`hover:text-[#0284C7] transition-colors truncate ${
                      activeHour >= 11 && activeHour < 16 ? 'text-[#0284C7] font-bold' : ''
                    }`}
                  >
                    ☼ <span className="hidden min-[420px]:inline">Noon</span>
                  </button>

                  {/* Central Time Badge */}
                  <div className="px-2 sm:px-2.5 py-0.5 rounded-md bg-[#0B2545] text-white text-[10px] sm:text-[11px] font-mono font-bold shrink-0 shadow-2xs">
                    {formatTime(activeHour)}
                  </div>

                  <button
                    onClick={() => onHourChange(18.0)}
                    className={`hover:text-sky-600 transition-colors truncate ${
                      activeHour >= 16 && activeHour < 20 ? 'text-sky-600 font-bold' : ''
                    }`}
                  >
                    🌅 <span className="hidden min-[420px]:inline">Evening</span>
                  </button>

                  <button
                    onClick={() => onHourChange(22.0)}
                    className={`hover:text-indigo-600 transition-colors truncate ${
                      activeHour >= 20 || activeHour < 6 ? 'text-indigo-600 font-bold' : ''
                    }`}
                  >
                    🌙 <span className="hidden min-[420px]:inline">Night</span>
                  </button>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.1"
                  value={activeHour}
                  onChange={(e) => onHourChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-sky-100 rounded-lg appearance-none cursor-pointer accent-[#0284C7] focus:outline-none"
                  aria-label="Time of day"
                />
              </div>
            </div>
          </div>

          {/* Desktop/Tablet 3D Toggle Button (Hidden on mobile where it's paired above) */}
          <div className="pointer-events-auto hidden sm:block shrink-0">
            <button
              onClick={() => {
                setIs3DMode(!is3DMode);
                if (!is3DMode) setIsRotating(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#0B2545] via-[#0284C7] to-[#38BDF8] hover:from-[#081C33] hover:via-[#0369A1] hover:to-[#0EA5E9] text-white text-xs font-bold tracking-wide shadow-[0_4px_16px_rgba(2,132,199,0.3)] border border-sky-300/30 backdrop-blur-md transition-all active:scale-95"
              title="Toggle interactive 3D Orbit view"
            >
              {is3DMode ? (
                <>
                  <Box className="w-3.5 h-3.5" />
                  <span>Photo View</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>3D Orbit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONTEXTUAL SLIDE-OUT PANEL (Inspecting Solar, House, Battery, Grid, Today) */}
      {activeDrawer && (
        <>
          {/* Backdrop for click-outside dismissal & clean visual isolation */}
          <div
            onClick={() => setActiveDrawer(null)}
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-xs transition-opacity animate-fadeIn"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-2xl p-5 sm:p-6 pb-24 sm:pb-6 overflow-y-auto animate-fadeIn flex flex-col justify-between">
            <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                {activeDrawer === 'solar' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                )}
                {activeDrawer === 'house' && (
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <HomeIcon className="w-4 h-4" />
                  </div>
                )}
                {activeDrawer === 'battery' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BatteryCharging className="w-4 h-4" />
                  </div>
                )}
                {activeDrawer === 'grid' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                )}
                {activeDrawer === 'today' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeDrawer === 'solar' && 'Solar Energy'}
                    {activeDrawer === 'house' && 'Home Electricity'}
                    {activeDrawer === 'battery' && 'Home Battery'}
                    {activeDrawer === 'grid' && 'Power Grid'}
                    {activeDrawer === 'today' && "Today's Energy"}
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    {formatTime(activeHour)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SOLAR DRAWER */}
            {activeDrawer === 'solar' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[11px] text-amber-800">Current solar output</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {solarGenKw.toFixed(2)} kW
                  </div>
                  <span className="text-xs text-slate-500">
                    {Math.round((solarGenKw / system.capacity_kw) * 100)}% of system capacity
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roof panels</span>
                    <span className="font-semibold text-slate-800">{system.panel_count} panels</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Panel condition</span>
                    <span className="font-semibold text-emerald-600">Clean (0.3% loss)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inverter</span>
                    <span className="font-semibold text-slate-800">{system.inverter_model}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveDrawer(null);
                    onNavigateTab('solar');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Solar Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* HOUSE DRAWER */}
            {activeDrawer === 'house' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                  <span className="text-[11px] text-sky-800">Total electricity used</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {homeUsageKw.toFixed(2)} kW
                  </div>
                  <span className="text-xs text-slate-500">
                    {solarGenKw >= homeUsageKw ? '100% powered by your solar panels' : 'Supported by battery and grid'}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Where energy is going
                  </span>
                  {[
                    { name: 'Car Charging (EV)', kw: '1.2 kW' },
                    { name: 'Heating & Cooling (HVAC)', kw: '0.5 kW' },
                    { name: 'Kitchen & Lights', kw: '0.3 kW' },
                    { name: 'Standby baseline', kw: '0.1 kW' },
                  ].map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between text-xs">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="font-semibold text-slate-900">{item.kw}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BATTERY DRAWER */}
            {activeDrawer === 'battery' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[11px] text-emerald-800">Battery level</span>
                  <div className="text-2xl font-bold text-emerald-700 mt-0.5">
                    {batteryPct}%
                  </div>
                  <span className="text-xs text-slate-500">
                    {batteryChargingKw > 0 ? `Charging at +${batteryChargingKw.toFixed(1)} kW` : `Providing ${batteryDischargingKw.toFixed(1)} kW to home`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Battery capacity</span>
                    <span className="font-semibold text-slate-800">13.5 kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Backup during outage</span>
                    <span className="font-semibold text-slate-800">
                      {(batteryPct * 0.135 / (homeUsageKw || 1)).toFixed(1)} hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Battery health</span>
                    <span className="font-semibold text-emerald-600">99.4% (Excellent)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveDrawer(null);
                    onNavigateTab('battery');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Battery Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* GRID DRAWER */}
            {activeDrawer === 'grid' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <span className="text-[11px] text-indigo-800">Grid exchange</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {gridExportKw > 0 ? `+${gridExportKw.toFixed(1)} kW Export` : `-${gridImportKw.toFixed(1)} kW Import`}
                  </div>
                  <span className="text-xs text-slate-500">
                    {gridExportKw > 0 ? 'Sending excess solar energy to grid' : 'Drawing electricity from grid'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Utility</span>
                    <span className="font-semibold text-slate-800">PG&E</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Solar export credit</span>
                    <span className="font-semibold text-emerald-600">+$0.28 / kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Today's savings</span>
                    <span className="font-semibold text-slate-800">$4.82</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveDrawer(null);
                    onNavigateTab('grid');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Grid & Bills</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TODAY'S ENERGY DRAWER */}
            {activeDrawer === 'today' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500">Total generated today</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {cumulativeTodayKwh.toFixed(1)} kWh
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">
                    +18% higher than average
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveDrawer(null);
                    if (onOpenDecompositionModal) onOpenDecompositionModal();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>See Energy Breakdown</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            SolarSense Home
          </div>
        </div>
      </>
    )}
    </div>
  );
};
