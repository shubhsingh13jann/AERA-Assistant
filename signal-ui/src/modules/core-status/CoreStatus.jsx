import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';

export const CoreStatus = () => {
  const { coreStatus, hardware } = useNexusStore();

  const metrics = [
    { label: `CPU (${hardware?.cores || 8} Cores)`, value: coreStatus?.cpu || 42, color: '#00f0ff' },
    { label: `Memory (${hardware?.memoryGB || 16} GB)`, value: coreStatus?.memory || 58, color: '#38bdf8' },
    { label: 'Storage (SSD)', value: coreStatus?.storage || 36, color: '#818cf8' },
    { label: 'Network (I/O)', value: coreStatus?.network || 64, color: '#a855f7' },
    { label: 'Neural Matrix', value: coreStatus?.neuralNet || 89, color: '#10b981' },
  ];

  // Overall health computed from CPU load & memory
  const cpuVal = coreStatus?.cpu || 42;
  const memVal = coreStatus?.memory || 58;
  const overallHealth = +(100 - (cpuVal * 0.15 + (memVal - 40) * 0.1)).toFixed(1);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallHealth / 100) * circumference;

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
          <span className="text-slate-200">CORE STATUS</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] text-cyan-400/60">
          <span>···</span>
          <span>&gt;</span>
        </div>
      </div>

      <div className="flex items-center gap-3 my-auto py-1">
        {/* Compact Radial Health Gauge */}
        <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke="rgba(56, 189, 248, 0.12)"
              strokeWidth="5"
              fill="none"
            />
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke="#00f0ff"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="drop-shadow-[0_0_6px_#00f0ff] transition-all duration-300"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-mono font-bold text-cyan-300 glow-text-cyan leading-none">
              {overallHealth}%
            </span>
            <span className="text-[6px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">
              HEALTH
            </span>
          </div>
        </div>

        {/* Telemetry Metric Bars */}
        <div className="flex-1 space-y-1 min-w-0">
          {metrics.map((item) => (
            <div key={item.label} className="text-[9px] font-mono">
              <div className="flex justify-between text-slate-300 mb-0.5 leading-none">
                <span className="text-slate-400 text-[8px] truncate">{item.label}</span>
                <span className="font-bold text-cyan-200 text-[8px]">{item.value}%</span>
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

export default CoreStatus;

