import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';
import { Shield, Database, Cpu, Sparkles, Crosshair } from 'lucide-react';

export const AiAgents = () => {
  const { agents, setSelectedAgent, toggleAgentStatus } = useNexusStore();

  const getAgentIcon = (id) => {
    switch (id) {
      case 'sentinel': return Shield;
      case 'oracle': return Database;
      case 'synth': return Sparkles;
      case 'vertex': return Cpu;
      case 'ares': return Crosshair;
      default: return Cpu;
    }
  };

  return (
    <div
      className="hud-panel p-2.5 rounded relative flex flex-col justify-between"
      onMouseEnter={() => soundFx.hover()}
    >
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Header */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-300 pb-1 border-b border-cyan-500/20">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-cyan-400 font-bold">//</span>
          <span className="text-slate-200">AI AGENTS</span>
        </div>
        <button
          onClick={() => {
            soundFx.click();
            if (agents && agents.length > 0) setSelectedAgent(agents[0]);
          }}
          className="text-[8px] font-mono text-cyan-400 hover:underline cursor-pointer"
        >
          VIEW ALL
        </button>
      </div>

      {/* Roster List (Compact) */}
      <div className="space-y-1 my-1">
        {(agents || []).slice(0, 4).map((agent) => {
          const Icon = getAgentIcon(agent.id);
          const isActive = agent.status === 'ACTIVE';

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className="flex items-center justify-between p-1 rounded hover:bg-cyan-950/30 transition-all border border-transparent hover:border-cyan-500/30 cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                  isActive
                    ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                    : 'border-purple-500/40 bg-purple-950/40 text-purple-300'
                }`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="min-w-0 leading-none">
                  <div className="text-[10px] font-mono font-bold text-slate-200 group-hover:text-cyan-300">
                    {agent.name}
                  </div>
                  <div className="text-[8px] font-mono text-slate-400 truncate mt-0.5">
                    {agent.role}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAgentStatus(agent.id);
                }}
                className={`flex items-center gap-1 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border transition-all ${
                  isActive
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                    : 'border-purple-500/40 bg-purple-950/30 text-purple-400'
                }`}
              >
                <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}`} />
                <span>{agent.status}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AiAgents;

