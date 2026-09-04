import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';
import { X, Play, Pause, Cpu } from 'lucide-react';

export const AgentModal = () => {
  const { selectedAgent, setSelectedAgent, toggleAgentStatus } = useNexusStore();

  if (!selectedAgent) return null;

  const isActive = selectedAgent.status === 'ACTIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="hud-panel max-w-sm w-full p-4 rounded border border-cyan-400 relative">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.click();
            setSelectedAgent(null);
          }}
          className="absolute top-3 right-3 p-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded border border-cyan-400 bg-cyan-950/50 flex items-center justify-center text-cyan-300">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-orbitron font-bold text-base text-cyan-200">
              {selectedAgent.name}
            </div>
            <div className="text-[10px] font-mono text-cyan-400/80">
              ROLE: {selectedAgent.role}
            </div>
          </div>
        </div>

        {/* Agent Telemetry Details */}
        <div className="space-y-2 font-mono text-[11px] mb-4">
          <div className="flex justify-between p-1.5 rounded bg-[#061026] border border-cyan-500/20">
            <span className="text-slate-400">STATUS:</span>
            <span className={`font-bold ${isActive ? 'text-emerald-400 glow-text-green' : 'text-purple-400'}`}>
              {selectedAgent.status}
            </span>
          </div>
          <div className="flex justify-between p-1.5 rounded bg-[#061026] border border-cyan-500/20">
            <span className="text-slate-400">EFFICIENCY:</span>
            <span className="font-bold text-cyan-300">{selectedAgent.efficiency}</span>
          </div>
          <div className="flex justify-between p-1.5 rounded bg-[#061026] border border-cyan-500/20">
            <span className="text-slate-400">TASKS EXECUTED:</span>
            <span className="font-bold text-slate-200">{selectedAgent.tasks}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-cyan-500/20">
          <button
            onClick={() => {
              toggleAgentStatus(selectedAgent.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono font-bold tracking-wider transition-all ${
              isActive
                ? 'bg-purple-600/30 border border-purple-400 text-purple-200 hover:bg-purple-600/50'
                : 'bg-emerald-600/30 border border-emerald-400 text-emerald-200 hover:bg-emerald-600/50'
            }`}
          >
            {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isActive ? 'SUSPEND AGENT' : 'ACTIVATE AGENT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentModal;

