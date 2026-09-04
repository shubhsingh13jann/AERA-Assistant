import React, { useEffect, useRef } from 'react';
import './JarvisReactor.css';

/**
 * JarvisReactor - Pure Digital Holographic Energy Core Component
 * SVG + GPU Keyframe Animations + 60 FPS Canvas Particles
 * Supported States: 'dormant' | 'idle' | 'listening' | 'thinking' | 'responding' | 'error' | 'warning'
 */
export const JarvisReactor = ({ state = 'idle', className = '' }) => {
  const canvasRef = useRef(null);

  const isErrorState = state === 'error' || state === 'warning';
  const isDormantState = state === 'dormant';

  // Lightweight 60 FPS Canvas Particles System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const particles = [];
    const particleCount = isDormantState ? 0 : 42;

    const w = 600;
    const h = 600;
    canvas.width = w;
    canvas.height = h;
    const cx = w / 2;
    const cy = h / 2 - 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 45 + Math.random() * 190,
        speed: (0.005 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1),
        yOffset: Math.random() * 150 - 75,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.7,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    let lastTime = 0;
    const frameDelay = 1000 / 60; // 60 FPS

    const animate = (now) => {
      animationId = requestAnimationFrame(animate);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      ctx.clearRect(0, 0, w, h);

      // Speed multiplier based on state
      let speedMult = 1;
      if (isDormantState) speedMult = 0.4;
      if (state === 'listening') speedMult = 1.6;
      if (state === 'thinking') speedMult = 2.4;
      if (state === 'responding') speedMult = 3.2;
      if (isErrorState) speedMult = 3.8;

      const pColor = isErrorState ? 'rgba(255, 30, 80,' : 'rgba(0, 240, 255,';

      particles.forEach((p) => {
        p.angle += p.speed * speedMult;
        p.yOffset -= 0.35 * speedMult;
        if (p.yOffset < -165) {
          p.yOffset = 145;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * (p.radius * 0.35) + p.yOffset;

        p.alpha += Math.sin(now * p.pulseSpeed) * 0.015;
        const clampedAlpha = Math.max(0.1, Math.min(0.95, p.alpha));

        ctx.fillStyle = `${pColor} ${clampedAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.size > 2) {
          ctx.fillStyle = isErrorState
            ? `rgba(255, 200, 200, ${clampedAlpha * 0.85})`
            : `rgba(255, 255, 255, ${clampedAlpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, isDormantState, isErrorState]);

  const currentState = state || 'idle';

  // Dynamic Color Constants for SVG elements (Lit vs Unlit Hardware OFF mode)
  const mainStroke = isErrorState
    ? 'rgba(255, 30, 80, 0.95)'
    : isDormantState
    ? 'rgba(56, 189, 248, 0.85)' // Crisp unlit cyan stroke
    : 'rgba(0, 240, 255, 0.95)';

  const secondaryStroke = isErrorState
    ? 'rgba(255, 80, 0, 0.75)'
    : isDormantState
    ? 'rgba(148, 163, 184, 0.75)' // Crisp unlit slate stroke
    : 'rgba(0, 200, 255, 0.75)';

  const dimStroke = isErrorState
    ? 'rgba(255, 0, 85, 0.45)'
    : isDormantState
    ? 'rgba(71, 85, 105, 0.7)' // Clear unlit dark slate stroke
    : 'rgba(0, 240, 255, 0.45)';

  const coreFill = isErrorState
    ? 'url(#redFusionGrad)'
    : isDormantState
    ? 'rgba(15, 23, 42, 0.95)' // UNLIT SOLID METALLIC CORE (LIGHT OFF!)
    : 'url(#centralFusionGrad)';

  const beamFill = isErrorState
    ? 'url(#redBeamGrad)'
    : isDormantState
    ? 'transparent' // ZERO UPWARD LIGHT BEAM WHEN OFF!
    : 'url(#upwardBeamGrad)';

  const blockFill = isErrorState
    ? 'rgba(52, 4, 16, 0.95)'
    : isDormantState
    ? 'rgba(15, 23, 42, 0.95)' // Unlit dark metallic block
    : 'rgba(2, 24, 52, 0.9)';

  const blockStroke = isErrorState
    ? '#ff0055'
    : isDormantState
    ? '#38bdf8' // Sharp unlit cyan stroke
    : '#00f0ff';

  return (
    <div
      className={`jarvis-reactor-container ${className}`}
      data-state={currentState}
    >
      {/* 2D Canvas Particle Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-90"
      />

      {/* Pure Digital Holographic SVG Reactor */}
      <svg
        viewBox="0 0 800 800"
        className="jarvis-reactor-svg relative z-20"
      >
        <defs>
          {/* Glow Filters */}
          <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur1" />
            <feGaussianBlur stdDeviation="22" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Central Radial Gradient - Cyan/White */}
          <radialGradient id="centralFusionGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#00f0ff" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#0080ff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>

          {/* Central Radial Gradient - Crimson Red Warning */}
          <radialGradient id="redFusionGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#ff0055" stopOpacity="1" />
            <stop offset="65%" stopColor="#ff3300" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#800020" stopOpacity="0" />
          </radialGradient>

          {/* Upward Light Beam Gradient - Cyan */}
          <linearGradient id="upwardBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.38" />
            <stop offset="60%" stopColor="#00a0ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>

          {/* Upward Light Beam Gradient - Crimson Red */}
          <linearGradient id="redBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff0055" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#ff3300" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ff0055" stopOpacity="0" />
          </linearGradient>

          {/* Sweep Radar Gradient */}
          <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isErrorState ? '#ff0055' : '#00f0ff'} stopOpacity="0.45" />
            <stop offset="100%" stopColor={isErrorState ? '#ff0055' : '#00f0ff'} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. PROJECTION BASE & UPWARD LIGHT BEAMS (y = 650) */}
        <g className="projection-base-group">
          {/* Upward Volumetric Light Columns */}
          <polygon
            points="250,650 550,650 490,380 310,380"
            fill={beamFill}
          />
          <line x1="290" y1="650" x2="340" y2="380" stroke={dimStroke} strokeWidth="1" />
          <line x1="350" y1="650" x2="375" y2="380" stroke={secondaryStroke} strokeWidth="1.2" />
          <line x1="450" y1="650" x2="425" y2="380" stroke={secondaryStroke} strokeWidth="1.2" />
          <line x1="510" y1="650" x2="460" y2="380" stroke={dimStroke} strokeWidth="1" />

          {/* Base Concentric Projection Rings */}
          <ellipse cx="400" cy="650" rx="165" ry="25" stroke={dimStroke} strokeWidth="3" fill="none" />
          <ellipse cx="400" cy="646" rx="130" ry="19" stroke={mainStroke} strokeWidth="2.5" fill="none" />
          <ellipse cx="400" cy="642" rx="80" ry="12" stroke={isErrorState ? '#ffffff' : 'rgba(180, 250, 255, 0.95)'} strokeWidth="2" fill="none" />

          {/* Seamless Dotted Ground Rings Rotating Flat on the Floor (strokeDashoffset animation) */}
          <ellipse
            cx="400"
            cy="650"
            rx="185"
            ry="28"
            stroke={dimStroke}
            strokeWidth="1.5"
            fill="none"
            className="spin-base-ring"
          />
          <ellipse
            cx="400"
            cy="646"
            rx="145"
            ry="21"
            stroke={secondaryStroke}
            strokeWidth="1.2"
            fill="none"
            className="spin-base-ring-counter"
          />
        </g>

        {/* 2. 3D ORBITAL TILTED ELLIPTICAL RINGS */}
        <g className="orbital-rings-group" filter="url(#ringGlow)">
          <ellipse
            cx="400"
            cy="380"
            rx="245"
            ry="68"
            stroke={dimStroke}
            strokeWidth="1.6"
            strokeDasharray="14 10 4 10"
            fill="none"
            transform="rotate(-18 400 380)"
            className="spin-clockwise-slow"
          />
          <ellipse
            cx="400"
            cy="380"
            rx="255"
            ry="78"
            stroke={isErrorState ? 'rgba(255, 60, 0, 0.5)' : 'rgba(139, 92, 246, 0.4)'}
            strokeWidth="1.4"
            strokeDasharray="30 15 8 15"
            fill="none"
            transform="rotate(24 400 380)"
            className="spin-counter-slow"
          />
        </g>

        {/* 3. MAIN CIRCULAR REACTOR HUD RINGS (Centered at x=400, y=380) */}

        {/* Outer Continuous HUD Rim */}
        <circle cx="400" cy="380" r="198" stroke={dimStroke} strokeWidth="1" fill="none" />
        <circle cx="400" cy="380" r="188" stroke={secondaryStroke} strokeWidth="1.8" fill="none" />

        {/* 10 GLOWING HOLOGRAPHIC ENERGY BLOCKS AROUND RING */}
        <g className="spin-clockwise-slow">
          {Array.from({ length: 10 }).map((_, i) => {
            const ang = i * ((Math.PI * 2) / 10) - Math.PI / 2;
            const radius = 175;
            const bx = 400 + Math.cos(ang) * radius;
            const by = 380 + Math.sin(ang) * radius;
            const rotDeg = (ang * 180) / Math.PI + 90;

            return (
              <g key={i} transform={`translate(${bx}, ${by}) rotate(${rotDeg})`} filter="url(#ringGlow)">
                {/* Outer Glass Container */}
                <rect
                  x="-15"
                  y="-25"
                  width="30"
                  height="50"
                  rx="7"
                  fill={blockFill}
                  stroke={blockStroke}
                  strokeWidth="2"
                />
                {/* Horizontal Internal Glowing Energy Bands */}
                <line x1="-11" y1="-17" x2="11" y2="-17" stroke="#ffffff" strokeWidth="2" />
                <line x1="-13" y1="-8.5" x2="13" y2="-8.5" stroke={blockStroke} strokeWidth="2.5" />
                <line x1="-14" y1="0" x2="14" y2="0" stroke={blockStroke} strokeWidth="3" />
                <line x1="-13" y1="8.5" x2="13" y2="8.5" stroke={blockStroke} strokeWidth="2.5" />
                <line x1="-11" y1="17" x2="11" y2="17" stroke="#ffffff" strokeWidth="2" />
              </g>
            );
          })}
        </g>

        {/* Outer Clockwise Arc Ring with HUD Markers */}
        <g className="spin-clockwise-slow" filter="url(#ringGlow)">
          <circle
            cx="400"
            cy="380"
            r="175"
            stroke={mainStroke}
            strokeWidth="2.5"
            strokeDasharray="60 12 120 12 40 12"
            fill="none"
          />
        </g>

        {/* Counter-Clockwise Segmented Ring */}
        <g className="spin-counter-slow" filter="url(#ringGlow)">
          <circle
            cx="400"
            cy="380"
            r="142"
            stroke={mainStroke}
            strokeWidth="3.5"
            strokeDasharray="25 10 45 10 15 10 60 10"
            fill="none"
          />
          <circle
            cx="400"
            cy="380"
            r="132"
            stroke={isErrorState ? 'rgba(255, 60, 0, 0.7)' : 'rgba(139, 92, 246, 0.6)'}
            strokeWidth="1.5"
            strokeDasharray="8 8"
            fill="none"
          />
        </g>

        {/* Inner Radar Arc Sweep */}
        <g className="radar-scan-sweep">
          <path
            d="M 400 380 L 525 380 A 125 125 0 0 0 400 255 Z"
            fill="url(#radarSweepGrad)"
          />
        </g>

        {/* Concentric Inner Tick Marks Ring */}
        <g className="spin-clockwise-fast" filter="url(#ringGlow)">
          <circle
            cx="400"
            cy="380"
            r="115"
            stroke={secondaryStroke}
            strokeWidth="2"
            strokeDasharray="4 8"
            fill="none"
          />
        </g>

        {/* Inner Counter Arc Segment */}
        <g className="spin-counter-fast">
          <circle
            cx="400"
            cy="380"
            r="98"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="40 20 80 20"
            fill="none"
          />
        </g>

        {/* Responding State Wave Expansion Ring */}
        {currentState === 'responding' && (
          <circle
            cx="400"
            cy="380"
            r="40"
            stroke={mainStroke}
            fill="none"
            className="wave-expand-pulse"
          />
        )}

        {/* 4. 10 RADIAL PLASMA SPOKES */}
        <g filter="url(#ringGlow)">
          {Array.from({ length: 10 }).map((_, i) => {
            const ang = i * ((Math.PI * 2) / 10) - Math.PI / 2;
            const x1 = 400 + Math.cos(ang) * 45;
            const y1 = 380 + Math.sin(ang) * 45;
            const x2 = 400 + Math.cos(ang) * 148;
            const y2 = 380 + Math.sin(ang) * 148;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={mainStroke}
                strokeWidth="2"
              />
            );
          })}
        </g>

        {/* 5. MASTER CENTRAL TRIANGULAR GEOMETRIC ENERGY CORE */}
        <g
          className={`reactor-core-group ${
            isErrorState
              ? 'pulse-core-warning'
              : currentState === 'thinking' || currentState === 'responding'
              ? 'pulse-core-intense'
              : 'pulse-core-soft'
          }`}
          filter="url(#coreGlow)"
        >
          {/* Central Plasma Glow Circle */}
          <circle
            cx="400"
            cy="380"
            r="75"
            fill={coreFill}
          />

          {/* Outer Layer Inverted JARVIS Energy Triangle */}
          <polygon
            points="400,448 458,345 342,345"
            fill={isErrorState ? 'rgba(255, 0, 85, 0.25)' : 'rgba(0, 240, 255, 0.2)'}
            stroke={mainStroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Inner Layer Accent Inverted Triangle */}
          <polygon
            points="400,432 444,352 356,352"
            fill="rgba(255, 255, 255, 0.3)"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Inner Cutout Geometric Framework */}
          <polygon
            points="400,414 428,362 372,362"
            fill="none"
            stroke={mainStroke}
            strokeWidth="1.5"
          />

          {/* White-Hot Core Apex Center Node */}
          <circle
            cx="400"
            cy="380"
            r="16"
            fill="#ffffff"
            filter="url(#coreGlow)"
          />
          <circle
            cx="400"
            cy="380"
            r="8"
            fill={isErrorState ? '#ffe5ec' : isDormantState ? '#475569' : '#e0f8ff'}
          />
        </g>
      </svg>
    </div>
  );
};

export default JarvisReactor;
