import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';

export const ResourceOverview = () => {
  const { resourceOverview, hardware } = useNexusStore();

  const metrics = [
    { label: `CPU (${hardware?.cores || 8}C)`, value: resourceOverview?.cpu || 45, color: '#8b5cf6' },
    { label: 'GPU VRAM', value: resourceOverview?.gpu || 62, color: '#00f0ff' },
    { label: `RAM (${hardware?.memoryGB || 16}GB)`, value: resourceOverview?.memory || 54, color: '#ec4899' },
    { label: 'SYS DISK', value: resourceOverview?.storage || 38, color: '#f59e0b' },
  ];

  const totalLoad = resourceOverview?.total || 51;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalLoad / 100) * circumference;

  return (
    <div
      className="hud-panel p-2.5 rounded relative flex flex-col justify-between h-full"
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
          <span className="text-slate-200">RESOURCE OVERVIEW</span>
        </div>
        <span className="text-[8px] font-mono text-cyan-400/80">LIVE ALLOCATION</span>
      </div>

      <div className="flex items-center gap-3 my-auto py-1">
        {/* Compact Radial Utilization Gauge */}
        <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke="rgba(56, 189, 248, 0.15)"
              strokeWidth="5"
              fill="none"
            />
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke="#8b5cf6"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="drop-shadow-[0_0_6px_#8b5cf6] transition-all duration-300"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-mono font-bold text-purple-300 glow-text-purple leading-none">
              {totalLoad}%
            </span>
            <span className="text-[6px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">
              LOAD
            </span>
          </div>
        </div>

        {/* Compact Resource Bars */}
        <div className="flex-1 space-y-1 min-w-0 font-mono">
          {metrics.map((item) => (
            <div key={item.label} className="text-[9px]">
              <div className="flex justify-between text-slate-300 mb-0.5 leading-none">
                <span className="text-slate-400 text-[8px]">{item.label}</span>
                <span className="font-bold text-[8px]" style={{ color: item.color }}>
                  {item.value}%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-900/90 rounded-full overflow-hidden border border-cyan-500/15">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.color,
                    boxShadow: `0 0 5px ${item.color}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceOverview;

