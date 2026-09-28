import React from 'react';
import {
  Sun,
  Home as HomeIcon,
  BatteryCharging,
  Zap,
  BarChart2,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { SolarSystem } from '../types/solar';
import { SolarSenseLogo } from './SolarSenseLogo';

export type SolarNavTab = 'home' | 'solar' | 'battery' | 'grid' | 'analytics' | 'settings';

interface SolarSenseNavProps {
  activeTab: SolarNavTab;
  onSelectTab: (tab: SolarNavTab) => void;
  systems: SolarSystem[];
  activeSystemId: string;
  onSelectSystemId: (id: string) => void;
  activeHour: number;
  onOpenCopilot: () => void;
  weatherTempC?: number;
}

export const SolarSenseNav: React.FC<SolarSenseNavProps> = ({
  activeTab,
  onSelectTab,
  systems,
  activeSystemId,
  onSelectSystemId,
  activeHour,
  onOpenCopilot,
  weatherTempC = 22,
}) => {
  // Format active time for top-right weather display
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

  const navItems: { id: SolarNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon className="w-4 h-4" /> },
    { id: 'solar', label: 'Solar', icon: <Sun className="w-4 h-4" /> },
    { id: 'battery', label: 'Battery', icon: <BatteryCharging className="w-4 h-4" /> },
    { id: 'grid', label: 'Grid', icon: <Zap className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const activeSystem = systems.find((s) => s.id === activeSystemId) || systems[0];

  return (
    <>
      {/* 1. TOP HEADER BAR: Pure Blue Shades Theme with Official SolarSense Emblem */}
      <header className="sticky top-0 z-40 w-full h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-auto bg-white/80 backdrop-blur-md border-b border-sky-100/80 shadow-[0_4px_20px_rgba(2,132,199,0.04)] transition-colors">
        {/* Brand: Official SolarSense Logo (Rising Sun + Solar Roof House) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 group focus:outline-none shrink-0"
            aria-label="SolarSense Home"
          >
            <SolarSenseLogo size="md" />
          </button>

          {/* System Switcher Dropdown (Pure Blue Theme - available on tablet and desktop) */}
          <div className="hidden md:flex items-center ml-2.5 sm:ml-3 pl-2.5 sm:ml-3 border-l border-sky-200/80">
            <select
              value={activeSystemId}
              onChange={(e) => onSelectSystemId(e.target.value)}
              className="text-xs font-bold text-[#0B2545] bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/80 rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-xs cursor-pointer transition-all max-w-[200px] truncate"
              aria-label="Select Solar System"
            >
              {systems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.name} ({sys.capacity_kw} kW)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Header Area: Weather Status + AI Copilot + Avatar (Pure Blue Theme) */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Weather & Time Status Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-[#134074] bg-sky-50/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-sky-200/70 shadow-xs">
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-mono font-bold text-[#0B2545] text-xs sm:text-sm leading-tight">
                {formatTime(activeHour)}
              </span>
              <span className="text-[11px] text-[#1E3A8A]/75 font-medium leading-tight hidden sm:inline">
                · {weatherTempC}°C · Clear
              </span>
            </div>
          </div>

          {/* AI Copilot Quick Launcher Button (Dark & Light Blue Shades Theme) */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0B2545] via-[#0284C7] to-[#38BDF8] hover:from-[#081C33] hover:via-[#0369A1] hover:to-[#0EA5E9] text-white text-xs font-bold tracking-wide border border-sky-300/40 shadow-[0_4px_16px_rgba(2,132,199,0.28)] transition-all duration-200 active:scale-95"
            title="Open SolarSense AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-200 shrink-0" />
            <span className="hidden min-[400px]:inline font-bold">AI Copilot</span>
          </button>

          {/* User Profile Avatar Icon Button */}
          <button
            onClick={() => onSelectTab('settings')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-50/80 hover:bg-sky-100 border border-sky-200/80 text-[#0284C7] flex items-center justify-center transition-all shadow-xs hover:shadow-md focus:outline-none active:scale-95 shrink-0"
            aria-label="User Account & Settings"
            title={`Active: ${activeSystem.name}`}
          >
            <User className="w-4 h-4 text-[#0284C7]" />
          </button>
        </div>
      </header>

      {/* 2. FLOATING VERTICAL LEFT NAVIGATION DOCK (Pure Blue Theme, Tablet & Desktop) */}
      <nav
        className="hidden md:flex fixed left-3 lg:left-5 top-20 z-30 w-32 lg:w-36 flex-col gap-1.5 p-1.5 rounded-2xl bg-white/85 backdrop-blur-md border border-sky-100/80 shadow-[0_8px_30px_rgba(2,132,199,0.08)]"
        aria-label="Primary Navigation"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 lg:gap-2.5 px-2.5 lg:px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 focus:outline-none ${
                isActive
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-[0_4px_14px_rgba(2,132,199,0.35)]'
                  : 'text-[#134074] hover:text-[#0284C7] hover:bg-sky-50/80 font-semibold'
              }`}
              title={item.label}
            >
              <span className={isActive ? 'text-white' : 'text-[#0284C7]'}>{item.icon}</span>
              <span className="pr-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (for small screens <= 768px, with Safe Area support) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 pb-[env(safe-area-inset-bottom,0px)] bg-white/95 backdrop-blur-xl border-t border-sky-100/80 flex items-center justify-around px-1 sm:px-2 shadow-lg"
        aria-label="Mobile Bottom Navigation"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2.5 rounded-xl transition-colors min-h-[44px] ${
                isActive ? 'text-[#0284C7] font-bold' : 'text-[#134074]/70 hover:text-[#0284C7]'
              }`}
            >
              <span className={isActive ? 'text-[#0284C7]' : 'text-sky-400'}>{item.icon}</span>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
