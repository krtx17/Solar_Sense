import React from 'react';
import { Sun, Moon, MessageSquare, AlertCircle, FileText, Camera, Sliders, UploadCloud, CheckCircle2, Zap } from 'lucide-react';
import { SolarSystem } from '../types/solar';

export type ActiveTab = 'dashboard' | 'echotwin' | 'why_drop' | 'bills' | 'inspections' | 'potential' | 'simulator' | 'review_queue';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  systems: SolarSystem[];
  selectedSystemId: string;
  onSelectSystemId: (id: string) => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  onOpenUpload: () => void;
  isSimulationMode?: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  systems,
  selectedSystemId,
  onSelectSystemId,
  isCopilotOpen,
  onToggleCopilot,
  onOpenUpload,
  isSimulationMode = false,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 transition-colors ${
      isDark
        ? 'bg-[#0B1322]/95 border-b border-slate-800/80 backdrop-blur-md text-slate-100'
        : 'bg-white border-b border-slate-200 text-slate-800'
    }`}>
      {/* Simulation Mode Boundary Banner if active */}
      {isSimulationMode && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1 text-center text-xs font-medium text-amber-300 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Simulation Mode Active — What-If calculations are isolated and never written to real system tables</span>
        </div>
      )}

      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              SolarSense<span className="text-emerald-400">AI</span>
            </span>
          </button>

          {/* System Switcher */}
          <div className={`hidden lg:flex items-center ml-2 border-l pl-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <select
              value={selectedSystemId}
              onChange={(e) => onSelectSystemId(e.target.value)}
              className={`text-xs font-medium rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
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

        {/* Zone 2: Clean text navigation links (single line) */}
        <nav className={`hidden md:flex items-center gap-1 sm:gap-2 lg:gap-3 text-xs lg:text-sm font-medium ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? isDark
                  ? 'text-white font-semibold bg-slate-800/80'
                  : 'text-slate-900 font-semibold bg-slate-100'
                : isDark
                ? 'hover:text-white hover:bg-slate-800/40'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('echotwin')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'echotwin'
                ? isDark
                  ? 'text-emerald-300 font-semibold bg-emerald-500/15 border border-emerald-500/30'
                  : 'text-sky-900 font-semibold bg-sky-50 border border-sky-200/60'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>EchoTwin™ Flow</span>
          </button>
          <button
            onClick={() => onTabChange('why_drop')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'why_drop'
                ? isDark
                  ? 'text-amber-300 font-semibold bg-amber-500/15 border border-amber-500/30'
                  : 'text-amber-800 font-semibold bg-amber-50'
                : isDark
                ? 'hover:text-white hover:bg-slate-800/40'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Why Did It Drop?
          </button>
          <button
            onClick={() => onTabChange('bills')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'bills'
                ? isDark
                  ? 'text-white font-semibold bg-slate-800/80'
                  : 'text-slate-900 font-semibold bg-slate-100'
                : isDark
                ? 'hover:text-white hover:bg-slate-800/40'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Bills & Tariffs
          </button>
          <button
            onClick={() => onTabChange('inspections')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'inspections'
                ? isDark
                  ? 'text-white font-semibold bg-slate-800/80'
                  : 'text-slate-900 font-semibold bg-slate-100'
                : isDark
                ? 'hover:text-white hover:bg-slate-800/40'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Panel Photos
          </button>
          <button
            onClick={() => onTabChange('simulator')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'simulator'
                ? isDark
                  ? 'text-white font-semibold bg-slate-800/80'
                  : 'text-slate-900 font-semibold bg-slate-100'
                : isDark
                ? 'hover:text-white hover:bg-slate-800/40'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            What-If Simulator
          </button>
          <button
            onClick={() => onTabChange('review_queue')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'review_queue'
                ? isDark
                  ? 'text-white font-semibold bg-slate-800/80'
                  : 'text-slate-900 font-semibold bg-slate-100'
                : isDark
                ? 'hover:text-white hover:bg-slate-800/40'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Review Queue
            <span className="text-xs text-amber-400 font-mono">(1)</span>
          </button>
        </nav>

        {/* Zone 3: Primary action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800 hover:text-amber-300'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Kris Anfalova Dark UI Theme'}
              aria-label="Toggle Color Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shadow-xs ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Upload CSV generation data"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Data</span>
          </button>

          <button
            onClick={onToggleCopilot}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs ${
              isCopilotOpen
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Solar Copilot</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className={`flex md:hidden overflow-x-auto px-4 py-2 border-t gap-1 text-xs no-scrollbar ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
      }`}>
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'dashboard' ? (isDark ? 'bg-slate-800 text-white font-semibold' : 'bg-white font-semibold text-slate-900 shadow-xs') : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('echotwin')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'echotwin' ? (isDark ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'bg-sky-100 font-semibold text-sky-900') : ''
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>EchoTwin</span>
        </button>
        <button
          onClick={() => onTabChange('why_drop')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'why_drop' ? (isDark ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'bg-amber-100 font-semibold text-amber-900') : ''
          }`}
        >
          Why It Dropped
        </button>
        <button
          onClick={() => onTabChange('bills')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'bills' ? (isDark ? 'bg-slate-800 text-white font-semibold' : 'bg-white font-semibold text-slate-900 shadow-xs') : ''
          }`}
        >
          Bills
        </button>
        <button
          onClick={() => onTabChange('inspections')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'inspections' ? (isDark ? 'bg-slate-800 text-white font-semibold' : 'bg-white font-semibold text-slate-900 shadow-xs') : ''
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => onTabChange('simulator')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'simulator' ? (isDark ? 'bg-slate-800 text-white font-semibold' : 'bg-white font-semibold text-slate-900 shadow-xs') : ''
          }`}
        >
          What-If
        </button>
        <button
          onClick={() => onTabChange('review_queue')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'review_queue' ? (isDark ? 'bg-slate-800 text-white font-semibold' : 'bg-white font-semibold text-slate-900 shadow-xs') : ''
          }`}
        >
          Review (1)
        </button>
        <button
          onClick={onOpenUpload}
          className="px-2.5 py-1 rounded whitespace-nowrap text-emerald-400 font-medium"
        >
          + Upload
        </button>
      </div>
    </header>
  );
};

