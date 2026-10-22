import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Eye, EyeOff, Play, Pause, Compass } from 'lucide-react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  amp: number;
  speed: number;
  phase: number;
  color: string;
  glowColor: string;
  isMajor?: boolean;
}

interface ConstellationLine {
  fromIndex: number;
  toIndex: number;
}

export const QinCeilingConstellationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showLines, setShowLines] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define Major Stars of the Underground Palace Ceiling
    // 0~6: 북두칠성 (Big Dipper)
    // 7: 북극성 (Polaris / Emperor Star)
    // 8~10: 삼태성 (Three Terraces)
    // 11~12: 견우성과 직녀성 (Altair & Vega)
    // 13~17: 카시오페이아 (Cassiopeia / Throne)
    // 18~23: 남두육성 (Southern Dipper)
    const majorStars: (Star & { label?: string })[] = [
      // 북두칠성 (국자 형태)
      { x: 370, y: 110, size: 3.5, baseAlpha: 0.85, amp: 0.25, speed: 1.1, phase: 0.2, color: '#fef08a', glowColor: '#facc15', isMajor: true, label: '천추(天樞)' },
      { x: 330, y: 125, size: 3.2, baseAlpha: 0.8, amp: 0.25, speed: 0.9, phase: 1.4, color: '#fef9c3', glowColor: '#eab308', isMajor: true, label: '천선(天璇)' },
      { x: 310, y: 165, size: 3.0, baseAlpha: 0.75, amp: 0.3, speed: 1.2, phase: 2.1, color: '#fef08a', glowColor: '#facc15', isMajor: true, label: '천기(天璣)' },
      { x: 350, y: 175, size: 2.8, baseAlpha: 0.7, amp: 0.25, speed: 0.8, phase: 3.5, color: '#fef9c3', glowColor: '#facc15', isMajor: true, label: '천권(天權)' },
      { x: 400, y: 195, size: 3.4, baseAlpha: 0.85, amp: 0.25, speed: 1.0, phase: 4.2, color: '#fef08a', glowColor: '#facc15', isMajor: true, label: '옥형(玉衡)' },
      { x: 445, y: 220, size: 3.2, baseAlpha: 0.8, amp: 0.3, speed: 1.3, phase: 5.1, color: '#fef9c3', glowColor: '#eab308', isMajor: true, label: '개양(開陽)' },
      { x: 485, y: 255, size: 3.6, baseAlpha: 0.9, amp: 0.2, speed: 0.95, phase: 0.8, color: '#fef08a', glowColor: '#facc15', isMajor: true, label: '요광(搖光)' },

      // 천상의 중심: 북극성 (황제를 상징하는 가장 빛나는 별)
      { x: 340, y: 55, size: 4.8, baseAlpha: 0.95, amp: 0.15, speed: 0.7, phase: 0.0, color: '#ffffff', glowColor: '#fde047', isMajor: true, label: '북극성(北極星·황제)' },

      // 삼태성 (황실의 안녕을 지키는 3개의 별)
      { x: 255, y: 110, size: 3.0, baseAlpha: 0.75, amp: 0.25, speed: 1.0, phase: 1.1, color: '#e0f2fe', glowColor: '#38bdf8', isMajor: true, label: '상태(上台)' },
      { x: 235, y: 125, size: 2.9, baseAlpha: 0.75, amp: 0.25, speed: 1.1, phase: 1.8, color: '#e0f2fe', glowColor: '#38bdf8', isMajor: true, label: '중태(中台)' },
      { x: 215, y: 140, size: 2.9, baseAlpha: 0.75, amp: 0.25, speed: 1.2, phase: 2.5, color: '#e0f2fe', glowColor: '#38bdf8', isMajor: true, label: '하태(下台)' },

      // 은하수 건너 직녀성과 견우성
      { x: 550, y: 100, size: 4.0, baseAlpha: 0.9, amp: 0.2, speed: 0.85, phase: 3.1, color: '#c7d2fe', glowColor: '#818cf8', isMajor: true, label: '직녀성(織女)' },
      { x: 590, y: 190, size: 3.8, baseAlpha: 0.85, amp: 0.25, speed: 0.9, phase: 4.7, color: '#fed7aa', glowColor: '#fb923c', isMajor: true, label: '견우성(牽牛)' },

      // 카시오페이아 (W 형태)
      { x: 140, y: 70, size: 3.2, baseAlpha: 0.8, amp: 0.25, speed: 1.1, phase: 0.5, color: '#fef08a', glowColor: '#facc15', isMajor: true },
      { x: 165, y: 95, size: 2.8, baseAlpha: 0.75, amp: 0.25, speed: 0.9, phase: 1.7, color: '#fef08a', glowColor: '#facc15', isMajor: true },
      { x: 190, y: 80, size: 3.1, baseAlpha: 0.8, amp: 0.25, speed: 1.2, phase: 2.9, color: '#fef08a', glowColor: '#facc15', isMajor: true },
      { x: 210, y: 100, size: 2.9, baseAlpha: 0.75, amp: 0.25, speed: 1.0, phase: 3.8, color: '#fef08a', glowColor: '#facc15', isMajor: true },
      { x: 235, y: 85, size: 3.0, baseAlpha: 0.8, amp: 0.25, speed: 0.8, phase: 4.9, color: '#fef08a', glowColor: '#facc15', isMajor: true },

      // 남두육성 (궁전 남쪽 천문)
      { x: 120, y: 180, size: 2.7, baseAlpha: 0.75, amp: 0.25, speed: 1.1, phase: 1.2, color: '#bae6fd', glowColor: '#38bdf8', isMajor: true },
      { x: 145, y: 195, size: 2.9, baseAlpha: 0.75, amp: 0.25, speed: 0.9, phase: 2.3, color: '#bae6fd', glowColor: '#38bdf8', isMajor: true },
      { x: 135, y: 220, size: 2.8, baseAlpha: 0.75, amp: 0.25, speed: 1.2, phase: 3.4, color: '#bae6fd', glowColor: '#38bdf8', isMajor: true },
      { x: 165, y: 215, size: 2.6, baseAlpha: 0.7, amp: 0.3, speed: 1.0, phase: 4.5, color: '#bae6fd', glowColor: '#38bdf8', isMajor: true },
      { x: 180, y: 240, size: 2.8, baseAlpha: 0.8, amp: 0.25, speed: 0.85, phase: 0.6, color: '#bae6fd', glowColor: '#38bdf8', isMajor: true },
      { x: 160, y: 260, size: 2.9, baseAlpha: 0.8, amp: 0.25, speed: 1.15, phase: 1.9, color: '#bae6fd', glowColor: '#38bdf8', isMajor: true },
    ];

    // Constellation connecting lines
    const lines: ConstellationLine[] = [
      // 북두칠성 연결
      { fromIndex: 0, toIndex: 1 },
      { fromIndex: 1, toIndex: 2 },
      { fromIndex: 2, toIndex: 3 },
      { fromIndex: 3, toIndex: 0 },
      { fromIndex: 3, toIndex: 4 },
      { fromIndex: 4, toIndex: 5 },
      { fromIndex: 5, toIndex: 6 },
      // 북극성을 가리키는 지극선 (천선 -> 천추 -> 북극성)
      { fromIndex: 0, toIndex: 7 },

      // 삼태성 연결
      { fromIndex: 8, toIndex: 9 },
      { fromIndex: 9, toIndex: 10 },

      // 카시오페이아 연결
      { fromIndex: 13, toIndex: 14 },
      { fromIndex: 14, toIndex: 15 },
      { fromIndex: 15, toIndex: 16 },
      { fromIndex: 16, toIndex: 17 },

      // 남두육성 연결
      { fromIndex: 18, toIndex: 19 },
      { fromIndex: 19, toIndex: 20 },
      { fromIndex: 20, toIndex: 21 },
      { fromIndex: 21, toIndex: 22 },
      { fromIndex: 22, toIndex: 23 },
    ];

    // Generate 75 Ambient Pearl / Gem Stars for the subterranean ceiling
    const fieldStars: Star[] = [];
    // Seeded random for consistent celestial field
    let seed = 42;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < 75; i++) {
      const sx = Math.round(rnd() * 660 + 20);
      // Ceiling dome upper area: y between 15 and 265
      const sy = Math.round(rnd() * 250 + 15);
      fieldStars.push({
        x: sx,
        y: sy,
        size: rnd() > 0.8 ? 2.2 : rnd() > 0.4 ? 1.6 : 1.1,
        baseAlpha: 0.35 + rnd() * 0.45,
        amp: 0.2 + rnd() * 0.35,
        speed: 0.5 + rnd() * 0.9, // Gentle, slow twinkle
        phase: rnd() * Math.PI * 2,
        color: i % 4 === 0 ? '#fef9c3' : i % 4 === 1 ? '#e0f2fe' : i % 4 === 2 ? '#fae8ff' : '#ffffff',
        glowColor: i % 2 === 0 ? '#facc15' : '#38bdf8',
        isMajor: false,
      });
    }

    let animId: number;
    let time = 0;

    const render = () => {
      if (isPlaying) {
        time += 0.02 * speedMultiplier;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // ==================== 1. CEILING VAULTED SKY DOME BACKGROUND ====================
      // Deep midnight indigo sky dome with subtle cosmic purple depth
      const skyGrad = ctx.createRadialGradient(w / 2, 70, 40, w / 2, 180, 460);
      skyGrad.addColorStop(0, '#0a0d24'); // Zenith deep cosmic navy
      skyGrad.addColorStop(0.4, '#0e1132');
      skyGrad.addColorStop(0.75, '#161942');
      skyGrad.addColorStop(1, '#090b1c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Celestial Arch Guidelines (천문도 천장 돔 괘선)
      ctx.save();
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.18)'; // Ancient imperial gold faint lines
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);

      // Inner Equator Arch & Ecliptic Oval
      ctx.beginPath();
      ctx.ellipse(w / 2, 140, 290, 115, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(w / 2, 140, 190, 75, -0.15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();

      // ==================== 2. MILKY WAY / CELESTIAL RIVER (은하수 / 천하) ====================
      // A soft, glowing diagonal band of cosmic pearl dust
      ctx.save();
      const milkyGrad = ctx.createLinearGradient(480, 0, 620, 280);
      milkyGrad.addColorStop(0, 'rgba(168, 85, 247, 0.04)');
      milkyGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.13)');
      milkyGrad.addColorStop(1, 'rgba(234, 179, 8, 0.05)');
      ctx.fillStyle = milkyGrad;
      ctx.beginPath();
      ctx.moveTo(430, 0);
      ctx.bezierCurveTo(470, 90, 520, 160, 580, 270);
      ctx.lineTo(650, 270);
      ctx.bezierCurveTo(590, 160, 550, 80, 510, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ==================== 3. SUN & MOON (해와 달 보석 모형) ====================
      // Golden Sun disc on east side (좌측 상단)
      const sunPulse = 1 + Math.sin(time * 0.8) * 0.06;
      const sunGrad = ctx.createRadialGradient(85, 60, 2, 85, 60, 24 * sunPulse);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.2, '#fef08a');
      sunGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.45)');
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(85, 60, 24 * sunPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(85, 60, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(85, 60, 3, 0, Math.PI * 2);
      ctx.fill();

      if (showLabels) {
        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(253, 224, 71, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText('일(日)·황금 태양', 85, 82);
      }

      // Jade Crescent Moon on west side (우측 상단)
      const moonGlow = 1 + Math.cos(time * 0.9) * 0.08;
      const moonGrad = ctx.createRadialGradient(620, 55, 3, 620, 55, 22 * moonGlow);
      moonGrad.addColorStop(0, 'rgba(240, 253, 250, 0.9)');
      moonGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.35)');
      moonGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(620, 55, 22 * moonGlow, 0, Math.PI * 2);
      ctx.fill();

      // Crescent Moon shape
      ctx.save();
      ctx.fillStyle = '#ccfbf1';
      ctx.beginPath();
      ctx.arc(620, 55, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f1430'; // Shadow cut to form crescent
      ctx.beginPath();
      ctx.arc(616, 53, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (showLabels) {
        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(153, 246, 228, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText('월(月)·비취 초승달', 620, 78);
      }

      // ==================== 4. CONSTELLATION LINES (황금 별자리 연결선) ====================
      if (showLines) {
        ctx.save();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.42)'; // Luminous golden thread
        lines.forEach((line) => {
          const p1 = majorStars[line.fromIndex];
          const p2 = majorStars[line.toIndex];
          if (!p1 || !p2) return;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });
        ctx.restore();
      }

      // ==================== 5. FIELD STARS (배경 반짝이는 별들) ====================
      fieldStars.forEach((star) => {
        // Slow organic sinusoidal twinkling
        const currentAlpha = Math.max(
          0.12,
          Math.min(1.0, star.baseAlpha + star.amp * Math.sin(time * star.speed + star.phase))
        );

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = star.color;

        // Faint radial bloom for slightly larger stars
        if (star.size > 1.8 && currentAlpha > 0.6) {
          const glowRadius = star.size * 3.5;
          const starGlow = ctx.createRadialGradient(
            star.x,
            star.y,
            0.5,
            star.x,
            star.y,
            glowRadius
          );
          starGlow.addColorStop(0, star.glowColor);
          starGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = starGlow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = star.color;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ==================== 6. MAJOR STARS & POLARIS (주요 성좌 및 북극성) ====================
      majorStars.forEach((star) => {
        const currentAlpha = Math.max(
          0.2,
          Math.min(1.0, star.baseAlpha + star.amp * Math.sin(time * star.speed + star.phase))
        );

        ctx.save();

        // Radiating 4-pointed diamond sparkle flare on peak twinkling
        if (currentAlpha > 0.65) {
          const flareLen = (star.size * 4 + 4) * (currentAlpha - 0.4);
          ctx.strokeStyle = star.glowColor;
          ctx.globalAlpha = (currentAlpha - 0.4) * 0.7;
          ctx.lineWidth = 1;

          // Cross lens flare
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y);
          ctx.lineTo(star.x + flareLen, star.y);
          ctx.moveTo(star.x, star.y - flareLen);
          ctx.lineTo(star.x, star.y + flareLen);
          ctx.stroke();

          // Outer halo
          const haloGrad = ctx.createRadialGradient(
            star.x,
            star.y,
            1,
            star.x,
            star.y,
            star.size * 4
          );
          haloGrad.addColorStop(0, star.glowColor);
          haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main Star Core
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Inner white diamond heart
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(star.x - 1, star.y - 1, 2, 2);

        // Star Label
        if (showLabels && star.label) {
          ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = currentAlpha > 0.5 ? 'rgba(254, 240, 138, 0.95)' : 'rgba(203, 213, 225, 0.7)';
          ctx.textAlign = 'left';
          ctx.fillText(star.label, star.x + star.size + 4, star.y + 3);
        }

        ctx.restore();
      });

      // ==================== 7. INTERACTIVE STARDUST PARTICLES NEAR MOUSE ====================
      if (mousePosRef.current) {
        const mx = mousePosRef.current.x;
        const my = mousePosRef.current.y;
        if (my < 290) {
          ctx.save();
          for (let p = 0; p < 5; p++) {
            const angle = time * 4 + p * 1.25;
            const px = mx + Math.cos(angle) * (14 + p * 3);
            const py = my + Math.sin(angle) * (14 + p * 3);
            ctx.fillStyle = p % 2 === 0 ? '#facc15' : '#38bdf8';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(px, py, 2, 2);
          }
          ctx.restore();
        }
      }

      // ==================== 8. UNDERGROUND PALACE ARCHITECTURE & MERCURY RIVERS ====================
      // Subterranean horizon divider & palace silhouette
      const horizonY = 278;

      // Heavy Ancient Bronze Columns & Eaves Silhouette framing the ceiling
      ctx.save();
      ctx.fillStyle = '#060814'; // Dark subterranean stone silhouette

      // Left Column
      ctx.fillRect(0, 0, 18, h);
      ctx.fillRect(18, 0, 12, h);
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1;
      ctx.strokeRect(18, 0, 12, h);

      // Right Column
      ctx.fillRect(w - 30, 0, 12, h);
      ctx.fillRect(w - 18, 0, 18, h);
      ctx.strokeRect(w - 30, 0, 12, h);

      // Vaulted Ceiling Eaves Arch (Top Left & Top Right)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(140, 0);
      ctx.bezierCurveTo(90, 15, 40, 30, 0, 50);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w - 140, 0);
      ctx.bezierCurveTo(w - 90, 15, w - 40, 30, w, 50);
      ctx.closePath();
      ctx.fill();

      // Palace Pavilion Silhouettes in Middle Distance
      ctx.fillStyle = '#090c1f';
      // Center Imperial Throne Hall roof ridge
      ctx.beginPath();
      ctx.moveTo(w / 2 - 90, horizonY);
      ctx.lineTo(w / 2 - 60, horizonY - 26);
      ctx.lineTo(w / 2 + 60, horizonY - 26);
      ctx.lineTo(w / 2 + 90, horizonY);
      ctx.closePath();
      ctx.fill();

      // Winged pavilions left & right
      ctx.beginPath();
      ctx.moveTo(110, horizonY);
      ctx.lineTo(140, horizonY - 18);
      ctx.lineTo(200, horizonY - 18);
      ctx.lineTo(225, horizonY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w - 225, horizonY);
      ctx.lineTo(w - 200, horizonY - 18);
      ctx.lineTo(w - 140, horizonY - 18);
      ctx.lineTo(w - 110, horizonY);
      ctx.closePath();
      ctx.fill();

      // ==================== 9. MERCURY RIVER (수은 백천강하) AT FLOOR ====================
      // Subterranean floor base
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      floorGrad.addColorStop(0, '#0c0e22');
      floorGrad.addColorStop(1, '#050713');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Shimmering Liquid Mercury River (수은 강)
      const riverGrad = ctx.createLinearGradient(0, horizonY + 8, 0, h);
      riverGrad.addColorStop(0, '#334155');
      riverGrad.addColorStop(0.3, '#94a3b8'); // Liquid mercury silver
      riverGrad.addColorStop(0.7, '#cbd5e1'); // Bright metallic sheen
      riverGrad.addColorStop(1, '#475569');

      // Mercury Riverbed Stream
      ctx.beginPath();
      ctx.moveTo(80, horizonY + 5);
      ctx.bezierCurveTo(180, horizonY + 20, 260, horizonY + 12, w / 2 - 40, horizonY + 18);
      ctx.bezierCurveTo(460, horizonY + 24, 540, horizonY + 14, w - 80, horizonY + 5);
      ctx.lineTo(w - 50, h);
      ctx.lineTo(50, h);
      ctx.closePath();
      ctx.fillStyle = riverGrad;
      ctx.fill();

      // Dynamic Shimmering Mercury Liquid Ripples & Reflected Constellations
      for (let r = 0; r < 9; r++) {
        const ry = horizonY + 22 + r * 14;
        const waveOffset = Math.sin(time * 2.2 + r * 0.9) * 28;
        const rx = w / 2 - 190 + waveOffset;
        const rLen = 220 + Math.cos(time * 1.8 + r) * 70;

        ctx.fillStyle = r % 2 === 0 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(250, 204, 21, 0.35)';
        ctx.fillRect(rx, ry, rLen, 2.5);

        // Mirror reflections of primary stars floating on mercury surface
        if (r === 2 || r === 5) {
          const sparkX = w / 2 + Math.sin(time * 1.5 + r) * 60;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sparkX, ry - 1, 4, 4);
        }
      }

      // Subterranean mist / mercury vapor drift along river banks
      ctx.fillStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.fillRect(0, horizonY - 4, w, 22);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, showLines, showLabels, speedMultiplier]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mousePosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = null;
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border-2 border-amber-500/40 shadow-2xl flex flex-col items-center">
      {/* Top Banner Badge */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-950 via-purple-950/80 to-slate-950 border-b border-purple-500/30 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>진시황릉 지하궁전 천문도 복원도 (움직이는 사진)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="hidden sm:inline">사마천 사기(史記) 고증: “상구천문(上具天文), 하구지리(下具地理)”</span>
        </div>
      </div>

      {/* Main Animated Canvas (700x440) */}
      <div className="relative w-full aspect-[700/440] max-h-[460px] bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={700}
          height={440}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full object-contain block cursor-crosshair select-none"
        />

        {/* Live Status Watermark */}
        <div className="absolute top-3 left-4 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-amber-400/30 text-[11px] text-amber-300 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>천장 별자리 보석 반짝임 활성화</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {/* Play / Pause Animation */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-purple-900/40 text-purple-200 border-purple-500/50 hover:bg-purple-900/70'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>반짝임 일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>반짝임 재생</span>
              </>
            )}
          </button>

          {/* Toggle Constellation Lines */}
          <button
            type="button"
            onClick={() => setShowLines((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
              showLines
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>별자리 선 {showLines ? '표시 중' : '숨김'}</span>
          </button>

          {/* Toggle Constellation Labels */}
          <button
            type="button"
            onClick={() => setShowLabels((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
              showLabels
                ? 'bg-sky-950/50 text-sky-300 border-sky-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {showLabels ? (
              <>
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>명칭 표시 중</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>명칭 숨김</span>
              </>
            )}
          </button>
        </div>

        {/* Twinkle Speed Selection */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1">별 반짝임 속도:</span>
          {(
            [
              { label: '천천히 (권장)', val: 0.65 },
              { label: '보통', val: 1.0 },
              { label: '빠르게', val: 1.8 },
            ] as const
          ).map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setSpeedMultiplier(item.val)}
              className={`px-2 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                speedMultiplier === item.val
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
