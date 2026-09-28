import React, { useState, useEffect } from 'react';
import {
  INITIAL_SYSTEMS,
  INITIAL_BILLS,
  INITIAL_INSPECTIONS,
  BENCHMARK_DECOMPOSITION,
  MOCK_NEXT_ACTIONS,
  getHealthComponents,
  generateTodayReadings,
  generateWeekDays,
  generateForecast,
  getLiveSolarSystems,
  getLiveDecomposition,
  getLiveNextBestActions,
} from './services/solarDataService';
import { SolarSystem, ElectricityBill, PanelInspection, DeviationDecomposition, NextBestAction } from './types/solar';
import { SolarSenseNav, SolarNavTab } from './components/SolarSenseNav';
import { HeroSolarHouse } from './components/HeroSolarHouse';
import { SolarView } from './views/SolarView';
import { BatteryView } from './views/BatteryView';
import { GridView } from './views/GridView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { WhyDidItDropView } from './components/WhyDidItDropModal';
import { CopilotDrawer } from './components/CopilotDrawer';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [systems, setSystems] = useState<SolarSystem[]>(INITIAL_SYSTEMS);
  const [nextActions, setNextActions] = useState<NextBestAction[]>(MOCK_NEXT_ACTIONS);
  const [activeSystemId, setActiveSystemId] = useState<string>('sys-home-9kw');
  const activeSystem = systems.find((s) => s.id === activeSystemId) || systems[0];

  // Live Backend Data Sync with Automatic Fallback
  useEffect(() => {
    getLiveSolarSystems().then((sys) => {
      if (sys && sys.length > 0) setSystems(sys);
    });
    getLiveDecomposition(activeSystemId, '2026-09-22').then((decomp) => {
      if (decomp) setDecomposition(decomp);
    });
    getLiveNextBestActions(activeSystemId).then((actions) => {
      if (actions && actions.length > 0) setNextActions(actions);
    });
  }, [activeSystemId]);

  // Primary Navigation Tab (Default to 'home' 3D Hero House Experience)
  const [activeTab, setActiveTab] = useState<SolarNavTab>('home');

  // Time of Day (0 to 24 float, default to 8.4 = 08:24 AM matching visual reference image!)
  const [activeHour, setActiveHour] = useState<number>(8.4);

  // Core Data
  const [bills, setBills] = useState<ElectricityBill[]>(INITIAL_BILLS);
  const [inspections, setInspections] = useState<PanelInspection[]>(INITIAL_INSPECTIONS);
  const [decomposition, setDecomposition] = useState<DeviationDecomposition>(BENCHMARK_DECOMPOSITION);

  // Modals & Drawers
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isWhyDropModalOpen, setIsWhyDropModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handlers for Data Updates
  const handleSaveBill = (updatedBill: ElectricityBill) => {
    setBills((prev) => prev.map((b) => (b.id === updatedBill.id ? updatedBill : b)));
    showToast('Utility bill reconciled and saved.');
  };

  const handleUpdateInspection = (id: string, outcome: 'confirmed' | 'rejected') => {
    setInspections((prev) =>
      prev.map((ins) =>
        ins.id === id ? { ...ins, reviewed_by_user: true, review_outcome: outcome } : ins
      )
    );
    showToast(`Inspection finding ${outcome}.`);
  };

  const handleConfirmAnomaly = (id: string) => {
    setDecomposition((prev) => ({ ...prev, status: 'reviewed' }));
    showToast('Anomaly confirmed. Remediation ticket dispatched.');
  };

  const handleDismissAnomaly = (id: string) => {
    setDecomposition((prev) => ({ ...prev, status: 'dismissed' }));
    showToast('Anomaly dismissed as non-critical transient.');
  };

  // Physical calculations for active system
  const todayReadings = generateTodayReadings(activeSystem);
  const weekDays = generateWeekDays(activeSystem);
  const forecastPoints = generateForecast(activeSystem);
  const healthComponents = getHealthComponents(activeSystem);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C8E5FA] via-[#DDF0FC] to-[#F3F9FD] text-[#0B2545] font-sans selection:bg-sky-500/20 selection:text-[#0B2545] flex flex-col justify-between">
      {/* 1. TOP HEADER & LEFT FLOATING DOCK NAVIGATION */}
      <SolarSenseNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        systems={systems}
        activeSystemId={activeSystemId}
        onSelectSystemId={setActiveSystemId}
        activeHour={activeHour}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        weatherTempC={22}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <main className="flex-1 w-full relative">
        {/* VIEW 0: HOME HERO EXPERIENCE (Photorealistic 3D Solar House + Daylight Cycle + Floating HUD Pills) */}
        {activeTab === 'home' && (
          <HeroSolarHouse
            system={activeSystem}
            decomposition={decomposition}
            activeHour={activeHour}
            onHourChange={setActiveHour}
            onNavigateTab={setActiveTab}
            onOpenDecompositionModal={() => setIsWhyDropModalOpen(true)}
            isCopilotOpen={isCopilotOpen}
            onCloseCopilot={() => setIsCopilotOpen(false)}
          />
        )}

        {/* SECONDARY VIEWS CONTAINER WITH RESPONSIVE MARGINS (Clear of Left Dock) */}
        {activeTab !== 'home' && (
          <div className="md:pl-48 lg:pl-52 pb-24 md:pb-8">
            {/* VIEW 1: SOLAR */}
            {activeTab === 'solar' && (
              <SolarView
                system={activeSystem}
                todayReadings={todayReadings}
                weekDays={weekDays}
                forecastPoints={forecastPoints}
                inspections={inspections}
                onUpdateInspection={handleUpdateInspection}
                onSelectAnomaly={() => setIsWhyDropModalOpen(true)}
              />
            )}

            {/* VIEW 2: BATTERY */}
            {activeTab === 'battery' && (
              <BatteryView system={activeSystem} activeHour={activeHour} />
            )}

            {/* VIEW 3: GRID */}
            {activeTab === 'grid' && (
              <GridView
                system={activeSystem}
                bills={bills}
                onSaveBill={handleSaveBill}
                activeHour={activeHour}
              />
            )}

            {/* VIEW 4: ANALYTICS */}
            {activeTab === 'analytics' && (
              <AnalyticsView
                system={activeSystem}
                decomposition={decomposition}
                nextActions={nextActions}
                onOpenAnomalyModal={() => setIsWhyDropModalOpen(true)}
              />
            )}

            {/* VIEW 5: SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsView
                systems={systems}
                activeSystemId={activeSystemId}
                onSelectSystemId={setActiveSystemId}
                decomposition={decomposition}
                inspections={inspections}
                onUpdateInspection={handleUpdateInspection}
                onConfirmAnomaly={handleConfirmAnomaly}
                onDismissAnomaly={handleDismissAnomaly}
                onOpenAnomalyModal={() => setIsWhyDropModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. MODAL: "WHY DID IT DROP?" DEVIATION DECOMPOSITION MODAL */}
      {isWhyDropModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative">
            <button
              onClick={() => setIsWhyDropModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <WhyDidItDropView
              decomposition={decomposition}
              onBack={() => setIsWhyDropModalOpen(false)}
              onConfirmFinding={() => {
                handleConfirmAnomaly(decomposition.id);
                setIsWhyDropModalOpen(false);
              }}
              isDarkTheme={false}
            />
          </div>
        </div>
      )}

      {/* 4. DRAWER: AI COPILOT ASSISTANT */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        system={activeSystem}
        decomposition={decomposition}
        forecast={forecastPoints}
        health={healthComponents}
        billsCount={bills.length}
        onInspectEvidence={(id) => {
          setIsCopilotOpen(false);
          setIsWhyDropModalOpen(true);
        }}
        isDarkTheme={false}
      />

      {/* 5. USER FEEDBACK TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
