import {
  Direction,
  DoorEntity,
  ExhibitItem,
  NPCEntity,
  PlayerState,
} from '../types/metaverse';

/**
 * Draws a crisp pixel-art character (NPC or Player).
 */
export function drawPixelNPC(
  ctx: CanvasRenderingContext2D,
  npc: NPCEntity,
  time: number
) {
  const x = Math.round(npc.x);
  const y = Math.round(npc.y);
  const isWalking = npc.state === 'walking' && !npc.isStationary;
  const walkOffset = isWalking ? Math.sin(time * 8 + npc.animFrame * 2) : 0;

  ctx.save();

  // ==================== GHOST DESIGN (진시황 지하궁전) ====================
  if (npc.isGhost) {
    const floatY = Math.round(Math.sin(time * 3.5 + npc.animFrame * 2) * 6);
    const bodyY = y - 16 + floatY;

    // Faint ethereal floor shadow
    ctx.fillStyle = 'rgba(147, 197, 253, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ghost body outer glow aura
    ctx.fillStyle = 'rgba(192, 132, 252, 0.28)';
    ctx.beginPath();
    ctx.arc(x, bodyY + 4, 17, 0, Math.PI * 2);
    ctx.fill();

    // Floating ghost shroud / head
    ctx.fillStyle = npc.palette.top;
    ctx.beginPath();
    ctx.arc(x, bodyY - 4, 12, Math.PI, 0, false);
    ctx.lineTo(x + 12, bodyY + 12);

    // Wavy ghost tail hem
    const wave1 = Math.sin(time * 6) * 3;
    const wave2 = Math.cos(time * 6) * 3;
    ctx.lineTo(x + 6, bodyY + 8 + wave1);
    ctx.lineTo(x, bodyY + 13 + wave2);
    ctx.lineTo(x - 6, bodyY + 8 - wave1);
    ctx.lineTo(x - 12, bodyY + 12);
    ctx.closePath();
    ctx.fill();

    // Inner lighter ghost shroud
    ctx.fillStyle = npc.palette.skin;
    ctx.beginPath();
    ctx.arc(x, bodyY - 4, 9, Math.PI, 0, false);
    ctx.lineTo(x + 9, bodyY + 8);
    ctx.lineTo(x, bodyY + 10);
    ctx.lineTo(x - 9, bodyY + 8);
    ctx.closePath();
    ctx.fill();

    // Glowing hollow ghost eyes
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x - 5, bodyY - 6, 3, 4);
    ctx.fillRect(x + 2, bodyY - 6, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 4, bodyY - 5, 1, 2);
    ctx.fillRect(x + 3, bodyY - 5, 1, 2);

    // Ethereal mouth
    ctx.fillStyle = '#6b21a8';
    ctx.fillRect(x - 2, bodyY, 4, 3);

    // Ghost wisp particles
    for (let i = 0; i < 3; i++) {
      const px = x + Math.sin(time * 4 + i * 2) * 16;
      const py = bodyY + 10 + ((time * 15 + i * 12) % 18);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
      ctx.fillRect(Math.round(px), Math.round(py), 3, 3);
    }
  } else if (npc.isChild) {
    // ==================== CHILD DESIGN (만리장성 어린이 관광객) ====================
    const legLeftY = isWalking ? Math.round(walkOffset * 2.5) : 0;
    const legRightY = isWalking ? Math.round(-walkOffset * 2.5) : 0;
    const bobY = isWalking ? Math.abs(Math.round(walkOffset * 1.2)) : 0;

    // Floor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(x - 8, y + 8, 16, 5);

    // Shorter Legs
    ctx.fillStyle = npc.palette.bottom;
    ctx.fillRect(x - 5, y + 2 + legLeftY, 4, 7);
    ctx.fillRect(x + 1, y + 2 + legRightY, 4, 7);

    // Sneakers
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 5, y + 7 + legLeftY, 4, 3);
    ctx.fillRect(x + 1, y + 7 + legRightY, 4, 3);

    // Torso / Bright yellow hoodie
    const bodyY = y - 8 - bobY;
    ctx.fillStyle = npc.palette.top;
    ctx.fillRect(x - 7, bodyY, 14, 11);

    // Tourist backpack
    ctx.fillStyle = '#0284c7';
    if (npc.direction === 'down' || npc.direction === 'up') {
      ctx.fillRect(x - 8, bodyY + 2, 2, 7);
      ctx.fillRect(x + 6, bodyY + 2, 2, 7);
    } else if (npc.direction === 'left') {
      ctx.fillRect(x + 4, bodyY + 1, 5, 8);
    } else {
      ctx.fillRect(x - 9, bodyY + 1, 5, 8);
    }

    // Arms
    ctx.fillStyle = npc.palette.top;
    ctx.fillRect(x - 9, bodyY + 2, 2, 7);
    ctx.fillRect(x + 7, bodyY + 2, 2, 7);

    // Head
    const headY = bodyY - 12;
    ctx.fillStyle = npc.palette.skin;
    ctx.fillRect(x - 6, headY, 12, 11);

    // Cute Cap
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 7, headY - 3, 14, 4);
    if (npc.direction === 'right') {
      ctx.fillRect(x + 5, headY - 1, 4, 2);
    } else if (npc.direction === 'left') {
      ctx.fillRect(x - 9, headY - 1, 4, 2);
    }

    // Eyes
    ctx.fillStyle = '#0f172a';
    if (npc.direction === 'down') {
      ctx.fillRect(x - 4, headY + 5, 2, 2);
      ctx.fillRect(x + 2, headY + 5, 2, 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x - 5, headY + 7, 2, 1);
      ctx.fillRect(x + 3, headY + 7, 2, 1);
    } else if (npc.direction === 'left') {
      ctx.fillRect(x - 4, headY + 5, 2, 2);
    } else if (npc.direction === 'right') {
      ctx.fillRect(x + 2, headY + 5, 2, 2);
    }
  } else {
    // ==================== STANDARD ADULT NPC DESIGN ====================
    const legLeftY = isWalking ? Math.round(walkOffset * 3) : 0;
    const legRightY = isWalking ? Math.round(-walkOffset * 3) : 0;
    const bobY = isWalking ? Math.abs(Math.round(walkOffset * 1.5)) : 0;

    // Floor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(x - 10, y + 10, 20, 6);

    // Legs
    ctx.fillStyle = npc.palette.bottom;
    ctx.fillRect(x - 6, y + 2 + legLeftY, 5, 10);
    ctx.fillRect(x + 1, y + 2 + legRightY, 5, 10);

    // Shoes
    ctx.fillStyle = '#111827';
    ctx.fillRect(x - 6, y + 10 + legLeftY, 5, 3);
    ctx.fillRect(x + 1, y + 10 + legRightY, 5, 3);

    // Torso / Coat
    const bodyY = y - 10 - bobY;
    ctx.fillStyle = npc.palette.top;
    ctx.fillRect(x - 8, bodyY, 16, 14);

    // Collar / Accent trim
    ctx.fillStyle = npc.palette.accent;
    ctx.fillRect(x - 4, bodyY, 8, 3);
    ctx.fillRect(x - 2, bodyY + 3, 4, 6);

    // Arms
    const armSwing = isWalking ? Math.round(walkOffset * 2.5) : 0;
    ctx.fillStyle = npc.palette.top;
    if (npc.direction === 'left') {
      ctx.fillRect(x - 9, bodyY + 2, 4, 10);
      ctx.fillStyle = npc.palette.skin;
      ctx.fillRect(x - 9, bodyY + 10, 4, 3);
    } else if (npc.direction === 'right') {
      ctx.fillRect(x + 5, bodyY + 2, 4, 10);
      ctx.fillStyle = npc.palette.skin;
      ctx.fillRect(x + 5, bodyY + 10, 4, 3);
    } else {
      ctx.fillRect(x - 11, bodyY + 1 + armSwing, 3, 10);
      ctx.fillRect(x + 8, bodyY + 1 - armSwing, 3, 10);
      ctx.fillStyle = npc.palette.skin;
      ctx.fillRect(x - 11, bodyY + 9 + armSwing, 3, 3);
      ctx.fillRect(x + 8, bodyY + 9 - armSwing, 3, 3);
    }

    // Head
    const headY = bodyY - 14;
    ctx.fillStyle = npc.palette.skin;
    ctx.fillRect(x - 7, headY, 14, 13);

    // Hair & Face by direction
    ctx.fillStyle = npc.palette.hair;
    if (npc.direction === 'up') {
      ctx.fillRect(x - 8, headY - 2, 16, 13);
    } else if (npc.direction === 'down') {
      ctx.fillRect(x - 8, headY - 3, 16, 6);
      ctx.fillRect(x - 8, headY, 2, 7);
      ctx.fillRect(x + 6, headY, 2, 7);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 4, headY + 6, 2, 3);
      ctx.fillRect(x + 2, headY + 6, 2, 3);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x - 5, headY + 9, 2, 1);
      ctx.fillRect(x + 3, headY + 9, 2, 1);
    } else if (npc.direction === 'left') {
      ctx.fillRect(x - 8, headY - 3, 16, 6);
      ctx.fillRect(x + 2, headY, 6, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 5, headY + 6, 2, 3);
    } else if (npc.direction === 'right') {
      ctx.fillRect(x - 8, headY - 3, 16, 6);
      ctx.fillRect(x - 8, headY, 6, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 3, headY + 6, 2, 3);
    }
  }

  // Name tag below NPC feet with Quest Checkmark indicator
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  const tagText = `${npc.hasTalked ? '✓ ' : ''}${npc.name}`;
  const nameWidth = ctx.measureText(tagText).width + 12;
  ctx.fillStyle = npc.hasTalked ? 'rgba(6, 78, 59, 0.88)' : 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(Math.round(x - nameWidth / 2), y + 16, Math.round(nameWidth), 16);
  ctx.strokeStyle =
    npc.state === 'talking'
      ? '#facc15'
      : npc.hasTalked
      ? '#34d399'
      : 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    Math.round(x - nameWidth / 2),
    y + 16,
    Math.round(nameWidth),
    16
  );

  ctx.fillStyle =
    npc.state === 'talking'
      ? '#fef08a'
      : npc.hasTalked
      ? '#a7f3d0'
      : '#e2e8f0';
  ctx.fillText(tagText, x, y + 28);

  ctx.restore();
}

