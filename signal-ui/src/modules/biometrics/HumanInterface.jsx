import React, { useRef, useEffect, useState } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import { CheckCircle2, Heart } from 'lucide-react';

export const HumanInterface = () => {
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [heartRate, setHeartRate] = useState(72);

  useEffect(() => {
    const hrInterval = setInterval(() => {
      setHeartRate(70 + Math.floor(Math.random() * 5));
    }, 2000);
    return () => clearInterval(hrInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let scanY = 0;
    let scanDirection = 1;
    let rotY = 0;

    const landmarks = [
      // Forehead / Hairline
      { id: 'fh1', x: 0, y: -52, z: 12 },
      { id: 'fh2', x: -16, y: -48, z: 10 },
      { id: 'fh3', x: 16, y: -48, z: 10 },
      { id: 'fh4', x: -28, y: -40, z: -4 },
      { id: 'fh5', x: 28, y: -40, z: -4 },
      { id: 'fh6', x: -38, y: -28, z: -18 },
      { id: 'fh7', x: 38, y: -28, z: -18 },

      // Eyebrows
      { id: 'eb_l1', x: -6, y: -28, z: 18 },
      { id: 'eb_l2', x: -16, y: -30, z: 19 },
      { id: 'eb_l3', x: -28, y: -26, z: 12 },
      { id: 'eb_r1', x: 6, y: -28, z: 18 },
      { id: 'eb_r2', x: 16, y: -30, z: 19 },
      { id: 'eb_r3', x: 28, y: -26, z: 12 },

      // Left Eye
      { id: 'eye_l_in', x: -9, y: -19, z: 14 },
      { id: 'eye_l_top', x: -18, y: -23, z: 16 },
      { id: 'eye_l_out', x: -28, y: -19, z: 10 },
      { id: 'eye_l_bot', x: -18, y: -15, z: 15 },
      { id: 'eye_l_pupil', x: -18, y: -19, z: 16 },

      // Right Eye
      { id: 'eye_r_in', x: 9, y: -19, z: 14 },
      { id: 'eye_r_top', x: 18, y: -23, z: 16 },
      { id: 'eye_r_out', x: 28, y: -19, z: 10 },
      { id: 'eye_r_bot', x: 18, y: -15, z: 15 },
      { id: 'eye_r_pupil', x: 18, y: -19, z: 16 },

      // Glabella / Nose Bridge
      { id: 'glabella', x: 0, y: -26, z: 18 },
      { id: 'nose_bridge', x: 0, y: -16, z: 22 },
      { id: 'nose_mid', x: 0, y: -4, z: 27 },
      { id: 'nose_tip', x: 0, y: 3, z: 32 },
      { id: 'nose_l_wing', x: -9, y: 4, z: 22 },
      { id: 'nose_r_wing', x: 9, y: 4, z: 22 },
      { id: 'subnasale', x: 0, y: 9, z: 23 },

      // Cheekbones
      { id: 'cheek_l_high', x: -32, y: -12, z: 4 },
      { id: 'cheek_r_high', x: 32, y: -12, z: 4 },
      { id: 'cheek_l_mid', x: -26, y: 4, z: 12 },
      { id: 'cheek_r_mid', x: 26, y: 4, z: 12 },

      // Mouth / Lips
      { id: 'lip_top_c', x: 0, y: 17, z: 23 },
      { id: 'lip_top_l', x: -7, y: 16, z: 21 },
      { id: 'lip_top_r', x: 7, y: 16, z: 21 },
      { id: 'lip_corner_l', x: -16, y: 20, z: 16 },
      { id: 'lip_corner_r', x: 16, y: 20, z: 16 },
      { id: 'lip_bot_c', x: 0, y: 26, z: 22 },
      { id: 'lip_bot_l', x: -8, y: 24, z: 19 },
      { id: 'lip_bot_r', x: 8, y: 24, z: 19 },

      // Jawline & Chin
      { id: 'chin_c', x: 0, y: 42, z: 18 },
      { id: 'chin_l', x: -9, y: 40, z: 15 },
      { id: 'chin_r', x: 9, y: 40, z: 15 },
      { id: 'jaw_l1', x: -22, y: 32, z: 6 },
      { id: 'jaw_r1', x: 22, y: 32, z: 6 },
      { id: 'jaw_l2', x: -34, y: 16, z: -6 },
      { id: 'jaw_r2', x: 34, y: 16, z: -6 },
      { id: 'jaw_l3', x: -38, y: -4, z: -14 },
      { id: 'jaw_r3', x: 38, y: -4, z: -14 },
    ];

    const edges = [
      ['fh6', 'fh4'], ['fh4', 'fh2'], ['fh2', 'fh1'], ['fh1', 'fh3'], ['fh3', 'fh5'], ['fh5', 'fh7'],
      ['fh6', 'jaw_l3'], ['jaw_l3', 'jaw_l2'], ['jaw_l2', 'jaw_l1'], ['jaw_l1', 'chin_l'], ['chin_l', 'chin_c'],
      ['chin_c', 'chin_r'], ['chin_r', 'jaw_r1'], ['jaw_r1', 'jaw_r2'], ['jaw_r2', 'jaw_r3'], ['jaw_r3', 'fh7'],

      ['fh1', 'glabella'], ['fh2', 'eb_l2'], ['fh3', 'eb_r2'],
      ['glabella', 'eb_l1'], ['eb_l1', 'eb_l2'], ['eb_l2', 'eb_l3'], ['eb_l3', 'cheek_l_high'],
      ['glabella', 'eb_r1'], ['eb_r1', 'eb_r2'], ['eb_r2', 'eb_r3'], ['eb_r3', 'cheek_r_high'],

      ['eye_l_in', 'eye_l_top'], ['eye_l_top', 'eye_l_out'], ['eye_l_out', 'eye_l_bot'], ['eye_l_bot', 'eye_l_in'],
      ['eye_r_in', 'eye_r_top'], ['eye_r_top', 'eye_r_out'], ['eye_r_out', 'eye_r_bot'], ['eye_r_bot', 'eye_r_in'],
      ['glabella', 'eye_l_in'], ['glabella', 'eye_r_in'],
      ['eb_l2', 'eye_l_top'], ['eb_r2', 'eye_r_top'],

      ['glabella', 'nose_bridge'], ['nose_bridge', 'nose_mid'], ['nose_mid', 'nose_tip'],
      ['nose_tip', 'nose_l_wing'], ['nose_tip', 'nose_r_wing'], ['nose_l_wing', 'subnasale'], ['nose_r_wing', 'subnasale'],
      ['nose_bridge', 'eye_l_in'], ['nose_bridge', 'eye_r_in'],
      ['nose_l_wing', 'cheek_l_mid'], ['nose_r_wing', 'cheek_r_mid'],

      ['eye_l_out', 'cheek_l_high'], ['eye_r_out', 'cheek_r_high'],
      ['cheek_l_high', 'cheek_l_mid'], ['cheek_r_high', 'cheek_r_mid'],
      ['cheek_l_mid', 'lip_corner_l'], ['cheek_r_mid', 'lip_corner_r'],

      ['subnasale', 'lip_top_c'],
      ['lip_corner_l', 'lip_top_l'], ['lip_top_l', 'lip_top_c'], ['lip_top_c', 'lip_top_r'], ['lip_top_r', 'lip_corner_r'],
      ['lip_corner_l', 'lip_bot_l'], ['lip_bot_l', 'lip_bot_c'], ['lip_bot_c', 'lip_bot_r'], ['lip_bot_r', 'lip_corner_r'],

      ['lip_bot_c', 'chin_c'], ['lip_corner_l', 'jaw_l1'], ['lip_corner_r', 'jaw_r1'],
      ['cheek_l_mid', 'jaw_l1'], ['cheek_r_mid', 'jaw_r1'],
    ];

    let lastTime = 0;
    const frameDelay = 1000 / 35;

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 - 2;

      rotY = Math.sin(Date.now() / 1500) * 0.08;

      scanY += 1.2 * scanDirection;
      if (scanY > h) scanDirection = -1;
      if (scanY < 0) scanDirection = 1;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const scaleFactor = Math.min(w, h) / 125;

      const projected = {};
      landmarks.forEach((pt) => {
        const rx = pt.x * cosY - pt.z * sinY;
        const rz = pt.z * cosY + pt.x * sinY;
        const fov = 220;
        const pScale = fov / (fov + rz);

        projected[pt.id] = {
          x: cx + rx * scaleFactor * pScale,
          y: cy + pt.y * scaleFactor * pScale,
          z: rz,
          scale: pScale,
        };
      });

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 1;
      edges.forEach(([id1, id2]) => {
        const p1 = projected[id1];
        const p2 = projected[id2];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      landmarks.forEach((pt) => {
        const p = projected[pt.id];
        if (!p) return;
        const alpha = Math.max(0.3, Math.min(1, (p.z + 30) / 60));
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      ['eye_l_pupil', 'eye_r_pupil'].forEach((id) => {
        const p = projected[id];
        if (p) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const laserGrad = ctx.createLinearGradient(0, scanY, w, scanY);
      laserGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      laserGrad.addColorStop(0.2, 'rgba(0, 240, 255, 0.5)');
      laserGrad.addColorStop(0.5, 'rgba(0, 255, 255, 0.95)');
      laserGrad.addColorStop(0.8, 'rgba(0, 240, 255, 0.5)');
      laserGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = laserGrad;
      ctx.fillRect(4, scanY - 1, w - 8, 2);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.fillRect(8, scanY - 6, w - 16, 12);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const triggerRescan = () => {
    if (scanning) return;
    soundService.scan();
    setScanning(true);
    setScanProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 8;
      if (current >= 100) {
        setScanProgress(100);
        setScanning(false);
        soundService.click();
        clearInterval(interval);
      } else {
        setScanProgress(current);
      }
    }, 45);
  };

  return (
    <div
      className="hud-panel p-2.5 rounded relative flex flex-col justify-between h-full"
      onMouseEnter={() => soundService.hover()}
      onClick={triggerRescan}
      title="Click to run biometric identity scan"
    >
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-300 pb-1 border-b border-cyan-500/20">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-cyan-400 font-bold">//</span>
          <span className="text-slate-200">HUMAN INTERFACE</span>
        </div>
        <span className="text-[8px] font-mono text-cyan-400/80">IDENTITY SCAN</span>
      </div>

      <div className="flex items-center gap-3 my-auto py-1">
        <div className="relative w-28 h-28 rounded bg-[#040c1e]/70 border border-cyan-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-[inset_0_0_15px_rgba(0,240,255,0.08)]">
          <canvas ref={canvasRef} width={112} height={112} className="w-full h-full" />
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-cyan-400" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-400" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-cyan-400" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-cyan-400" />
        </div>

        <div className="flex-1 space-y-1.5 font-mono min-w-0">
          <div>
            <div className="flex justify-between text-[8px] text-slate-400 uppercase tracking-wider">
              <span>SCAN PROGRESS</span>
              <span className="text-cyan-300 font-bold">{scanProgress}%</span>
            </div>
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/25 mt-0.5">
              <div
                className="h-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] transition-all duration-150"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase tracking-wider">
              <span>HEART RATE</span>
              <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-slate-100 flex items-baseline gap-1">
              <span className="text-sm font-mono text-cyan-200">{heartRate}</span>
              <span className="text-[8px] text-slate-400">BPM</span>
            </div>

            <svg className="w-full h-3.5 text-cyan-400 mt-0.5" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d="M0,10 L30,10 L35,2 L40,18 L45,6 L50,10 L100,10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="drop-shadow-[0_0_4px_#00f0ff]"
              />
            </svg>
          </div>

          <div className="pt-1 border-t border-cyan-500/20 flex items-center justify-between">
            <span className="text-[8px] text-slate-400">STATUS</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 glow-text-green">
              <span>{scanning ? 'SCANNING...' : 'VERIFIED'}</span>
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

