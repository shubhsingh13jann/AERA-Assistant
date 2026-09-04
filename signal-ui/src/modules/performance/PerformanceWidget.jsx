import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import { Cpu, Database, HardDrive, Monitor, ArrowUpRight } from 'lucide-react';

export const PerformanceWidget = () => {
  const { setActiveNav, coreStatus, hardware } = useNexusStore();

  const handleOpenFull = () => {
    soundService.click();
    setActiveNav('PERFORMANCE');
  };

  return (
    <div
      onClick={handleOpenFull}
      onMouseEnter={() => soundService.hover()}
      className="hud-panel p-2.5 rounded relative flex flex-col justify-between h-full cursor-pointer group transition-all hover:border-cyan-400"
      title="Click to view full Task Manager Performance Monitor"
    >
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Header */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-300 pb-1 border-b border-cyan-500/20 shrink-0">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-cyan-400 font-bold">//</span>
          <span className="text-slate-200">PERFORMANCE</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenFull();
          }}
          className="flex items-center gap-0.5 text-[8px] font-mono font-bold text-cyan-400 hover:text-cyan-200 hover:underline cursor-pointer"
        >
          <span>TASK MANAGER</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Roster of 4 Key Devices */}
      <div className="space-y-1.5 my-1">
        {/* CPU */}
        <div className="flex items-center justify-between text-[9px] font-mono p-1 rounded bg-[#061026]/70 border border-cyan-500/15 group-hover:border-cyan-500/30">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-300">CPU (12C / 16T)</span>
          </div>
          <span className="font-bold text-cyan-300">25% 1.56 GHz</span>
        </div>

        {/* Memory */}
        <div className="flex items-center justify-between text-[9px] font-mono p-1 rounded bg-[#061026]/70 border border-cyan-500/15 group-hover:border-cyan-500/30">
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-sky-400" />
            <span className="text-slate-300">RAM (DDR4)</span>
          </div>
          <span className="font-bold text-sky-300">7.0/7.7 GB (91%)</span>
        </div>

        {/* Disk NVMe */}
        <div className="flex items-center justify-between text-[9px] font-mono p-1 rounded bg-[#061026]/70 border border-cyan-500/15 group-hover:border-cyan-500/30">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-300">Disk 0 (NVMe)</span>
          </div>
          <span className="font-bold text-emerald-300">40%</span>
        </div>

        {/* GPU */}
        <div className="flex items-center justify-between text-[9px] font-mono p-1 rounded bg-[#061026]/70 border border-cyan-500/15 group-hover:border-cyan-500/30">
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3 h-3 text-purple-400" />
            <span className="text-slate-300">GPU (RTX + UHD)</span>
          </div>
          <span className="font-bold text-purple-300">0% (55°C) | 24%</span>
        </div>
      </div>

      {/* Footer Callout */}
      <div className="pt-1 border-t border-cyan-500/15 flex items-center justify-between text-[7.5px] font-mono text-cyan-400/80">
        <span>12th Gen Intel i5-1240P</span>
        <span className="group-hover:text-cyan-200 group-hover:translate-x-0.5 transition-transform font-bold">CLICK FOR 60s REAL-TIME GRAPH &gt;</span>
      </div>
    </div>
  );
};

export default PerformanceWidget;