/**
 * Draws the Player character in either:
 * - 'left_classic': Classic Art Explorer / Curator (Left Wing: Rooms 1 & 2)
 * - 'right_cyber': Futuristic Cyber Visor Suit (Right Wing: Rooms 3 & 4)
 */
export function drawPixelPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  time: number
) {
  const x = Math.round(player.x);
  const y = Math.round(player.y);
  const walkCycle = player.isMoving ? Math.sin(time * 12) : 0;
  const legLeftY = player.isMoving ? Math.round(walkCycle * 3.5) : 0;
  const legRightY = player.isMoving ? Math.round(-walkCycle * 3.5) : 0;
  const bobY = player.isMoving ? Math.abs(Math.round(walkCycle * 1.5)) : 0;

  ctx.save();

  // Player aura ring on floor
  if (player.wingStyle === 'left_classic') {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
    ctx.fillRect(x - 13, y + 9, 26, 8);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 13, y + 9, 26, 8);
  } else {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
    ctx.fillRect(x - 14, y + 8, 28, 9);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 14, y + 8, 28, 9);
  }

  if (player.wingStyle === 'left_classic') {
    // ==================== DESIGN A: LEFT WING CLASSIC VISITOR ====================
    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 6, y + 2 + legLeftY, 5, 10);
    ctx.fillRect(x + 1, y + 2 + legRightY, 5, 10);

    // Classic leather boots
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 6, y + 10 + legLeftY, 5, 3);
    ctx.fillRect(x + 1, y + 10 + legRightY, 5, 3);

    // Warm Amber Trench Coat
    const bodyY = y - 11 - bobY;
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x - 9, bodyY, 18, 15);

    // Cream Scarf & Satchel Strap
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(x - 6, bodyY, 12, 4);
    ctx.fillRect(x + 2, bodyY + 3, 3, 7);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 7, bodyY + 4, 14, 2);

    // Arms
    const armSwing = player.isMoving ? Math.round(walkCycle * 3) : 0;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 12, bodyY + 1 + armSwing, 3, 11);
    ctx.fillRect(x + 9, bodyY + 1 - armSwing, 3, 11);
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(x - 12, bodyY + 10 + armSwing, 3, 3);
    ctx.fillRect(x + 9, bodyY + 10 - armSwing, 3, 3);

    // Head
    const headY = bodyY - 14;
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(x - 7, headY, 14, 13);

    // Hair & Face by direction
    ctx.fillStyle = '#451a03';
    if (player.direction === 'up') {
      ctx.fillRect(x - 8, headY - 1, 16, 12);
    } else if (player.direction === 'down') {
      ctx.fillRect(x - 8, headY - 1, 16, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 4, headY + 6, 2, 3);
      ctx.fillRect(x + 2, headY + 6, 2, 3);
    } else if (player.direction === 'left') {
      ctx.fillRect(x - 8, headY - 1, 16, 4);
      ctx.fillRect(x + 2, headY + 2, 6, 9);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 5, headY + 6, 2, 3);
    } else {
      ctx.fillRect(x - 8, headY - 1, 16, 4);
      ctx.fillRect(x - 8, headY + 2, 6, 9);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 3, headY + 6, 2, 3);
    }

    // Classic Artist Beret Hat
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(x - 9, headY - 5, 18, 5);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x - 1, headY - 7, 3, 2);
  } else {
    // ==================== DESIGN B: RIGHT WING MODERN FEMALE STUDENT (초록색 야구잠바 + 하얀색 긴 스커트) ====================
    // Student Loafers / Sneakers (peeking out under long white skirt)
    const shoeLeftY = player.isMoving ? Math.round(walkCycle * 2.5) : 0;
    const shoeRightY = player.isMoving ? Math.round(-walkCycle * 2.5) : 0;
    ctx.fillStyle = '#0f172a'; // dark sneaker body
    ctx.fillRect(x - 5, y + 10 + shoeLeftY, 4, 3);
    ctx.fillRect(x + 1, y + 10 + shoeRightY, 4, 3);
    ctx.fillStyle = '#ffffff'; // white rubber sole
    ctx.fillRect(x - 5, y + 12 + shoeLeftY, 4, 1);
    ctx.fillRect(x + 1, y + 12 + shoeRightY, 4, 1);

    // Flowing White Long Skirt (하얀색 긴 스커트)
    const skirtY = y - 3 - bobY;
    ctx.fillStyle = '#ffffff'; // pure white long skirt
    ctx.fillRect(x - 8, skirtY, 16, 14);
    // Subtle fabric fold shadows on white skirt
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x - 4, skirtY + 2, 2, 12);
    ctx.fillRect(x + 2, skirtY + 2, 2, 12);
    // Skirt bottom hem fold
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 8, skirtY + 13, 16, 1);

    // Green Baseball / Varsity Jacket (초록색 야구잠바)
    const bodyY = y - 13 - bobY;
    // Green wool torso body
    ctx.fillStyle = '#15803d'; // vibrant varsity green
    ctx.fillRect(x - 8, bodyY, 16, 11);
    // Jacket waist ribbing (green and white stripe)
    ctx.fillStyle = '#166534';
    ctx.fillRect(x - 8, bodyY + 9, 16, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8, bodyY + 10, 16, 1);

    // Ribbed baseball collar (green & white striped)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 4, bodyY - 1, 8, 2);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x - 3, bodyY, 6, 1);

    // Inner crewneck T-shirt
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 2, bodyY + 1, 4, 3);

    // White Snap Buttons down center
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - 1, bodyY + 4, 2, 2);
    ctx.fillRect(x - 1, bodyY + 7, 2, 2);

    // Varsity Embroidered Monogram on left chest (white letter 'E' / 'P')
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, bodyY + 3, 3, 4);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + 3, bodyY + 4, 2, 1);

    // White Leather Sleeves (야구잠바 특유의 흰색 가죽 소매)
    const armSwing = player.isMoving ? Math.round(walkCycle * 2.8) : 0;
    ctx.fillStyle = '#ffffff'; // white leather sleeve
    if (player.direction === 'left') {
      ctx.fillRect(x - 10, bodyY + 1, 3, 9);
      // Green striped cuff
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x - 10, bodyY + 9, 3, 2);
      // Hand
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(x - 10, bodyY + 11, 3, 2);
    } else if (player.direction === 'right') {
      ctx.fillRect(x + 7, bodyY + 1, 3, 9);
      // Green striped cuff
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x + 7, bodyY + 9, 3, 2);
      // Hand
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(x + 7, bodyY + 11, 3, 2);
    } else {
      ctx.fillRect(x - 11, bodyY + 1 + armSwing, 3, 8);
      ctx.fillRect(x + 8, bodyY + 1 - armSwing, 3, 8);
      // Green ribbed cuffs
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x - 11, bodyY + 8 + armSwing, 3, 2);
      ctx.fillRect(x + 8, bodyY + 8 - armSwing, 3, 2);
      // Hands
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(x - 11, bodyY + 10 + armSwing, 3, 2);
      ctx.fillRect(x + 8, bodyY + 10 - armSwing, 3, 2);
    }

    // Head
    const headY = bodyY - 14;
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(x - 7, headY, 14, 13);

    // Neat Student Hairstyle (Dark Espresso)
    ctx.fillStyle = '#292524';
    if (player.direction === 'up') {
      // Back of head with cute green baseball cap/ribbon
      ctx.fillRect(x - 8, headY - 2, 16, 14);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x - 3, headY + 2, 6, 3);
    } else if (player.direction === 'down') {
      // Cute bangs and side hair framing face
      ctx.fillRect(x - 8, headY - 3, 16, 6);
      ctx.fillRect(x - 8, headY, 2, 8);
      ctx.fillRect(x + 6, headY, 2, 8);
      // Cute star hairpin
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 4, headY - 1, 3, 2);

      // Lively student eyes
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(x - 4, headY + 6, 2, 3);
      ctx.fillRect(x + 2, headY + 6, 2, 3);
      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 4, headY + 6, 1, 1);
      ctx.fillRect(x + 2, headY + 6, 1, 1);

      // Cheerful cheek blush
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(x - 5, headY + 9, 2, 1);
      ctx.fillRect(x + 3, headY + 9, 2, 1);
    } else if (player.direction === 'left') {
      ctx.fillRect(x - 8, headY - 3, 16, 6);
      ctx.fillRect(x + 1, headY, 6, 11);
      // Eye
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(x - 5, headY + 6, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 5, headY + 6, 1, 1);
      // Cheek blush
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(x - 6, headY + 9, 2, 1);
    } else {
      ctx.fillRect(x - 8, headY - 3, 16, 6);
      ctx.fillRect(x - 7, headY, 6, 11);
      // Eye
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(x + 3, headY + 6, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, headY + 6, 1, 1);
      // Cheek blush
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(x + 4, headY + 9, 2, 1);
    }
  }

  // Sprite transformation burst effect when crossing corridor center
  if (player.transformFlashTimer > 0) {
    const progress = player.transformFlashTimer / 0.9;
    const radius = Math.round((1 - progress) * 38 + 10);
    ctx.strokeStyle =
      player.wingStyle === 'right_cyber' ? '#10b981' : '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - radius, y - radius - 8, radius * 2, radius * 2);

    // 8 pixel sparks
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + time * 6;
      const sx = Math.round(x + Math.cos(angle) * (radius + 6));
      const sy = Math.round(y - 8 + Math.sin(angle) * (radius + 6));
      ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#facc15';
      ctx.fillRect(sx - 2, sy - 2, 5, 5);
    }
  }

  // "PLAYER" indicator badge above head - unified to '나'
  ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  const badgeLabel = '▼ 나';
  const tw = ctx.measureText(badgeLabel).width + 14;
  ctx.fillStyle =
    player.wingStyle === 'left_classic'
      ? 'rgba(120, 53, 15, 0.92)'
      : 'rgba(20, 83, 45, 0.92)';
  ctx.fillRect(Math.round(x - tw / 2), y - 47, Math.round(tw), 16);
  ctx.strokeStyle =
    player.wingStyle === 'left_classic' ? '#facc15' : '#34d399';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(Math.round(x - tw / 2), y - 47, Math.round(tw), 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(badgeLabel, x, y - 35);

  ctx.restore();
}

