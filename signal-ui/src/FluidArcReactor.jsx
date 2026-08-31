import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * High-performance 60fps Organic Fluid Plasma Arc Reactor with:
 * - Multi-layer fluid plasma simulation (harmonic noise + radial fluid field)
 * - Fluid acoustic shockwave ripples driven by live microphone decibels
 * - Counter-rotating holographic gyro rings with HUD tick marks
 * - State-reactive particle swarm (idle drift, voice shockwaves, vortex, harmonics)
 */
export default function FluidArcReactor({ state = "idle", micLevel = 0 }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(state);
  const micRef = useRef(micLevel);
  const ripplesRef = useRef([]);
  const particlesRef = useRef([]);

  // Keep refs synchronized with props for the rAF animation loop
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    micRef.current = micLevel;
    // Spawn a fluid ripple when significant audio energy is detected in listening state
    if (micLevel > 15 && (state === "listening" || state === "idle")) {
      const intensity = Math.min(1, micLevel / 100);
      ripplesRef.current.push({
        radius: 35,
        maxRadius: 110 + intensity * 40,
        alpha: 0.9 * intensity,
        speed: 1.8 + intensity * 2.5,
        width: 1.5 + intensity * 2,
        color: state === "listening" ? "0, 240, 255" : "70, 180, 255",
      });
      if (ripplesRef.current.length > 8) {
        ripplesRef.current.shift();
      }
    }
  }, [micLevel, state]);

  // Main Canvas Rendering Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let t = 0;

    // Initialize ambient plasma particle field
    const particleCount = 45;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: 25 + Math.random() * 65,
      radius: 0.8 + Math.random() * 1.8,
      speed: (Math.random() - 0.5) * 0.02,
      radialSpeed: (Math.random() - 0.5) * 0.3,
      alpha: 0.2 + Math.random() * 0.6,
      hue: Math.random() > 0.3 ? 188 : 260, // Cyan or soft violet
    }));

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const currentState = stateRef.current;
      const currentMic = micRef.current;

      ctx.clearRect(0, 0, width, height);

      // Speed multipliers based on state
      let speedMult = 1.0;
      let fluidAmplitude = 4;
      let coreGlowIntensity = 1.0;

      if (currentState === "listening") {
        speedMult = 1.8;
        fluidAmplitude = 6 + (currentMic / 100) * 16;
        coreGlowIntensity = 1.5 + (currentMic / 100) * 1.2;
      } else if (currentState === "speaking") {
        speedMult = 2.2;
        fluidAmplitude = 10 + Math.sin(t * 4) * 6;
        coreGlowIntensity = 1.8;
      } else if (currentState === "processing") {
        speedMult = 3.5;
        fluidAmplitude = 3;
        coreGlowIntensity = 1.4;
      }

      t += 0.02 * speedMult;

      // -------------------------------------------------------------
      // 1. Fluid Acoustic Shockwave Ripples
      // -------------------------------------------------------------
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.radius += rip.speed;
        rip.alpha *= 0.96;

        if (rip.alpha < 0.02 || rip.radius > rip.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rip.color}, ${rip.alpha})`;
        ctx.lineWidth = rip.width;
        ctx.shadowColor = `rgb(${rip.color})`;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 2. Ambient Plasma Particles
      // -------------------------------------------------------------
      particlesRef.current.forEach((p) => {
        if (currentState === "processing") {
          // Vortex spiral inward
          p.angle += 0.04;
          p.distance -= 0.4;
          if (p.distance < 10) p.distance = 80;
        } else if (currentState === "listening") {
          // Responsive outward vibration
          p.angle += p.speed * 1.5;
          p.distance += (currentMic / 100) * 0.8;
          if (p.distance > 85) p.distance = 30;
        } else {
          p.angle += p.speed;
          p.distance += p.radialSpeed;
          if (p.distance > 80 || p.distance < 20) {
            p.radialSpeed *= -1;
          }
        }

        const px = cx + Math.cos(p.angle) * p.distance;
        const py = cy + Math.sin(p.angle) * p.distance;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${p.alpha * (currentState === "idle" ? 0.6 : 0.95)})`;
        ctx.shadowColor = `hsl(${p.hue}, 95%, 60%)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      // -------------------------------------------------------------
      // 3. Multi-Layer Organic Fluid Plasma Core (Liquid Light Engine)
      // -------------------------------------------------------------
      // Layer A: Outer Fluid Halo
      const outerGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 75);
      outerGlow.addColorStop(0, `rgba(0, 240, 255, ${0.4 * coreGlowIntensity})`);
      outerGlow.addColorStop(0.5, `rgba(13, 85, 140, ${0.25 * coreGlowIntensity})`);
      outerGlow.addColorStop(0.85, `rgba(100, 40, 240, ${0.12 * coreGlowIntensity})`);
      outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.fill();

      // Layer B: Deformed Organic Fluid Blob 1 (Cyan/Teal liquid)
      ctx.save();
      ctx.beginPath();
      const points = 12;
      const baseRadius = 38;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const noise =
          Math.sin(angle * 3 + t * 1.5) * fluidAmplitude +
          Math.cos(angle * 2 - t * 2.1) * (fluidAmplitude * 0.6);
        const r = baseRadius + noise;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      const fluidGrad1 = ctx.createRadialGradient(
        cx - 8,
        cy - 8,
        2,
        cx,
        cy,
        baseRadius + 12
      );
      fluidGrad1.addColorStop(0, "#ffffff");
      fluidGrad1.addColorStop(0.2, "#80f6ff");
      fluidGrad1.addColorStop(0.55, "#00c4e6");
      fluidGrad1.addColorStop(0.85, "#005a78");
      fluidGrad1.addColorStop(1, "rgba(0, 30, 50, 0.8)");

      ctx.fillStyle = fluidGrad1;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 18 * coreGlowIntensity;
      ctx.fill();
      ctx.restore();

      // Layer C: Counter-deformed Inner Harmonic Fluid Wave (Violet/White core)
      ctx.save();
      ctx.beginPath();
      const innerPoints = 8;
      const innerBaseRadius = 22;
      for (let i = 0; i <= innerPoints; i++) {
        const angle = (i / innerPoints) * Math.PI * 2;
        const noise =
          Math.cos(angle * 4 - t * 2.8) * (fluidAmplitude * 0.5) +
          Math.sin(angle * 3 + t * 1.8) * 2;
        const r = innerBaseRadius + noise;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      const fluidGrad2 = ctx.createRadialGradient(
        cx - 4,
        cy - 4,
        1,
        cx,
        cy,
        innerBaseRadius + 6
      );
      fluidGrad2.addColorStop(0, "#ffffff");
      fluidGrad2.addColorStop(0.4, "#d4faff");
      fluidGrad2.addColorStop(0.8, "#38bdf8");
      fluidGrad2.addColorStop(1, "#818cf8");

      ctx.fillStyle = fluidGrad2;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();

      // -------------------------------------------------------------
      // 4. Arc Reactor Heart & Concentric Radial Energy Lines
      // -------------------------------------------------------------
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      const rays = 8;
      for (let i = 0; i < rays; i++) {
        const rayAngle = (i / rays) * Math.PI * 2 + (currentState === "processing" ? t * 2 : t * 0.3);
        const x1 = cx + Math.cos(rayAngle) * 8;
        const y1 = cy + Math.sin(rayAngle) * 8;
        const x2 = cx + Math.cos(rayAngle) * 32;
        const y2 = cy + Math.sin(rayAngle) * 32;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // Super-bright center singularity point
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 4 + Math.sin(t * 5) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // State metadata badge colors & text
  const stateConfig = {
    idle: {
      label: "SYSTEM IDLE // STANDBY",
      glow: "from-cyan-500/20 to-blue-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      dot: "bg-cyan-400",
    },
    listening: {
      label: "VOICE MATRIX ACTIVE // CAPTURING",
      glow: "from-cyan-400/40 to-emerald-500/20",
      border: "border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]",
      text: "text-cyan-300 font-bold tracking-wider",
      dot: "bg-cyan-300 animate-ping",
    },
    processing: {
      label: "DECODING INTENT // ANALYZING",
      glow: "from-purple-500/40 to-cyan-500/30",
      border: "border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
      text: "text-purple-300",
      dot: "bg-purple-400 animate-pulse",
    },
    speaking: {
      label: "JARVIS RESPONDING // HARMONIC",
      glow: "from-sky-400/40 to-indigo-500/30",
      border: "border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]",
      text: "text-sky-300",
      dot: "bg-sky-400 animate-pulse",
    },
  };

  const currentConfig = stateConfig[state] || stateConfig.idle;

  return (
    <div className="relative flex flex-col items-center justify-center p-3 select-none">
      {/* Reactor Canvas & Holographic Gyro Stack Container */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        
        {/* Holographic Ring 1: Outer Segmented Compass Ring */}
        <motion.div
          animate={{
            rotate: 360,
            scale: state === "listening" ? 1.08 : state === "speaking" ? 1.05 : 1,
          }}
          transition={{
            rotate: { duration: state === "processing" ? 8 : 32, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.4 },
          }}
          className="absolute inset-0 rounded-full border border-dashed border-cyan-500/25 pointer-events-none"
        >
          {/* Compass HUD Marks */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#00f0ff]" />
        </motion.div>

        {/* Holographic Ring 2: Counter-Rotating Segmented Arc Ring */}
        <motion.div
          animate={{
            rotate: -360,
            scale: state === "listening" ? 1.04 : 1,
          }}
          transition={{
            rotate: { duration: state === "processing" ? 6 : 24, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.3 },
          }}
          className="absolute w-48 h-48 rounded-full border-t-2 border-b-2 border-r border-cyan-400/50 border-l-transparent pointer-events-none shadow-[0_0_12px_rgba(0,240,255,0.15)]"
        />

        {/* Holographic Ring 3: Inner Gyro Gimbal Ring with Angle Brackets */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: state === "processing" ? 4 : 16,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-40 h-40 rounded-full border border-cyan-300/30 border-dashed pointer-events-none"
        />

        {/* HUD Precision Crosshair Brackets */}
        <div className="absolute inset-1 pointer-events-none">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/70" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/70" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/70" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/70" />
        </div>

        {/* Dynamic 60fps Canvas Fluid Engine */}
        <canvas
          ref={canvasRef}
          width={224}
          height={224}
          className="relative z-10 w-56 h-56 pointer-events-none"
        />
      </div>

      {/* Futuristic Telemetry State Readout */}
      <div
        className={`mt-4 px-3.5 py-1.5 rounded-full border bg-gradient-to-r ${currentConfig.glow} ${currentConfig.border} bg-[#0c1015]/90 backdrop-blur-md flex items-center gap-2 transition-all duration-300`}
      >
        <span className={`w-2 h-2 rounded-full ${currentConfig.dot}`} />
        <span className={`text-[11px] font-mono tracking-wider ${currentConfig.text}`}>
          {currentConfig.label}
        </span>
      </div>

      {/* Live Acoustic Frequency Scale */}
      <div className="mt-2.5 flex items-center gap-1">
        {Array.from({ length: 16 }).map((_, idx) => {
          const threshold = (idx + 1) * 6.25;
          const isActive = micLevel >= threshold;
          return (
            <div
              key={idx}
              className={`w-1 rounded-sm transition-all duration-100 ${
                isActive
                  ? "bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_6px_#00f0ff]"
                  : "bg-slate-800"
              }`}
              style={{
                height: isActive
                  ? `${Math.max(4, Math.min(18, ((micLevel - threshold + 10) / 10) * 14))}px`
                  : "4px",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

