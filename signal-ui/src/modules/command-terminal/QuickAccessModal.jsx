import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';
import { X, Zap, Shield, RefreshCw, Cpu } from 'lucide-react';

export const QuickAccessModal = () => {
  const { quickAccessOpen, toggleQuickAccess, executeCommand } = useNexusStore();

  if (!quickAccessOpen) return null;

  const actions = [
    { title: 'Full System Diagnostic', cmd: 'scan', desc: 'Scan all quantum and neural clusters', icon: Shield },
    { title: 'Core Overdrive (Boost)', cmd: 'boost', desc: 'Overclock processor pipeline', icon: Zap },
    { title: 'Flush Terminal Buffer', cmd: 'clear', desc: 'Purge real-time memory buffer', icon: RefreshCw },
    { title: 'Holo View Shader', cmd: 'holo', desc: 'Toggle CRT scanline HUD mode', icon: Cpu },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="hud-panel max-w-md w-full p-4 rounded border border-cyan-400 relative">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.click();
            toggleQuickAccess();
          }}
          className="absolute top-3 right-3 p-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-3">
          <div className="font-orbitron font-bold text-base text-cyan-200 glow-text-cyan">
            TACTICAL QUICK ACCESS
          </div>
        </div>

        {/* Grid of Tactical Actions */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={() => {
                  executeCommand(act.cmd);
                  toggleQuickAccess();
                }}
                onMouseEnter={() => soundFx.hover()}
                className="flex items-start gap-2.5 p-2.5 rounded bg-[#061026] border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 group-hover:text-cyan-200">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300">
                    {act.title}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    {act.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickAccessModal;