export interface SpeechBubbleBounds {
  bubbleX: number;
  bubbleY: number;
  bubbleWidth: number;
  bubbleHeight: number;
  choiceRects?: {
    x: number;
    y: number;
    width: number;
    height: number;
    choiceIndex: number;
    lines: string[];
  }[];
}

/**
 * Calculates speech bubble coordinates for click handling & rendering
 */
export function getSpeechBubbleBounds(
  ctx: CanvasRenderingContext2D,
  npc: NPCEntity
): SpeechBubbleBounds | null {
  if (npc.state !== 'talking') return null;

  const pages = npc.dialoguePages && npc.dialoguePages.length > 0
    ? npc.dialoguePages
    : [npc.dialogue];
  const pageIdx = Math.min(npc.currentPageIndex, pages.length - 1);
  const fullText = pages[pageIdx] || npc.dialogue;

  const bubbleWidth = 500; // Enlarged speech bubble width for comfortable reading & wrapping
  const maxTextWidth = bubbleWidth - 36;

  ctx.save();
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';

  // Text line wrapping with paragraph newline support
  const paragraphs = fullText.split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(' ');
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxTextWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
  }
  if (lines.length === 0) lines.push('');

  const lineHeight = 22;
  let bubbleHeight = lines.length * lineHeight + 82;

  const choiceRects: SpeechBubbleBounds['choiceRects'] = [];

  // If this NPC has a quiz and is on the question page, calculate wrapped choice heights
  if (npc.quiz && npc.quiz.selectedChoiceIndex === null) {
    const choiceGap = 8;
    const choiceInnerWidth = bubbleWidth - 52;
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';

    const choiceItems: { lines: string[]; height: number }[] = [];
    let choicesTotalHeight = 0;

    npc.quiz.choices.forEach((choice) => {
      const cParagraphs = choice.text.split('\n');
      const clines: string[] = [];
      for (const cPara of cParagraphs) {
        const cwords = cPara.split(' ');
        let ccur = '';
        for (const w of cwords) {
          const test = ccur ? `${ccur} ${w}` : w;
          if (ctx.measureText(test).width > choiceInnerWidth && ccur) {
            clines.push(ccur);
            ccur = w;
          } else {
            ccur = test;
          }
        }
        if (ccur) clines.push(ccur);
      }
      if (clines.length === 0) clines.push('');

      // Height of each choice box adapts to wrapped line count
      const ch = Math.max(38, clines.length * 18 + 15);
      choiceItems.push({ lines: clines, height: ch });
      choicesTotalHeight += ch + choiceGap;
    });

    bubbleHeight += choicesTotalHeight + 6;

    const bx = Math.max(
      20,
      Math.min(1280 - bubbleWidth - 20, Math.round(npc.x - bubbleWidth / 2))
    );
    const by = Math.max(16, Math.round(npc.y - 44 - bubbleHeight));

    let currentChoiceY = by + lines.length * lineHeight + 44;
    choiceItems.forEach((item, idx) => {
      choiceRects.push({
        x: bx + 16,
        y: currentChoiceY,
        width: bubbleWidth - 32,
        height: item.height,
        choiceIndex: idx,
        lines: item.lines,
      });
      currentChoiceY += item.height + choiceGap;
    });

    ctx.restore();

    return {
      bubbleX: bx,
      bubbleY: by,
      bubbleWidth,
      bubbleHeight,
      choiceRects,
    };
  }

  const bx = Math.max(
    20,
    Math.min(1280 - bubbleWidth - 20, Math.round(npc.x - bubbleWidth / 2))
  );
  const by = Math.max(16, Math.round(npc.y - 44 - bubbleHeight));

  ctx.restore();

  return {
    bubbleX: bx,
    bubbleY: by,
    bubbleWidth,
    bubbleHeight,
  };
}

