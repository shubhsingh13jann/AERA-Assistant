import React, { useRef, useEffect, useState } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';

export const PredictiveAnalytics = () => {
  const canvasRef = useRef(null);
  const { predictiveAnalytics } = useNexusStore();
  const [activeSeries, setActiveSeries] = useState({
    system: true,
    security: true,
    performance: true,
    network: true,
  });

  const seriesMeta = [
    { key: 'system', label: 'SYS', color: '#ef4444' },
    { key: 'security', label: 'SEC', color: '#10b981' },
    { key: 'performance', label: 'PERF', color: '#38bdf8' },
    { key: 'network', label: 'NET', color: '#a855f7' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let offset = 0;
    let lastTime = 0;
    const frameDelay = 1000 / 35;

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      offset += 0.03;

      const w = canvas.width;
      const h = canvas.height;

      // Draw Grid Horizontal Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 10; y < h; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Spline Line
      const drawSpline = (color, freq, amp, phase, isDotted = false) => {
        ctx.beginPath();
        if (isDotted) {
          ctx.setLineDash([2, 3]);
        } else {
          ctx.setLineDash([]);
        }

        for (let x = 0; x <= w; x += 3) {
          const y = h / 2 + Math.sin(x * freq + offset + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.setLineDash([]);
      };

      if (activeSeries.system) drawSpline('#ef4444', 0.04, 12, 0);
      if (activeSeries.security) drawSpline('#10b981', 0.03, 10, 1.5, true);
      if (activeSeries.performance) drawSpline('#38bdf8', 0.025, 14, 3.1);
      if (activeSeries.network) drawSpline('#a855f7', 0.045, 11, 4.2);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeSeries]);

  const toggleSeries = (key) => {
    soundFx.click();
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="hud-panel p-2.5 rounded relative flex flex-col justify-between h-full overflow-hidden"
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
          <span className="text-slate-200">PREDICTIVE ANALYTICS</span>
        </div>
        <span className="text-[8px] font-mono text-cyan-400/80">PREDICT v5</span>
      </div>

      {/* Predictive Canvas */}
      <div className="w-full h-16 overflow-hidden relative my-auto">
        <canvas ref={canvasRef} width={280} height={64} className="w-full h-full" />
      </div>

      {/* Interactive Series Legend */}
      <div className="flex items-center justify-between pt-1 border-t border-cyan-500/15 text-[8px] font-mono">
        {seriesMeta.map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSeries(s.key)}
            className={`flex items-center gap-1 cursor-pointer transition-opacity ${
              activeSeries[s.key] ? 'opacity-100 font-bold' : 'opacity-40 line-through'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span style={{ color: s.color }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Accuracy Summary */}
      <div className="flex items-center justify-between pt-1 text-[8px] font-mono border-t border-cyan-500/10">
        <div>
          <span className="text-slate-400 mr-1">ACCURACY</span>
          <span className="font-bold text-cyan-300">{predictiveAnalytics?.accuracy || 98.4}%</span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">ANOMALIES</span>
          <span className="font-bold text-emerald-400">{predictiveAnalytics?.anomalies || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;

