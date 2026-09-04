import React, { useEffect, useState, useMemo } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import {
  LayoutDashboard,
  Bot,
  Grid,
  Box,
  Sliders,
  ShieldAlert,
  FileText,
  Settings,
  Lock,
} from 'lucide-react';

export const Sidebar = () => {
  const {
    activeNav,
    setActiveNav,
    operator,
    uptimeSeconds,
  } = useNexusStore();

  const formattedUptime = useMemo(() => {
    const safeSecs = uptimeSeconds || 0;
    const hrs = String(Math.floor(safeSecs / 3600)).padStart(2, '0');
    const mins = String(Math.floor((safeSecs % 3600) / 60)).padStart(2, '0');
    const secs = String(safeSecs % 60).padStart(2, '0');
    return { hrs, mins, secs };
  }, [uptimeSeconds]);

  const navItems = [
    { id: 'DASHBOARD', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'AI AGENTS', label: 'AI AGENTS', icon: Bot },
    { id: 'DATA MATRIX', label: 'DATA MATRIX', icon: Grid },
    { id: 'MODELS', label: 'MODELS', icon: Box },
    { id: 'AUTOMATIONS', label: 'AUTOMATIONS', icon: Sliders },
    { id: 'CYBER VAULT', label: 'CYBER VAULT', icon: Lock },
    { id: 'ANOMALIES', label: 'ANOMALIES', icon: ShieldAlert, badge: 3 },
    { id: 'LOGS', label: 'LOGS', icon: FileText },
    { id: 'SETTINGS', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-52 shrink-0 h-full flex flex-col justify-between border-r border-cyan-500/20 bg-[#050b18]/90 backdrop-blur-md p-2 select-none overflow-hidden">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="w-7 h-7 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center glow-box-cyan">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400 stroke-current" fill="none" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <circle cx="12" cy="12" r="3" fill="#00f0ff" />
            </svg>
          </div>
          <div>
            <div className="font-orbitron font-bold text-xs tracking-wider text-slate-100 leading-none">
              NEXUS AI
            </div>
            <div className="text-[8px] font-mono tracking-widest text-cyan-400/80 uppercase">
              COMMAND CENTER
            </div>
          </div>
        </div>

        {/* Operator Card */}
        <div className="hud-panel p-2 rounded mb-2 relative overflow-hidden">
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-br" />

          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full border border-cyan-400/60 overflow-hidden bg-[#0a1630] flex items-center justify-center shrink-0">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-300" fill="currentColor">
                  <path d="M12 2a9 9 0 0 0-9 9c0 4.1 2.8 7.5 6.6 8.6v1.4h4.8v-1.4c3.8-1.1 6.6-4.5 6.6-8.6a9 9 0 0 0-9-9zm0 4a3 3 0 0 1 3 3v2h-6V9a3 3 0 0 1 3-3zm-5 7h10c-.3 2.8-2.6 5-5 5s-4.7-2.2-5-5z" />
                </svg>
              </div>
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-300 truncate">
                  {operator?.name || 'COMMANDER'}
                </span>
                <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-500/30">
                  Lv {operator?.level || 4}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/20 mt-1">
                <div
                  className="h-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]"
                  style={{ width: `${((operator?.xp || 6200) / (operator?.xpMax || 10000)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.label)}
                onMouseEnter={() => soundService.hover()}
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded transition-all text-[11px] font-mono font-semibold tracking-wider relative group ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 glow-box-cyan'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                )}
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[8px] font-mono font-bold px-1 rounded-full bg-purple-600/80 text-purple-100 border border-purple-400/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-1.5 pt-1.5 border-t border-cyan-500/20">
        <div className="hud-panel p-1.5 rounded relative">
          <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
            <span>SESSION UPTIME</span>
            <span className="text-cyan-400 text-[7px]">SYS // OK</span>
          </div>

          <div className="flex items-baseline justify-between text-cyan-300 font-mono font-bold text-sm leading-none mt-0.5 glow-text-cyan">
            <span>{formattedUptime.hrs}</span>
            <span className="text-cyan-500/50">:</span>
            <span>{formattedUptime.mins}</span>
            <span className="text-cyan-500/50">:</span>
            <span>{formattedUptime.secs}</span>
          </div>

          <div className="w-full h-2.5 overflow-hidden mt-0.5">
            <svg className="w-full h-full text-cyan-400 opacity-80" viewBox="0 0 150 16" preserveAspectRatio="none">
              <path
                d="M 0 8 Q 25 1, 50 8 T 100 8 T 150 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>

        {/* Power Core */}
        <div className="hud-panel p-1.5 rounded flex items-center justify-between relative">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full text-cyan-500/40 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3" strokeDasharray="6 8" fill="none" />
            </svg>
            <svg className="absolute inset-0.5 w-7 h-7 text-cyan-400 animate-[spin_6s_linear_infinite_reverse]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" strokeDasharray="14 10" fill="none" />
            </svg>
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
          </div>

          <div className="flex-1 pl-2 leading-tight">
            <div className="text-[7px] font-mono text-slate-400 uppercase">POWER CORE</div>
            <div className="text-[10px] font-mono font-bold text-cyan-300 glow-text-cyan">STABLE</div>
          </div>

          <div className="text-[10px] font-mono font-bold text-cyan-400">
            100%
          </div>
        </div>
      </div>
    </aside>
  );
};
