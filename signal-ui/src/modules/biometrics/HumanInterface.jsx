import React, { useRef, useEffect, useState } from 'react';
import { soundService } from '../../core/soundService';
import { CheckCircle2, Heart } from 'lucide-react';

// Master Anatomical Human 3D Facial Topography Model
// Calibrated according to classical anthropometric landmarks (Da Vinci / Loomis proportions)
const LANDMARKS = {
  // Cranial Vault & Crown (Natural rounded skull dome)
  vertex: { x: 0, y: -66, z: -6 },
  crown_l1: { x: -15, y: -63, z: -8 },
  crown_r1: { x: 15, y: -63, z: -8 },
  crown_l2: { x: -28, y: -56, z: -14 },
  crown_r2: { x: 28, y: -56, z: -14 },

  // Hairline & Upper Forehead
  hairline_c: { x: 0, y: -53, z: 10 },
  hairline_l1: { x: -16, y: -52, z: 6 },
  hairline_r1: { x: 16, y: -52, z: 6 },
  hairline_l2: { x: -30, y: -49, z: -4 },
  hairline_r2: { x: 30, y: -49, z: -4 },
  hairline_l3: { x: -38, y: -44, z: -16 },
  hairline_r3: { x: 38, y: -44, z: -16 },

  // Mid Forehead (Frontal Eminences)
  forehead_c: { x: 0, y: -39, z: 18 },
  forehead_l1: { x: -15, y: -38, z: 15 },
  forehead_r1: { x: 15, y: -38, z: 15 },
  forehead_l2: { x: -29, y: -37, z: 4 },
  forehead_r2: { x: 29, y: -37, z: 4 },
  temple_l: { x: -41, y: -33, z: -12 },
  temple_r: { x: 41, y: -33, z: -12 },

  // Glabella & Arched Eyebrows
  glabella: { x: 0, y: -25, z: 20 },
  brow_in_l: { x: -8, y: -25.5, z: 19 },
  brow_in_r: { x: 8, y: -25.5, z: 19 },
  brow_mid_l: { x: -20, y: -28.5, z: 17 },
  brow_mid_r: { x: 20, y: -28.5, z: 17 },
  brow_out_l: { x: -33, y: -24.5, z: 8 },
  brow_out_r: { x: 33, y: -24.5, z: 8 },
  brow_tail_l: { x: -41, y: -23, z: -10 },
  brow_tail_r: { x: 41, y: -23, z: -10 },

  // Nasion & Almond Eyes
  nasion: { x: 0, y: -17, z: 21 },
  canthus_in_l: { x: -9, y: -15, z: 16 },
  canthus_in_r: { x: 9, y: -15, z: 16 },
  eye_top_l: { x: -20, y: -19, z: 17 },
  eye_top_r: { x: 20, y: -19, z: 17 },
  canthus_out_l: { x: -31, y: -15, z: 9 },
  canthus_out_r: { x: 31, y: -15, z: 9 },
  eye_bot_l: { x: -20, y: -12, z: 14 },
  eye_bot_r: { x: 20, y: -12, z: 14 },
  pupil_l: { x: -20, y: -15.5, z: 16.5 },
  pupil_r: { x: 20, y: -15.5, z: 16.5 },

  // Zygomatic Cheekbones & Mid Nose Dorsum
  zygoma_l: { x: -41.5, y: -4, z: -7 },
  zygoma_r: { x: 41.5, y: -4, z: -7 },
  cheek_high_l: { x: -31, y: -3, z: 8 },
  cheek_high_r: { x: 31, y: -3, z: 8 },
  cheek_mid_l: { x: -17, y: -3, z: 16 },
  cheek_mid_r: { x: 17, y: -3, z: 16 },
  rhinion: { x: 0, y: -3, z: 27 },

  // 3D Nose Tip, Nostril Wings & Subnasale
  nose_tip: { x: 0, y: 6, z: 35 },
  nostril_l: { x: -7.5, y: 8, z: 25 },
  nostril_r: { x: 7.5, y: 8, z: 25 },
  alar_l: { x: -13, y: 7, z: 18 },
  alar_r: { x: 13, y: 7, z: 18 },
  subnasale: { x: 0, y: 10, z: 23 },

  // Mid Cheek / Buccal Region
  buccal_l: { x: -38, y: 10, z: -6 },
  buccal_r: { x: 38, y: 10, z: -6 },
  cheek_low_l: { x: -27, y: 9, z: 8 },
  cheek_low_r: { x: 27, y: 9, z: 8 },

  // Anatomical Cupid's Bow Lips
  cupid_c: { x: 0, y: 17.5, z: 22 },
  cupid_l: { x: -4.5, y: 16.5, z: 23 },
  cupid_r: { x: 4.5, y: 16.5, z: 23 },
  cheilion_l: { x: -19, y: 19.5, z: 11 },
  cheilion_r: { x: 19, y: 19.5, z: 11 },
  lip_bot_c: { x: 0, y: 27.5, z: 22 },
  lip_bot_l: { x: -8, y: 26.5, z: 19 },
  lip_bot_r: { x: 8, y: 26.5, z: 19 },
  mouth_c: { x: 0, y: 21, z: 20 },

  // Mandible, Gonion (Jaw Angles) & Chin
  gonion_l: { x: -33, y: 26, z: -6 },
  gonion_r: { x: 33, y: 26, z: -6 },
  jaw_body_l: { x: -27, y: 35, z: 4 },
  jaw_body_r: { x: 27, y: 35, z: 4 },
  prejowl_l: { x: -17, y: 41, z: 12 },
  prejowl_r: { x: 17, y: 41, z: 12 },
  chin_l: { x: -8, y: 45, z: 17 },
  chin_r: { x: 8, y: 45, z: 17 },
  pogonion: { x: 0, y: 46, z: 19 },
  mentolabial: { x: 0, y: 34, z: 17 },

  // Neck, Throat & Clavicular Base
  hyoid: { x: 0, y: 53, z: 6 },
  neck_high_l: { x: -22, y: 49, z: -8 },
  neck_high_r: { x: 22, y: 49, z: -8 },
  neck_low_l: { x: -24, y: 65, z: -12 },
  neck_low_r: { x: 24, y: 65, z: -12 },
  clavicle_l: { x: -12, y: 66, z: -3 },
  clavicle_r: { x: 12, y: 66, z: -3 },
  notch: { x: 0, y: 67, z: 2 },
};

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

    let scanY = 12;
    let scanDirection = 1;
    let lastTime = 0;
    const frameDelay = 1000 / 35; // Strict 35 FPS lock to prevent UI rendering lag

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 - 2;

      // Realistic subtle 3D rotational breathing & yaw dynamics
      const time = now * 0.0009;
      const rotY = Math.sin(time) * 0.05;
      const rotX = Math.cos(time * 0.75) * 0.025;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Retina scale factor
      const scaleFactor = Math.min(w, h) / 158;
      const fov = 260;

      // Sweeping laser scanner motion
      scanY += 1.4 * scanDirection;
      if (scanY > h - 12) scanDirection = -1;
      if (scanY < 12) scanDirection = 1;

      // 3D Perspective Projection
      const proj = {};
      Object.entries(LANDMARKS).forEach(([key, pt]) => {
        const y1 = pt.y * cosX - pt.z * sinX;
        const z1 = pt.z * cosX + pt.y * sinX;
        const x2 = pt.x * cosY - z1 * sinY;
        const z2 = z1 * cosY + pt.x * sinY;

        const pScale = fov / (fov + z2);
        proj[key] = {
          x: cx + x2 * scaleFactor * pScale,
          y: cy + y1 * scaleFactor * pScale,
          z: z2,
          scale: pScale,
        };
      });

      // Helper to render polylines with depth lighting
      const drawPath = (names, strokeStyle, lineWidth = 1, close = false) => {
        const pts = names.map((n) => proj[n]).filter(Boolean);
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        if (close) ctx.closePath();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };

      // 1. Natural Human Head Silhouette Boundary (Cranium vault -> temples -> zygoma -> jaw -> chin)
      const completeSilhouette = [
        'chin_l', 'prejowl_l', 'jaw_body_l', 'gonion_l', 'buccal_l', 'zygoma_l', 'temple_l',
        'hairline_l3', 'crown_l2', 'crown_l1', 'vertex',
        'crown_r1', 'crown_r2', 'hairline_r3', 'temple_r', 'zygoma_r', 'buccal_r', 'gonion_r',
        'jaw_body_r', 'prejowl_r', 'chin_r', 'pogonion',
      ];
      drawPath(completeSilhouette, 'rgba(0, 240, 255, 0.85)', 1.4, true);

      // 2. Distinct Mandibular Jawline
      const jawline = [
        'gonion_l', 'jaw_body_l', 'prejowl_l', 'chin_l', 'pogonion',
        'chin_r', 'prejowl_r', 'jaw_body_r', 'gonion_r',
      ];
      drawPath(jawline, 'rgba(0, 245, 255, 0.8)', 1.2);

      // 3. Neck & Clavicular Outlines
      drawPath(['gonion_l', 'neck_high_l', 'neck_low_l'], 'rgba(0, 240, 255, 0.4)', 0.9);
      drawPath(['gonion_r', 'neck_high_r', 'neck_low_r'], 'rgba(0, 240, 255, 0.4)', 0.9);
      drawPath(['neck_low_l', 'clavicle_l', 'notch', 'clavicle_r', 'neck_low_r'], 'rgba(0, 240, 255, 0.35)', 0.8);

      // 4. Horizontal Topographic Contour Rings
      const rings = [
        ['hairline_l3', 'hairline_l2', 'hairline_l1', 'hairline_c', 'hairline_r1', 'hairline_r2', 'hairline_r3'],
        ['temple_l', 'forehead_l2', 'forehead_l1', 'forehead_c', 'forehead_r1', 'forehead_r2', 'temple_r'],
        ['brow_tail_l', 'brow_out_l', 'brow_mid_l', 'brow_in_l', 'glabella', 'brow_in_r', 'brow_mid_r', 'brow_out_r', 'brow_tail_r'],
        ['temple_l', 'canthus_out_l', 'canthus_in_l', 'nasion', 'canthus_in_r', 'canthus_out_r', 'temple_r'],
        ['zygoma_l', 'cheek_high_l', 'cheek_mid_l', 'rhinion', 'cheek_mid_r', 'cheek_high_r', 'zygoma_r'],
        ['buccal_l', 'cheek_low_l', 'alar_l', 'nostril_l', 'nose_tip', 'nostril_r', 'alar_r', 'cheek_low_r', 'buccal_r'],
        ['gonion_l', 'cheilion_l', 'cupid_l', 'cupid_c', 'cupid_r', 'cheilion_r', 'gonion_r'],
        ['jaw_body_l', 'cheilion_l', 'lip_bot_l', 'lip_bot_c', 'lip_bot_r', 'cheilion_r', 'jaw_body_r'],
        ['jaw_body_l', 'prejowl_l', 'mentolabial', 'prejowl_r', 'jaw_body_r'],
        ['neck_high_l', 'hyoid', 'neck_high_r'],
      ];

      rings.forEach((r) => {
        drawPath(r, 'rgba(0, 240, 255, 0.32)', 0.75);
      });

      // 5. Sagittal Centerline & Facial Flow Curves
      const sagittal = [
        'vertex', 'hairline_c', 'forehead_c', 'glabella', 'nasion', 'rhinion',
        'nose_tip', 'subnasale', 'cupid_c', 'mouth_c', 'lip_bot_c', 'mentolabial',
        'pogonion', 'hyoid', 'notch',
      ];
      drawPath(sagittal, 'rgba(0, 240, 255, 0.55)', 1.0);

      // Paracentral lines
      drawPath(
        ['crown_l1', 'hairline_l1', 'forehead_l1', 'brow_in_l', 'canthus_in_l', 'alar_l', 'cupid_l', 'lip_bot_l', 'chin_l', 'clavicle_l'],
        'rgba(0, 240, 255, 0.3)',
        0.75
      );
      drawPath(
        ['crown_r1', 'hairline_r1', 'forehead_r1', 'brow_in_r', 'canthus_in_r', 'alar_r', 'cupid_r', 'lip_bot_r', 'chin_r', 'clavicle_r'],
        'rgba(0, 240, 255, 0.3)',
        0.75
      );

      // Pupil / Cheek curves
      drawPath(
        ['crown_l2', 'hairline_l2', 'forehead_l2', 'brow_mid_l', 'eye_top_l', 'eye_bot_l', 'cheek_mid_l', 'cheilion_l', 'prejowl_l'],
        'rgba(0, 240, 255, 0.28)',
        0.7
      );
      drawPath(
        ['crown_r2', 'hairline_r2', 'forehead_r2', 'brow_mid_r', 'eye_top_r', 'eye_bot_r', 'cheek_mid_r', 'cheilion_r', 'prejowl_r'],
        'rgba(0, 240, 255, 0.28)',
        0.7
      );

      // 6. Almond Eyes & Biometric Iris / Pupil HUD
      [
        { in: 'canthus_in_l', top: 'eye_top_l', out: 'canthus_out_l', bot: 'eye_bot_l', pup: 'pupil_l' },
        { in: 'canthus_in_r', top: 'eye_top_r', out: 'canthus_out_r', bot: 'eye_bot_r', pup: 'pupil_r' },
      ].forEach((eye) => {
        drawPath([eye.in, eye.top, eye.out, eye.bot], 'rgba(0, 255, 255, 0.95)', 1.3, true);

        const p = proj[eye.pup];
        if (p) {
          // Iris ring
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4.5 * p.scale, 0, Math.PI * 2);
          ctx.stroke();

          // Outer tracking ring
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8.0 * p.scale, 0, Math.PI * 2);
          ctx.stroke();

          // Glowing pupil core
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.0 * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Corner HUD brackets
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x - 11, p.y - 5);
          ctx.lineTo(p.x - 11, p.y + 5);
          ctx.moveTo(p.x + 11, p.y - 5);
          ctx.lineTo(p.x + 11, p.y + 5);
          ctx.stroke();
        }
      });

      // 7. Arched Eyebrows
      drawPath(['brow_in_l', 'brow_mid_l', 'brow_out_l', 'brow_tail_l'], 'rgba(0, 255, 255, 0.9)', 1.4);
      drawPath(['brow_in_r', 'brow_mid_r', 'brow_out_r', 'brow_tail_r'], 'rgba(0, 255, 255, 0.9)', 1.4);

      // 8. Sculpted 3D Nose Ridge & Nostril Wings
      drawPath(['nasion', 'rhinion', 'nose_tip'], 'rgba(0, 255, 255, 0.95)', 1.5);
      drawPath(['alar_l', 'nostril_l', 'nose_tip', 'nostril_r', 'alar_r'], 'rgba(0, 240, 255, 0.75)', 1.0);
      drawPath(['nostril_l', 'subnasale', 'nostril_r'], 'rgba(0, 240, 255, 0.65)', 0.9);

      // 9. Anatomical Cupid's Bow Lips
      drawPath(['cheilion_l', 'cupid_l', 'cupid_c', 'cupid_r', 'cheilion_r'], 'rgba(0, 255, 255, 0.9)', 1.3);
      drawPath(['cheilion_l', 'lip_bot_l', 'lip_bot_c', 'lip_bot_r', 'cheilion_r'], 'rgba(0, 240, 255, 0.8)', 1.2);
      drawPath(['cheilion_l', 'mouth_c', 'cheilion_r'], 'rgba(0, 240, 255, 0.5)', 0.8);

      // 10. Holographic Landmark Points with Laser Activation
      Object.values(proj).forEach((p) => {
        const distToLaser = Math.abs(p.y - scanY);
        const isLaserActive = distToLaser < 12;

        let alpha = Math.max(0.25, Math.min(0.9, (p.z + 25) / 55));
        let radius = 1.15 * p.scale;

        if (isLaserActive) {
          const laserFactor = 1 - distToLaser / 12;
          ctx.fillStyle = `rgba(230, 255, 255, ${0.85 + laserFactor * 0.15})`;
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 5 * laserFactor;
          radius *= 1 + laserFactor * 0.5;
        } else {
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.8})`;
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 11. Sweeping Laser Beam Visuals
      const laserGrad = ctx.createLinearGradient(0, scanY, w, scanY);
      laserGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      laserGrad.addColorStop(0.15, 'rgba(0, 240, 255, 0.45)');
      laserGrad.addColorStop(0.5, 'rgba(230, 255, 255, 0.95)');
      laserGrad.addColorStop(0.85, 'rgba(0, 240, 255, 0.45)');
      laserGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = laserGrad;
      ctx.fillRect(4, scanY - 1, w - 8, 2);

      // Ambient Laser Glow Area
      const glowGrad = ctx.createRadialGradient(cx, scanY, 2, cx, scanY, w * 0.45);
      glowGrad.addColorStop(0, 'rgba(0, 240, 255, 0.14)');
      glowGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, scanY - 8, w, 16);

      // 12. Subtle Biometric HUD Measurement Callout
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.55)';
      ctx.fillText('BIOM: 3D-VALID', 8, h - 8);
      ctx.fillText('CONF: 99.8%', w - 62, h - 8);
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
          <canvas ref={canvasRef} width={240} height={240} className="w-full h-full" />
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

