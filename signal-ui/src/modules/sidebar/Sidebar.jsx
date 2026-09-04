import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import {
  Home,
  Activity,
  BookOpen,
  FileText,
  Wrench,
  Settings,
} from 'lucide-react';

export const Sidebar = () => {
  const { activeNav, setActiveNav } = useNexusStore();

  const navItems = [
    { id: 'Chat', label: 'Chat', icon: Home },
    { id: 'Performance', label: 'Performance', icon: Activity },
    { id: 'Knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'Files', label: 'Files', icon: FileText },
    { id: 'Tools', label: 'Tools', icon: Wrench },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 h-full flex flex-col justify-between border-r border-cyan-500/15 bg-[#030712]/90 backdrop-blur-2xl p-4 select-none z-20">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Concentric Arc Reactor Ring */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400 animate-[spin_12s_linear_infinite]">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3" strokeDasharray="14 10" fill="none" opacity="0.6" />
              <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" fill="none" opacity="0.8" />
            </svg>
            <div className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff] animate-pulse" />
          </div>

          <div>
            <div className="font-sans font-bold text-lg tracking-wider text-white leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              JARVIS
            </div>
            <div className="text-[9px] font-mono tracking-widest text-cyan-400/80 uppercase mt-1">
              YOUR AI ASSISTANT
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.id === 'Chat' && (activeNav === 'Chat' || activeNav === 'DASHBOARD' || !activeNav)) ||
              (item.id === 'Performance' && (activeNav === 'Performance' || activeNav === 'PERFORMANCE')) ||
              activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundService.click();
                  setActiveNav(item.id);
                }}
                onMouseEnter={() => soundService.hover()}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium tracking-wide ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="pt-4 border-t border-cyan-500/15">
        <div className="flex items-center gap-2 px-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </span>
          <span className="text-xs font-semibold text-emerald-400 tracking-wide">Online</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 px-2 mt-1">
          JARVIS v1.0
        </div>
      </div>
    </aside>
  );
};