/**
 * Draws a significantly enlarged pixel speech bubble with typewriter text,
 * interactive click prompts for multi-sentence dialogues, and wrapped quiz buttons.
 */
export function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  npc: NPCEntity,
  time: number
) {
  if (npc.state !== 'talking') return;

  const bounds = getSpeechBubbleBounds(ctx, npc);
  if (!bounds) return;

  const { bubbleX: bx, bubbleY: by, bubbleWidth: bw, bubbleHeight: bh, choiceRects } = bounds;

  const pages = npc.dialoguePages && npc.dialoguePages.length > 0
    ? npc.dialoguePages
    : [npc.dialogue];
  const pageIdx = Math.min(npc.currentPageIndex, pages.length - 1);
  const fullText = pages[pageIdx] || npc.dialogue;

  // Typewriter sliced text
  const charCount = Math.floor(npc.typewriterCharCount);
  const displayedText = fullText.slice(0, charCount);
  const isTyping = charCount < fullText.length;

  ctx.save();

  // Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  ctx.fillRect(bx + 6, by + 6, bw, bh);

  // Main Speech Bubble Panel
  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(bx, by, bw, bh);

  // Pixel Border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);

  // Top Title Bar
  ctx.fillStyle = npc.isGhost ? '#ede9fe' : '#fef3c7';
  ctx.fillRect(bx + 3, by + 3, bw - 6, 26);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bx + 3, by + 29);
  ctx.lineTo(bx + bw - 3, by + 29);
  ctx.stroke();

  // NPC Name & Role Header
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = npc.isGhost ? '#6b21a8' : '#78350f';
  ctx.textAlign = 'left';
  ctx.fillText(`${npc.name}  [${npc.role}]`, bx + 14, by + 20);

  // Page index indicator in header
  if (pages.length > 1) {
    ctx.font = '600 12px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#b45309';
    ctx.textAlign = 'right';
    ctx.fillText(`${pageIdx + 1} / ${pages.length}`, bx + bw - 14, by + 20);
  }

  // Typewriter Text Rendering
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';

  const maxTextWidth = bw - 36;
  const paragraphs = displayedText.split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(' ');
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxTextWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
  }
  if (lines.length === 0) lines.push('');

  const lineHeight = 22;
  lines.forEach((line, i) => {
    ctx.fillText(line, bx + 16, by + 50 + i * lineHeight);
  });

  // Blinking Typewriter Cursor
  if (isTyping) {
    const lastLine = lines[lines.length - 1] || '';
    const lastLineWidth = ctx.measureText(lastLine).width;
    const cursorX = bx + 18 + lastLineWidth;
    const cursorY = by + 37 + (lines.length - 1) * lineHeight;
    if (Math.floor(time * 8) % 2 === 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cursorX, cursorY, 3, 16);
    }
  }

  // Quiz Choices Rendering if applicable (with multi-line line wrapping)
  if (choiceRects && npc.quiz) {
    choiceRects.forEach((rect, idx) => {
      const isChoice2 = idx === 1;
      ctx.fillStyle = isChoice2 ? '#ecfdf5' : '#f8fafc';
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.strokeStyle = isChoice2 ? '#10b981' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'left';

      // Draw all wrapped lines inside the choice button
      const clines = rect.lines || [npc.quiz!.choices[idx].text];
      clines.forEach((lineText, lidx) => {
        ctx.fillText(lineText, rect.x + 12, rect.y + 17 + lidx * 18);
      });
    });
  }

  // Bottom Click Action Hint Bar
  const footerHeight = 24;
  const footerY = by + bh - footerHeight - 3;
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(bx + 3, footerY, bw - 6, footerHeight);

  ctx.font = '700 11.5px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';

  if (isTyping) {
    ctx.fillStyle = '#d97706';
    ctx.fillText('⚡ 말풍선을 클릭하면 대사가 즉시 완성됩니다', bx + bw / 2, footerY + 16);
  } else if (npc.quiz && npc.quiz.selectedChoiceIndex === null) {
    ctx.fillStyle = '#0284c7';
    ctx.fillText('👆 위의 답변 선택지 중 하나를 클릭하세요', bx + bw / 2, footerY + 16);
  } else if (pageIdx < pages.length - 1) {
    ctx.fillStyle = '#059669';
    ctx.fillText('▶ 말풍선을 클릭하면 다음 대사로 이어집니다 (클릭)', bx + bw / 2, footerY + 16);
  } else {
    ctx.fillStyle = '#475569';
    ctx.fillText('✔ 말풍선을 클릭하면 대화가 완료됩니다', bx + bw / 2, footerY + 16);
  }

  // Pointer Tail pointing down to NPC
  const tailX = Math.max(bx + 24, Math.min(bx + bw - 24, Math.round(npc.x)));
  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(tailX - 7, by + bh, 14, 9);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(tailX - 9, by + bh, 2, 9);
  ctx.fillRect(tailX + 7, by + bh, 2, 9);
  ctx.fillRect(tailX - 7, by + bh + 9, 14, 3);

  ctx.restore();
}

