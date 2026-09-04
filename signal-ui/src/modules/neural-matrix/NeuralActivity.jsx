import React, { useRef, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';

export const NeuralActivity = () => {
  const canvasRef = useRef(null);
  const { coreStatus, hardware } = useNexusStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;
    const nodes = 22;
    let lastTime = 0;
    const frameDelay = 1000 / 35;

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.04;

      const points = [];
      const w = canvas.width;
      const h = canvas.height;

      for (let i = 0; i <= nodes; i++) {
        const x = (i / nodes) * w;
        const y = h / 2 + Math.sin(i * 0.45 + time) * 12 + Math.cos(i * 0.2 - time * 0.7) * 8;
        points.push({ x, y });
      }

      // Draw glowing gradient curve
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0.5)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Nodes
      points.forEach((p, idx) => {
        if (idx % 2 === 0) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, h);
          ctx.stroke();

          ctx.fillStyle = idx % 4 === 0 ? '#00f0ff' : '#a855f7';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

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
          <span className="text-slate-200">NEURAL ACTIVITY</span>
        </div>
        <span className="text-[8px] font-mono text-cyan-400/80">LIVE MAP</span>
      </div>

      {/* Canvas Wave Visualizer */}
      <div className="w-full h-12 overflow-hidden relative my-1">
        <canvas ref={canvasRef} width={260} height={48} className="w-full h-full" />
      </div>

      {/* Bottom Telemetry Counters */}
      <div className="grid grid-cols-4 gap-1 pt-1 border-t border-cyan-500/15 text-center font-mono text-[8px]">
        <div>
          <div className="font-bold text-cyan-300">{((coreStatus?.cpu || 40) / 10).toFixed(1)} GB/s</div>
          <div className="text-[7px] text-slate-400 uppercase">THROUGHPUT</div>
        </div>
        <div>
          <div className="font-bold text-cyan-300">{(hardware?.cores || 8) * 120}K</div>
          <div className="text-[7px] text-slate-400 uppercase">SYNAPSES</div>
        </div>
        <div>
          <div className="font-bold text-purple-300">0.78</div>
          <div className="text-[7px] text-slate-400 uppercase">LEARN RATE</div>
        </div>
        <div>
          <div className="font-bold text-emerald-300">99.2%</div>
          <div className="text-[7px] text-slate-400 uppercase">ACCURACY</div>
        </div>
      </div>
    </div>
  );
};

export default NeuralActivity;

