import React, { useRef, useEffect, useState } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import { Database, Lightbulb, BarChart3, Box } from 'lucide-react';

// Master 3D Humanoid AI Avatar Bust Landmarks
const LANDMARKS = {
  // Cranial Vault & Crown
  vertex:     { x: 0,   y: -80, z: -6 },
  crown_l1:   { x: -18, y: -76, z: -8 },
  crown_r1:   { x: 18,  y: -76, z: -8 },
  crown_l2:   { x: -32, y: -68, z: -14 },
  crown_r2:   { x: 32,  y: -68, z: -14 },

  // Hairline & Upper Forehead
  hairline_c: { x: 0,   y: -64, z: 10 },
  hairline_l1:{ x: -18, y: -63, z: 6 },
  hairline_r1:{ x: 18,  y: -63, z: 6 },
  hairline_l2:{ x: -34, y: -60, z: -4 },
  hairline_r2:{ x: 34,  y: -60, z: -4 },
  hairline_l3:{ x: -44, y: -54, z: -16 },
  hairline_r3:{ x: 44,  y: -54, z: -16 },

  // Mid Forehead
  forehead_c: { x: 0,   y: -48, z: 18 },
  forehead_l1:{ x: -18, y: -47, z: 15 },
  forehead_r1:{ x: 18,  y: -47, z: 15 },
  forehead_l2:{ x: -34, y: -46, z: 4 },
  forehead_r2:{ x: 34,  y: -46, z: 4 },
  temple_l:   { x: -46, y: -41, z: -12 },
  temple_r:   { x: 46,  y: -41, z: -12 },

  // Headset Ear Sensors
  headset_l:  { x: -52, y: -16, z: -10 },
  headset_r:  { x: 52,  y: -16, z: -10 },

  // Brows & Glabella
  glabella:   { x: 0,   y: -30, z: 20 },
  brow_in_l:  { x: -9,  y: -31, z: 19 },
  brow_in_r:  { x: 9,   y: -31, z: 19 },
  brow_mid_l: { x: -23, y: -34, z: 17 },
  brow_mid_r: { x: 23,  y: -34, z: 17 },
  brow_out_l: { x: -38, y: -29, z: 8 },
  brow_out_r: { x: 38,  y: -29, z: 8 },
  brow_tail_l:{ x: -46, y: -28, z: -10 },
  brow_tail_r:{ x: 46,  y: -28, z: -10 },

  // Eyes & Orbits
  nasion:       { x: 0,   y: -20, z: 21 },
  canthus_in_l: { x: -10, y: -18, z: 16 },
  canthus_in_r: { x: 10,  y: -18, z: 16 },
  eye_top_l:    { x: -23, y: -23, z: 17 },
  eye_top_r:    { x: 23,  y: -23, z: 17 },
  canthus_out_l:{ x: -36, y: -18, z: 9 },
  canthus_out_r:{ x: 36,  y: -18, z: 9 },
  eye_bot_l:    { x: -23, y: -14, z: 14 },
  eye_bot_r:    { x: 23,  y: -14, z: 14 },
  pupil_l:      { x: -23, y: -18.5, z: 16.5 },
  pupil_r:      { x: 23,  y: -18.5, z: 16.5 },

  // Cheeks & Zygoma
  zygoma_l:     { x: -48, y: -4,  z: -7 },
  zygoma_r:     { x: 48,  y: -4,  z: -7 },
  cheek_high_l: { x: -35, y: -3,  z: 8 },
  cheek_high_r: { x: 35,  y: -3,  z: 8 },
  cheek_mid_l:  { x: -20, y: -3,  z: 16 },
  cheek_mid_r:  { x: 20,  y: -3,  z: 16 },
  rhinion:      { x: 0,   y: -3,  z: 27 },

  // Nose Tip & Wings
  nose_tip:     { x: 0,   y: 8,   z: 35 },
  nostril_l:    { x: -8.5,y: 10,  z: 25 },
  nostril_r:    { x: 8.5, y: 10,  z: 25 },
  alar_l:       { x: -15, y: 9,   z: 18 },
  alar_r:       { x: 15,  y: 9,   z: 18 },
  subnasale:    { x: 0,   y: 12,  z: 23 },

  // Buccal Cheek
  buccal_l:     { x: -44, y: 12,  z: -6 },
  buccal_r:     { x: 44,  y: 12,  z: -6 },
  cheek_low_l:  { x: -30, y: 11,  z: 8 },
  cheek_low_r:  { x: 30,  y: 11,  z: 8 },

  // Lips & Cupid's Bow
  cupid_c:      { x: 0,   y: 21,  z: 22 },
  cupid_l:      { x: -5,  y: 20,  z: 23 },
  cupid_r:      { x: 5,   y: 20,  z: 23 },
  cheilion_l:   { x: -22, y: 24,  z: 11 },
  cheilion_r:   { x: 22,  y: 24,  z: 11 },
  lip_bot_c:    { x: 0,   y: 33,  z: 22 },
  lip_bot_l:    { x: -9,  y: 32,  z: 19 },
  lip_bot_r:    { x: 9,   y: 32,  z: 19 },
  mouth_c:      { x: 0,   y: 25,  z: 20 },

  // Jaw & Chin
  gonion_l:     { x: -38, y: 32,  z: -6 },
  gonion_r:     { x: 38,  y: 32,  z: -6 },
  jaw_body_l:   { x: -31, y: 42,  z: 4 },
  jaw_body_r:   { x: 31,  y: 42,  z: 4 },
  prejowl_l:    { x: -19, y: 50,  z: 12 },
  prejowl_r:    { x: 19,  y: 50,  z: 12 },
  chin_l:       { x: -9,  y: 55,  z: 17 },
  chin_r:       { x: 9,   y: 55,  z: 17 },
  pogonion:     { x: 0,   y: 56,  z: 19 },
  mentolabial:  { x: 0,   y: 42,  z: 17 },

  // Neck
  hyoid:        { x: 0,   y: 65,  z: 6 },
  neck_high_l:  { x: -24, y: 60,  z: -8 },
  neck_high_r:  { x: 24,  y: 60,  z: -8 },
  neck_low_l:   { x: -28, y: 78,  z: -12 },
  neck_low_r:   { x: 28,  y: 78,  z: -12 },
  notch:        { x: 0,   y: 80,  z: 2 },

  // Shoulders & Upper Torso
  trap_l:       { x: -48, y: 88,  z: -14 },
  trap_r:       { x: 48,  y: 88,  z: -14 },
  shoulder_l:   { x: -95, y: 110, z: -18 },
  shoulder_r:   { x: 95,  y: 110, z: -18 },
  deltoid_l:    { x: -100,y: 135, z: -16 },
  deltoid_r:    { x: 100, y: 135, z: -16 },
  arm_low_l:    { x: -88, y: 160, z: -12 },
  arm_low_r:    { x: 88,  y: 160, z: -12 },

  // Chest & Arc Reactor
  clavicle_l:   { x: -24, y: 82,  z: 4 },
  clavicle_r:   { x: 24,  y: 82,  z: 4 },
  sternum_top:  { x: 0,   y: 92,  z: 10 },
  arc_reactor:  { x: 0,   y: 118, z: 18 },
  pec_mid_l:    { x: -42, y: 120, z: 14 },
  pec_mid_r:    { x: 42,  y: 120, z: 14 },
  pec_low_l:    { x: -48, y: 145, z: 10 },
  pec_low_r:    { x: 48,  y: 145, z: 10 },
  xiphoid:      { x: 0,   y: 152, z: 12 },
  torso_base_l: { x: -65, y: 175, z: 4 },
  torso_base_c: { x: 0,   y: 175, z: 8 },
  torso_base_r: { x: 65,  y: 175, z: 4 },
};

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
      mouseRef.current.targetX = nx * 0.2;
      mouseRef.current.targetY = ny * 0.12;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let lastTime = 0;
    const frameDelay = 1000 / 45; // 45 fps smooth lock

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      // Mouse smoothing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 - 16;
      const scaleFactor = Math.min(w / 450, h / 390) * 1.02;
      const fov = 320;

      // Subtle breathing float
      const breathing = Math.sin(now / 1200) * 3;
      const effectiveCy = cy + breathing;

      // Rotations
      const rotY = mouseRef.current.x + Math.sin(now / 2400) * 0.03;
      const rotX = mouseRef.current.y * 0.6 + 0.02;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 3D Projection
      const proj = {};
      for (const [key, pt] of Object.entries(LANDMARKS)) {
        const y1 = pt.y * cosX - pt.z * sinX;
        const z1 = pt.z * cosX + pt.y * sinX;
        const x2 = pt.x * cosY - z1 * sinY;
        const z2 = z1 * cosY + pt.x * sinY;
        const pscale = fov / (fov + z2);

        proj[key] = {
          x: cx + x2 * scaleFactor * pscale,
          y: effectiveCy + y1 * scaleFactor * pscale,
          z: z2,
          scale: pscale,
        };
      }

      // Helper to draw 3D connected lines
      const drawPath = (names, strokeStyle, lineWidth = 1.2, close = false) => {
        const pts = names.map((n) => proj[n]).filter(Boolean);
        if (pts.length < 2) return;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        if (close) ctx.closePath();
        ctx.stroke();
      };

      // 1. Pedestal Glowing Projection Rings (Concentric Ellipses at bottom)
      const pedY = effectiveCy + 180 * scaleFactor;
      const pedRadiusX = 145 * scaleFactor;
      const pedRadiusY = 22 * scaleFactor;

      // Pedestal light columns / aura
      const auraGrad = ctx.createLinearGradient(cx, pedY, cx, effectiveCy + 80);
      auraGrad.addColorStop(0, 'rgba(0, 220, 255, 0.22)');
      auraGrad.addColorStop(0.5, 'rgba(0, 160, 255, 0.06)');
      auraGrad.addColorStop(1, 'rgba(0, 220, 255, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.moveTo(cx - pedRadiusX * 0.9, pedY);
      ctx.lineTo(cx + pedRadiusX * 0.9, pedY);
      ctx.lineTo(cx + pedRadiusX * 0.4, effectiveCy + 80);
      ctx.lineTo(cx - pedRadiusX * 0.4, effectiveCy + 80);
      ctx.closePath();
      ctx.fill();

      // Outer tier ring
      ctx.strokeStyle = 'rgba(0, 180, 255, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, pedY, pedRadiusX, pedRadiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Mid tier ring
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(cx, pedY - 3, pedRadiusX * 0.78, pedRadiusY * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner core ring
      ctx.strokeStyle = 'rgba(180, 250, 255, 0.95)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(cx, pedY - 6, pedRadiusX * 0.48, pedRadiusY * 0.48, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Upward vertical projection laser lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 14; i++) {
        const ang = (i / 14) * Math.PI;
        const rx = Math.cos(ang) * (pedRadiusX * 0.75);
        ctx.beginPath();
        ctx.moveTo(cx + rx, pedY);
        ctx.lineTo(cx + rx * 0.35, effectiveCy + 115);
        ctx.stroke();
      }

      // 2. Head Silhouette & Cranial Vault
      const headSilhouette = [
        'chin_l', 'prejowl_l', 'jaw_body_l', 'gonion_l', 'buccal_l', 'zygoma_l', 'temple_l',
        'hairline_l3', 'crown_l2', 'crown_l1', 'vertex',
        'crown_r1', 'crown_r2', 'hairline_r3', 'temple_r', 'zygoma_r', 'buccal_r', 'gonion_r',
        'jaw_body_r', 'prejowl_r', 'chin_r', 'pogonion'
      ];
      drawPath(headSilhouette, 'rgba(0, 240, 255, 0.88)', 1.8, true);

      // 3. Headset Band & Ear Nodes
      drawPath(['headset_l', 'temple_l', 'crown_l2', 'vertex', 'crown_r2', 'temple_r', 'headset_r'], 'rgba(0, 255, 255, 0.95)', 2.2);
      ['headset_l', 'headset_r'].forEach((hs) => {
        const p = proj[hs];
        if (!p) return;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6.5 * p.scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Facial Features (Brows, Eyes, Nose, Lips, Jaw)
      drawPath(['brow_in_l', 'brow_mid_l', 'brow_out_l', 'brow_tail_l'], 'rgba(0, 255, 255, 0.9)', 1.8);
      drawPath(['brow_in_r', 'brow_mid_r', 'brow_out_r', 'brow_tail_r'], 'rgba(0, 255, 255, 0.9)', 1.8);

      // Eyes
      [
        ['canthus_in_l', 'eye_top_l', 'canthus_out_l', 'eye_bot_l', 'pupil_l'],
        ['canthus_in_r', 'eye_top_r', 'canthus_out_r', 'eye_bot_r', 'pupil_r'],
      ].forEach(([inPt, topPt, outPt, botPt, pup]) => {
        drawPath([inPt, topPt, outPt, botPt], 'rgba(0, 255, 255, 0.92)', 1.6, true);
        const p = proj[pup];
        if (p) {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Nose
      drawPath(['nasion', 'rhinion', 'nose_tip'], 'rgba(0, 255, 255, 0.9)', 1.6);
      drawPath(['alar_l', 'nostril_l', 'nose_tip', 'nostril_r', 'alar_r'], 'rgba(0, 240, 255, 0.75)', 1.2);
      drawPath(['nostril_l', 'subnasale', 'nostril_r'], 'rgba(0, 240, 255, 0.65)', 1);

      // Lips
      drawPath(['cheilion_l', 'cupid_l', 'cupid_c', 'cupid_r', 'cheilion_r'], 'rgba(0, 255, 255, 0.9)', 1.6);
      drawPath(['cheilion_l', 'lip_bot_l', 'lip_bot_c', 'lip_bot_r', 'cheilion_r'], 'rgba(0, 240, 255, 0.8)', 1.4);

      // Jawline
      drawPath(['gonion_l', 'jaw_body_l', 'prejowl_l', 'chin_l', 'pogonion', 'chin_r', 'prejowl_r', 'jaw_body_r', 'gonion_r'], 'rgba(0, 240, 255, 0.85)', 1.6);

      // 5. Head Contour Latitudinal Rings
      const ringsHead = [
        ['hairline_l3', 'hairline_l2', 'hairline_l1', 'hairline_c', 'hairline_r1', 'hairline_r2', 'hairline_r3'],
        ['temple_l', 'forehead_l2', 'forehead_l1', 'forehead_c', 'forehead_r1', 'forehead_r2', 'temple_r'],
        ['zygoma_l', 'cheek_high_l', 'cheek_mid_l', 'rhinion', 'cheek_mid_r', 'cheek_high_r', 'zygoma_r'],
        ['buccal_l', 'cheek_low_l', 'alar_l', 'nostril_l', 'nose_tip', 'nostril_r', 'alar_r', 'cheek_low_r', 'buccal_r'],
      ];
      ringsHead.forEach((r) => drawPath(r, 'rgba(0, 240, 255, 0.4)', 1));

      // 6. Shoulders & Torso Contours
      drawPath(['gonion_l', 'neck_high_l', 'neck_low_l', 'trap_l', 'shoulder_l', 'deltoid_l', 'arm_low_l'], 'rgba(0, 240, 255, 0.85)', 1.8);
      drawPath(['gonion_r', 'neck_high_r', 'neck_low_r', 'trap_r', 'shoulder_r', 'deltoid_r', 'arm_low_r'], 'rgba(0, 240, 255, 0.85)', 1.8);

      // Torso isolines
      drawPath(['shoulder_l', 'trap_l', 'clavicle_l', 'notch', 'clavicle_r', 'trap_r', 'shoulder_r'], 'rgba(0, 240, 255, 0.55)', 1.1);
      drawPath(['deltoid_l', 'pec_mid_l', 'arc_reactor', 'pec_mid_r', 'deltoid_r'], 'rgba(0, 240, 255, 0.65)', 1.2);
      drawPath(['arm_low_l', 'pec_low_l', 'xiphoid', 'pec_low_r', 'arm_low_r'], 'rgba(0, 240, 255, 0.5)', 1);
      drawPath(['arm_low_l', 'torso_base_l', 'torso_base_c', 'torso_base_r', 'arm_low_r'], 'rgba(0, 240, 255, 0.75)', 1.6);

      // Torso longitudinal flow lines
      drawPath(['notch', 'sternum_top', 'arc_reactor', 'xiphoid', 'torso_base_c'], 'rgba(0, 255, 255, 0.75)', 1.2);
      drawPath(['clavicle_l', 'pec_mid_l', 'pec_low_l', 'torso_base_l'], 'rgba(0, 240, 255, 0.45)', 1);
      drawPath(['clavicle_r', 'pec_mid_r', 'pec_low_r', 'torso_base_r'], 'rgba(0, 240, 255, 0.45)', 1);

      // 7. ARC REACTOR CHEST CORE (Radiant Concentric Emitter)
      const ac = proj['arc_reactor'];
      if (ac) {
        const pulse = Math.sin(now / 350) * 2;
        // Outer halo
        const haloGrad = ctx.createRadialGradient(ac.x, ac.y, 4, ac.x, ac.y, (28 + pulse) * ac.scale);
        haloGrad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        haloGrad.addColorStop(0.5, 'rgba(0, 160, 255, 0.25)');
        haloGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(ac.x, ac.y, (28 + pulse) * ac.scale, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring
        ctx.strokeStyle = 'rgba(0, 220, 255, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ac.x, ac.y, (18 + pulse * 0.5) * ac.scale, 0, Math.PI * 2);
        ctx.stroke();

        // Mid ring
        ctx.strokeStyle = 'rgba(180, 250, 255, 0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ac.x, ac.y, 11 * ac.scale, 0, Math.PI * 2);
        ctx.stroke();

        // Center white core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ac.x, ac.y, 5 * ac.scale, 0, Math.PI * 2);
        ctx.fill();

        // Radial core spokes
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const ang = i * (Math.PI / 4) + now / 2500;
          const sx1 = ac.x + Math.cos(ang) * (7 * ac.scale);
          const sy1 = ac.y + Math.sin(ang) * (7 * ac.scale);
          const sx2 = ac.x + Math.cos(ang) * (16 * ac.scale);
          const sy2 = ac.y + Math.sin(ang) * (16 * ac.scale);
          ctx.beginPath();
          ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.stroke();
        }
      }

      // 8. Holographic Landmark Points
      for (const p of Object.values(proj)) {
        const rad = 1.25 * p.scale;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
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
    addConversationMessage({
      sender: 'user',
      text: query,
    });
    setTimeout(() => {
      addConversationMessage({
        sender: 'jarvis',
        text: `Executing ${label}... Analyzing context and telemetry.`,
      });
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

        {/* 3D Holographic Canvas */}
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full drop-shadow-[0_0_25px_rgba(0,220,255,0.4)]"
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