/**
 * Draws an Exhibit item (Wall Image, Wall Video Screen, or Floor Pedestal Text).
 */
export function drawPixelExhibit(
  ctx: CanvasRenderingContext2D,
  exhibit: ExhibitItem,
  time: number,
  isNearby: boolean
) {
  ctx.save();
  const { x, y, width, height, type, frameColor, accentColor } = exhibit;

  if (exhibit.placement === 'wall') {
    // Wall plaque shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - 2, y + 3, width + 4, height + 2);

    // Outer pixel frame
    ctx.fillStyle = frameColor;
    ctx.fillRect(x, y, width, height);

    // Inner canvas area
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 4, y + 4, width - 8, height - 8);

    if (type === 'image') {
      // Miniature pixel painting preview inside frame
      const ix = x + 6;
      const iy = y + 6;
      const iw = width - 12;
      const ih = height - 12;

      if (exhibit.roomId === 'room1') {
        // Vaulted constellation ceiling of Qin Shi Huang's tomb with slowly twinkling stars
        ctx.fillStyle = '#0a0d24';
        ctx.fillRect(ix, iy, iw, ih);

        // Vaulted celestial dome arch
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(ix + iw / 2, iy + ih * 0.45, iw * 0.44, ih * 0.35, 0, Math.PI, 0);
        ctx.stroke();

        // Big Dipper constellation connecting line in miniature
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
        ctx.beginPath();
        ctx.moveTo(ix + 24, iy + 7);
        ctx.lineTo(ix + 38, iy + 6);
        ctx.lineTo(ix + 50, iy + 10);
        ctx.lineTo(ix + 64, iy + 13);
        ctx.lineTo(ix + 76, iy + 11);
        ctx.lineTo(ix + 84, iy + 15);
        ctx.stroke();

        // Sun & Crescent Moon on ceiling
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(ix + 8, iy + 5, 4, 4); // Golden Sun
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(ix + iw - 12, iy + 5, 3, 3); // Jade Moon

        // Slowly twinkling pearl & diamond stars (organic breathing rhythm)
        const t1 = Math.sin(time * 1.6);
        const t2 = Math.sin(time * 2.1 + 1.2);
        const t3 = Math.sin(time * 1.4 + 2.5);
        const t4 = Math.sin(time * 1.8 + 3.8);

        // Polaris (Emperor Star) at Zenith
        ctx.fillStyle = t1 > 0.2 ? '#ffffff' : '#fef08a';
        ctx.fillRect(ix + 46, iy + 4, 3, 3);

        // Big Dipper stars twinkling
        ctx.fillStyle = t2 > 0 ? '#ffffff' : '#fde047';
        ctx.fillRect(ix + 24, iy + 7, 2, 2);
        ctx.fillStyle = t3 > 0 ? '#ffffff' : '#facc15';
        ctx.fillRect(ix + 50, iy + 10, 2, 2);
        ctx.fillStyle = t4 > 0 ? '#ffffff' : '#38bdf8';
        ctx.fillRect(ix + 76, iy + 11, 2, 2);

        // Background twinkling field stars
        ctx.fillStyle = t1 < -0.3 ? '#ffffff' : 'rgba(254, 240, 138, 0.4)';
        ctx.fillRect(ix + 16, iy + 12, 1, 1);
        ctx.fillStyle = t3 > 0.3 ? '#ffffff' : 'rgba(186, 230, 253, 0.4)';
        ctx.fillRect(ix + iw - 22, iy + 10, 1, 1);

        // Mercury River (수은 강) at floor reflecting celestial stars
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ix, iy + ih - 6, iw, 6);
        ctx.fillStyle = '#94a3b8';
        const waveX = Math.round(Math.sin(time * 2.5) * 5);
        ctx.fillRect(ix + 8 + waveX, iy + ih - 4, iw - 16, 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(ix + 46 + waveX, iy + ih - 4, 3, 2); // Star reflection on mercury
      } else if (exhibit.roomId === 'room2') {
        // "10년간의 동원" - Ancient stone excavation, scaffolding & masonry construction site
        ctx.fillStyle = '#44403c';
        ctx.fillRect(ix, iy, iw, ih);

        // Surrounding terrain
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(ix, iy, 18, ih);
        ctx.fillRect(ix + iw - 16, iy, 18, ih);

        // Massive stone chamber structure
        ctx.fillStyle = '#a8a29e';
        ctx.fillRect(ix + 18, iy + 4, iw - 34, ih - 6);
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(ix + 32, iy + 7, iw - 62, ih - 13);

        // Wooden scaffolding & hoist beams
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(ix + 16, iy + 2, 2, ih - 3);
        ctx.fillRect(ix + 16, iy + 2, 14, 2);
        ctx.fillRect(ix + iw - 20, iy + 3, 2, ih - 4);
        ctx.fillRect(ix + iw - 24, iy + 8, 10, 1);

        // Laborers & stone carts
        ctx.fillStyle = '#b45309';
        ctx.fillRect(ix + 8, iy + ih - 7, 3, 4);
        ctx.fillRect(ix + 24, iy + ih - 6, 3, 4);
        ctx.fillRect(ix + 44, iy + ih - 6, 3, 4);
        ctx.fillRect(ix + iw - 12, iy + ih - 7, 3, 4);

        ctx.fillStyle = '#e7e5e4';
        ctx.fillRect(ix + 12, iy + ih - 5, 4, 3);
        ctx.fillRect(ix + 48, iy + ih - 5, 4, 3);
      } else if (exhibit.roomId === 'room3') {
        // Cyber brutalist pavilion pixel art
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ix, iy, iw, ih);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(ix + 18, iy + 5, 60, 12);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(ix + 26, iy + 8, 12, 6);
        ctx.fillRect(ix + 48, iy + 8, 16, 6);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(ix + 6, iy + 18, iw - 12, 5);
      } else {
        // Room 4: Great Wall exhibits
        if (exhibit.id === 'ex_r4_video' || exhibit.title.includes('우주')) {
          // "우주에서 본 만리장성?!" - Deep space, Earth curve, UFO with alien & telescope
          ctx.fillStyle = '#050814';
          ctx.fillRect(ix, iy, iw, ih);

          // Deep space stars
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ix + 10, iy + 4, 1, 1);
          ctx.fillRect(ix + 26, iy + 14, 1, 1);
          ctx.fillRect(ix + 52, iy + 6, 1, 1);
          ctx.fillRect(ix + 78, iy + 12, 1, 1);

          // Planet Earth curve on right
          ctx.fillStyle = '#1d4ed8';
          ctx.beginPath();
          ctx.arc(ix + iw + 8, iy + ih / 2, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(ix + iw - 12, iy + 6, 8, 12);

          // UFO flying saucer
          ctx.fillStyle = '#64748b';
          ctx.fillRect(ix + 16, iy + 10, 22, 5);
          ctx.fillStyle = '#84cc16';
          ctx.fillRect(ix + 20, iy + 15, 14, 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(ix + 22, iy + 6, 10, 4);

          // Green Alien head & telescope
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(ix + 25, iy + 7, 4, 3);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(ix + 28, iy + 7, 10, 2);
        } else {
          // "만리장성의 또 다른 목적" - Rolling green mountains, Great Wall & Nomadic yurt
          ctx.fillStyle = '#93c5fd';
          ctx.fillRect(ix, iy, iw, ih);

          // Green mountain hills
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.moveTo(ix, iy + ih);
          ctx.lineTo(ix, iy + 11);
          ctx.lineTo(ix + 35, iy + 5);
          ctx.lineTo(ix + 70, iy + 12);
          ctx.lineTo(ix + iw, iy + 6);
          ctx.lineTo(ix + iw, iy + ih);
          ctx.closePath();
          ctx.fill();

          // Great Wall stone path & watchtower
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ix + 20, iy + 16);
          ctx.lineTo(ix + 50, iy + 9);
          ctx.lineTo(ix + 85, iy + 13);
          ctx.stroke();

          // Watchtower fortress
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(ix + 48, iy + 6, 7, 7);
          ctx.fillStyle = '#475569';
          ctx.fillRect(ix + 50, iy + 8, 3, 4);

          // White Yurt tent in meadow & nomadic shepherd
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(ix + 8, iy + ih - 7, 7, 5);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(ix + 18, iy + ih - 6, 2, 5);
        }
      }
    } else if (type === 'video') {
      // Live animated pixel screen right on the gallery wall matching exhibit contents!
      const ix = x + 5;
      const iy = y + 5;
      const iw = width - 10;
      const ih = height - 10;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(ix, iy, iw, ih);

      const vPreset =
        exhibit.videoPreset ||
        (exhibit.roomId === 'room1'
          ? 'cosmos_wave'
          : exhibit.roomId === 'room2'
          ? 'botanical_wind'
          : exhibit.roomId === 'room3'
          ? 'cyber_matrix'
          : 'clockwork_pulse');

      if (vPreset === 'cosmos_wave') {
        // Room 1: 738kg Automatic Crossbow trap (화살 발사 모션)
        // Stone crypt background
        ctx.fillStyle = '#141118';
        ctx.fillRect(ix, iy, iw, ih);

        // Crossbow on left
        ctx.fillStyle = '#b45309';
        ctx.fillRect(ix + 6, iy + ih / 2 - 3, 16, 6);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ix + 6, iy + ih / 2 - 3, 16, 6);

        // Flying crossbow bolt shooting across to right wall
        const arrowProgress = (time * 2.8) % 1.0;
        const arrowX = ix + 24 + arrowProgress * (iw - 32);
        const arrowY = iy + ih / 2;

        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.max(ix + 24, arrowX - 16), arrowY);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(arrowX - 2, arrowY - 2, 4, 4);

        // Impact spark at right end
        if (arrowProgress > 0.85) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ix + iw - 6, arrowY - 3, 4, 6);
        }

      } else if (vPreset === 'botanical_wind') {
        // Room 2: Rammed Earth Compaction (판축 공법 다짐 모션)
        // Dusty loess background
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(ix, iy, iw, ih);

        // Wooden formwork frame
        ctx.fillStyle = '#78350f';
        ctx.fillRect(ix + 18, iy + 4, 6, ih - 8);
        ctx.fillRect(ix + iw - 24, iy + 4, 6, ih - 8);

        // Layered loess earth inside
        const layerColors = ['#78350f', '#92400e', '#b45309', '#d97706'];
        for (let l = 0; l < 4; l++) {
          ctx.fillStyle = layerColors[l];
          ctx.fillRect(ix + 24, iy + ih - 6 - (l + 1) * 4, iw - 48, 4);
        }

        // Two wooden rammers stamping rhythmically
        const r1Y = Math.sin(time * 8) * 5;
        const r2Y = Math.sin(time * 8 + Math.PI) * 5;

        ctx.fillStyle = '#451a03';
        ctx.fillRect(ix + 35, iy + 6 + r1Y, 3, 14); // Rammer 1
        ctx.fillRect(ix + 32, iy + 16 + r1Y, 9, 4); // Stamp head 1

        ctx.fillRect(ix + iw - 42, iy + 6 + r2Y, 3, 14); // Rammer 2
        ctx.fillRect(ix + iw - 45, iy + 16 + r2Y, 9, 4); // Stamp head 2

        // Dust particles puffing
        if (r1Y > 3 || r2Y > 3) {
          ctx.fillStyle = 'rgba(217, 119, 6, 0.7)';
          ctx.fillRect(ix + 33, iy + 20, 6, 2);
          ctx.fillRect(ix + iw - 44, iy + 20, 6, 2);
        }

      } else if (vPreset === 'cyber_matrix') {
        // Room 3: 3D LiDAR Scanning & Terracotta Warrior (3D 스캔 & 복원)
        ctx.fillStyle = '#020617';
        ctx.fillRect(ix, iy, iw, ih);

        // Terracotta warrior pixel silhouette in center
        const warriorX = ix + iw / 2 - 4;
        ctx.fillStyle = '#b45309';
        ctx.fillRect(warriorX + 2, iy + 6, 4, 5); // Head
        ctx.fillStyle = '#78350f';
        ctx.fillRect(warriorX, iy + 11, 8, 8); // Chest
        ctx.fillRect(warriorX - 1, iy + 19, 10, 6); // Robe/Legs

        // Green/cyan 3D laser scan line moving up and down
        const laserY = iy + 4 + ((Math.sin(time * 3) + 1) / 2) * (ih - 8);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ix + 8, laserY);
        ctx.lineTo(ix + iw - 8, laserY);
        ctx.stroke();

        // 3D point cloud particles
        for (let p = 0; p < 8; p++) {
          const px = ix + 14 + p * 9;
          const py = iy + 8 + ((p * 7 + Math.floor(time * 15)) % (ih - 16));
          ctx.fillStyle = p % 2 === 0 ? '#10b981' : '#38bdf8';
          ctx.fillRect(px, py, 2, 2);
        }

      } else {
        // Room 4: Satellite SAR Radar (인공위성 레이더 궤도 관측)
        ctx.fillStyle = '#030712';
        ctx.fillRect(ix, iy, iw, ih);

        // Mountain terrain profile below
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(ix, iy + ih);
        for (let tx = ix; tx <= ix + iw; tx += 8) {
          const my = iy + ih - 7 - Math.sin((tx - ix) * 0.15) * 6;
          ctx.lineTo(tx, my);
        }
        ctx.lineTo(ix + iw, iy + ih);
        ctx.closePath();
        ctx.fill();

        // Orbiting Satellite on top
        const satProg = (time * 12) % (iw - 16);
        const satX = ix + 8 + satProg;
        const satY = iy + 6;

        ctx.fillStyle = '#facc15';
        ctx.fillRect(satX - 2, satY - 2, 5, 4); // Sat core
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(satX - 6, satY - 1, 4, 2); // Left panel
        ctx.fillRect(satX + 3, satY - 1, 4, 2); // Right panel

        // Sweeping radar beam pulse to ground
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(satX, satY + 2);
        ctx.lineTo(satX - 12, iy + ih - 2);
        ctx.lineTo(satX + 12, iy + ih - 2);
        ctx.closePath();
        ctx.stroke();

        // Green synthetic Great Wall contour on ridge
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ix + 12, iy + ih - 7);
        ctx.lineTo(ix + iw / 2, iy + ih - 10);
        ctx.lineTo(ix + iw - 12, iy + ih - 6);
        ctx.stroke();
      }

      // Corner "LIVE VIDEO" red pixel indicator
      const blink = Math.floor(time * 2) % 2 === 0;
      ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
      ctx.fillRect(ix + 4, iy + 3, 5, 5);
    } else if (type === 'text') {
      // Wall-mounted classical inscription / historical text tablet
      const ix = x + 6;
      const iy = y + 6;
      const iw = width - 12;
      const ih = height - 12;

      ctx.fillStyle = '#1c1917'; // Antique stone slate
      ctx.fillRect(ix, iy, iw, ih);

      // Inscribed border line
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 1;
      ctx.strokeRect(ix + 2, iy + 2, iw - 4, ih - 4);

      // Engraved gold/amber header text line
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ix + 6, iy + 5, iw - 28, 2);

      // Etched text lines on stone tablet
      ctx.fillStyle = '#d6d3d1';
      ctx.fillRect(ix + 6, iy + 10, iw - 12, 1.5);
      ctx.fillRect(ix + 6, iy + 14, iw - 18, 1.5);
      ctx.fillRect(ix + 6, iy + 18, iw - 14, 1.5);

      // Subtle royal seal / stamp at corner
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ix + iw - 10, iy + 4, 4, 4);
    }

    // Type badge below wall frame
    const badgeText = type === 'image' ? '🖼 이미지 전시' : type === 'text' ? '📜 텍스트 전시' : '🎬 영상 전시';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isNearby ? '#fef08a' : '#cbd5e1';
    ctx.fillText(badgeText, x + width / 2, y + height + 14);
  } else {
    // ==================== FLOOR PEDESTAL (TEXT ARCHIVE) ====================
    // Floor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x - 4, y + 6, width + 8, height);

    // Pedestal base
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, y + 10, width, height - 10);

    // Pedestal top marble/metallic surface
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 3, y, width - 6, height - 14);

    // Trim border
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y, width - 6, height - 14);

    // Glowing manuscript / monolith book on top
    const floatY = Math.round(Math.sin(time * 3) * 2);
    ctx.fillStyle = accentColor;
    ctx.fillRect(x + 18, y + 8 + floatY, width - 36, 22);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + width / 2 - 1, y + 9 + floatY, 2, 20);
    // Text lines on book pages
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 22, y + 13 + floatY, 12, 2);
    ctx.fillRect(x + 22, y + 18 + floatY, 10, 2);
    ctx.fillRect(x + width / 2 + 4, y + 13 + floatY, 12, 2);
    ctx.fillRect(x + width / 2 + 4, y + 18 + floatY, 10, 2);

    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isNearby ? '#fef08a' : '#cbd5e1';
    ctx.fillText('📜 텍스트 전시', x + width / 2, y + height + 14);
  }

  // Interactive highlight ring if player is nearby
  if (isNearby) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * Draws a functional pixel Door that slides open as the player approaches/passes through.
 */
