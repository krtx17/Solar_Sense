import React, { useState } from 'react';
import { Sun, Moon, Sliders, Menu, X, Sparkles } from 'lucide-react';

interface MinimalNavbarProps {
  activeView: 'landing' | 'monitor' | 'analytics' | 'system';
  onSelectView: (view: 'landing' | 'monitor' | 'analytics' | 'system') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenQuickTools: () => void;
}

/**
 * Minimal top navbar restyled with warm near-black and bold glowing amber accents.
 * Strict STEP 0 feature compliance:
 * 1. Logo + status dot
 * 2. "Monitor / Analytics / System" tabs
 * 3. Theme toggle button
 * 4. "Actions" button
 */
export const MinimalNavbar: React.FC<MinimalNavbarProps> = ({
  activeView,
  onSelectView,
  theme,
  onToggleTheme,
  onOpenQuickTools,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  const navLinks: { id: 'monitor' | 'analytics' | 'system'; label: string }[] = [
    { id: 'monitor', label: 'Monitor' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'system', label: 'System' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b ${
        isDark
          ? 'bg-[#0A0908]/90 border-[#26211C] backdrop-blur-md text-stone-100'
          : 'bg-[#FAF7F2]/90 border-[#E8E2D8] backdrop-blur-md text-stone-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand: Logo + status dot */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectView(activeView === 'landing' ? 'monitor' : 'landing')}
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="SolarSense Brand Home"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            </span>
            <span className="font-extrabold tracking-tight text-lg text-stone-100 group-hover:text-amber-400 transition-colors">
              Solar<span className="text-amber-500">Sense</span>
            </span>
          </button>

          {/* Quick badge showing current mode */}
          {activeView === 'landing' && (
            <span className="hidden sm:inline-flex text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Overview
            </span>
          )}
        </div>

        {/* Desktop Nav: "Monitor / Analytics / System" tabs with warm amber active states */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectView(link.id)}
                className={`relative py-1.5 text-xs font-bold tracking-wider uppercase transition-colors duration-150 ${
                  isActive
                    ? 'text-amber-400 font-extrabold'
                    : isDark
                    ? 'text-stone-400 hover:text-stone-100'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_8px_#f59e0b]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Theme Toggle + "Actions" CTA */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border ${
              isDark
                ? 'border-[#26211C] bg-[#161310] text-stone-400 hover:text-amber-400 hover:border-amber-500/40'
                : 'border-stone-200 bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary "Actions" CTA Button */}
          <button
            onClick={onOpenQuickTools}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-xs font-bold tracking-wide shadow-md shadow-amber-500/20 transition-all duration-200 active:scale-95 min-h-[38px]"
            aria-label="Open Actions Panel"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Actions</span>
          </button>

          {/* Mobile Hamburger Toggle (<= 640px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
              isDark ? 'border-[#26211C] bg-[#161310] text-stone-300' : 'border-stone-200 bg-stone-100 text-stone-700'
            }`}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (<= 640px) with >= 44px tap targets */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 py-4 space-y-2 animate-fadeIn ${
            isDark ? 'bg-[#0A0908] border-[#26211C]' : 'bg-[#FAF7F2] border-stone-200'
          }`}
        >
          <button
            onClick={() => {
              onSelectView('landing');
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[44px] flex items-center px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors ${
              activeView === 'landing'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : isDark
                ? 'text-stone-300 hover:bg-stone-900'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            Landing Overview
          </button>

          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onSelectView(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full min-h-[44px] flex items-center px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : isDark
                    ? 'text-stone-300 hover:bg-stone-900'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
