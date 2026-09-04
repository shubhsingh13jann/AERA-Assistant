import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';
import { X, ShieldAlert, CheckCircle } from 'lucide-react';

export const ThreatModal = () => {
  const { selectedThreat, setSelectedThreat, executeCommand } = useNexusStore();

  if (!selectedThreat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="hud-panel max-w-sm w-full p-4 rounded border border-red-500/80 relative">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.click();
            setSelectedThreat(null);
          }}
          className="absolute top-3 right-3 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded border border-red-500 bg-red-950/60 flex items-center justify-center text-red-400 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-orbitron font-bold text-base text-red-400 glow-text-red">
              SECURITY INCIDENT
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              VECTOR: {selectedThreat.id.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 font-mono text-[11px] mb-4">
          <div className="flex justify-between p-1.5 rounded bg-[#100609] border border-red-500/30">
            <span className="text-slate-400">INCIDENT:</span>
            <span className="font-bold text-red-300">{selectedThreat.title}</span>
          </div>
          <div className="flex justify-between p-1.5 rounded bg-[#100609] border border-red-500/30">
            <span className="text-slate-400">LOCATION:</span>
            <span className="font-bold text-slate-200">{selectedThreat.location}</span>
          </div>
          <div className="flex justify-between p-1.5 rounded bg-[#100609] border border-red-500/30">
            <span className="text-slate-400">SEVERITY:</span>
            <span className="font-bold text-red-400 glow-text-red">{selectedThreat.severity}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-500/20">
          <button
            onClick={() => {
              executeCommand(`quarantine ${selectedThreat.id}`);
              setSelectedThreat(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono font-bold tracking-wider bg-red-600/30 border border-red-400 text-red-200 hover:bg-red-600/60 transition-all"
          >
            <CheckCircle className="w-3 h-3" />
            <span>QUARANTINE VECTOR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreatModal;

