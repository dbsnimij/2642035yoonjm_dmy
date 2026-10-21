import React, { useEffect, useRef, useCallback } from 'react';
import {
  CORRIDOR_BOUNDS,
  CORRIDOR_CENTER_X,
  INITIAL_DOORS,
  ROOM_CONFIGS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../data/exhibitionData';
import {
  DoorEntity,
  ExhibitItem,
  NPCEntity,
  PlayerState,
  RectBox,
  RoomId,
  StrictRoomId,
} from '../types/metaverse';
import {
  drawPixelDoor,
  drawPixelExhibit,
  drawPixelNPC,
  drawPixelPlayer,
  drawSpeechBubble,
  getCardinalDirection,
  getSpeechBubbleBounds,
} from '../utils/pixelRenderer';
import { soundEngine } from '../utils/soundEngine';

interface MetaverseCanvasProps {
  zoom: number;
  joystickVector: { vx: number; vy: number };
  exhibits: ExhibitItem[];
  npcsRef: React.MutableRefObject<NPCEntity[]>;
  playerStateRef: React.MutableRefObject<PlayerState>;
  onSelectExhibit: (exhibit: ExhibitItem) => void;
  onStatusChange: (status: {
    currentRoom: RoomId;
    wingStyle: 'left_classic' | 'right_cyber';
    nearbyExhibit: ExhibitItem | null;
    activeTalkingNpc: string | null;
    roomLightLevels: Record<StrictRoomId, number>;
  }) => void;
}

export const MetaverseCanvas: React.FC<MetaverseCanvasProps> = ({
  zoom,
  joystickVector,
  exhibits,
  npcsRef,
  playerStateRef,
  onSelectExhibit,
  onStatusChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doorsRef = useRef<DoorEntity[]>(
    INITIAL_DOORS.map((d) => ({ ...d }))
  );

  // Room lighting state (0.0 = dark, 1.0 = fully illuminated)
  // Player starts in Room 1, so Room 1 begins at 0.15 and smoothly brightens to 1.0 over 1.5s
  const roomLightsRef = useRef<Record<StrictRoomId, number>>({
    room1: 0.1,
    room2: 0.0,
    room3: 0.0,
    room4: 0.0,
  });

  const keysPressedRef = useRef<Set<string>>(new Set());
  const joystickRef = useRef(joystickVector);
  const exhibitsRef = useRef(exhibits);

  useEffect(() => {
    joystickRef.current = joystickVector;
  }, [joystickVector]);

  useEffect(() => {
    exhibitsRef.current = exhibits;
  }, [exhibits]);

  // Keyboard support alongside Virtual Joystick
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName
        )
      ) {
        return;
      }
      keysPressedRef.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * Checks if a point (px, py) with radius r is inside a valid walkable zone
   * (either inside a room's innerBounds, inside the central corridor's innerBounds,
   * or passing through any Door's bounding box) and not colliding with floor pedestals.
   */
  const isPlayerPositionWalkable = useCallback(
    (px: number, py: number): boolean => {
      const r = 11;
      const playerBox: RectBox = {
        x: px - r,
        y: py - r,
        width: r * 2,
        height: r * 2,
      };

      // Check collision with floor pedestals
      for (const ex of exhibitsRef.current) {
        if (ex.placement === 'pedestal') {
          const pedBox: RectBox = {
            x: ex.x + 2,
            y: ex.y + 4,
            width: ex.width - 4,
            height: ex.height - 6,
          };
          if (boxesOverlap(playerBox, pedBox)) {
            return false;
          }
        }
      }

      // Check if fully inside any room's inner walkable area
      for (const room of ROOM_CONFIGS) {
        if (boxInside(playerBox, room.innerBounds)) {
          return true;
        }
      }

      // Check if fully inside the central corridor's inner walkable area
      if (boxInside(playerBox, CORRIDOR_BOUNDS.inner)) {
        return true;
      }

      // Check if passing through any doorway passage
      for (const door of doorsRef.current) {
        const passageBox: RectBox =
          door.orientation === 'vertical'
            ? {
                x: door.x - 28,
                y: door.y + 6,
                width: door.width + 56,
                height: door.height - 12,
              }
            : {
                x: door.x + 6,
                y: door.y - 28,
                width: door.width - 12,
                height: door.height + 56,
              };
        if (boxInside(playerBox, passageBox)) {
          return true;
        }
      }

      return false;
    },
    []
  );

  /**
   * Determines which RoomId ('room1' | 'room2' | 'room3' | 'room4' | 'corridor')
   * the player is currently located in.
   */
  const detectCurrentRoom = (px: number, py: number): RoomId => {
    for (const room of ROOM_CONFIGS) {
      const b = room.bounds;
      if (
        px >= b.x &&
        px <= b.x + b.width &&
        py >= b.y &&
        py <= b.y + b.height
      ) {
        return room.id;
      }
    }
    return 'corridor';
  };

  /**
   * Handle Canvas Click:
   * 1. Check if user clicked on currently active Speech Bubble or its quiz choices -> advance sentence or pick answer!
   * 2. Ensure only ONE person can talk at a time -> close any other talking NPC when a new NPC is clicked!
   * 3. Check if user clicked any Exhibit -> Open Exhibit detail modal!
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const scaleX = WORLD_WIDTH / rect.width;
    const scaleY = WORLD_HEIGHT / rect.height;
    const worldX = (e.clientX - rect.left) * scaleX;
    const worldY = (e.clientY - rect.top) * scaleY;

    const player = playerStateRef.current;
    const ctx = canvas.getContext('2d');

    // 1. Check if user clicked inside the currently active speech bubble (or quiz choices)
    const activeTalkingNpc = npcsRef.current.find((n) => n.state === 'talking');
    if (activeTalkingNpc && ctx) {
      const bubbleBounds = getSpeechBubbleBounds(ctx, activeTalkingNpc);
      if (bubbleBounds) {
        // 1A. Check quiz choices if applicable (Room 4 npc10)
        if (
          bubbleBounds.choiceRects &&
          activeTalkingNpc.quiz &&
          activeTalkingNpc.quiz.selectedChoiceIndex === null
        ) {
          for (const cr of bubbleBounds.choiceRects) {
            if (
              worldX >= cr.x &&
              worldX <= cr.x + cr.width &&
              worldY >= cr.y &&
              worldY <= cr.y + cr.height
            ) {
              activeTalkingNpc.quiz.selectedChoiceIndex = cr.choiceIndex;
              const choice = activeTalkingNpc.quiz.choices[cr.choiceIndex];
              activeTalkingNpc.dialoguePages = [choice.response];
              activeTalkingNpc.currentPageIndex = 0;
              activeTalkingNpc.typewriterCharCount = 0;
              activeTalkingNpc.hasTalked = true;
              soundEngine.playNpcTalk();
              return;
            }
          }
        }

        // 1B. Check speech bubble body click
        if (
          worldX >= bubbleBounds.bubbleX &&
          worldX <= bubbleBounds.bubbleX + bubbleBounds.bubbleWidth &&
          worldY >= bubbleBounds.bubbleY &&
          worldY <= bubbleBounds.bubbleY + bubbleBounds.bubbleHeight
        ) {
          const pages =
            activeTalkingNpc.dialoguePages &&
            activeTalkingNpc.dialoguePages.length > 0
              ? activeTalkingNpc.dialoguePages
              : [activeTalkingNpc.dialogue];
          const pageIdx = Math.min(
            activeTalkingNpc.currentPageIndex,
            pages.length - 1
          );
          const fullText = pages[pageIdx] || activeTalkingNpc.dialogue;

          // If typewriter is still typing, complete current sentence immediately!
          if (activeTalkingNpc.typewriterCharCount < fullText.length) {
            activeTalkingNpc.typewriterCharCount = fullText.length;
            return;
          }

          // If waiting for quiz answer, do not close or advance until a choice is clicked
          if (
            activeTalkingNpc.quiz &&
            activeTalkingNpc.quiz.selectedChoiceIndex === null
          ) {
            return;
          }

          // If there is a next sentence divided by '/', advance to next sentence!
          if (pageIdx < pages.length - 1) {
            activeTalkingNpc.currentPageIndex++;
            activeTalkingNpc.typewriterCharCount = 0;
            soundEngine.playNpcTalk();
            return;
          }

          // Last sentence complete: close speech bubble & resume NPC
          activeTalkingNpc.state = activeTalkingNpc.isStationary
            ? 'pausing'
            : 'walking';
          activeTalkingNpc.talkTimer = 0;
          activeTalkingNpc.hasTalked = true;
          return;
        }
      }
    }

    // 2. Check NPC click -> "한번에 한 사람이랑만 대화할 수 있도록 하기"
    for (const npc of npcsRef.current) {
      const dx = worldX - npc.x;
      const dy = worldY - (npc.y - 6);
      if (Math.abs(dx) <= 26 && Math.abs(dy) <= 32) {
        // Close any other talking NPC immediately!
        npcsRef.current.forEach((other) => {
          if (other.id !== npc.id && other.state === 'talking') {
            other.state = other.isStationary ? 'pausing' : 'walking';
            other.talkTimer = 0;
          }
        });

        // Start conversation with clicked NPC
        npc.state = 'talking';
        npc.vx = 0;
        npc.vy = 0;
        npc.currentPageIndex = 0;
        npc.typewriterCharCount = 0;
        npc.talkTimer = 9999; // Stays active until user clicks through
        npc.direction = getCardinalDirection(
          player.x - npc.x,
          player.y - npc.y
        );
        npc.hasTalked = true; // Mark as talked for Quest Tracker
        soundEngine.playNpcTalk();
        return;
      }
    }

    // 3. Check Exhibit click
    for (const ex of exhibitsRef.current) {
      if (
        worldX >= ex.x - 10 &&
        worldX <= ex.x + ex.width + 10 &&
        worldY >= ex.y - 10 &&
        worldY <= ex.y + ex.height + 18
      ) {
        soundEngine.playExhibitOpen();
        onSelectExhibit(ex);
        return;
      }
    }
  };

  // Main 60FPS Game Loop (Physics, Lighting, NPC AI, Pixel Rendering)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let lastTimestamp = performance.now();
    let elapsedTime = 0;
    let statusSyncCounter = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimestamp) / 1000);
      lastTimestamp = now;
      elapsedTime += dt;

      const player = playerStateRef.current;

      // ==================== 1. PLAYER INPUT & MOVEMENT ====================
      let inputX = joystickRef.current.vx;
      let inputY = joystickRef.current.vy;

      const keys = keysPressedRef.current;
      if (keys.has('arrowleft') || keys.has('a')) inputX -= 1;
      if (keys.has('arrowright') || keys.has('d')) inputX += 1;
      if (keys.has('arrowup') || keys.has('w')) inputY -= 1;
      if (keys.has('arrowdown') || keys.has('s')) inputY += 1;

      const mag = Math.hypot(inputX, inputY);
      if (mag > 1) {
        inputX /= mag;
        inputY /= mag;
      }

      if (mag > 0.08) {
        player.isMoving = true;
        player.direction = getCardinalDirection(inputX, inputY);

        const moveX = inputX * player.speed * dt;
        const moveY = inputY * player.speed * dt;

        // Sliding collision along X and Y independently
        if (isPlayerPositionWalkable(player.x + moveX, player.y)) {
          player.x += moveX;
        }
        if (isPlayerPositionWalkable(player.x, player.y + moveY)) {
          player.y += moveY;
        }
      } else {
        player.isMoving = false;
      }

      // ==================== 2. CORRIDOR SPRITE TRANSFORMATION ====================
      // Crossing CORRIDOR_CENTER_X (640) from Left to Right changes sprite to 'right_cyber'
      // Crossing from Right to Left restores original 'left_classic' sprite
      if (
        player.x >= CORRIDOR_CENTER_X &&
        player.wingStyle === 'left_classic'
      ) {
        player.wingStyle = 'right_cyber';
        player.transformFlashTimer = 0.9;
        soundEngine.setWingMode('right_cyber');
        soundEngine.playTransformChime(true);
      } else if (
        player.x < CORRIDOR_CENTER_X &&
        player.wingStyle === 'right_cyber'
      ) {
        player.wingStyle = 'left_classic';
        player.transformFlashTimer = 0.9;
        soundEngine.setWingMode('left_classic');
        soundEngine.playTransformChime(false);
      }

      if (player.transformFlashTimer > 0) {
        player.transformFlashTimer = Math.max(
          0,
          player.transformFlashTimer - dt
        );
      }

      // ==================== 3. ROOM DETECTION & 1.5s LIGHTING FADE ====================
      player.currentRoom = detectCurrentRoom(player.x, player.y);

      const fadeSpeed = 1 / 1.5; // 1.5 seconds transition (within 1~2s specification)
      (['room1', 'room2', 'room3', 'room4'] as StrictRoomId[]).forEach(
        (roomId) => {
          const target = player.currentRoom === roomId ? 1.0 : 0.0;
          const current = roomLightsRef.current[roomId];
          if (current < target) {
            roomLightsRef.current[roomId] = Math.min(
              1.0,
              current + fadeSpeed * dt
            );
          } else if (current > target) {
            roomLightsRef.current[roomId] = Math.max(
              0.0,
              current - fadeSpeed * dt
            );
          }
        }
      );

      // ==================== 4. DOOR PROXIMITY ANIMATION ====================
      doorsRef.current.forEach((door) => {
        const doorCenterX = door.x + door.width / 2;
        const doorCenterY = door.y + door.height / 2;
        const dist = Math.hypot(player.x - doorCenterX, player.y - doorCenterY);
        const targetOpen = dist < 72 ? 1 : 0;
        door.openProgress += (targetOpen - door.openProgress) * Math.min(1, dt * 8);
      });

      // ==================== 5. NPC AI & ROOM-CONFINED COLLISION ====================
      let activeTalkingNpcName: string | null = null;
      npcsRef.current.forEach((npc) => {
        const room = ROOM_CONFIGS.find((r) => r.id === npc.roomId);
        if (!room) return;

        if (npc.state === 'talking') {
          // Maintain gaze toward player while talking
          npc.direction = getCardinalDirection(
            player.x - npc.x,
            player.y - npc.y
          );

          const pages =
            npc.dialoguePages && npc.dialoguePages.length > 0
              ? npc.dialoguePages
              : [npc.dialogue];
          const pageIdx = Math.min(npc.currentPageIndex, pages.length - 1);
          const fullText = pages[pageIdx] || npc.dialogue;

          // Rapid typewriter character progression
          if (npc.typewriterCharCount < fullText.length) {
            const prevChar = Math.floor(npc.typewriterCharCount);
            npc.typewriterCharCount = Math.min(
              fullText.length,
              npc.typewriterCharCount + dt * 40
            );
            if (
              Math.floor(npc.typewriterCharCount) > prevChar &&
              Math.floor(npc.typewriterCharCount) % 4 === 0
            ) {
              soundEngine.playTypewriterBlip();
            }
          }

          activeTalkingNpcName = `${npc.name}: "${fullText.slice(
            0,
            Math.floor(npc.typewriterCharCount)
          )}"`;
          return;
        }

        // Stationary NPCs (진나라 마을 중앙 관리 & 백성1) remain fixed facing each other
        if (npc.isStationary) {
          npc.vx = 0;
          npc.vy = 0;
          // Keep facing each other when not in dialogue
          if (npc.id === 'npc_r2_1') npc.direction = 'right';
          if (npc.id === 'npc_r2_2') npc.direction = 'left';
          return;
        }

        npc.stateTimer -= dt;
        if (npc.stateTimer <= 0) {
          if (npc.state === 'walking' && Math.random() < 0.28) {
            npc.state = 'pausing';
            npc.vx = 0;
            npc.vy = 0;
            npc.stateTimer = 0.8 + Math.random() * 1.2;
          } else {
            npc.state = 'walking';
            npc.stateTimer = 1.8 + Math.random() * 2.8;
            const angle = Math.random() * Math.PI * 2;
            npc.vx = Math.cos(angle) * npc.speed;
            npc.vy = Math.sin(angle) * npc.speed;
            npc.direction = getCardinalDirection(npc.vx, npc.vy);
          }
        }

        if (npc.state === 'walking') {
          const nextX = npc.x + npc.vx * dt;
          const nextY = npc.y + npc.vy * dt;

          // Keep NPC strictly inside its room's innerBounds (with margin so they never enter doors or touch walls)
          const margin = 24;
          const minX = room.innerBounds.x + margin;
          const maxX = room.innerBounds.x + room.innerBounds.width - margin;
          const minY = room.innerBounds.y + margin + 14;
          const maxY = room.innerBounds.y + room.innerBounds.height - margin;

          let collided = false;

          if (nextX < minX || nextX > maxX) {
            npc.vx = -npc.vx;
            collided = true;
          }
          if (nextY < minY || nextY > maxY) {
            npc.vy = -npc.vy;
            collided = true;
          }

          // Check collision with Exhibits inside the same room
          const npcBox: RectBox = {
            x: nextX - 13,
            y: nextY - 13,
            width: 26,
            height: 26,
          };

          for (const ex of exhibitsRef.current) {
            if (ex.roomId !== npc.roomId) continue;
            const exBox: RectBox = {
              x: ex.x - 10,
              y: ex.y - 6,
              width: ex.width + 20,
              height: ex.height + 24,
            };
            if (boxesOverlap(npcBox, exBox)) {
              npc.vx = -npc.vx;
              npc.vy = -npc.vy;
              collided = true;
              break;
            }
          }

          // Check collision with other NPCs in the same room
          for (const other of npcsRef.current) {
            if (other.id === npc.id || other.roomId !== npc.roomId) continue;
            const dist = Math.hypot(nextX - other.x, nextY - other.y);
            if (dist < 32) {
              npc.vx = -npc.vx;
              npc.vy = -npc.vy;
              collided = true;
              break;
            }
          }

          if (!collided) {
            npc.x = nextX;
            npc.y = nextY;
          } else {
            npc.direction = getCardinalDirection(npc.vx, npc.vy);
          }
        }
      });

      // ==================== 6. FIND NEARBY EXHIBIT ====================
      let closestExhibit: ExhibitItem | null = null;
      let minExDist = Infinity;
      for (const ex of exhibitsRef.current) {
        const cx = ex.x + ex.width / 2;
        const cy = ex.y + ex.height / 2;
        const d = Math.hypot(player.x - cx, player.y - cy);
        if (d <= ex.interactRadius && d < minExDist) {
          minExDist = d;
          closestExhibit = ex;
        }
      }

      // ==================== 7. RENDER 2D PIXEL WORLD ====================
      ctx.imageSmoothingEnabled = false;

      // Outer Void Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Subtle outer pixel grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= WORLD_WIDTH; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, WORLD_HEIGHT);
        ctx.stroke();
      }
      for (let gy = 0; gy <= WORLD_HEIGHT; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(WORLD_WIDTH, gy);
        ctx.stroke();
      }

      // ---- 7A. DRAW CENTRAL LONG CORRIDOR (Top to Bottom) ----
      drawCentralCorridor(ctx, elapsedTime, player);

      // ---- 7B. DRAW 4 ROOMS (2x2 Layout with Thematic Environmental Features) ----
      ROOM_CONFIGS.forEach((room) => {
        drawRoomStructure(ctx, room, elapsedTime);
      });

      // ---- 7C. DRAW DOORS ----
      doorsRef.current.forEach((door) => {
        drawPixelDoor(ctx, door);
      });

      // ---- 7D. DRAW EXHIBITS ----
      exhibitsRef.current.forEach((ex) => {
        const isNearby = closestExhibit?.id === ex.id;
        drawPixelExhibit(ctx, ex, elapsedTime, isNearby);
      });

      // ---- 7E. DRAW NPCS & PLAYER (Y-Sorted for 2D Top-Down Depth) ----
      const renderables: Array<
        | { kind: 'npc'; y: number; npc: NPCEntity }
        | { kind: 'player'; y: number }
      > = [
        ...npcsRef.current.map((npc) => ({
          kind: 'npc' as const,
          y: npc.y,
          npc,
        })),
        { kind: 'player' as const, y: player.y },
      ];
      renderables.sort((a, b) => a.y - b.y);

      renderables.forEach((item) => {
        if (item.kind === 'npc') {
          drawPixelNPC(ctx, item.npc, elapsedTime);
        } else {
          drawPixelPlayer(ctx, player, elapsedTime);
        }
      });

      // ---- 7F. DRAW DYNAMIC ROOM LIGHTING & DARKNESS OVERLAYS ----
      ROOM_CONFIGS.forEach((room) => {
        const lightLevel = roomLightsRef.current[room.id];
        drawRoomLightingOverlay(ctx, room, lightLevel, exhibitsRef.current);
      });

      // ---- 7G. DRAW ROOM HEADER LABELS & NPC SPEECH BUBBLES ABOVE LIGHTING ----
      ROOM_CONFIGS.forEach((room) => {
        const lightLevel = roomLightsRef.current[room.id];
        drawRoomCornerBadge(ctx, room, lightLevel);
      });

      const activeTalkingNpc = npcsRef.current.find(
        (n) => n.state === 'talking'
      );
      if (activeTalkingNpc) {
        drawSpeechBubble(ctx, activeTalkingNpc, elapsedTime);
      }

      // Sync React HUD state every ~6 frames
      statusSyncCounter++;
      if (statusSyncCounter % 6 === 0) {
        onStatusChange({
          currentRoom: player.currentRoom,
          wingStyle: player.wingStyle,
          nearbyExhibit: closestExhibit,
          activeTalkingNpc: activeTalkingNpcName,
          roomLightLevels: { ...roomLightsRef.current },
        });
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [isPlayerPositionWalkable, onStatusChange, npcsRef, playerStateRef]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-auto bg-[#070a12] p-2 select-none">
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
        className="transition-transform duration-150 ease-out shadow-[0_0_50px_rgba(0,0,0,0.9)] border-2 border-slate-800 rounded"
      >
        <canvas
          ref={canvasRef}
          width={WORLD_WIDTH}
          height={WORLD_HEIGHT}
          onClick={handleCanvasClick}
          style={{ imageRendering: 'pixelated' }}
          className="block w-[1120px] max-w-[95vw] h-auto cursor-pointer"
        />
      </div>
    </div>
  );
};

// ==================== HELPER RENDERING FUNCTIONS ====================

function boxesOverlap(a: RectBox, b: RectBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function boxInside(inner: RectBox, outer: RectBox): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

function drawRoomStructure(
  ctx: CanvasRenderingContext2D,
  room: typeof ROOM_CONFIGS[number],
  time: number
) {
  const { bounds, innerBounds } = room;
  const tileSize = 24;

  ctx.save();

  // Outer Wall Box
  ctx.fillStyle = room.wallTopColor;
  ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

  // North Wall Face (where wall artworks hang)
  ctx.fillStyle = room.wallFaceColor;
  ctx.fillRect(
    innerBounds.x,
    bounds.y + 16,
    innerBounds.width,
    innerBounds.y - (bounds.y + 16)
  );

  // Baseboard trim along North Wall
  ctx.fillStyle = room.accentColor;
  ctx.fillRect(innerBounds.x, innerBounds.y - 3, innerBounds.width, 3);

  // Thematic Floor Tiles inside innerBounds
  for (
    let fy = innerBounds.y;
    fy < innerBounds.y + innerBounds.height;
    fy += tileSize
  ) {
    for (
      let fx = innerBounds.x;
      fx < innerBounds.x + innerBounds.width;
      fx += tileSize
    ) {
      const isEven =
        (Math.floor((fx - innerBounds.x) / tileSize) +
          Math.floor((fy - innerBounds.y) / tileSize)) %
          2 ===
        0;
      ctx.fillStyle = isEven ? room.floorPrimary : room.floorSecondary;
      const w = Math.min(tileSize, innerBounds.x + innerBounds.width - fx);
      const h = Math.min(tileSize, innerBounds.y + innerBounds.height - fy);
      ctx.fillRect(fx, fy, w, h);
    }
  }

  // Draw Specific Thematic Environmental Details per Room
  drawThematicRoomDecorations(ctx, room, time);

  // Crisp Inner Wall Border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    innerBounds.x,
    innerBounds.y,
    innerBounds.width,
    innerBounds.height
  );

  ctx.restore();
}

/**
 * Draws rich, domain-specific pixel environmental art for each room
 */
function drawThematicRoomDecorations(
  ctx: CanvasRenderingContext2D,
  room: typeof ROOM_CONFIGS[number],
  time: number
) {
  const { innerBounds, id } = room;

  // ==================== ROOM 1: 진시황의 지하궁전 (고대 황릉 미궁) ====================
  if (id === 'room1') {
    // 1. Constellation Starry Gems on the North Wall Ceiling
    const starCoords = [
      [innerBounds.x + 40, innerBounds.y - 30],
      [innerBounds.x + 65, innerBounds.y - 22],
      [innerBounds.x + 85, innerBounds.y - 32],
      [innerBounds.x + 110, innerBounds.y - 25],
      [innerBounds.x + 370, innerBounds.y - 28],
      [innerBounds.x + 400, innerBounds.y - 20],
      [innerBounds.x + 430, innerBounds.y - 32],
      [innerBounds.x + 455, innerBounds.y - 22],
    ];
    starCoords.forEach(([sx, sy], idx) => {
      const sparkle = (Math.sin(time * 4 + idx * 1.5) + 1) * 0.5;
      ctx.fillStyle = sparkle > 0.5 ? '#fef08a' : '#c084fc';
      ctx.fillRect(sx, sy, 3, 3);
      if (sparkle > 0.75) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 1, sy + 1, 1, 1);
      }
    });

    // 2. Imperial Bronze Tripod Cauldrons (동정 銅鼎) with eternal blue flames
    [innerBounds.x + 45, innerBounds.x + innerBounds.width - 55].forEach((bx, idx) => {
      const by = innerBounds.y + 25;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bx, by + 12, 18, 12);
      ctx.fillRect(bx - 2, by + 22, 4, 6);
      ctx.fillRect(bx + 16, by + 22, 4, 6);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(bx + 2, by + 14, 14, 8);
      const flameH = 6 + Math.sin(time * 8 + idx * 3) * 3;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx + 5, by + 8 - flameH, 8, flameH + 4);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(bx + 7, by + 10 - flameH, 4, flameH);
    });

    // 3. Shimmering Mercury River Canal (사마천 사기 고증: 수은 강) in Bottom Right
    const canalX = innerBounds.x + innerBounds.width - 150;
    const canalY = innerBounds.y + innerBounds.height - 90;
    const canalW = 135;
    const canalH = 68;

    ctx.fillStyle = '#2e2633';
    ctx.fillRect(canalX - 4, canalY - 4, canalW + 8, canalH + 8);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1;
    ctx.strokeRect(canalX - 4, canalY - 4, canalW + 8, canalH + 8);

    const riverGrad = ctx.createLinearGradient(canalX, canalY, canalX + canalW, canalY + canalH);
    riverGrad.addColorStop(0, '#94a3b8');
    riverGrad.addColorStop(0.5, '#e2e8f0');
    riverGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(canalX, canalY, canalW, canalH);

    for (let r = 0; r < 5; r++) {
      const rx = canalX + 12 + ((time * 25 + r * 28) % (canalW - 24));
      const ry = canalY + 10 + r * 11;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(rx), ry, 16, 2);
    }

    ctx.font = '600 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#e9d5ff';
    ctx.fillText('~ 수은 강 (水銀河) ~', canalX + 22, canalY - 7);
  }

  // ==================== ROOM 2: 진나라 마을 (고대 야외 둔전 농촌) ====================
  if (id === 'room2') {
    // 1. Tilled Village Farm Plots (채소밭과 보리밭이랑)
    const farmX = innerBounds.x + 35;
    const farmY = innerBounds.y + 35;
    const farmW = 135;
    const farmH = 95;

    ctx.fillStyle = '#854d0e';
    ctx.fillRect(farmX, farmY, farmW, farmH);
    ctx.fillStyle = '#713f12';
    for (let row = farmY + 12; row < farmY + farmH; row += 22) {
      ctx.fillRect(farmX + 4, row, farmW - 8, 12);
      for (let sprout = farmX + 10; sprout < farmX + farmW - 10; sprout += 16) {
        ctx.fillStyle = '#65a30d';
        ctx.fillRect(sprout, row + 2, 4, 4);
        ctx.fillStyle = '#a3e635';
        ctx.fillRect(sprout + 1, row + 1, 2, 2);
        ctx.fillStyle = '#713f12';
      }
    }
    // Wooden split-rail fence
    ctx.fillStyle = '#a16207';
    ctx.fillRect(farmX - 4, farmY - 4, farmW + 8, 3);
    ctx.fillRect(farmX - 4, farmY + farmH + 1, farmW + 8, 3);
    ctx.fillRect(farmX - 4, farmY - 4, 3, farmH + 8);
    ctx.fillRect(farmX + farmW + 1, farmY - 4, 3, farmH + 8);
    for (let px = farmX - 4; px <= farmX + farmW + 1; px += 34) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px - 1, farmY - 7, 4, 7);
      ctx.fillRect(px - 1, farmY + farmH - 1, 4, 7);
    }

    // 2. Ancient Stone Water Well (돌 우물과 두레박)
    const wellX = innerBounds.x + innerBounds.width - 120;
    const wellY = innerBounds.y + 40;
    ctx.fillStyle = '#78716c';
    ctx.fillRect(wellX, wellY, 38, 28);
    ctx.fillStyle = '#57534e';
    ctx.fillRect(wellX + 3, wellY + 3, 32, 22);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(wellX + 6, wellY + 6, 26, 16);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(wellX + 2, wellY - 14, 4, 18);
    ctx.fillRect(wellX + 32, wellY - 14, 4, 18);
    ctx.fillRect(wellX - 2, wellY - 18, 42, 5);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(wellX + 44, wellY + 12, 10, 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(wellX + 46, wellY + 13, 6, 3);

    // 3. Harvested Straw Haystacks & Grain Sacks
    const hayX = innerBounds.x + innerBounds.width - 130;
    const hayY = innerBounds.y + innerBounds.height - 80;
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(hayX + 25, hayY + 25, 24, Math.PI, 0, false);
    ctx.lineTo(hayX + 49, hayY + 45);
    ctx.lineTo(hayX + 1, hayY + 45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(hayX + 8, hayY + 25, 34, 16);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(hayX + 54, hayY + 22, 18, 20);
    ctx.fillRect(hayX + 74, hayY + 26, 16, 16);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(hayX + 60, hayY + 20, 6, 3);
  }

  // ==================== ROOM 3: 병마용갱 (현대 발굴 복원 연구실) ====================
  if (id === 'room3') {
    // 1. Excavation Pit Trenches with Stepped Soil Layers
    const pitX = innerBounds.x + 30;
    const pitY = innerBounds.y + 35;
    const pitW = 145;
    const pitH = 95;

    ctx.fillStyle = '#9a7b56';
    ctx.fillRect(pitX, pitY, pitW, pitH);
    ctx.fillStyle = '#836544';
    ctx.fillRect(pitX + 10, pitY + 10, pitW - 20, pitH - 20);
    ctx.fillStyle = '#6e5337';
    ctx.fillRect(pitX + 22, pitY + 22, pitW - 44, pitH - 44);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pitX + pitW / 2, pitY);
    ctx.lineTo(pitX + pitW / 2, pitY + pitH);
    ctx.moveTo(pitX, pitY + pitH / 2);
    ctx.lineTo(pitX + pitW, pitY + pitH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('T1 갱', pitX + 6, pitY + 18);
    ctx.fillText('T2 갱', pitX + pitW / 2 + 6, pitY + 18);
    ctx.fillText('T3 갱', pitX + 6, pitY + pitH / 2 + 18);

    // 2. Modern Elevated Steel Scaffolding & Catwalk with Hazard Stripes
    const catX = innerBounds.x + innerBounds.width - 150;
    const catY = innerBounds.y + 40;
    const catW = 125;
    const catH = 45;

    ctx.fillStyle = '#475569';
    ctx.fillRect(catX, catY, catW, catH);
    ctx.fillStyle = '#cbd5e1';
    for (let slat = catX + 3; slat < catX + catW - 3; slat += 10) {
      ctx.fillRect(slat, catY + 3, 7, catH - 6);
    }
    for (let hz = catX; hz < catX + catW; hz += 12) {
      ctx.fillStyle = hz % 24 === 0 ? '#facc15' : '#0f172a';
      ctx.fillRect(hz, catY + catH - 3, 12, 3);
    }

    // 3. Archaeological Restoration Workbench in lower corner
    const wbX = innerBounds.x + innerBounds.width - 140;
    const wbY = innerBounds.y + innerBounds.height - 85;
    ctx.fillStyle = '#334155';
    ctx.fillRect(wbX, wbY, 110, 52);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(wbX + 3, wbY + 3, 104, 46);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(wbX + 15, wbY + 12, 10, 16);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(wbX + 12, wbY + 26, 16, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(wbX + 42, wbY + 14, 5, 12);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(wbX + 51, wbY + 14, 5, 12);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(wbX + 60, wbY + 14, 5, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(wbX + 74, wbY + 16, 24, 18);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(wbX + 74, wbY + 16, 24, 18);
  }

  // ==================== ROOM 4: 만리장성 (현대 능선 유적 야외) ====================
  if (id === 'room4') {
    // 1. Mountain Skyline & Stone Crenellations (성벽 총안과 요철) along North Wall
    const crenY = innerBounds.y - 20;
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(innerBounds.x, crenY);
    ctx.lineTo(innerBounds.x + 80, crenY - 14);
    ctx.lineTo(innerBounds.x + 160, crenY);
    ctx.lineTo(innerBounds.x + 280, crenY - 18);
    ctx.lineTo(innerBounds.x + 390, crenY - 8);
    ctx.lineTo(innerBounds.x + innerBounds.width, crenY - 16);
    ctx.lineTo(innerBounds.x + innerBounds.width, crenY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#334155';
    for (let cx = innerBounds.x + 10; cx < innerBounds.x + innerBounds.width - 20; cx += 28) {
      ctx.fillRect(cx, crenY, 18, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 7, crenY + 4, 4, 8);
      ctx.fillStyle = '#334155';
    }

    // 2. Mountain Pine Shrubbery on sides
    [
      [innerBounds.x + 35, innerBounds.y + 40],
      [innerBounds.x + 40, innerBounds.y + 70],
      [innerBounds.x + 35, innerBounds.y + innerBounds.height - 70],
    ].forEach(([tx, ty]) => {
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(tx, ty, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(tx - 3, ty - 3, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(tx - 2, ty - 2, 4, 4);
    });

    // 3. Tourist Observation Viewpoint Railing & Coin-op Binoculars in Upper Right
    const viewX = innerBounds.x + innerBounds.width - 125;
    const viewY = innerBounds.y + 35;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(viewX, viewY + 30);
    ctx.lineTo(viewX + 85, viewY + 30);
    ctx.stroke();
    for (let rx = viewX + 5; rx <= viewX + 80; rx += 25) {
      ctx.beginPath();
      ctx.moveTo(rx, viewY + 30);
      ctx.lineTo(rx, viewY + 46);
      ctx.stroke();
    }
    const binoX = viewX + 42;
    const binoY = viewY + 12;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(binoX, binoY + 8, 5, 20);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(binoX - 4, binoY + 26, 13, 3);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(binoX - 3, binoY + 2, 15, 7);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(binoX + 9, binoY + 3, 3, 5);
  }
}

/**
 * Draws the long vertical Central Corridor separating the Left Wing (Rooms 1 & 2)
 * and Right Wing (Rooms 3 & 4), complete with its own dedicated lighting effects
 * and the avatar transformation boundary line at CORRIDOR_CENTER_X (640).
 */
function drawCentralCorridor(
  ctx: CanvasRenderingContext2D,
  time: number,
  player: PlayerState
) {
  const { outer, inner } = CORRIDOR_BOUNDS;
  const tileSize = 20;

  ctx.save();

  // Corridor North & South End Walls
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(outer.x, outer.y, outer.width, outer.height);

  // Corridor Walkable Floor Tiles (Left side warm ancient stone, Right side bright modern gallery)
  for (let fy = inner.y; fy < inner.y + inner.height; fy += tileSize) {
    for (let fx = inner.x; fx < inner.x + inner.width; fx += tileSize) {
      const isLeftHalf = fx + tileSize / 2 < CORRIDOR_CENTER_X;
      const isEven =
        (Math.floor(fx / tileSize) + Math.floor(fy / tileSize)) % 2 === 0;
      if (isLeftHalf) {
        ctx.fillStyle = isEven ? '#473f3b' : '#3d3632'; // warm ancient stone
      } else {
        ctx.fillStyle = isEven ? '#404c5e' : '#333e4f'; // bright modern stone
      }
      ctx.fillRect(fx, fy, tileSize, tileSize);
    }
  }

  // Dedicated Corridor Lighting Effect:
  // 1. Rhythmic Wall Sconce Spotlights along Left & Right Corridor Walls
  const sconceYs = [105, 225, 345, 495, 615, 735];
  sconceYs.forEach((sy, idx) => {
    const pulse = 0.75 + Math.sin(time * 2.5 + idx * 0.9) * 0.25;

    // Left wall warm amber sconce
    const leftGrad = ctx.createRadialGradient(
      inner.x + 6,
      sy,
      2,
      inner.x + 24,
      sy,
      62 * pulse
    );
    leftGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    leftGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(inner.x, sy - 60, 90, 120);

    // Sconce fixture pixel
    ctx.fillStyle = '#facc15';
    ctx.fillRect(inner.x + 1, sy - 4, 4, 8);

    // Right wall cyber cyan sconce
    const rightGrad = ctx.createRadialGradient(
      inner.x + inner.width - 6,
      sy,
      2,
      inner.x + inner.width - 24,
      sy,
      62 * pulse
    );
    rightGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    rightGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(inner.x + inner.width - 90, sy - 60, 90, 120);

    // Right sconce fixture pixel
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(inner.x + inner.width - 5, sy - 4, 4, 8);
  });

  // 2. Center Dimension Boundary Line (Sprite Transformation Line at x = 640)
  const beamGlow = ctx.createLinearGradient(
    CORRIDOR_CENTER_X - 18,
    0,
    CORRIDOR_CENTER_X + 18,
    0
  );
  beamGlow.addColorStop(0, 'rgba(250, 204, 21, 0)');
  beamGlow.addColorStop(0.45, 'rgba(250, 204, 21, 0.22)');
  beamGlow.addColorStop(0.55, 'rgba(56, 189, 248, 0.22)');
  beamGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = beamGlow;
  ctx.fillRect(CORRIDOR_CENTER_X - 18, inner.y, 36, inner.height);

  // Dashed pixel energy line down the exact center of the corridor
  for (let py = inner.y + 8; py < inner.y + inner.height - 8; py += 16) {
    const shimmer = Math.floor(time * 6 + py * 0.1) % 2 === 0;
    ctx.fillStyle = shimmer ? '#facc15' : '#38bdf8';
    ctx.fillRect(CORRIDOR_CENTER_X - 1, py, 2, 10);
  }

  // 3. Player-Following Lantern Spotlight when inside the Corridor
  if (player.currentRoom === 'corridor') {
    const playerSpot = ctx.createRadialGradient(
      player.x,
      player.y,
      8,
      player.x,
      player.y,
      110
    );
    if (player.wingStyle === 'left_classic') {
      playerSpot.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
      playerSpot.addColorStop(1, 'rgba(254, 240, 138, 0)');
    } else {
      playerSpot.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      playerSpot.addColorStop(1, 'rgba(56, 189, 248, 0)');
    }
    ctx.fillStyle = playerSpot;
    ctx.fillRect(inner.x, inner.y, inner.width, inner.height);
  }

  // Corridor Header & Threshold Labels
  ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('중앙 긴 복도 (CENTRAL CORRIDOR)', CORRIDOR_CENTER_X, 36);

  ctx.font = '600 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#facc15';
  ctx.fillText('◀ 고대 구역', CORRIDOR_CENTER_X - 48, 422);
  ctx.fillStyle = '#34d399';
  ctx.fillText('현대 구역 ▶', CORRIDOR_CENTER_X + 48, 422);

  ctx.restore();
}

/**
 * Draws the smooth 1~2 second room illumination & darkness overlay for each room.
 */
function drawRoomLightingOverlay(
  ctx: CanvasRenderingContext2D,
  room: typeof ROOM_CONFIGS[number],
  lightLevel: number,
  exhibits: ExhibitItem[]
) {
  ctx.save();

  // 1. When room is illuminated (lightLevel > 0), render warm gallery track spotlights on exhibits
  if (lightLevel > 0.02) {
    // Overall room ambient glow
    ctx.fillStyle = room.ambientLightColor;
    ctx.globalAlpha = lightLevel;
    ctx.fillRect(
      room.innerBounds.x,
      room.innerBounds.y,
      room.innerBounds.width,
      room.innerBounds.height
    );

    // Individual exhibit spotlights
    const roomExhibits = exhibits.filter((e) => e.roomId === room.id);
    roomExhibits.forEach((ex) => {
      const cx = ex.x + ex.width / 2;
      const cy = ex.y + ex.height / 2 + 18;
      const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 95);
      grad.addColorStop(0, 'rgba(255, 251, 235, 0.32)');
      grad.addColorStop(0.6, 'rgba(254, 243, 199, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 95, cy - 95, 190, 190);
    });
  }

  // 2. Darkness overlay when player is not in the room (or while room is fading in over 1.5s)
  // Softened darkness (0.38 max) so rooms remain clearly visible, warm, and inviting
  const darknessAlpha = (1 - lightLevel) * 0.38;
  if (darknessAlpha > 0.01) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(15, 23, 42, ${darknessAlpha.toFixed(3)})`;
    ctx.fillRect(
      room.bounds.x,
      room.bounds.y,
      room.bounds.width,
      room.bounds.height
    );
  }

  ctx.restore();
}

/**
 * Draws room number & lighting status badge in the bottom corner of each room.
 */
function drawRoomCornerBadge(
  ctx: CanvasRenderingContext2D,
  room: typeof ROOM_CONFIGS[number],
  lightLevel: number
) {
  ctx.save();
  const bx = room.innerBounds.x + 12;
  const by = room.innerBounds.y + room.innerBounds.height - 32;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
  ctx.fillRect(bx, by, 215, 22);
  ctx.strokeStyle = lightLevel > 0.5 ? room.accentColor : '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, by, 215, 22);

  ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = lightLevel > 0.5 ? '#ffffff' : '#94a3b8';
  ctx.fillText(room.name, bx + 8, by + 15);

  ctx.restore();
}
