import React, { useEffect, useRef } from 'react';
import './JarvisReactor.css';

/**
 * JarvisReactor - Pure Digital Holographic Energy Core Component
 * SVG + CSS Transforms + 60 FPS Canvas Particles
 * Supported States: 'idle' | 'listening' | 'thinking' | 'responding'
 */
export const JarvisReactor = ({ state = 'idle', className = '' }) => {
  const canvasRef = useRef(null);

  // Lightweight 60 FPS Canvas Particles System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const particles = [];
    const particleCount = 38;

    const w = 600;
    const h = 600;
    canvas.width = w;
    canvas.height = h;
    const cx = w / 2;
    const cy = h / 2 - 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 40 + Math.random() * 180,
        speed: (0.005 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1),
        yOffset: Math.random() * 140 - 70,
        size: 1 + Math.random() * 2.2,
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
      if (state === 'listening') speedMult = 1.6;
      if (state === 'thinking') speedMult = 2.4;
      if (state === 'responding') speedMult = 3.0;

      particles.forEach((p) => {
        p.angle += p.speed * speedMult;
        p.yOffset -= 0.3 * speedMult;
        if (p.yOffset < -160) {
          p.yOffset = 140;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * (p.radius * 0.35) + p.yOffset;

        p.alpha += Math.sin(now * p.pulseSpeed) * 0.015;
        const clampedAlpha = Math.max(0.1, Math.min(0.9, p.alpha));

        ctx.fillStyle = `rgba(0, 240, 255, ${clampedAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.size > 2) {
          ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha * 0.8})`;
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
  }, [state]);

  const currentState = state || 'idle';

  return (
    <div
      className={`jarvis-reactor-container ${className}`}
      data-state={currentState}
    >
      {/* 2D Canvas Particle Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-85"
      />

      {/* Pure Digital Holographic SVG Reactor */}
      <svg
        viewBox="0 0 800 800"
        className="jarvis-reactor-svg relative z-20"
      >
        <defs>
          {/* Cyan Energy Glow Filters */}
          <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur1" />
            <feGaussianBlur stdDeviation="24" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Central Radial Gradient */}
          <radialGradient id="centralFusionGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#00f0ff" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#0080ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>

          {/* Upward Light Beam Linear Gradient */}
          <linearGradient id="upwardBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#00a0ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>

          {/* Sweep Radar Gradient */}
          <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. PROJECTION BASE & UPWARD LIGHT BEAMS (y = 650) */}
        <g className="projection-base-group">
          {/* Upward Volumetric Light Columns */}
          <polygon
            points="260,650 540,650 480,380 320,380"
            fill="url(#upwardBeamGrad)"
          />
          <line x1="300" y1="650" x2="350" y2="380" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1" />
          <line x1="360" y1="650" x2="380" y2="380" stroke="rgba(0, 240, 255, 0.35)" strokeWidth="1" />
          <line x1="440" y1="650" x2="420" y2="380" stroke="rgba(0, 240, 255, 0.35)" strokeWidth="1" />
          <line x1="500" y1="650" x2="450" y2="380" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1" />

          {/* Base Concentric Projection Rings */}
          <ellipse cx="400" cy="650" rx="160" ry="24" stroke="rgba(0, 180, 255, 0.5)" strokeWidth="3" fill="none" />
          <ellipse cx="400" cy="646" rx="125" ry="18" stroke="rgba(0, 240, 255, 0.85)" strokeWidth="2.5" fill="none" />
          <ellipse cx="400" cy="642" rx="75" ry="11" stroke="rgba(180, 250, 255, 0.95)" strokeWidth="2" fill="none" />

          {/* Rotating Outer Base Ring Marks */}
          <g className="spin-base-ring">
            <ellipse cx="400" cy="650" rx="175" ry="26" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" strokeDasharray="12 18" fill="none" />
          </g>
        </g>

        {/* 2. 3D ORBITAL TILTED ELLIPTICAL RINGS */}
        <g className="orbital-rings-group" filter="url(#ringGlow)">
          <ellipse
            cx="400"
            cy="380"
            rx="240"
            ry="65"
            stroke="rgba(0, 240, 255, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="14 10 4 10"
            fill="none"
            transform="rotate(-18 400 380)"
            className="spin-clockwise-slow"
          />
          <ellipse
            cx="400"
            cy="380"
            rx="250"
            ry="75"
            stroke="rgba(139, 92, 246, 0.35)"
            strokeWidth="1.2"
            strokeDasharray="30 15 8 15"
            fill="none"
            transform="rotate(24 400 380)"
            className="spin-counter-slow"
          />
        </g>

        {/* 3. MAIN CIRCULAR REACTOR HUD RINGS (Centered at x=400, y=380) */}

        {/* Outer Continuous HUD Rim */}
        <circle cx="400" cy="380" r="195" stroke="rgba(0, 200, 255, 0.35)" strokeWidth="1" fill="none" />
        <circle cx="400" cy="380" r="185" stroke="rgba(0, 240, 255, 0.65)" strokeWidth="1.5" fill="none" />

        {/* Outer Clockwise Arc Ring with HUD Markers */}
        <g className="spin-clockwise-slow" filter="url(#ringGlow)">
          <circle
            cx="400"
            cy="380"
            r="175"
            stroke="rgba(0, 240, 255, 0.85)"
            strokeWidth="2.5"
            strokeDasharray="60 12 120 12 40 12"
            fill="none"
          />
          {/* Outer Marker Dots */}
          <circle cx="575" cy="380" r="3.5" fill="#ffffff" />
          <circle cx="225" cy="380" r="3.5" fill="#ffffff" />
          <circle cx="400" cy="205" r="3.5" fill="#ffffff" />
          <circle cx="400" cy="555" r="3.5" fill="#ffffff" />
        </g>

        {/* Counter-Clockwise Segmented Ring */}
        <g className="spin-counter-slow" filter="url(#ringGlow)">
          <circle
            cx="400"
            cy="380"
            r="155"
            stroke="rgba(0, 240, 255, 0.9)"
            strokeWidth="4"
            strokeDasharray="25 10 45 10 15 10 60 10"
            fill="none"
          />
          <circle
            cx="400"
            cy="380"
            r="145"
            stroke="rgba(139, 92, 246, 0.55)"
            strokeWidth="1.5"
            strokeDasharray="8 8"
            fill="none"
          />
        </g>

        {/* Inner Radar Arc Sweep */}
        <g className="radar-scan-sweep">
          <path
            d="M 400 380 L 530 380 A 130 130 0 0 0 400 250 Z"
            fill="url(#radarSweepGrad)"
          />
        </g>

        {/* Concentric Inner Tick Marks Ring */}
        <g className="spin-clockwise-fast" filter="url(#ringGlow)">
          <circle
            cx="400"
            cy="380"
            r="125"
            stroke="rgba(0, 240, 255, 0.75)"
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
            r="105"
            stroke="rgba(255, 255, 255, 0.9)"
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
            stroke="rgba(0, 240, 255, 0.9)"
            fill="none"
            className="wave-expand-pulse"
          />
        )}

        {/* 4. MASTER CENTRAL TRIANGULAR GEOMETRIC ENERGY CORE */}
        <g
          className={`reactor-core-group ${
            currentState === 'thinking' || currentState === 'responding'
              ? 'pulse-core-intense'
              : 'pulse-core-soft'
          }`}
          filter="url(#coreGlow)"
        >
          {/* Radial Energy Spokes */}
          <line x1="400" y1="380" x2="400" y2="280" stroke="rgba(0, 240, 255, 0.8)" strokeWidth="2" />
          <line x1="400" y1="380" x2="486" y2="430" stroke="rgba(0, 240, 255, 0.8)" strokeWidth="2" />
          <line x1="400" y1="380" x2="314" y2="430" stroke="rgba(0, 240, 255, 0.8)" strokeWidth="2" />

          {/* Central Plasma Glow Circle */}
          <circle
            cx="400"
            cy="380"
            r="85"
            fill="url(#centralFusionGrad)"
          />

          {/* Outer Layer Inverted JARVIS Energy Triangle */}
          <polygon
            points="400,455 465,340 335,340"
            fill="rgba(0, 240, 255, 0.15)"
            stroke="rgba(0, 240, 255, 0.95)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Inner Layer Accent Inverted Triangle */}
          <polygon
            points="400,438 450,348 350,348"
            fill="rgba(255, 255, 255, 0.25)"
            stroke="rgba(255, 255, 255, 1)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Inner Cutout Geometric Framework */}
          <polygon
            points="400,418 432,360 368,360"
            fill="none"
            stroke="rgba(0, 240, 255, 0.9)"
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
            fill="#e0f8ff"
          />
        </g>
      </svg>
    </div>
  );
};

export default JarvisReactor;
