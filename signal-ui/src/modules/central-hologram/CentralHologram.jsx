import React, { useRef, useEffect, useState } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import { Activity, ShieldCheck, Box, TrendingUp } from 'lucide-react';

export const CentralHologram = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.006);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const pointCount = 240;
    const points = [];

    for (let i = 0; i < pointCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pointCount);
      const theta = Math.sqrt(pointCount * Math.PI) * phi;
      points.push({
        origX: Math.cos(theta) * Math.sin(phi),
        origY: Math.sin(theta) * Math.sin(phi),
        origZ: Math.cos(phi),
      });
    }

    let angleY = 0;
    let angleX = 0.22;
    let lastTime = 0;
    const frameDelay = 1000 / 35; // 35fps smooth lock

    let w = container.clientWidth || 400;
    let h = container.clientHeight || 280;
    canvas.width = w;
    canvas.height = h;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        w = Math.floor(entry.contentRect.width) || 400;
        h = Math.floor(entry.contentRect.height) || 280;
        canvas.width = w;
        canvas.height = h;
      }
    });
    resizeObserver.observe(container);

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2 - 12;
      const radius = Math.min(cx, cy) * 0.58;

      angleY += rotationSpeed;

      // Pedestal Light Beams
      const pedY = cy + radius * 1.05;
      const pedGrad = ctx.createRadialGradient(cx, pedY, 10, cx, cy, radius * 1.5);
      pedGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      pedGrad.addColorStop(0.4, 'rgba(0, 180, 255, 0.1)');
      pedGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = pedGrad;
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.9, pedY + 8);
      ctx.lineTo(cx + radius * 0.9, pedY + 8);
      ctx.lineTo(cx + radius * 1.2, cy);
      ctx.lineTo(cx - radius * 1.2, cy);
      ctx.closePath();
      ctx.fill();

      // Pedestal Glowing Rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(cx, pedY, radius * 0.95, radius * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.ellipse(cx, pedY + 8, radius * 1.1, radius * 0.26, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Orbital Holographic Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleY * 0.4);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.35, radius * 0.42, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3D Sphere Points
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected = points.map((p) => {
        const x0 = p.origX * radius;
        const y0 = p.origY * radius;
        const z0 = p.origZ * radius;

        const x1 = x0 * cosY - z0 * sinY;
        const z1 = z0 * cosY + x0 * sinY;
        const y1 = y0 * cosX - z1 * sinX;
        const z2 = z1 * cosX + y0 * sinX;

        const fov = 300;
        const scale = fov / (fov + z2);

        return {
          x: cx + x1 * scale,
          y: cy + y1 * scale,
          z: z2,
          scale: scale,
        };
      });

      projected.sort((a, b) => a.z - b.z);

      // Constellation Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i += 3) {
        for (let j = i + 1; j < projected.length; j += 6) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 32) {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Particles
      projected.forEach((p) => {
        const alpha = Math.max(0.2, Math.min(1, (p.z + radius) / (radius * 2)));
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.scale * 2), 0, Math.PI * 2);
        ctx.fill();

        if (p.z > 10) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.scale * 0.9), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Core Aura Glow
      const corePulse = 20 + Math.sin(Date.now() / 400) * 4;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, corePulse * 2.5);
      coreGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      coreGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.15)');
      coreGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse * 2.5, 0, Math.PI * 2);
      ctx.fill();
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [rotationSpeed]);

  const handleClick = () => {
    soundService.hologramHum();
    setRotationSpeed(0.025);
    setTimeout(() => setRotationSpeed(0.006), 1200);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center rounded overflow-hidden cursor-pointer group select-none"
      onClick={handleClick}
      title="Click to accelerate hologram"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#061026] via-[#081533] to-[#040817]">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#020510] to-transparent opacity-95" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <canvas
        ref={canvasRef}
        className="relative z-10 drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]"
      />

      {/* Floating HUD Telemetry Badges */}
      <div className="absolute top-2 left-2 z-20 hud-panel px-2.5 py-1 rounded flex items-center gap-2 pointer-events-auto hover:border-cyan-400 transition-all">
        <div className="w-5 h-5 rounded bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Activity className="w-3 h-3 animate-pulse" />
        </div>
        <div>
          <div className="text-[8px] font-mono text-slate-400 tracking-wider leading-none">DATA STREAMS</div>
          <div className="text-[11px] font-mono font-bold text-cyan-300 glow-text-cyan leading-tight mt-0.5">320 active</div>
        </div>
      </div>

      <div className="absolute bottom-3 left-2 z-20 hud-panel px-2.5 py-1 rounded flex items-center gap-2 pointer-events-auto hover:border-cyan-400 transition-all">
        <div className="w-5 h-5 rounded bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
        </div>
        <div>
          <div className="text-[8px] font-mono text-slate-400 tracking-wider leading-none">THREAT MAP</div>
          <div className="text-[11px] font-mono font-bold text-emerald-400 glow-text-green leading-tight mt-0.5">No threats</div>
        </div>
      </div>

      <div className="absolute top-2 right-2 z-20 hud-panel px-2.5 py-1 rounded flex items-center gap-2 pointer-events-auto hover:border-cyan-400 transition-all">
        <div className="w-5 h-5 rounded bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-cyan-400">
          <Box className="w-3 h-3" />
        </div>
        <div>
          <div className="text-[8px] font-mono text-slate-400 tracking-wider leading-none">MODELS RUNNING</div>
          <div className="text-[11px] font-mono font-bold text-cyan-300 glow-text-cyan leading-tight mt-0.5">24 online</div>
        </div>
      </div>

      <div className="absolute bottom-3 right-2 z-20 hud-panel px-2.5 py-1 rounded flex items-center gap-2 pointer-events-auto hover:border-cyan-400 transition-all">
        <div className="w-5 h-5 rounded bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400">
          <TrendingUp className="w-3 h-3" />
        </div>
        <div>
          <div className="text-[8px] font-mono text-slate-400 tracking-wider leading-none">CORE EFFICIENCY</div>
          <div className="text-[11px] font-mono font-bold text-purple-300 glow-text-purple leading-tight mt-0.5">3.2x active</div>
        </div>
      </div>
    </div>
  );
};

