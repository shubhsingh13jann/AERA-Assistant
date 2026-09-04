import React from 'react';

export const ModuleSkeleton = ({ title = 'INITIALIZING SUBSYSTEM...' }) => {
  return (
    <div className="hud-panel p-2.5 rounded relative h-full flex flex-col justify-between overflow-hidden animate-pulse">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-500/60 font-mono font-bold">//</span>
          <span className="text-[10px] font-mono text-cyan-400/60 tracking-wider">
            {title}
          </span>
        </div>
        <div className="w-2 h-2 rounded-full bg-cyan-500/30 animate-ping" />
      </div>

      {/* Body Skeleton Placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2">
        <div className="w-10 h-10 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400/50 animate-pulse" />
        </div>
        <div className="w-24 h-1.5 bg-cyan-950/60 rounded border border-cyan-500/20" />
      </div>

      {/* Footer Skeleton */}
      <div className="pt-1 border-t border-cyan-500/15 flex justify-between text-[7px] font-mono text-cyan-500/40">
        <span>LINKING BUS...</span>
        <span>0x00</span>
      </div>
    </div>
  );
};

export default ModuleSkeleton;

