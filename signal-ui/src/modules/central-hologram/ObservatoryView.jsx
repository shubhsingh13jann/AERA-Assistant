import React, { useRef, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import { Database, Lightbulb, BarChart3, Box } from 'lucide-react';

export const ObservatoryView = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const { addConversationMessage } = useNexusStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let w = container.clientWidth || 600;
    let h = container.clientHeight || 500;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        w = Math.floor(entry.contentRect.width) || 600;
        h = Math.floor(entry.contentRect.height) || 500;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }
    });
    resizeObserver.observe(container);

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseRef.current.targetX = nx * 14;
      mouseRef.current.targetY = ny * 10;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let lastTime = 0;
    const frameDelay = 1000 / 45; // 45 FPS lock

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      // Mouse position smoothing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2 + mouseRef.current.x;
      const cy = h / 2 - 18 + mouseRef.current.y;
      const baseR = Math.min(w / 4.2, h / 3.6);

      // Subtle breathing idle float
      const breathing = Math.sin(now / 1100) * 3;
      const effectiveCy = cy + breathing;

      // 1. Pedestal Glowing Projection Rings (Concentric Ellipses at bottom)
      const pedY = effectiveCy + baseR * 1.32;
      const pedRadiusX = baseR * 1.15;
      const pedRadiusY = baseR * 0.18;

      // Projection light column / upward laser beams
      const auraGrad = ctx.createLinearGradient(cx, pedY, cx, effectiveCy + baseR * 0.4);
      auraGrad.addColorStop(0, 'rgba(0, 220, 255, 0.28)');
      auraGrad.addColorStop(0.5, 'rgba(0, 160, 255, 0.08)');
      auraGrad.addColorStop(1, 'rgba(0, 220, 255, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.moveTo(cx - pedRadiusX * 0.9, pedY);
      ctx.lineTo(cx + pedRadiusX * 0.9, pedY);
      ctx.lineTo(cx + pedRadiusX * 0.4, effectiveCy + baseR * 0.4);
      ctx.lineTo(cx - pedRadiusX * 0.4, effectiveCy + baseR * 0.4);
      ctx.closePath();
      ctx.fill();

      // Outer tier ring
      ctx.strokeStyle = 'rgba(0, 180, 255, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, pedY, pedRadiusX, pedRadiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Mid tier ring
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, pedY - 4, pedRadiusX * 0.78, pedRadiusY * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner core ring
      ctx.strokeStyle = 'rgba(180, 250, 255, 0.95)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(cx, pedY - 8, pedRadiusX * 0.48, pedRadiusY * 0.48, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Upward vertical projection laser lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 14; i++) {
        const ang = (i / 14) * Math.PI;
        const rx = Math.cos(ang) * (pedRadiusX * 0.78);
        ctx.beginPath();
        ctx.moveTo(cx + rx, pedY);
        ctx.lineTo(cx + rx * 0.35, effectiveCy + baseR * 0.5);
        ctx.stroke();
      }

      // 2. MASTER 3D ARC REACTOR CORE ENGINE

      // Outer Ambient Glow Aura
      const outerPulse = Math.sin(now / 400) * 3;
      const outerGlow = ctx.createRadialGradient(cx, effectiveCy, baseR * 0.3, cx, effectiveCy, baseR * 1.25 + outerPulse);
      outerGlow.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      outerGlow.addColorStop(0.5, 'rgba(0, 140, 255, 0.12)');
      outerGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, effectiveCy, baseR * 1.25 + outerPulse, 0, Math.PI * 2);
      ctx.fill();

      // Heavy Industrial Metallic Outer Chassis Ring
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, effectiveCy, baseR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(180, 250, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, effectiveCy, baseR - 10, 0, Math.PI * 2);
      ctx.stroke();

      // 10 Copper Coil Blocks with Wire Windings & Amber Warmth
      for (let i = 0; i < 10; i++) {
        const ang = i * ((Math.PI * 2) / 10) - Math.PI / 2;
        const coilR = baseR - 26;
        const bx = cx + Math.cos(ang) * coilR;
        const by = effectiveCy + Math.sin(ang) * coilR;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(ang + Math.PI / 2);

        // Coil Block Background
        ctx.fillStyle = 'rgba(30, 16, 8, 0.95)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = 1.5;
        const rw = 15;
        const rh = 22;
        ctx.beginPath();
        ctx.rect(-rw / 2, -rh / 2, rw, rh);
        ctx.fill();
        ctx.stroke();

        // Copper Coil Winding Lines
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
        for (let wStep = -7; wStep <= 7; wStep += 3.5) {
          ctx.beginPath();
          ctx.moveTo(-rw / 2 + 2, wStep);
          ctx.lineTo(rw / 2 - 2, wStep);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Counter-Rotating Inner Energy Rings
      const rotAngle1 = (now / 2200);
      const rotAngle2 = -(now / 1800);

      // Ring 1 (Laser Ticks Clockwise)
      ctx.save();
      ctx.translate(cx, effectiveCy);
      ctx.rotate(rotAngle1);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 0.62, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 30; i++) {
        const ang = i * ((Math.PI * 2) / 30);
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = i % 3 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (baseR * 0.62), Math.sin(ang) * (baseR * 0.62));
        ctx.lineTo(Math.cos(ang) * (baseR * 0.68), Math.sin(ang) * (baseR * 0.68));
        ctx.stroke();
      }
      ctx.restore();

      // Ring 2 (Glyph Segment Ring Counter-Clockwise)
      ctx.save();
      ctx.translate(cx, effectiveCy);
      ctx.rotate(rotAngle2);
      ctx.strokeStyle = 'rgba(180, 250, 255, 0.95)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 10 Radial Plasma Spokes connecting Fusion Core to Outer Coils
      for (let i = 0; i < 10; i++) {
        const ang = i * ((Math.PI * 2) / 10) - Math.PI / 2;
        const sx1 = cx + Math.cos(ang) * (base_r * 0.18);
        const sy1 = effectiveCy + Math.sin(ang) * (base_r * 0.18);
        const sx2 = cx + Math.cos(ang) * (base_r - 38);
        const sy2 = effectiveCy + Math.sin(ang) * (base_r - 38);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();

        // Energy pulse node along spoke
        const pulsePos = (now / 1000 + i * 0.2) % 1;
        const px = sx1 + (sx2 - sx1) * pulsePos;
        const py = sy1 + (sy2 - sy1) * pulsePos;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central White-Hot Fusion Core & Iris Emitter
      const corePulse = Math.sin(now / 300) * 2.5;

      // Deep Core Plasma Halo Gradient
      const coreGrad = ctx.createRadialGradient(cx, effectiveCy, 2, cx, effectiveCy, (baseR * 0.26 + corePulse));
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.95)');
      coreGrad.addColorStop(0.7, 'rgba(0, 140, 255, 0.4)');
      coreGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, effectiveCy, (baseR * 0.26 + corePulse), 0, Math.PI * 2);
      ctx.fill();

      // Outer Iris Ring
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, effectiveCy, baseR * 0.16, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Iris Ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, effectiveCy, baseR * 0.09, 0, Math.PI * 2);
      ctx.stroke();

      // Radiant Core Center Point
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, effectiveCy, baseR * 0.05, 0, Math.PI * 2);
      ctx.fill();
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleAction = (label, query) => {
    soundService.buttonClick();
    addConversationMessage('user', query);
    setTimeout(() => {
      addConversationMessage('assistant', `Executing ${label}... Analyzing context and telemetry.`);
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full min-h-0 overflow-hidden flex flex-col justify-between select-none bg-[#030712]"
    >
      {/* Deep Space / Observatory Cockpit Curved Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Planetary Horizon Glow */}
        <div
          className="absolute -bottom-[38%] left-[-15%] right-[-15%] h-[75%] rounded-[100%] border-t border-cyan-500/20 shadow-[0_-20px_80px_rgba(0,180,255,0.18)]"
          style={{
            background: 'radial-gradient(ellipse at center bottom, #091a3c 0%, #040d22 45%, #020614 75%, transparent 100%)',
          }}
        />

        {/* Distant stars */}
        <div className="absolute top-12 left-16 w-1 h-1 bg-white/70 rounded-full blur-[0.5px]" />
        <div className="absolute top-24 left-32 w-1.5 h-1.5 bg-cyan-200/80 rounded-full blur-[0.5px]" />
        <div className="absolute top-10 right-28 w-1 h-1 bg-white/60 rounded-full" />
        <div className="absolute top-36 right-48 w-1.5 h-1.5 bg-blue-300/80 rounded-full blur-[0.5px]" />
        <div className="absolute top-44 left-1/4 w-1 h-1 bg-white/50 rounded-full" />
        <div className="absolute top-16 right-1/3 w-1 h-1 bg-white/70 rounded-full" />

        {/* Ambient Observatory Window Vignette / Arch */}
        <div className="absolute inset-0 border border-cyan-900/15 rounded-3xl m-3 pointer-events-none shadow-[inset_0_0_80px_rgba(2,6,23,0.85)]" />
      </div>

      {/* Top Section: Quotes & Observatory Meta */}
      <div className="relative z-10 px-8 pt-8 flex items-start justify-between pointer-events-none">
        <div>
          <p className="text-slate-300/85 text-sm md:text-base font-light tracking-wide italic">
            &ldquo;A smarter tomorrow, with you.&rdquo;
          </p>
        </div>
      </div>

      {/* Central Floating HUD Badges & Hologram Viewport */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
        {/* Left Floating Glass Pill: Listening... */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-cyan-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-400/50">
          <div className="flex items-center gap-1 text-cyan-400">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-cyan-400 rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:300ms]" />
          </div>
          <span className="text-xs font-medium text-slate-200 tracking-wide">Listening...</span>
        </div>

        {/* 3D Holographic Arc Reactor Canvas */}
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full drop-shadow-[0_0_30px_rgba(0,220,255,0.45)]"
        />

        {/* Right Floating Glass Pill: Processing... */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-blue-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:border-blue-400/50">
          <span className="text-xs font-medium text-slate-200 tracking-wide">Processing...</span>
          <div className="flex items-center gap-1 text-blue-400">
            <span className="w-1 h-2.5 bg-blue-400 rounded-full animate-pulse [animation-delay:200ms]" />
            <span className="w-1 h-5 bg-blue-400 rounded-full animate-pulse [animation-delay:100ms]" />
            <span className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Mid-Lower Text Quote */}
      <div className="relative z-10 px-8 flex justify-end pointer-events-none mb-2">
        <p className="text-slate-400/80 text-xs md:text-sm font-light tracking-wide italic">
          &ldquo;Ask anything. I'm here to help.&rdquo;
        </p>
      </div>

      {/* Bottom 4 Quick Action Cards */}
      <div className="relative z-20 px-8 pb-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto">
          {/* Card 1 */}
          <button
            onClick={() => handleAction('Document Analysis', 'Analyze the active document set.')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-cyan-950/40 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all mb-2 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <Database className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-200 text-center leading-tight">
              Analyze<br />Documents
            </span>
          </button>

          {/* Card 2 */}
          <button
            onClick={() => handleAction('Q&A Assistant', 'How do quantum circuits maintain superposition?')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-blue-950/40 backdrop-blur-md border border-slate-800 hover:border-blue-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition-all mb-2 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <Lightbulb className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-blue-200 text-center leading-tight">
              Answer<br />Questions
            </span>
          </button>

          {/* Card 3 */}
          <button
            onClick={() => handleAction('Insight Engine', 'Generate telemetry insights for current node operations.')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-indigo-950/40 backdrop-blur-md border border-slate-800 hover:border-indigo-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all mb-2 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-200 text-center leading-tight">
              Generate<br />Insights
            </span>
          </button>

          {/* Card 4 */}
          <button
            onClick={() => handleAction('Architecture Builder', 'Formulate a distributed event queue architecture.')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-cyan-950/40 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all mb-2 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <Box className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-200 text-center leading-tight">
              Build<br />Solutions
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservatoryView;
