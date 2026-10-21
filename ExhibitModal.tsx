import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Image as ImageIcon,
  FileText,
  Film,
  Edit3,
  Check,
  Play,
  Pause,
  Upload,
} from 'lucide-react';
import { ExhibitItem, ExhibitType, VideoPresetId } from './metaverse';
import { ROOM_CONFIGS } from './exhibitionData';
import { QinCeilingConstellationCanvas } from './QinCeilingConstellationCanvas';

interface ExhibitModalProps {
  exhibit: ExhibitItem | null;
  onClose: () => void;
  onUpdateExhibit: (updated: ExhibitItem) => void;
  startInEditMode?: boolean;
  isFromCatalog?: boolean;
  isAdmin?: boolean;
}

export const ExhibitModal: React.FC<ExhibitModalProps> = ({
  exhibit,
  onClose,
  onUpdateExhibit,
  startInEditMode = false,
  isFromCatalog = false,
  isAdmin = false,
}) => {
  const [isEditing, setIsEditing] = useState(isAdmin && startInEditMode);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Edit form states
  const [editType, setEditType] = useState<ExhibitType>('image');
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLeadQuote, setEditLeadQuote] = useState('');
  const [editBodyText, setEditBodyText] = useState('');
  const [editCuratorNote, setEditCuratorNote] = useState('');
  const [editVideoPreset, setEditVideoPreset] =
    useState<VideoPresetId>('cosmos_wave');
  const [editCustomVideoUrl, setEditCustomVideoUrl] = useState('');

  const videoCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (exhibit) {
      setIsEditing(isAdmin ? startInEditMode : false);
      setIsPlayingVideo(true);
      setImgError(false);
      setEditType(exhibit.type);
      setEditTitle(exhibit.title);
      setEditSubtitle(exhibit.subtitle);
      setEditArtist(exhibit.artist);
      setEditDescription(exhibit.description);
      setEditImageUrl(exhibit.imageUrl || '');
      setEditLeadQuote(
        exhibit.textContent?.leadQuote ||
          '“디지털 공간 위에 세워진 새로운 예술적 사유의 기록”'
      );
      setEditBodyText(
        exhibit.textContent?.paragraphs.join('\n\n') || exhibit.description
      );
      setEditCuratorNote(
        exhibit.textContent?.curatorNote ||
          '큐레이터 노트: 자유롭게 텍스트를 수정하여 전시할 수 있습니다.'
      );
      setEditVideoPreset(exhibit.videoPreset || 'cosmos_wave');
      setEditCustomVideoUrl(exhibit.customVideoUrl || '');
    }
  }, [exhibit, startInEditMode, isAdmin]);

  // Procedural Pixel Art Video Player Canvas for Video Exhibits
  useEffect(() => {
    if (!exhibit || exhibit.type !== 'video' || isEditing) return;
    if (exhibit.customVideoUrl) return;

    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const renderVideoFrame = () => {
      if (isPlayingVideo) {
        time += 0.025;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.imageSmoothingEnabled = false;

      const preset = exhibit.videoPreset || 'cosmos_wave';

      if (preset === 'cosmos_wave') {
        // ==================== 1. 장력 738kg 자동발사 노궁(弩弓) 메커니즘 (Room 1) ====================
        // Subterranean stone crypt chamber
        ctx.fillStyle = '#0f1118';
        ctx.fillRect(0, 0, w, h);

        // Stone chamber flagstone floor
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, h - 55, w, 55);
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 1.5;
        for (let bx = 0; bx < w; bx += 48) {
          ctx.strokeRect(bx, h - 55, 48, 28);
          ctx.strokeRect(bx + 24, h - 27, 48, 27);
        }

        // Flickering torch sconce on the back wall
        const torchFlicker = Math.sin(time * 14) * 3 + Math.cos(time * 23) * 2;
        const torchGrad = ctx.createRadialGradient(50, 60, 2, 50, 60, 55 + torchFlicker);
        torchGrad.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
        torchGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.15)');
        torchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = torchGrad;
        ctx.fillRect(0, 0, 130, 140);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(47, 65, 6, 18);
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(50, 60 + torchFlicker * 0.4, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(50, 58 + torchFlicker * 0.3, 4, 0, Math.PI * 2);
        ctx.fill();

        // 4-phase Crossbow firing cycle
        const cycle = (time * 1.3) % 4.0;
        const isCocking = cycle < 1.4;
        const isTriggered = cycle >= 1.4 && cycle < 1.7;
        const isFiring = cycle >= 1.7 && cycle < 2.9;
        const isReloading = cycle >= 2.9;

        // Intruder Floor Pressure Plate (바닥 함정 발판)
        const platePressed = isTriggered || isFiring;
        const plateY = h - 55 + (platePressed ? 5 : 0);
        ctx.fillStyle = platePressed ? '#dc2626' : '#b45309';
        ctx.fillRect(180, plateY, 85, 10);
        ctx.strokeStyle = platePressed ? '#f87171' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(180, plateY, 85, 10);

        if (platePressed) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fillRect(170, h - 65, 105, 20);
        }

        // Heavy Stone Platform for Crossbow
        ctx.fillStyle = '#334155';
        ctx.fillRect(35, h - 130, 80, 75);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(35, h - 130, 80, 75);

        // Bronze Mechanical Crossbow Stock & Winch
        const bowOriginX = 75;
        const bowOriginY = h - 135;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bowOriginX - 10, bowOriginY - 8, 90, 16);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(bowOriginX + 15, bowOriginY - 14, 25, 28); // Bronze trigger housing (노기 弩機)

        // Heavy Bow Arms (강궁 날개) flexing under 738kg tension
        const flexOffset = isCocking ? (cycle / 1.4) * 14 : isTriggered ? 14 : 0;
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(bowOriginX + 60, bowOriginY - 45 + flexOffset);
        ctx.quadraticCurveTo(bowOriginX + 70, bowOriginY, bowOriginX + 60, bowOriginY + 45 - flexOffset);
        ctx.stroke();

        // Bowstring (현 弦)
        ctx.strokeStyle = isFiring ? '#fde047' : '#cbd5e1';
        ctx.lineWidth = 2;
        const stringNockX = isCocking ? bowOriginX + 60 - flexOffset * 2.2 : isFiring ? bowOriginX + 68 : bowOriginX + 25;
        ctx.beginPath();
        ctx.moveTo(bowOriginX + 60, bowOriginY - 45 + flexOffset);
        ctx.lineTo(stringNockX, bowOriginY);
        ctx.lineTo(bowOriginX + 60, bowOriginY + 45 - flexOffset);
        ctx.stroke();

        // 3 Consecutive Rapid Flying Iron Crossbow Bolts (연발 쇠화살)
        if (isFiring) {
          const fireElapsed = cycle - 1.7; // 0.0 ~ 1.2
          for (let arrowIdx = 0; arrowIdx < 3; arrowIdx++) {
            const arrowDelay = arrowIdx * 0.32;
            const arrowTime = fireElapsed - arrowDelay;
            if (arrowTime > 0 && arrowTime < 0.65) {
              const arrowProgress = arrowTime / 0.65;
              const arrowX = bowOriginX + 70 + arrowProgress * (w - 140);
              const arrowY = bowOriginY - 4 + (arrowIdx - 1) * 7;

              // White-hot kinetic motion blur trail
              ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(arrowX - 45, arrowY);
              ctx.lineTo(arrowX, arrowY);
              ctx.stroke();

              // Heavy Iron Bolt Head & Shaft
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(arrowX - 22, arrowY - 2, 22, 4);
              ctx.fillStyle = '#ffffff'; // White-hot pointed tip
              ctx.beginPath();
              ctx.moveTo(arrowX + 6, arrowY);
              ctx.lineTo(arrowX - 4, arrowY - 4);
              ctx.lineTo(arrowX - 4, arrowY + 4);
              ctx.closePath();
              ctx.fill();

              // Muzzle flash at bow
              if (arrowTime < 0.1) {
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(bowOriginX + 75, bowOriginY, 18, 0, Math.PI * 2);
                ctx.fill();
              }

              // Stone wall impact sparks on right side
              if (arrowProgress > 0.88) {
                for (let sp = 0; sp < 6; sp++) {
                  const spx = w - 45 + Math.cos(sp + time * 10) * 16;
                  const spy = arrowY + Math.sin(sp + time * 10) * 16;
                  ctx.fillStyle = sp % 2 === 0 ? '#facc15' : '#ef4444';
                  ctx.fillRect(spx, spy, 3, 3);
                }
              }
            }
          }
        }

        // Right side stone target / corridor depth
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w - 40, 25, 40, h - 80);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(w - 40, 25, 40, h - 80);

        // Target impact marks
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w - 38, bowOriginY - 12, 14, 24);

        // HUD Telemetry Overlays
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(0, 0, w, 28);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, 28);

        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#f3e8ff';
        ctx.textAlign = 'left';
        ctx.fillText('⚡ 고대 자동 방어장치: 진대(秦代) 청동 연노(連弩) 메커니즘 시뮬레이션', 14, 18);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, h - 26, w, 26);
        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = isFiring ? '#ef4444' : isTriggered ? '#f59e0b' : '#34d399';
        const tensionVal = isFiring ? '738 kgf [연사 중]' : isCocking ? `${Math.round(400 + (cycle / 1.4) * 338)} kgf [인장 중]` : '738 kgf [발사 대기]';
        ctx.fillText(`장력: ${tensionVal} | 상태: ${isFiring ? '침입 감지 화살 연속 발사 (FIRING)' : isTriggered ? '발판 압력 감지 (TRIGGERED)' : '함정 기계장치 가동 대기'}`, 14, h - 8);

      } else if (preset === 'botanical_wind') {
        // ==================== 2. 토목 축조 현장의 일상 모션 (판축 版築 공법) (Room 2) ====================
        // Dusty Qin era construction site
        const dustGrad = ctx.createLinearGradient(0, 0, 0, h);
        dustGrad.addColorStop(0, '#fed7aa'); // Pale sunny dusty sky
        dustGrad.addColorStop(0.4, '#fde68a');
        dustGrad.addColorStop(1, '#d97706'); // Earthen ground
        ctx.fillStyle = dustGrad;
        ctx.fillRect(0, 0, w, h);

        // Distant hills and earthworks
        ctx.fillStyle = 'rgba(180, 83, 9, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, 110);
        ctx.bezierCurveTo(120, 80, 280, 130, w, 95);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // Wooden Formwork Frame (판축 목재 거푸집)
        const frameLeft = 140;
        const frameRight = 420;
        const frameWidth = frameRight - frameLeft;
        const frameTop = 60;
        const frameBottom = h - 35;

        // Ground earthen base
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, frameBottom, w, 35);

        // Formwork interior: Compacted Loess Layers (켜켜이 쌓인 판축 단층선)
        const numLayers = 5;
        const layerColors = ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b'];
        const layerH = (frameBottom - frameTop - 25) / numLayers;

        for (let i = 0; i < numLayers; i++) {
          const ly = frameBottom - (i + 1) * layerH;
          ctx.fillStyle = layerColors[i % layerColors.length];
          ctx.fillRect(frameLeft + 12, ly, frameWidth - 24, layerH);

          // Sediment compaction gravel and lines
          ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(frameLeft + 14, ly + layerH / 2);
          ctx.lineTo(frameRight - 14, ly + layerH / 2);
          ctx.stroke();

          // Embedded stones / gravel pebbles
          for (let g = 0; g < 7; g++) {
            const gx = frameLeft + 25 + g * 36 + ((i * 17) % 24);
            const gy = ly + 4 + ((g * 11) % Math.max(4, Math.floor(layerH - 8)));
            ctx.fillStyle = g % 2 === 0 ? '#451a03' : '#cbd5e1';
            ctx.fillRect(gx, gy, 4, 3);
          }
        }

        // Top fresh loose earth layer being compacted
        const workSurfaceY = frameBottom - numLayers * layerH;
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(frameLeft + 12, workSurfaceY - 6, frameWidth - 24, 8);

        // Heavy Wooden Uprights (수직 지주목) & Horizontal retaining boards (판목)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(frameLeft, frameTop - 20, 12, frameBottom - frameTop + 30);
        ctx.fillRect(frameRight - 12, frameTop - 20, 12, frameBottom - frameTop + 30);

        // Horizontal Wooden Form Planks
        for (let py = frameTop; py < frameBottom; py += 28) {
          ctx.fillStyle = '#92400e';
          ctx.fillRect(frameLeft - 6, py, 14, 22);
          ctx.fillRect(frameRight - 8, py, 14, 22);
          // Binding ropes
          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 2;
          ctx.strokeRect(frameLeft - 6, py, 14, 22);
          ctx.strokeRect(frameRight - 8, py, 14, 22);
        }

        // Two Qin Laborers stamping with wooden rammers (절굿공이 / 달구)
        // Laborer 1 on left side of frame
        const rammer1Cycle = Math.sin(time * 6);
        const r1ArmY = workSurfaceY - 55 + rammer1Cycle * 22;
        const r1Impact = rammer1Cycle > 0.85;

        // Laborer 1 sprite
        const l1X = frameLeft + 70;
        ctx.fillStyle = '#fed7aa'; // Skin
        ctx.fillRect(l1X - 6, workSurfaceY - 72, 12, 12); // Head
        ctx.fillStyle = '#451a03';
        ctx.fillRect(l1X - 7, workSurfaceY - 76, 14, 6); // Topknot hair
        ctx.fillStyle = '#b45309'; // Tunic
        ctx.fillRect(l1X - 8, workSurfaceY - 60, 16, 24);
        ctx.fillStyle = '#78350f'; // Pants
        ctx.fillRect(l1X - 7, workSurfaceY - 36, 6, 16);
        ctx.fillRect(l1X + 1, workSurfaceY - 36, 6, 16);

        // Heavy Wooden Rammer 1
        ctx.fillStyle = '#78350f';
        ctx.fillRect(l1X + 14, r1ArmY, 6, 48); // Long handle
        ctx.fillStyle = '#451a03';
        ctx.fillRect(l1X + 10, r1ArmY + 44, 14, 12); // Heavy iron/wood stamping block

        // Laborer 2 on right side of frame (alternating rhythm)
        const rammer2Cycle = Math.sin(time * 6 + Math.PI);
        const r2ArmY = workSurfaceY - 55 + rammer2Cycle * 22;
        const r2Impact = rammer2Cycle > 0.85;

        const l2X = frameRight - 90;
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(l2X - 6, workSurfaceY - 72, 12, 12);
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(l2X - 7, workSurfaceY - 76, 14, 6);
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(l2X - 8, workSurfaceY - 60, 16, 24);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(l2X - 7, workSurfaceY - 36, 6, 16);
        ctx.fillRect(l2X + 1, workSurfaceY - 36, 6, 16);

        // Heavy Wooden Rammer 2
        ctx.fillStyle = '#78350f';
        ctx.fillRect(l2X - 20, r2ArmY, 6, 48);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(l2X - 24, r2ArmY + 44, 14, 12);

        // Dynamic Dust Puffs and Impact Kinetic Waves on Earth
        if (r1Impact) {
          ctx.fillStyle = 'rgba(253, 230, 138, 0.75)';
          ctx.beginPath();
          ctx.arc(l1X + 17, workSurfaceY, 14, 0, Math.PI * 2);
          ctx.fill();
        }
        if (r2Impact) {
          ctx.fillStyle = 'rgba(253, 230, 138, 0.75)';
          ctx.beginPath();
          ctx.arc(l2X - 17, workSurfaceY, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Soil dust particles drifting across the construction site
        for (let d = 0; d < 22; d++) {
          const dx = ((d * 37 + time * 45) % w);
          const dy = workSurfaceY - 40 + Math.sin(time * 3 + d) * 35;
          ctx.fillStyle = d % 2 === 0 ? 'rgba(254, 243, 199, 0.65)' : 'rgba(217, 119, 6, 0.45)';
          ctx.fillRect(dx, dy, 3, 3);
        }

        // HUD Telemetry Overlays
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(0, 0, w, 28);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, 28);

        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'left';
        ctx.fillText('🏛 진대(秦代) 토목 판축(版築) 공법 고증 시뮬레이션', 14, 18);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, h - 26, w, 26);
        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fde68a';
        ctx.fillText('공정: 판목 거푸집 내 황토 충진 → 달구·절굿공이 고압 다짐 → 켜켜이 압축 단층 형성', 14, h - 8);

      } else if (preset === 'cyber_matrix') {
        // ==================== 3. 3D 정밀 스캔 기반 병마용 파편 재조합 (Room 3) ====================
        // Modern Digital Conservation 3D Lab
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, w, h);

        // 3D Isometric Coordinate Grid Floor
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.22)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Moving 3D Laser Scan Line (녹색 / 청록색 정밀 라이다 레이저)
        const scanY = 40 + ((Math.sin(time * 2.2) + 1) / 2) * (h - 90);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, scanY);
        ctx.lineTo(w - 20, scanY);
        ctx.stroke();

        // Laser scan plane glow
        const laserGrad = ctx.createLinearGradient(0, scanY - 18, 0, scanY + 18);
        laserGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        laserGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.28)');
        laserGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = laserGrad;
        ctx.fillRect(20, scanY - 18, w - 40, 36);

        // Terracotta Fragment Assembly Cycle (4.5s loop)
        const tCycle = (time * 0.9) % 5.0;
        const assembleProgress = tCycle < 2.2 ? Math.min(1.0, tCycle / 1.8) : tCycle > 4.2 ? Math.max(0, 1.0 - (tCycle - 4.2) / 0.8) : 1.0;
        const isFullyAssembled = assembleProgress > 0.95;

        // Center coordinates for warrior
        const cx = w / 2;
        const cy = h / 2 + 10;

        // Exploded / Reassembled Ceramic Fragments
        // Fragment 1: Head & Topknot
        const headOffset = (1 - assembleProgress) * 45;
        const headY = cy - 75 - headOffset;
        ctx.fillStyle = '#b45309'; // Terracotta clay
        ctx.fillRect(cx - 10, headY, 20, 24);
        ctx.fillStyle = '#78350f'; // Topknot
        ctx.fillRect(cx - 5, headY - 8, 10, 8);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 10, headY, 20, 24);

        // Fragment 2: Upper Armor Torso
        const chestOffset = (1 - assembleProgress) * -28;
        const chestX = cx + chestOffset;
        ctx.fillStyle = '#92400e';
        ctx.fillRect(chestX - 22, cy - 48, 44, 40);
        // Armor scale details
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            ctx.fillStyle = isFullyAssembled && (r + c) % 2 === 0 ? '#7c3aed' : '#78350f'; // Pigment reconstruction overlay
            ctx.fillRect(chestX - 18 + c * 9, cy - 44 + r * 10, 7, 7);
          }
        }
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(chestX - 22, cy - 48, 44, 40);

        // Fragment 3: Left Arm
        const armLeftOffset = (1 - assembleProgress) * -42;
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx - 38 + armLeftOffset, cy - 44, 14, 38);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(cx - 38 + armLeftOffset, cy - 44, 14, 38);

        // Fragment 4: Right Arm & Hands
        const armRightOffset = (1 - assembleProgress) * 42;
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx + 24 + armRightOffset, cy - 44, 14, 38);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(cx + 24 + armRightOffset, cy - 44, 14, 38);

        // Fragment 5: Lower Robe & Legs
        const legOffset = (1 - assembleProgress) * 35;
        const legY = cy - 6 + legOffset;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 20, legY, 40, 48);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(cx - 16, legY + 48, 12, 16); // Left boot
        ctx.fillRect(cx + 4, legY + 48, 12, 16); // Right boot
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(cx - 20, legY, 40, 48);

        // 3D Point Cloud Particles around warrior
        for (let pt = 0; pt < 40; pt++) {
          const ptx = cx + Math.sin(pt * 1.7 + time) * (65 - assembleProgress * 25);
          const pty = cy - 60 + (pt * 3.4);
          ctx.fillStyle = pt % 3 === 0 ? '#10b981' : '#38bdf8';
          ctx.fillRect(ptx, pty, 2, 2);
        }

        // Bounding Boxes & Matching Lines during assembly
        if (!isFullyAssembled) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(cx - 38 + armLeftOffset, cy - 25);
          ctx.lineTo(chestX - 22, cy - 25);
          ctx.moveTo(cx + 24 + armRightOffset, cy - 25);
          ctx.lineTo(chestX + 22, cy - 25);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // HUD Telemetry Overlays
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(0, 0, w, 28);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, 28);

        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#e0f2fe';
        ctx.textAlign = 'left';
        ctx.fillText('🔬 현대 디지털 보존과학: 병마용 3D 비파괴 라이다 스캔 & 파편 가상 정합', 14, 18);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, h - 26, w, 26);
        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = isFullyAssembled ? '#34d399' : '#38bdf8';
        const matchPercent = Math.round(72 + assembleProgress * 27.8);
        ctx.fillText(`스캔 분해능: 0.05 mm | 파편 정합률: ${matchPercent}% | ${isFullyAssembled ? '정합 완료: 보라색·주사(朱砂) 안료 흔적 복원' : '파편 접합면 3D 좌표 벡터 분석 중...'}`, 14, h - 8);

      } else {
        // ==================== 4. 인공위성 고해상도 궤도 관측 레이더 (Room 4) ====================
        // Dual-View Satellite Remote Sensing Display
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);

        const splitX = Math.round(w * 0.45);

        // ---------- LEFT PANEL: Low Earth Orbit (LEO Space View) ----------
        // Deep space background with distant stars
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 28, splitX, h - 54);

        for (let s = 0; s < 25; s++) {
          const sx = (s * 43) % splitX;
          const sy = 32 + ((s * 29) % (h - 70));
          ctx.fillStyle = s % 2 === 0 ? '#f8fafc' : '#94a3b8';
          ctx.fillRect(sx, sy, 2, 2);
        }

        // Curved Blue Earth Horizon from 400km Orbit
        const earthGrad = ctx.createRadialGradient(splitX / 2, h + 90, 80, splitX / 2, h + 90, 240);
        earthGrad.addColorStop(0, '#1e3a8a');
        earthGrad.addColorStop(0.7, '#0284c7');
        earthGrad.addColorStop(0.92, '#38bdf8'); // Glowing blue atmosphere thin line
        earthGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = earthGrad;
        ctx.beginPath();
        ctx.arc(splitX / 2, h + 90, 240, Math.PI, 0, false);
        ctx.fill();

        // High-Tech Earth Observation Satellite in Orbit
        const satX = 35 + ((time * 24) % (splitX - 70));
        const satY = 75 + Math.sin(time * 1.5) * 6;

        // Satellite Body
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(satX - 6, satY - 6, 12, 12);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.strokeRect(satX - 6, satY - 6, 12, 12);

        // Blue Solar Panels left & right
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(satX - 22, satY - 4, 14, 8);
        ctx.fillRect(satX + 8, satY - 4, 14, 8);
        ctx.strokeStyle = '#60a5fa';
        ctx.strokeRect(satX - 22, satY - 4, 14, 8);
        ctx.strokeRect(satX + 8, satY - 4, 14, 8);

        // SAR Radar Conical Microwave Beam Pulse sweeping Earth
        const pulse = (time * 2) % 1.0;
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.7 - pulse * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(satX, satY + 6);
        ctx.lineTo(satX - 45 - pulse * 30, h - 35);
        ctx.lineTo(satX + 45 + pulse * 30, h - 35);
        ctx.closePath();
        ctx.stroke();

        ctx.font = '600 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('SAR 관측위성 (고도 420km)', splitX / 2, 45);

        // Divider
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(splitX, 28);
        ctx.lineTo(splitX, h - 26);
        ctx.stroke();

        // ---------- RIGHT PANEL: Orbital Radar Terrain Sensor View ----------
        // Mountain ridges of northern China seen from orbital sensor
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(splitX, 28, w - splitX, h - 54);

        // Jagged mountain ridges and deep shadowed valleys
        const terrainY = 80;
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(splitX, h - 54);
        for (let tx = splitX; tx <= w; tx += 20) {
          const mHeight = Math.sin((tx - splitX) * 0.05) * 45 + Math.cos((tx - splitX) * 0.12) * 20;
          ctx.lineTo(tx, terrainY + 70 + mHeight);
        }
        ctx.lineTo(w, h - 54);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(splitX, h - 54);
        for (let tx = splitX; tx <= w; tx += 24) {
          const mHeight = Math.cos((tx - splitX) * 0.07) * 35 + Math.sin((tx - splitX) * 0.03) * 15;
          ctx.lineTo(tx, terrainY + 110 + mHeight);
        }
        ctx.lineTo(w, h - 54);
        ctx.closePath();
        ctx.fill();

        // Sweeping Radar Line across terrain
        const radarSweepX = splitX + 15 + ((time * 65) % (w - splitX - 30));
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(radarSweepX, 35);
        ctx.lineTo(radarSweepX, h - 35);
        ctx.stroke();

        // Great Wall (폭 불과 몇 미터) on the ridge
        // Optical visibility test: Great Wall is physically narrower than 1 optical pixel!
        // SAR radar synthetically detects dielectric roughness:
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Winding wall path along ridge
        for (let wx = splitX + 20; wx < w - 20; wx += 14) {
          const wy = terrainY + 80 + Math.sin((wx - splitX) * 0.05) * 40;
          if (wx === splitX + 20) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        // Optical vs Radar Warning Overlay
        const blinkAlert = Math.floor(time * 3) % 2 === 0;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.fillRect(splitX + 15, h - 105, w - splitX - 30, 48);
        ctx.strokeStyle = blinkAlert ? '#ef4444' : '#7f1d1d';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(splitX + 15, h - 105, w - splitX - 30, 48);

        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = blinkAlert ? '#f87171' : '#fca5a5';
        ctx.textAlign = 'center';
        ctx.fillText('❌ 광학 육안 관측 결과: 식별 불가능', splitX + (w - splitX) / 2, h - 88);

        ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('장성 평균 폭 5.5m < 궤도 광학 해상도 한계 (루머 검증)', splitX + (w - splitX) / 2, h - 70);

        // Top Header
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(0, 0, w, 28);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, 28);

        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#a7f3d0';
        ctx.textAlign = 'left';
        ctx.fillText('🛰 우주 원격탐사: 인공위성 고해상도 궤도 관측 레이더 (SAR)', 14, 18);

        // Bottom Footer
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, h - 26, w, 26);
        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('관측 고도: 420.5 km | 위성 센서: L-Band SAR 레이더 | 우주 육안 관측: 물리적 불가', 14, h - 8);
      }

      animId = requestAnimationFrame(renderVideoFrame);
    };

    animId = requestAnimationFrame(renderVideoFrame);
    return () => cancelAnimationFrame(animId);
  }, [exhibit, isEditing, isPlayingVideo]);

  if (!exhibit) return null;

  const roomInfo = ROOM_CONFIGS.find((r) => r.id === exhibit.roomId);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditImageUrl(reader.result);
        setImgError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const isImageResourceCustomized =
      editType === 'image' &&
      Boolean(editImageUrl) &&
      (editImageUrl.startsWith('data:') || editImageUrl.startsWith('http'));

    const now = new Date();
    const formattedDate = `${now.getFullYear()}. ${(now.getMonth() + 1).toString().padStart(2, '0')}. ${now.getDate().toString().padStart(2, '0')}. ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updated: ExhibitItem = {
      ...exhibit,
      type: editType,
      title: editTitle.trim() || exhibit.title,
      subtitle: editSubtitle.trim() || exhibit.subtitle,
      artist: editArtist.trim(),
      description: editDescription.trim() || exhibit.description,
      imageUrl: editImageUrl.trim() || exhibit.imageUrl,
      videoPreset: editVideoPreset,
      customVideoUrl: editCustomVideoUrl.trim() || undefined,
      isCustomized: true,
      lastModified: formattedDate,
      textContent: {
        leadQuote: editLeadQuote.trim(),
        paragraphs: editBodyText
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean),
        curatorNote: editCuratorNote.trim(),
      },
    };
    onUpdateExhibit(updated);
    setIsEditing(false);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 2800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-lg bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{roomInfo?.name}</span>
            <span aria-hidden="true">·</span>
            <span>
              {exhibit.type === 'image'
                ? '이미지 전시물'
                : exhibit.type === 'video'
                ? '영상 미디어 전시물'
                : '텍스트 아카이브 전시물'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{exhibit.year}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? '감상 모드로 돌아가기' : '전시물 편집/교체'}</span>
              </button>
            )}
            {isFromCatalog && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>← 도록 목록으로 복귀</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label={isFromCatalog ? '전시 도록으로 돌아가기' : '닫기'}
              title={isFromCatalog ? '전시 도록으로 돌아가기' : '닫기'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing && isAdmin ? (
          /* ==================== CURATOR EDIT MODE ==================== */
          <form onSubmit={handleSaveChanges} className="p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                전시물 커스텀 배치 및 수정
              </h3>
              <p className="text-xs text-slate-400">
                이 전시 공간에 이미지, 텍스트, 또는 영상을 자유롭게 배치할 수 있습니다.
              </p>
            </div>

            {/* Exhibit Media Type Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                전시물 유형 선택
              </label>
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'image', label: '이미지 (Image)', icon: ImageIcon },
                    { id: 'text', label: '텍스트 (Text)', icon: FileText },
                    { id: 'video', label: '영상 (Video)', icon: Film },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = editType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEditType(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded border transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  명칭
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  출처 및 인물
                </label>
                <input
                  type="text"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                상세 내용
              </label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Type-Specific Fields */}
            {editType === 'image' && (
              <div className="space-y-3 p-4 rounded bg-slate-950/70 border border-slate-800">
                <label className="block text-xs font-medium text-amber-300">
                  이미지 리소스 설정 (파일 업로드 또는 이미지 URL)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>내 PC에서 이미지 선택</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="또는 이미지 URL 입력..."
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200"
                  />
                </div>
              </div>
            )}

            {editType === 'text' && (
              <div className="space-y-3 p-4 rounded bg-slate-950/70 border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-amber-300 mb-1">
                    핵심 인용구 (Lead Quote)
                  </label>
                  <input
                    type="text"
                    value={editLeadQuote}
                    onChange={(e) => setEditLeadQuote(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-300 mb-1">
                    본문 텍스트 (줄바꿈으로 문단 구분)
                  </label>
                  <textarea
                    rows={4}
                    value={editBodyText}
                    onChange={(e) => setEditBodyText(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
            )}

            {editType === 'video' && (
              <div className="space-y-3 p-4 rounded bg-slate-950/70 border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-amber-300 mb-1">
                    기본 내장 픽셀 미디어 아트 영상 프리셋
                  </label>
                  <select
                    value={editVideoPreset}
                    onChange={(e) =>
                      setEditVideoPreset(e.target.value as VideoPresetId)
                    }
                    className="w-full px-3 py-2 text-sm rounded bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="cosmos_wave">
                      1. 장력 738kg 자동발사 노궁(弩弓) 메커니즘 (지하궁전 방어 함정)
                    </option>
                    <option value="botanical_wind">
                      2. 토목 판축(版築) 성벽 축조 모션 (고대 판축 공법)
                    </option>
                    <option value="cyber_matrix">
                      3. 3D 비파괴 라이다 스캔 & 병마용 파편 재조합 (현대 보존과학)
                    </option>
                    <option value="clockwork_pulse">
                      4. 인공위성 고해상도 SAR 궤도 관측 레이더 (우주 원격탐사)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    외부 MP4/WebM 비디오 URL (비워두면 위 픽셀 영상 프리셋 재생)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={editCustomVideoUrl}
                    onChange={(e) => setEditCustomVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>전시물에 반영하기</span>
              </button>
            </div>
          </form>
        ) : (
          /* ==================== EXHIBITION VIEW MODE ==================== */
          <div className="p-6 space-y-6">
            {/* Title Header */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                {exhibit.subtitle && (
                  <p className="text-xs text-amber-400 font-medium">
                    {exhibit.subtitle}
                  </p>
                )}
                {exhibit.lastModified && (
                  <p className="text-[11px] text-slate-500 font-normal">
                    마지막 수정: {exhibit.lastModified}
                  </p>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight text-balance">
                {exhibit.title}
              </h2>
            </div>

            {/* Exhibit Media Showcase */}
            {exhibit.type === 'image' && (
              <div className="rounded-lg overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center min-h-[280px]">
                {exhibit.id === 'ex_r1_image' && (!exhibit.imageUrl || !exhibit.imageUrl.startsWith('data:')) ? (
                  <div className="w-full">
                    <QinCeilingConstellationCanvas />
                  </div>
                ) : exhibit.imageUrl && !imgError ? (
                  <img
                    src={exhibit.imageUrl}
                    alt={exhibit.title}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="p-12 text-center space-y-2">
                    <ImageIcon className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-sm font-medium text-slate-200">
                      {exhibit.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      픽셀 아트 디지털 컬렉션 아카이브
                    </p>
                  </div>
                )}
              </div>
            )}

            {exhibit.type === 'video' && (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden bg-slate-950 border-2 border-slate-800">
                  {exhibit.customVideoUrl ? (
                    <video
                      src={exhibit.customVideoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full max-h-[380px] object-contain"
                    />
                  ) : (
                    <>
                      <canvas
                        ref={videoCanvasRef}
                        width={560}
                        height={300}
                        className="w-full h-[300px] block object-cover"
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlayingVideo((p) => !p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 cursor-pointer"
                        >
                          {isPlayingVideo ? (
                            <>
                              <Pause className="w-3.5 h-3.5 text-amber-400" />
                              <span>일시정지</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-400" />
                              <span>재생</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {exhibit.type === 'text' && exhibit.textContent && (
              <div className="p-6 rounded-lg bg-slate-950/90 border border-slate-800 space-y-4">
                <blockquote className="pl-4 border-l-2 border-amber-400 text-base font-medium italic text-amber-100">
                  {exhibit.textContent.leadQuote}
                </blockquote>
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  {exhibit.textContent.paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
                {exhibit.textContent.curatorNote && (
                  <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    {exhibit.textContent.curatorNote}
                  </div>
                )}
              </div>
            )}

            {/* Curatorial Description (본문) & Source Attribution (본문 직후) */}
            <div className="pt-3 border-t border-slate-800/60 space-y-2">
              <p className="text-sm text-slate-200 leading-relaxed">
                {exhibit.description}
              </p>
              {exhibit.artist && (
                <div className="flex justify-end pt-1">
                  <span className="text-xs text-slate-400 font-medium">
                    {exhibit.artist}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Success Toast Banner */}
        {showSavedToast && (
          <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-xs shadow-2xl border border-emerald-400/50">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>수정 사항이 전시 도록에 안전하게 저장되었습니다!</span>
          </div>
        )}
      </div>
    </div>
  );
};
