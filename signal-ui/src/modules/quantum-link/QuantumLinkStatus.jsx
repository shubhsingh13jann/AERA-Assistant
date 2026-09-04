import React, { useRef, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';

export const QuantumLinkStatus = () => {
  const canvasRef = useRef(null);
  const { latency, packetsRate } = useNexusStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const phi = (1 + Math.sqrt(5)) / 2;
    const r = 30; // Contained within box

    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return { x: (x / len) * r, y: (y / len) * r, z: (z / len) * r };
    });

    let angleX = 0;
    let angleY = 0;
    let lastTime = 0;
    const frameDelay = 1000 / 35;

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      angleX += 0.012;
      angleY += 0.015;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = baseVertices.map((v) => {
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.z * cosY + v.x * sinY;
        let y1 = v.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + v.y * sinX;

        return {
          x: cx + x1,
          y: cy + y1,
          z: z2,
        };
      });

      // Wireframe edges
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 36) {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      projected.forEach((p) => {
        const alpha = Math.max(0.3, (p.z + r) / (r * 2));
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Core glow
      const corePulse = 5 + Math.sin(Date.now() / 250) * 1.5;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse, 0, Math.PI * 2);
      ctx.fill();
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

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
          <span className="text-slate-200">QUANTUM LINK</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-cyan-400/80">
          <span>QL-512</span>
          <span className="text-slate-500">··· &gt;</span>
        </div>
      </div>

      <div className="flex items-center gap-2 my-auto py-1">
        {/* 3D Icosahedron Cage Canvas */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0 overflow-hidden">
          <canvas ref={canvasRef} width={96} height={96} className="w-full h-full" />
        </div>

        {/* Link Telemetry */}
        <div className="flex-1 space-y-1 font-mono text-[9px] min-w-0">
          <div className="flex justify-between">
            <span className="text-slate-400">STRENGTH</span>
            <span className="font-bold text-cyan-300">100%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">LATENCY</span>
            <span className="font-bold text-emerald-400">{latency || 12} ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">PACKETS</span>
            <span className="font-bold text-cyan-300">{packetsRate || '1.8'}M/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Q-STABILITY</span>
            <span className="font-bold text-cyan-300">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumLinkStatus;

