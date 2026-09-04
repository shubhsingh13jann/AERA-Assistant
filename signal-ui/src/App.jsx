import React, { useEffect, Suspense, lazy } from 'react';
import { useNexusStore } from './core/nexusStore';
import { HeaderNav } from './modules/header';
import { Sidebar } from './modules/sidebar';
import { ModuleSkeleton } from './core/ModuleSkeleton';

// Micro-Frontend Decoupled Visualizer Modules (Loaded Asynchronously via React.lazy)
const ObservatoryView = lazy(() => import('./modules/central-hologram'));
const ConversationPanel = lazy(() => import('./modules/conversation-stream'));
const PerformanceMonitor = lazy(() => import('./modules/performance'));
const ThreatModal = lazy(() => import('./modules/threat-intelligence/ThreatModal'));
const QuickAccessModal = lazy(() => import('./modules/command-terminal/QuickAccessModal'));

export default function App() {
  const holoMode = useNexusStore((s) => s.holoMode);
  const activeNav = useNexusStore((s) => s.activeNav);

  // Background hardware telemetry tick (isolated from App render)
  useEffect(() => {
    const timer = setInterval(() => {
      useNexusStore.getState().tickHardware();
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Native pywebview Bridge Handlers
  useEffect(() => {
    window.setOrbState = (state) => useNexusStore.getState().setOrbState(state);
    window.addMessage = (role, text) => useNexusStore.getState().addConversationMessage(role, text);
    window.setMicLevel = (level, name) => useNexusStore.getState().setMicLevel(level, name);
  }, []);

  const isPerformanceTab = activeNav === 'Performance' || activeNav === 'PERFORMANCE';

  return (
    <div className="relative w-screen h-screen max-h-screen overflow-hidden bg-[#030712] text-slate-100 font-sans flex flex-col justify-between select-none cyber-grid">
      {/* Ambient Sci-Fi Nebulae */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-5 left-1/4 w-[450px] h-[250px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Holographic Scanline Shader Layer (Toggled by HOLO MODE) */}
      {holoMode && (
        <div className="fixed inset-0 z-50 pointer-events-none holo-scanlines">
          <div className="w-full h-12 bg-cyan-400/5 holo-beam" />
        </div>
      )}

      {/* MAIN VIEWPORT HUD (Strictly fits inside 1 screen without scrolling) */}
      <div className="relative z-10 flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Workspace: Performance Tab OR Space Observatory Deck + Conversation Stream */}
        {isPerformanceTab ? (
          <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
            <div className="absolute top-3 right-6 z-30">
              <HeaderNav />
            </div>
            <Suspense fallback={<ModuleSkeleton title="// PERFORMANCE MONITOR" />}>
              <PerformanceMonitor />
            </Suspense>
          </main>
        ) : (
          <main className="flex-1 min-h-0 flex overflow-hidden relative p-3 gap-3">
            {/* Center Stage: Space Observatory Cockpit + 3D Humanoid AI Bust + 4 Quick Action Cards */}
            <div className="flex-1 h-full min-h-0 min-w-0 rounded-2xl overflow-hidden border border-cyan-500/20 bg-[#030712] shadow-2xl relative">
              <Suspense fallback={<ModuleSkeleton title="// OBSERVATORY VIEW" />}>
                <ObservatoryView />
              </Suspense>
            </div>

            {/* Right Column: Header Clock/Profile + Conversation Stream */}
            <div className="w-[420px] 2xl:w-[460px] shrink-0 h-full flex flex-col gap-2 min-h-0">
              <div className="shrink-0 flex justify-end pr-1 pt-0.5">
                <HeaderNav />
              </div>
              <div className="flex-1 min-h-0">
                <Suspense fallback={<ModuleSkeleton title="// CONVERSATION" />}>
                  <ConversationPanel />
                </Suspense>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Interactive Floating Modals (Lazy Loaded) */}
      <Suspense fallback={null}>
        <ThreatModal />
        <QuickAccessModal />
      </Suspense>
    </div>
  );
}