export function drawPixelDoor(
  ctx: CanvasRenderingContext2D,
  door: DoorEntity
) {
  ctx.save();
  const { x, y, width, height, orientation, openProgress } = door;

  // Threshold floor carpet / mat
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 6, y - 4, width + 12, height + 8);

  // Glowing threshold guide stripes
  ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
  if (orientation === 'vertical') {
    ctx.fillRect(x + 2, y + 4, width - 4, height - 8);
    // Door frame posts (top and bottom of vertical doorway)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 2, y - 6, width + 4, 8);
    ctx.fillRect(x - 2, y + height - 2, width + 4, 8);

    // Sliding door panels
    const panelLen = Math.round(((height - 8) / 2) * (1 - openProgress * 0.85));
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 4, y + 2, width - 8, panelLen);
    ctx.fillRect(x + 4, y + height - 2 - panelLen, width - 8, panelLen);

    // Door laser / glass center line when closed
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + width / 2 - 1, y + 2, 2, panelLen);
    ctx.fillRect(x + width / 2 - 1, y + height - 2 - panelLen, 2, panelLen);
  } else {
    ctx.fillRect(x + 4, y + 2, width - 8, height - 4);
    // Door frame posts (left and right of horizontal doorway)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 6, y - 2, 8, height + 4);
    ctx.fillRect(x + width - 2, y - 2, 8, height + 4);

    // Sliding door panels
    const panelLen = Math.round(((width - 8) / 2) * (1 - openProgress * 0.85));
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 2, y + 18, panelLen, height - 36);
    ctx.fillRect(x + width - 2 - panelLen, y + 18, panelLen, height - 36);

    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + 2, y + height / 2 - 1, panelLen, 2);
    ctx.fillRect(x + width - 2 - panelLen, y + height / 2 - 1, panelLen, 2);
  }

  ctx.restore();
}

/**
 * Helper to determine cardinal direction from a delta vector (dx, dy)
 */
export function getCardinalDirection(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0 ? 'right' : 'left';
  }
  return dy >= 0 ? 'down' : 'up';
}
