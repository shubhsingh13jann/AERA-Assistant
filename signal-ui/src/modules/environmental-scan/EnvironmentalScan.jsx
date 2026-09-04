import React, { useRef, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';
import { Globe2, Cloud, Wind, Radio } from 'lucide-react';

export const EnvironmentalScan = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { environmental, setEnvironmentalLayer } = useNexusStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let rotY = 0;
    let lastTime = 0;
    const frameDelay = 1000 / 35;

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotY += 0.012;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) - 10; // Guarantees 100% containment inside box

      if (radius <= 0) return;

      // Atmosphere Subtle Halo
      const haloGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius + 4);
      haloGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      haloGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
      ctx.fill();

      // Earth Sphere Wireframe
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Longitude Lines
      for (let i = 0; i < 5; i++) {
        const angle = rotY + (i * Math.PI) / 5;
        const xRadius = Math.cos(angle) * radius;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(1, Math.abs(xRadius)), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Latitude Lines
      [-0.6, -0.3, 0.3, 0.6].forEach((latRatio) => {
        const y = cy + latRatio * radius;
        const r = Math.sqrt(Math.max(0, radius * radius - (latRatio * radius) ** 2));
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx, y, r, r * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Rotating Continent Particle Clusters
      for (let p = 0; p < 24; p++) {
        const phi = (p * 0.45);
        const theta = rotY + p * 0.75;
        const x = cx + Math.cos(theta) * Math.sin(phi) * (radius - 2);
        const y = cy + Math.cos(phi) * (radius - 2);
        const z = Math.sin(theta) * Math.sin(phi);

        if (z > 0) {
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(x, y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const layers = [
    { id: 'biome', icon: Globe2 },
    { id: 'clouds', icon: Cloud },
    { id: 'wind', icon: Wind },
    { id: 'radar', icon: Radio },
  ];

  return (
    <div
      ref={containerRef}
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
          <span className="text-slate-200">ENVIRONMENTAL SCAN</span>
        </div>
        <span className="text-[8px] font-mono text-cyan-400/80">LOCATION: {environmental?.location || 'TERRA // SECTOR-01'}</span>
      </div>

      <div className="flex items-center gap-2 my-auto py-1">
        {/* Hologram Earth Canvas (Contained) */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0 overflow-hidden">
          <canvas ref={canvasRef} width={96} height={96} className="w-full h-full" />
        </div>

        {/* Telemetry Metrics */}
        <div className="flex-1 space-y-1 font-mono text-[9px] min-w-0">
          <div className="flex justify-between">
            <span className="text-slate-400">TEMP</span>
            <span className="font-bold text-cyan-300">{environmental?.temperature || 21.4}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">ATMOS</span>
            <span className="font-bold text-cyan-300">{environmental?.atmosphere || 98.2}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">RADIATION</span>
            <span className="font-bold text-emerald-400">{environmental?.radiation || 0.12} uSv</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">GRAVITY</span>
            <span className="font-bold text-slate-200">{environmental?.gravity || 9.81} m/s²</span>
          </div>
        </div>
      </div>

      {/* Layer Filter Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-cyan-500/15">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isActive = (environmental?.activeLayer || 'biome') === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setEnvironmentalLayer(layer.id)}
              className={`p-1 rounded border transition-all ${
                isActive
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                  : 'border-cyan-500/20 text-slate-400 hover:text-cyan-400'
              }`}
            >
              <Icon className="w-3 h-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EnvironmentalScan;

