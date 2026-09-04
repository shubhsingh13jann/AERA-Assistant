import React, { useEffect } from 'react';
import { useNexusStore } from './store/nexusStore';
import { HeaderNav } from './components/HeaderNav';
import { Sidebar } from './components/Sidebar';
import { CoreStatus } from './components/CoreStatus';
import { CentralHologram } from './components/CentralHologram';
import { HumanInterface } from './components/HumanInterface';
import { NeuralActivity } from './components/NeuralActivity';
import { SystemLogs } from './components/SystemLogs';
import { ResourceOverview } from './components/ResourceOverview';
import { NetworkActivity } from './components/NetworkActivity';
import { AiAgents } from './components/AiAgents';
import { RealTimeFeed } from './components/RealTimeFeed';
import { EnvironmentalScan } from './components/EnvironmentalScan';
import { ThreatMap } from './components/ThreatMap';
import { QuantumLinkStatus } from './components/QuantumLinkStatus';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { CommandBar } from './components/CommandBar';
import { AgentModal } from './components/AgentModal';
import { ThreatModal } from './components/ThreatModal';
import { QuickAccessModal } from './components/QuickAccessModal';

export default function App() {
  const { holoMode, tickTelemetry } = useNexusStore();

  // Run telemetry background clock simulation
  useEffect(() => {
    const timer = setInterval(() => {
      tickTelemetry();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickTelemetry]);

  // Support pywebview or external backend message bridging if present
  useEffect(() => {
    window.addMessage = (role, text) => {
      useNexusStore.setState((state) => ({
        logs: [
          ...state.logs,
          {
            id: Date.now(),
            time: new Date().toTimeString().split(' ')[0],
            text: `[${role.toUpperCase()}]: ${text}`,
            type: role === 'assistant' ? 'success' : 'info',
          },
        ],
      }));
    };
  }, []);

  return (
    <div className="relative w-screen h-screen min-h-[900px] bg-[#030712] text-slate-100 font-sans flex flex-col justify-between overflow-hidden select-none cyber-grid">
      {/* Background Ambient Glow Nebulae */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[350px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[400px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Holographic Scanline Shader Layer (Toggled by HOLO MODE) */}
      {holoMode && (
        <div className="fixed inset-0 z-50 pointer-events-none holo-scanlines">
          <div className="w-full h-12 bg-cyan-400/5 holo-beam" />
        </div>
      )}

      {/* 1. TOP HEADER NAVIGATION */}
      <HeaderNav />

      {/* 2. MAIN CENTER HUD WORKSPACE */}
      <div className="relative z-10 flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dashboard Grid Container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          
          {/* ROW 1: CORE STATUS // CENTRAL HERO HOLOGRAM // HUMAN INTERFACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* Left: Core Status */}
            <div className="lg:col-span-3 flex flex-col">
              <CoreStatus />
            </div>

            {/* Center: Central 3D Hologram */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="hud-panel rounded overflow-hidden flex-1 relative min-h-[280px]">
                <div className="hud-corner hud-corner-tl" />
                <div className="hud-corner hud-corner-tr" />
                <div className="hud-corner hud-corner-bl" />
                <div className="hud-corner hud-corner-br" />
                <CentralHologram />
              </div>
            </div>

            {/* Right: Human Interface */}
            <div className="lg:col-span-3 flex flex-col">
              <HumanInterface />
            </div>
          </div>

          {/* ROW 2: NEURAL ACTIVITY & LOGS // RESOURCES & NETWORK // AGENTS & REAL-TIME FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* Left Column: Neural Activity & System Logs */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <NeuralActivity />
              <div className="flex-1 min-h-[160px]">
                <SystemLogs />
              </div>
            </div>

            {/* Center Column: Resource Overview & Network Activity */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ResourceOverview />
              <NetworkActivity />
            </div>

            {/* Right Column: AI Agents & Real-Time Feed */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <AiAgents />
              <RealTimeFeed />
            </div>
          </div>

          {/* ROW 3: BOTTOM TELEMETRY 4-PANEL ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <EnvironmentalScan />
            <ThreatMap />
            <QuantumLinkStatus />
            <PredictiveAnalytics />
          </div>

        </main>
      </div>

      {/* 3. BOTTOM COMMAND BAR FOOTER */}
      <CommandBar />

      {/* Interactive Modals */}
      <AgentModal />
      <ThreatModal />
      <QuickAccessModal />
    </div>
  );
}