import React, { useRef, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';

export const NetworkActivity = () => {
  const canvasRef = useRef(null);
  const { latency, packetsRate, hardware } = useNexusStore();

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
      offset += 0.05;

      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      // Draw Wave Function
      const drawWave = (color, freq, amp, speed, lineWidth = 1.2) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const y = cy + Math.sin(x * freq + offset * speed) * Math.cos(x * 0.015 + offset * 0.4) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };

      // Waves
      drawWave('rgba(0, 240, 255, 0.85)', 0.05, 12, 1.2, 1.5);
      drawWave('rgba(168, 85, 247, 0.7)', 0.03, 14, -0.9, 1.2);
      drawWave('rgba(59, 130, 246, 0.5)', 0.02, 10, 0.6, 1.0);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

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
          <span className="text-slate-200">NETWORK ACTIVITY</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-cyan-400/80">
          <span>LATENCY: {latency || 12}ms</span>
          <span className="text-slate-500">··· &gt;</span>
        </div>
      </div>

      {/* Compact Wave Canvas */}
      <div className="w-full h-14 overflow-hidden relative my-auto">
        <canvas ref={canvasRef} width={280} height={56} className="w-full h-full" />
      </div>

      {/* Traffic Summary */}
      <div className="flex items-center justify-between pt-1 border-t border-cyan-500/15 text-center font-mono text-[8px]">
        <div>
          <span className="text-slate-400 mr-1">DOWNLINK</span>
          <span className="font-bold text-cyan-300 glow-text-cyan">{hardware?.downlink || '10 Gbps'}</span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">PACKETS</span>
          <span className="font-bold text-emerald-300 glow-text-green">{packetsRate || '1.8'}M/s</span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">RTT</span>
          <span className="font-bold text-purple-300 glow-text-purple">{latency || 12}ms</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkActivity;

