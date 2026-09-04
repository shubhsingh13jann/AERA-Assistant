import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';
import { CheckCircle2, CircleDot, AlertTriangle } from 'lucide-react';

export const RealTimeFeed = () => {
  const { realTimeFeed, setSelectedThreat } = useNexusStore();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'info':
        return <CircleDot className="w-3 h-3 text-cyan-400" />;
      case 'alert':
        return <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" />;
      default:
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
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
          <span className="text-slate-200">REAL-TIME FEED</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono font-bold text-emerald-400 glow-text-green">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-1.5 my-1">
        {(realTimeFeed || []).slice(0, 3).map((item) => {
          const isAlert = item.status === 'alert';

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isAlert) {
                  soundFx.alert();
                  setSelectedThreat({
                    id: 'node_47',
                    title: 'Node_47 Buffer Anomaly',
                    location: 'Sector 7 Core Cluster',
                    severity: 'CRITICAL',
                    timestamp: item.time,
                  });
                } else {
                  soundFx.click();
                }
              }}
              className={`flex items-start gap-2 p-1 rounded transition-all cursor-pointer border ${
                isAlert
                  ? 'border-red-500/40 bg-red-950/20 hover:bg-red-950/40'
                  : 'border-transparent hover:border-cyan-500/30 hover:bg-cyan-950/20'
              }`}
            >
              <span className="text-[8px] font-mono text-cyan-400/80 pt-0.5">
                {item.time}
              </span>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-[10px] font-mono font-bold leading-snug truncate ${
                    isAlert ? 'text-red-300 glow-text-red' : 'text-slate-200'
                  }`}
                >
                  {item.title}
                </div>
                <div
                  className={`text-[8px] font-mono truncate ${
                    isAlert ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  {item.desc}
                </div>
              </div>

              <div className="pt-0.5 shrink-0">{getStatusIcon(item.status)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RealTimeFeed;

