import React, { useState, useEffect, useRef } from 'react';
import { Sun, BatteryCharging, Zap, ArrowUpRight, ArrowRight, Menu, X } from 'lucide-react';
import { LandingSolarSphere3D } from '../components/LandingSolarSphere3D';
import { SolarSenseLogo } from '../components/SolarSenseLogo';

interface LandingPageProps {
  onGetStarted: () => void;
}

/**
 * ScrollSection helper component using IntersectionObserver for scroll-triggered reveal.
 * Styled purely with dark, medium, and radiant blue shades — zero black or gray text.
 */
interface ScrollSectionProps {
  number: string;
  tag: string;
  headline: string;
  body: string;
  graphic: React.ReactNode;
}

const ScrollSection: React.FC<ScrollSectionProps> = ({
  number,
  tag,
  headline,
  body,
  graphic,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center p-6 sm:p-8 rounded-3xl bg-white/75 backdrop-blur-md border border-white/85 shadow-[0_8px_30px_rgba(2,132,199,0.06)] hover:bg-white/85 transition-all">
        {/* Text Area - Pure Blue Shades */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#0284C7] uppercase">
            <span>{number}</span>
            <span>·</span>
            <span>{tag}</span>
          </div>

          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[#0B2545] leading-tight">
            {headline}
          </h3>

          <p className="text-sm sm:text-base text-[#1E3A8A]/80 font-medium leading-relaxed max-w-lg">
            {body}
          </p>
        </div>

        {/* Visual Graphic Area */}
        <div className="md:col-span-5 flex justify-center">
          {graphic}
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#C8E5FA] via-[#DDF0FC] via-[#EBF5FD] to-[#F3F9FD] text-[#0B2545] font-sans selection:bg-sky-500/20 selection:text-[#0B2545] overflow-x-hidden">
      {/* ========================================================
          PAGE-WIDE CONTINUOUS CLOUDY SKY BACKGROUND
          Spans the ENTIRE page from Hero through How It Works, Features, Performance, to Footer!
          ======================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle Ambient High-Sky Sunlight Radiance */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-amber-100/45 via-sky-200/35 to-transparent rounded-full blur-[100px]" />

        {/* --- Top Sky / Hero Clouds --- */}
        <div className="absolute top-10 -left-32 w-[620px] h-[360px] bg-white/85 rounded-full blur-[90px]" />
        <div className="absolute top-36 left-1/4 w-[520px] h-[300px] bg-sky-200/40 rounded-full blur-[80px]" />
        <div className="absolute top-20 -right-28 w-[660px] h-[390px] bg-white/90 rounded-full blur-[95px]" />

        {/* --- Mid Sky / "How It Works" Clouds --- */}
        <div className="absolute top-[38%] -left-24 w-[600px] h-[350px] bg-white/80 rounded-full blur-[90px]" />
        <div className="absolute top-[46%] -right-20 w-[640px] h-[380px] bg-sky-200/35 rounded-full blur-[85px]" />
        <div className="absolute top-[54%] left-1/3 w-[560px] h-[320px] bg-white/75 rounded-full blur-[90px]" />

        {/* --- Lower Sky / "Features" & "Performance" Clouds --- */}
        <div className="absolute top-[72%] -left-28 w-[680px] h-[400px] bg-white/85 rounded-full blur-[100px]" />
        <div className="absolute top-[80%] -right-24 w-[620px] h-[380px] bg-sky-200/40 rounded-full blur-[90px]" />

        {/* Low Horizon Daylight Mist at Bottom of Screen */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[340px] bg-gradient-to-t from-white/90 via-sky-100/50 to-transparent rounded-full blur-[90px]" />
      </div>

      {/* 1. NAVBAR: SolarSense Brand Logo + Short Links + CTA Button */}
      <header className="sticky top-0 z-50 w-full border-b border-sky-100/70 bg-white/75 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo: SolarSense Official Brand Mark */}
          <SolarSenseLogo size="md" />

          {/* Short Links (Desktop) - Pure Blue Shades */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#134074]">
            <button
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-[#0284C7] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="hover:text-[#0284C7] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('performance')}
              className="hover:text-[#0284C7] transition-colors"
            >
              Performance
            </button>
          </nav>

          {/* CTA Button ("Get Started") - Dark & Light Blue Shades */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0B2545] via-[#0284C7] to-[#38BDF8] hover:from-[#081C33] hover:via-[#0369A1] hover:to-[#0EA5E9] text-white font-bold text-xs tracking-wide shadow-[0_4px_20px_rgba(2,132,199,0.3)] border border-sky-300/30 transition-all active:scale-95 min-h-[38px]"
            >
              Get Started
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center border border-sky-200/80 bg-white/90 text-[#134074] hover:text-[#0284C7]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-sky-100 bg-white/95 backdrop-blur-md px-6 py-4 space-y-2 animate-fadeIn">
            <button
              onClick={() => scrollTo('how-it-works')}
              className="w-full min-h-[44px] flex items-center px-4 rounded-xl text-xs font-bold tracking-wider uppercase text-[#134074] hover:bg-sky-50 hover:text-[#0284C7]"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="w-full min-h-[44px] flex items-center px-4 rounded-xl text-xs font-bold tracking-wider uppercase text-[#134074] hover:bg-sky-50 hover:text-[#0284C7]"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('performance')}
              className="w-full min-h-[44px] flex items-center px-4 rounded-xl text-xs font-bold tracking-wider uppercase text-[#134074] hover:bg-sky-50 hover:text-[#0284C7]"
            >
              Performance
            </button>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION: Seamless Cloudy & Blue Sky with Dark & Light Blue Styled Typography */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-12 pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Bold headline styled with Dark & Light Blue Shades (No Black) */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08]">
            <span className="text-[#0B2545]">Pure solar power </span>
            <span className="bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] bg-clip-text text-transparent">
              for complete home freedom.
            </span>
          </h1>

          {/* Plain English subline styled with Dark & Light Blue Shades (No Black) */}
          <p className="text-base sm:text-lg max-w-xl mx-auto font-medium">
            <span className="text-[#134074]">Generate, store, and control </span>
            <span className="text-[#0284C7] font-semibold">your clean electricity </span>
            <span className="text-[#0369A1]">in real time.</span>
          </p>

          {/* Primary CTA Button styled with Dark & Light Blue Shades */}
          <div className="pt-2">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0B2545] via-[#0284C7] to-[#38BDF8] hover:from-[#081C33] hover:via-[#0369A1] hover:to-[#0EA5E9] text-white font-extrabold text-sm tracking-wide shadow-[0_8px_30px_rgba(2,132,199,0.38)] border border-sky-300/40 transition-all active:scale-95 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 3D Solar Model with crossed rings, golden sun, and 4 corner callout cards */}
        <div className="w-full max-w-5xl mx-auto mt-8 sm:mt-12">
          <LandingSolarSphere3D />
        </div>
      </section>

      {/* 3. SCROLL-TRIGGERED SECTIONS (Translucent Frosted Glass in the Continuous Cloudy Sky) */}
      <section id="how-it-works" className="relative z-10 space-y-4 sm:space-y-6 py-10 sm:py-14 bg-transparent max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-xs font-bold uppercase tracking-widest text-[#0284C7] mb-2">
            How It Works
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Seamless Three-Step Energy Flow
          </h2>
        </div>

        {/* Section 1: Harvest */}
        <ScrollSection
          number="01"
          tag="Harvest"
          headline="Clean Energy From Every Sunrise"
          body="Rooftop panels capture daylight and power your daily home appliances cleanly."
          graphic={
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-white/75 backdrop-blur-md border border-white/90 p-5 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_30px_rgba(2,132,199,0.06)]">
              <div className="w-14 h-14 rounded-2xl bg-white border border-sky-200/80 shadow-xs flex items-center justify-center text-[#0284C7] mb-3">
                <Sun className="w-7 h-7 animate-spin" style={{ animationDuration: '24s' }} />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">Direct Solar</div>
              <div className="text-2xl font-black text-[#0B2545] mt-1">9.6 kW</div>
            </div>
          }
        />

        {/* Section 2: Reserve */}
        <ScrollSection
          number="02"
          tag="Reserve"
          headline="Power Stored For The Night"
          body="Extra daytime sunshine charges your home battery for total evening reliability."
          graphic={
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-white/75 backdrop-blur-md border border-white/90 p-5 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_30px_rgba(2,132,199,0.06)]">
              <div className="w-14 h-14 rounded-2xl bg-white border border-sky-200/80 shadow-xs flex items-center justify-center text-[#0369A1] mb-3">
                <BatteryCharging className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">Battery Pack</div>
              <div className="text-2xl font-black text-[#0B2545] mt-1">13.5 kWh</div>
            </div>
          }
        />

        {/* Section 3: Deliver */}
        <ScrollSection
          number="03"
          tag="Deliver"
          headline="Intelligent Automatic Power Flow"
          body="Electricity moves smoothly between your roof, battery, and home without interruption."
          graphic={
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-white/75 backdrop-blur-md border border-white/90 p-5 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_30px_rgba(2,132,199,0.06)]">
              <div className="w-14 h-14 rounded-2xl bg-white border border-sky-200/80 shadow-xs flex items-center justify-center text-[#0284C7] mb-3">
                <Zap className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">Switchover Time</div>
              <div className="text-2xl font-black text-[#0B2545] mt-1">0.0 ms</div>
            </div>
          }
        />
      </section>

      {/* 4. FEATURE + STATS ROW (Translucent Frosted Glass in the Continuous Cloudy Sky) */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8 bg-transparent">
        {/* Core Features */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#0284C7] mb-2.5 text-center sm:text-left">
            Core Features
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/85 shadow-[0_4px_20px_rgba(2,132,199,0.05)] flex items-center gap-3 hover:bg-white/95 hover:border-sky-300 transition-all">
              <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-[#0284C7] shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-[#0B2545]">Live Generation</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/85 shadow-[0_4px_20px_rgba(2,132,199,0.05)] flex items-center gap-3 hover:bg-white/95 hover:border-sky-300 transition-all">
              <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-[#0369A1] shrink-0">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-[#0B2545]">Battery Backup</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/85 shadow-[0_4px_20px_rgba(2,132,199,0.05)] flex items-center gap-3 hover:bg-white/95 hover:border-sky-300 transition-all">
              <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-[#0284C7] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-[#0B2545]">Smart Routing</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/85 shadow-[0_4px_20px_rgba(2,132,199,0.05)] flex items-center gap-3 hover:bg-white/95 hover:border-sky-300 transition-all">
              <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-[#0369A1] shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-[#0B2545]">Grid Export</span>
            </div>
          </div>
        </div>

        {/* System Stats / Performance */}
        <div id="performance">
          <div className="text-xs font-bold uppercase tracking-widest text-[#0284C7] mb-2.5 text-center sm:text-left">
            System Performance
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/85 shadow-[0_6px_25px_rgba(2,132,199,0.05)] hover:bg-white/95 transition-all text-center md:text-left">
              <div className="text-3xl font-extrabold tracking-tight text-[#0284C7]">
                9.6 kW
              </div>
              <div className="text-xs uppercase font-bold text-[#1E3A8A]/75 mt-1">
                Peak Array Output
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/85 shadow-[0_6px_25px_rgba(2,132,199,0.05)] hover:bg-white/95 transition-all text-center md:text-left">
              <div className="text-3xl font-extrabold tracking-tight text-[#0B2545]">
                92%
              </div>
              <div className="text-xs uppercase font-bold text-[#1E3A8A]/75 mt-1">
                Clean Power Self-Reliance
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/85 shadow-[0_6px_25px_rgba(2,132,199,0.05)] hover:bg-white/95 transition-all text-center md:text-left">
              <div className="text-3xl font-extrabold tracking-tight text-[#0369A1]">
                $184
              </div>
              <div className="text-xs uppercase font-bold text-[#1E3A8A]/75 mt-1">
                Monthly Utility Savings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="relative z-10 border-t border-sky-200/60 bg-white/65 backdrop-blur-md py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SolarSenseLogo size="sm" />

          <div className="flex items-center gap-6 text-xs text-[#1E3A8A]/80 font-semibold">
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#0284C7] transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollTo('features')} className="hover:text-[#0284C7] transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo('performance')} className="hover:text-[#0284C7] transition-colors">
              Performance
            </button>
            <button onClick={onGetStarted} className="text-[#0284C7] hover:underline font-bold transition-colors">
              Launch App
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
