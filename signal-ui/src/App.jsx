import React, { useEffect, Suspense, lazy } from 'react';
import { useNexusStore } from './core/nexusStore';
import { HeaderNav } from './modules/header';
import { Sidebar } from './modules/sidebar';
import { CommandBar } from './modules/command-terminal';
import { ModuleSkeleton } from './core/ModuleSkeleton';

// Micro-Frontend Decoupled Visualizer Modules (Loaded Asynchronously via React.lazy)
const CoreStatus = lazy(() => import('./modules/core-status'));
const CentralHologram = lazy(() => import('./modules/central-hologram'));
const HumanInterface = lazy(() => import('./modules/biometrics'));
const NeuralActivity = lazy(() => import('./modules/neural-matrix'));
const SystemLogs = lazy(() => import('./modules/conversation-stream'));
const ResourceOverview = lazy(() => import('./modules/resources'));
const NetworkActivity = lazy(() => import('./modules/network-traffic'));
const RealTimeFeed = lazy(() => import('./modules/realtime-feed'));
const EnvironmentalScan = lazy(() => import('./modules/environmental-scan'));
const ThreatMap = lazy(() => import('./modules/threat-intelligence'));
const QuantumLinkStatus = lazy(() => import('./modules/quantum-link'));
const PredictiveAnalytics = lazy(() => import('./modules/predictive-analytics'));
const PerformanceMonitor = lazy(() => import('./modules/performance'));
const PerformanceWidget = lazy(() => import('./modules/performance/PerformanceWidget'));
const ThreatModal = lazy(() => import('./modules/threat-intelligence/ThreatModal'));
const QuickAccessModal = lazy(() => import('./modules/command-terminal/QuickAccessModal'));

export default function App() {
  // Atomic selective subscription - App NEVER re-renders on telemetry ticks
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

      {/* 1. TOP HEADER HUD */}
      <HeaderNav />

      {/* 2. MAIN CENTER HUD (Strictly fits inside 1 screen without scrolling) */}
      <div className="relative z-10 flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Workspace: Task Manager Performance Monitor OR Holographic HUD */}
        {activeNav === 'PERFORMANCE' ? (
          <Suspense fallback={<ModuleSkeleton title="// PERFORMANCE MONITOR" />}>
            <PerformanceMonitor />
          </Suspense>
        ) : (
          /* Dashboard Grid Container - Proportional flex rows with 0 page scroll */
          <main className="flex-1 min-h-0 p-2 flex flex-col gap-2 overflow-hidden">
            
            {/* ROW 1 (Hero Row ~37% Height) */}
            <div className="flex-[3.7] min-h-0 grid grid-cols-12 gap-2 items-stretch">
              {/* Left: Core Status */}
              <div className="col-span-3 h-full">
                <Suspense fallback={<ModuleSkeleton title="// CORE STATUS" />}>
                  <CoreStatus />
                </Suspense>
              </div>

              {/* Center: Central 3D Hologram Micro-Module */}
              <div className="col-span-6 h-full hud-panel rounded overflow-hidden relative">
                <div className="hud-corner hud-corner-tl" />
                <div className="hud-corner hud-corner-tr" />
                <div className="hud-corner hud-corner-bl" />
                <div className="hud-corner hud-corner-br" />
                <Suspense fallback={<ModuleSkeleton title="// CENTRAL HOLOGRAM" />}>
                  <CentralHologram />
                </Suspense>
              </div>

              {/* Right: Human Biometric Interface Micro-Module */}
              <div className="col-span-3 h-full">
                <Suspense fallback={<ModuleSkeleton title="// HUMAN INTERFACE" />}>
                  <HumanInterface />
                </Suspense>
              </div>
            </div>

            {/* ROW 2 (Mid Telemetry Row ~33% Height) */}
            <div className="flex-[3.3] min-h-0 grid grid-cols-12 gap-2 items-stretch">
              {/* Left: Neural Wave + Live Conversation Stream */}
              <div className="col-span-3 h-full flex flex-col gap-2 overflow-hidden">
                <div className="shrink-0">
                  <Suspense fallback={<ModuleSkeleton title="// NEURAL MAP" />}>
                    <NeuralActivity />
                  </Suspense>
                </div>
                <div className="flex-1 min-h-0">
                  <Suspense fallback={<ModuleSkeleton title="// CONVERSATION STREAM" />}>
                    <SystemLogs />
                  </Suspense>
                </div>
              </div>

              {/* Center: Resource Overview & Network Traffic Micro-Modules */}
              <div className="col-span-6 h-full grid grid-cols-2 gap-2">
                <Suspense fallback={<ModuleSkeleton title="// RESOURCES" />}>
                  <ResourceOverview />
                </Suspense>
                <Suspense fallback={<ModuleSkeleton title="// NETWORK TRAFFIC" />}>
                  <NetworkActivity />
                </Suspense>
              </div>

              {/* Right: Performance Widget & Real-Time Alert Feed */}
              <div className="col-span-3 h-full flex flex-col gap-2 overflow-hidden">
                <div className="flex-1 min-h-0">
                  <Suspense fallback={<ModuleSkeleton title="// PERFORMANCE" />}>
                    <PerformanceWidget />
                  </Suspense>
                </div>
                <div className="shrink-0">
                  <Suspense fallback={<ModuleSkeleton title="// REAL-TIME FEED" />}>
                    <RealTimeFeed />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* ROW 3 (Bottom Telemetry Row ~30% Height) */}
            <div className="flex-[3] min-h-0 grid grid-cols-4 gap-2 items-stretch">
              <Suspense fallback={<ModuleSkeleton title="// ENVIRONMENT" />}>
                <EnvironmentalScan />
              </Suspense>
              <Suspense fallback={<ModuleSkeleton title="// THREAT MAP" />}>
                <ThreatMap />
              </Suspense>
              <Suspense fallback={<ModuleSkeleton title="// QUANTUM LINK" />}>
                <QuantumLinkStatus />
              </Suspense>
              <Suspense fallback={<ModuleSkeleton title="// PREDICTIVE" />}>
                <PredictiveAnalytics />
              </Suspense>
            </div>

          </main>
        )}
      </div>

      {/* 3. BOTTOM COMMAND BAR FOOTER */}
      <CommandBar />

      {/* Interactive Floating Modals (Lazy Loaded) */}
      <Suspense fallback={null}>
        <ThreatModal />
        <QuickAccessModal />
      </Suspense>
    </div>
  );
}