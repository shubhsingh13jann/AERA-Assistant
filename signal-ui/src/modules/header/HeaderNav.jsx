import React, { useState, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import {
  Mic,
  Volume2,
  VolumeX,
  Maximize2,
  Tv,
  MessageSquare,
  Grid,
  Shield,
  ChevronDown,
  Activity,
} from 'lucide-react';

export const HeaderNav = () => {
  const {
    systemStatus,
    systemSubStatus,
    coreStatus,
    quantumLink,
    soundEnabled,
    toggleSound,
    activeHeaderTab,
    setActiveHeaderTab,
    currentTime,
    currentDate,
    updateClock,
    hardware,
    micLevel,
  } = useNexusStore();

  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [updateClock]);

  const headerTabs = [
    { id: 'expand', icon: Maximize2 },
    { id: 'display', icon: Tv },
    { id: 'chat', icon: MessageSquare },
    { id: 'grid', icon: Grid },
    { id: 'shield', icon: Shield },
  ];

  return (
    <header className="relative z-30 w-full px-3 py-1.5 flex items-center justify-between border-b border-cyan-500/20 bg-[#060b19]/90 backdrop-blur-md shrink-0 select-none">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75" />

      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        <div 
          className="relative w-8 h-8 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          onClick={() => soundService.click()}
        >
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none stroke-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" strokeWidth="6">
            <polygon points="50 5, 90 27.5, 90 72.5, 50 95, 10 72.5, 10 27.5" stroke="rgba(0,240,255,0.8)" fill="rgba(0,240,255,0.06)" />
            <path d="M30 40 L50 25 L70 40 L50 75 Z" stroke="rgba(56,189,248,0.9)" strokeWidth="5" />
            <circle cx="50" cy="45" r="5" fill="#00f0ff" />
          </svg>
        </div>

        <div>
          <div className="text-sm font-mono tracking-wider text-cyan-200 font-bold leading-none glow-text-cyan">
            {currentTime || new Date().toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-[9px] font-mono tracking-wider text-slate-400 uppercase mt-0.5">
            {currentDate || new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        <div className="h-5 w-[1px] bg-cyan-500/20 mx-0.5" />

        <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20">
          <div className="relative flex items-center justify-center">
            <Mic className={`w-3 h-3 ${micLevel > 10 ? 'text-cyan-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SYSTEM {systemStatus}
            </div>
            <div className="text-[8px] text-emerald-400/70 font-mono tracking-tight hidden sm:block">
              {systemSubStatus}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER SECTION */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg border border-cyan-500/20 bg-[#081226]/60">
          {headerTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeHeaderTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveHeaderTab(tab.id)}
                onMouseEnter={() => soundService.hover()}
                className={`p-1 rounded transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 glow-box-cyan'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
                title={tab.id}
              >
                <Icon className="w-3 h-3" />
              </button>
            );
          })}
        </div>

        <div className="text-center cursor-default">
          <h1 className="font-orbitron font-black text-lg tracking-[0.2em] text-cyan-300 glow-text-cyan flex items-center justify-center gap-2 leading-none">
            NEXUS PRIME
          </h1>
          <p className="text-[8px] font-mono tracking-[0.25em] text-cyan-400/70 uppercase">
            INTELLIGENT CONTROL SYSTEM
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSound}
          onMouseEnter={() => soundService.hover()}
          className="p-1 rounded border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all cursor-pointer"
          title={soundEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
        >
          {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
        </button>

        <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-cyan-500/20 bg-[#081226]/50">
          <div>
            <div className="text-[8px] font-mono text-slate-400 tracking-wider">
              CPU ({hardware.cores} CORES)
            </div>
            <div className="text-[11px] font-mono font-bold text-cyan-300 leading-none">
              {coreStatus.cpu.toFixed(1)}%
            </div>
          </div>
          <svg className="w-9 h-4 text-cyan-400 overflow-visible" viewBox="0 0 50 20">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              points="0,15 10,12 18,16 26,6 34,14 42,9 50,11"
              className="drop-shadow-[0_0_3px_rgba(0,240,255,0.8)]"
            />
          </svg>
        </div>

        <div className="hidden md:flex items-center gap-2 px-2 py-0.5 rounded border border-cyan-500/20 bg-[#081226]/50">
          <div>
            <div className="text-[8px] font-mono text-slate-400 tracking-wider">LINK STATUS</div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 leading-none glow-text-green">
              {quantumLink}
            </div>
          </div>
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        </div>

        <div className="relative">
          <button
            onClick={() => {
              soundService.click();
              setProfileOpen(!profileOpen);
            }}
            className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded border border-cyan-500/30 bg-[#0a1630]/70 hover:border-cyan-400 transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full border border-cyan-400 overflow-hidden bg-cyan-950 flex items-center justify-center">
              <span className="text-[9px] font-bold text-cyan-300">NX</span>
            </div>
            <div className="text-left leading-none">
              <div className="text-[9px] font-mono font-bold text-slate-200">
                NEXUS AI
              </div>
              <div className="text-[7px] font-mono text-cyan-400 mt-0.5">
                v7.3.2
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-8 w-44 rounded border border-cyan-500/30 bg-[#060e20] p-2 shadow-2xl z-50 text-xs font-mono">
              <div className="text-cyan-300 font-bold border-b border-cyan-500/20 pb-1 mb-1">
                OPERATOR // ROOT
              </div>
              <div className="text-slate-400 text-[10px] space-y-1">
                <div>Hardware: {hardware.cores} Cores, {hardware.memoryGB} GB RAM</div>
                <div>Downlink: {hardware.downlink}</div>
                <div className="text-emerald-400">Signal AI Core: ONLINE</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

