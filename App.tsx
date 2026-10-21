import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Eye,
  BookOpen,
  HelpCircle,
  X,
  Sparkles,
  Edit3,
  RotateCcw,
  Check,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import {
  INITIAL_EXHIBITS,
  INITIAL_NPCS,
  ROOM_CONFIGS,
} from './exhibitionData';
import {
  ExhibitItem,
  NPCEntity,
  PlayerState,
  RoomId,
  StrictRoomId,
} from './types/metaverse';
import { MetaverseCanvas } from './components/MetaverseCanvas';
import { VirtualJoystick } from './components/VirtualJoystick';
import { ExhibitModal } from './components/ExhibitModal';
import { QuestTracker } from './components/QuestTracker';
import { soundEngine } from './utils/soundEngine';

const EXHIBITS_STORAGE_KEY = 'pixelverse_exhibits_v3';
const ADMIN_PASSWORD_STORAGE_KEY = 'pixelverse_admin_pwd_v1';

function getStoredAdminPassword(): string {
  try {
    return localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) || '1234';
  } catch {
    return '1234';
  }
}

function saveAdminPassword(pwd: string) {
  try {
    localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, pwd);
  } catch (err) {
    console.error('Failed to save admin password:', err);
  }
}

function loadSavedExhibits(): ExhibitItem[] {
  try {
    const raw = localStorage.getItem(EXHIBITS_STORAGE_KEY);
    if (!raw) return INITIAL_EXHIBITS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return INITIAL_EXHIBITS.map((initialItem) => {
        const savedItem = parsed.find((p: any) => p && p.id === initialItem.id);
        if (!savedItem) return initialItem;
        const isCustomImage =
          savedItem.imageUrl &&
          (savedItem.imageUrl.startsWith('data:') || savedItem.imageUrl.startsWith('http'));
        return {
          ...initialItem,
          ...savedItem,
          imageUrl: isCustomImage ? savedItem.imageUrl : initialItem.imageUrl,
          textContent: savedItem.textContent || initialItem.textContent,
        };
      });
    }
  } catch (err) {
    console.error('Failed to load exhibits from localStorage:', err);
  }
  return INITIAL_EXHIBITS;
}

function saveExhibitsToStorage(items: ExhibitItem[]) {
  try {
    localStorage.setItem(EXHIBITS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn(
      'LocalStorage save attempt failed, stripping large data URLs and retrying:',
      err
    );
    try {
      const sanitized = items.map((item) => {
        if (
          item.imageUrl &&
          item.imageUrl.startsWith('data:') &&
          item.imageUrl.length > 50000
        ) {
          const { imageUrl, ...rest } = item;
          return rest;
        }
        return item;
      });
      localStorage.setItem(EXHIBITS_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (fallbackErr) {
      console.error(
        'Failed to save exhibits to localStorage fallback:',
        fallbackErr
      );
    }
  }
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom & Fullscreen states
  const [zoom, setZoom] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);

  // Exhibits state persisted with localStorage for continuous edits
  const [exhibits, setExhibits] = useState<ExhibitItem[]>(loadSavedExhibits);
  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitItem | null>(
    null
  );
  const [modalStartInEdit, setModalStartInEdit] = useState<boolean>(false);
  const [openedFromCatalog, setOpenedFromCatalog] = useState<boolean>(false);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Inline Catalog editing state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState<string>('');
  const [inlineArtist, setInlineArtist] = useState<string>('');
  const [inlineDescription, setInlineDescription] = useState<string>('');
  const [catalogToast, setCatalogToast] = useState<string | null>(null);
  const [questToast, setQuestToast] = useState<string | null>(null);

  // Admin password & authorization state (관리자만 수정 가능하도록 숨김처리)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  // Mutable refs for 60fps simulation entities
  const npcsRef = useRef<NPCEntity[]>(
    INITIAL_NPCS.map((npc) => ({ ...npc }))
  );

  // State to trigger reactive QuestTracker re-renders
  const [questNpcs, setQuestNpcs] = useState<NPCEntity[]>(
    INITIAL_NPCS.map((npc) => ({ ...npc }))
  );

  const playerStateRef = useRef<PlayerState>({
    x: 280,
    y: 260,
    vx: 0,
    vy: 0,
    speed: 145,
    direction: 'down',
    isMoving: false,
    wingStyle: 'left_classic',
    currentRoom: 'room1',
    animTime: 0,
    transformFlashTimer: 0,
  });

  // Joystick input vector
  const [joystickVector, setJoystickVector] = useState<{
    vx: number;
    vy: number;
  }>({ vx: 0, vy: 0 });

  // Live HUD status synced from canvas loop
  const [hudStatus, setHudStatus] = useState<{
    currentRoom: RoomId;
    wingStyle: 'left_classic' | 'right_cyber';
    nearbyExhibit: ExhibitItem | null;
    activeTalkingNpc: string | null;
    roomLightLevels: Record<StrictRoomId, number>;
  }>({
    currentRoom: 'room1',
    wingStyle: 'left_classic',
    nearbyExhibit: null,
    activeTalkingNpc: null,
    roomLightLevels: {
      room1: 1,
      room2: 0,
      room3: 0,
      room4: 0,
    },
  });

  const handleJoystickChange = useCallback((vx: number, vy: number) => {
    setJoystickVector({ vx, vy });
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.6, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.65, Number((prev - 0.15).toFixed(2))));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  const handleToggleBgm = () => {
    const playing = soundEngine.toggleBgm();
    setIsBgmPlaying(playing);
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      // Fallback toggle if browser iframe policy restricts native fullscreen
      setIsFullscreen((prev) => !prev);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Spacebar shortcut to open nearby exhibit
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName
        )
      ) {
        return;
      }
      if (e.key === ' ' && hudStatus.nearbyExhibit && !selectedExhibit) {
        e.preventDefault();
        soundEngine.playExhibitOpen();
        setSelectedExhibit(hudStatus.nearbyExhibit);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hudStatus.nearbyExhibit, selectedExhibit]);

  const handleUpdateExhibit = (updated: ExhibitItem) => {
    const itemWithTime: ExhibitItem = updated.lastModified
      ? updated
      : {
          ...updated,
          lastModified: `${new Date().getFullYear()}. ${(new Date().getMonth() + 1)
            .toString()
            .padStart(2, '0')}. ${new Date()
            .getDate()
            .toString()
            .padStart(2, '0')}. ${new Date()
            .getHours()
            .toString()
            .padStart(2, '0')}:${new Date()
            .getMinutes()
            .toString()
            .padStart(2, '0')}`,
        };
    setExhibits((prev) => {
      const next = prev.map((item) =>
        item.id === itemWithTime.id ? itemWithTime : item
      );
      saveExhibitsToStorage(next);
      return next;
    });
    setSelectedExhibit(itemWithTime);
  };

  const handleResetExhibits = () => {
    if (
      window.confirm(
        '모든 전시물을 초기 설정(사마천 사기 고증 및 기본 전시물)으로 되돌리시겠습니까?'
      )
    ) {
      try {
        localStorage.removeItem(EXHIBITS_STORAGE_KEY);
      } catch (err) {
        console.error(err);
      }
      const resetList = INITIAL_EXHIBITS.map((ex) => ({ ...ex }));
      setExhibits(resetList);
      saveExhibitsToStorage(resetList);
      setSelectedExhibit(null);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPwd = getStoredAdminPassword();
    if (adminPasswordInput.trim() === storedPwd) {
      setIsAdmin(true);
      setShowAdminLoginModal(false);
      setAdminPasswordInput('');
      setAdminLoginError(null);
      setCatalogToast('👑 관리자 인증 완료: 전시 도록 수정 권한이 활성화되었습니다.');
      setTimeout(() => setCatalogToast(null), 3500);
    } else {
      setAdminLoginError('비밀번호가 올바르지 않습니다. 다시 확인해주세요.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setInlineEditingId(null);
    setCatalogToast('관리자 모드가 해제되어 감상 전용 모드로 전환되었습니다.');
    setTimeout(() => setCatalogToast(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPwd = getStoredAdminPassword();
    if (currentPasswordInput.trim() !== storedPwd) {
      setChangePasswordError('현재 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 2) {
      setChangePasswordError('새 비밀번호를 2자 이상 입력해주세요.');
      return;
    }
    if (newPasswordInput.trim() !== newPasswordConfirm.trim()) {
      setChangePasswordError('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    saveAdminPassword(newPasswordInput.trim());
    setShowChangePasswordModal(false);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setNewPasswordConfirm('');
    setChangePasswordError(null);
    setCatalogToast('관리자 비밀번호가 성공적으로 변경되었습니다!');
    setTimeout(() => setCatalogToast(null), 3500);
  };

  const handleTeleportToRoom = (roomId: StrictRoomId) => {
    const room = ROOM_CONFIGS.find((r) => r.id === roomId);
    if (!room) return;
    const centerX = room.innerBounds.x + room.innerBounds.width / 2;
    const centerY = room.innerBounds.y + room.innerBounds.height / 2;
    playerStateRef.current.x = centerX;
    playerStateRef.current.y = centerY;
    playerStateRef.current.vx = 0;
    playerStateRef.current.vy = 0;
    soundEngine.playFootstep();
  };

  const handleStatusChange = useCallback(
    (status: {
      currentRoom: RoomId;
      wingStyle: 'left_classic' | 'right_cyber';
      nearbyExhibit: ExhibitItem | null;
      activeTalkingNpc: string | null;
      roomLightLevels: Record<StrictRoomId, number>;
    }) => {
      setHudStatus(status);
      soundEngine.setWingMode(status.wingStyle);

      // Check if quest talked states need sync
      setQuestNpcs((prev) => {
        let changed = false;
        const currentList = npcsRef.current;
        for (let i = 0; i < currentList.length; i++) {
          if (prev[i]?.hasTalked !== currentList[i]?.hasTalked) {
            changed = true;
            break;
          }
        }
        return changed ? currentList.map((n) => ({ ...n })) : prev;
      });
    },
    []
  );

  const handleResetQuests = () => {
    // 1. Reset all NPC talking & quest states
    npcsRef.current.forEach((npc) => {
      npc.hasTalked = false;
      npc.state = 'pausing';
      npc.talkTimer = 0;
      npc.currentPageIndex = 0;
      npc.typewriterCharCount = 0;
      if (npc.quiz) {
        npc.quiz.selectedChoiceIndex = null;
      }
    });

    // 2. Trigger reactive QuestTracker state update
    setQuestNpcs(npcsRef.current.map((n) => ({ ...n })));

    // 3. Reset active talking NPC in hudStatus
    setHudStatus((prev) => ({
      ...prev,
      activeTalkingNpc: null,
    }));

    // 4. Show confirmation Toast
    setQuestToast('📜 인물 탐방 퀘스트가 초기화되었습니다! 인물들과 새로운 대화를 시작해보세요.');
    setTimeout(() => {
      setQuestToast(null);
    }, 3500);
  };

  const currentRoomLabel =
    hudStatus.currentRoom === 'corridor'
      ? '중앙 긴 복도 (경계선)'
      : ROOM_CONFIGS.find((r) => r.id === hudStatus.currentRoom)?.name ||
        '전시실';

  const currentLightPercent =
    hudStatus.currentRoom === 'corridor'
      ? 100
      : Math.round(
          (hudStatus.roomLightLevels[hudStatus.currentRoom as StrictRoomId] ||
            0) * 100
        );

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-screen h-screen overflow-hidden bg-[#070a12] text-slate-100 font-sans"
    >
      {/* Top bar removed per user request to maximize screen visibility */}

      {/* ==================== MAIN 2D METAVERSE VIEWPORT ==================== */}
      <main className="relative flex-1 overflow-hidden">
        <MetaverseCanvas
          zoom={zoom}
          joystickVector={joystickVector}
          exhibits={exhibits}
          npcsRef={npcsRef}
          playerStateRef={playerStateRef}
          onSelectExhibit={(ex) => setSelectedExhibit(ex)}
          onStatusChange={handleStatusChange}
        />

        {/* Quest Tracker Window in Top-Right Corner */}
        <QuestTracker npcs={questNpcs} onResetQuests={handleResetQuests} />

        {/* Quest Notification Toast Banner */}
        {questToast && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/60 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md pointer-events-none transition-all">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>{questToast}</span>
          </div>
        )}

        {/* Floating Proximity Action Prompt when near an Exhibit */}
        {hudStatus.nearbyExhibit && (
          <div className="absolute top-4 left-6 z-20 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-950/95 border-2 border-amber-400/90 shadow-2xl">
            <div className="text-xs">
              <span className="text-slate-400 mr-2">인접 전시물:</span>
              <span className="font-semibold text-white">
                {hudStatus.nearbyExhibit.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (hudStatus.nearbyExhibit) {
                  soundEngine.playExhibitOpen();
                  setSelectedExhibit(hudStatus.nearbyExhibit);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-amber-400 hover:bg-amber-300 text-slate-950 whitespace-nowrap cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>상세 감상 (Space / 클릭)</span>
            </button>
          </div>
        )}

        {/* Interactive Virtual Joystick (Bottom-Right above Bottom Menu Bar) */}
        <div className="absolute bottom-5 right-6 z-10">
          <VirtualJoystick onVectorChange={handleJoystickChange} />
        </div>
      </main>

      {/* ==================== BOTTOM MENU BAR ==================== */}
      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-950 border-t border-slate-800 shrink-0 z-20">
        {/* Left: Unboxed Spatial & Lighting Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-white">{currentRoomLabel}</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              플레이어: <strong className="text-white font-bold">나</strong>
              <span className="text-slate-400 ml-1.5 text-[11px]">
                ({hudStatus.wingStyle === 'left_classic'
                  ? '고대 구역 탐방'
                  : '현대 구역 탐방'})
              </span>
            </span>
          </span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="font-mono tabular-nums text-slate-400">
            조명 밝기: {currentLightPercent}%
          </span>
        </div>

        {/* Right: Zoom Controls, BGM Toggle, Exhibition Catalog, Fullscreen Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded overflow-hidden">
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="화면 축소"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-mono text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors border-x border-slate-700 cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="화면 확대"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* BGM Toggle Button */}
          <button
            type="button"
            onClick={handleToggleBgm}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-colors whitespace-nowrap cursor-pointer ${
              isBgmPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isBgmPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>배경음악 끄기</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>배경음악 켜기</span>
              </>
            )}
          </button>

          {/* Fullscreen Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? '전체 화면 해제' : '전체 화면 모드'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">전체화면 해제</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">전체화면</span>
              </>
            )}
          </button>

          {/* Exhibition Catalog Button */}
          <button
            type="button"
            onClick={() => setShowCatalogModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">전시 도록</span>
            {isAdmin ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold ml-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden md:inline">관리자</span>
              </span>
            ) : (
              <span className="flex items-center text-[10px] text-slate-400 ml-0.5" title="감상 전용 모드">
                <Lock className="w-2.5 h-2.5" />
              </span>
            )}
          </button>

          {/* Guide Modal Button */}
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">이용 안내</span>
          </button>
        </div>
      </footer>

      {/* ==================== EXHIBIT DETAIL & CURATOR EDIT MODAL ==================== */}
      <ExhibitModal
        exhibit={selectedExhibit}
        onClose={() => {
          setSelectedExhibit(null);
          if (openedFromCatalog) {
            setShowCatalogModal(true);
            setOpenedFromCatalog(false);
          }
        }}
        onUpdateExhibit={handleUpdateExhibit}
        startInEditMode={modalStartInEdit}
        isFromCatalog={openedFromCatalog}
        isAdmin={isAdmin}
      />

      {/* ==================== EXHIBITION CATALOG MODAL ==================== */}
      {showCatalogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => {
            setShowCatalogModal(false);
            setInlineEditingId(null);
          }}
        >
          <div
            className="w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-lg bg-slate-900 border-2 border-slate-700 p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">
                    전시관 전체 도록 {isAdmin ? '및 관리' : ''} (총 12점)
                  </h2>
                  {isAdmin ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>관리자 모드 활성화됨</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>감상 전용 모드</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isAdmin
                    ? '관리자 인증이 완료되었습니다. 각 방의 전시물을 클릭하여 감상하거나, [수정]으로 명칭·출처·내용을 변경하여 도록에 영구 저장할 수 있습니다.'
                    : '전시관의 12점 전시물을 자유롭게 감상할 수 있습니다. (전시물 수정 및 도록 편집은 관리자 인증 후 제공됩니다)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPasswordInput('');
                        setNewPasswordInput('');
                        setNewPasswordConfirm('');
                        setChangePasswordError(null);
                        setShowChangePasswordModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                      title="관리자 비밀번호 변경"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">비밀번호 변경</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetExhibits}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                      title="모든 전시물을 초기 고증 데이터로 복원"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">기본값 복원</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                      title="관리자 모드 해제"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPasswordInput('');
                      setAdminLoginError(null);
                      setShowAdminLoginModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow"
                    title="관리자 비밀번호를 입력하고 도록 수정 권한 얻기"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>관리자 로그인</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowCatalogModal(false);
                    setInlineEditingId(null);
                  }}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {catalogToast && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded bg-emerald-600/90 text-white text-xs font-medium border border-emerald-400">
                <Check className="w-4 h-4 text-emerald-200" />
                <span>{catalogToast}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ROOM_CONFIGS.map((room) => {
                const roomExhibits = exhibits.filter(
                  (e) => e.roomId === room.id
                );
                return (
                  <div
                    key={room.id}
                    className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-sm font-bold text-white">
                        {room.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          handleTeleportToRoom(room.id);
                          setShowCatalogModal(false);
                          setInlineEditingId(null);
                        }}
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        이 방으로 이동 →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {roomExhibits.map((ex) => {
                        const isEditingThis = isAdmin && inlineEditingId === ex.id;
                        return (
                          <div
                            key={ex.id}
                            className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2.5 transition-all"
                          >
                            {isEditingThis ? (
                              <div className="space-y-3 bg-slate-950/80 p-3 rounded border border-amber-500/50">
                                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold border-b border-slate-800 pb-1.5">
                                  <span>전시물 빠른 수정 및 도록 저장</span>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                    명칭 (제목)
                                  </label>
                                  <input
                                    type="text"
                                    value={inlineTitle}
                                    onChange={(e) => setInlineTitle(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                                    placeholder="전시물 명칭 입력..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                    출처 및 기록자
                                  </label>
                                  <input
                                    type="text"
                                    value={inlineArtist}
                                    onChange={(e) => setInlineArtist(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                                    placeholder="출처 또는 인물 입력..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                    상세 설명 (본문)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={inlineDescription}
                                    onChange={(e) => setInlineDescription(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                                    placeholder="상세 설명 입력..."
                                  />
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModalStartInEdit(true);
                                      setOpenedFromCatalog(true);
                                      setSelectedExhibit(ex);
                                      setShowCatalogModal(false);
                                      setInlineEditingId(null);
                                    }}
                                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                                  >
                                    이미지/영상 파일 교체 →
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setInlineEditingId(null)}
                                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                    >
                                      취소
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const now = new Date();
                                        const formattedDate = `${now.getFullYear()}. ${(now.getMonth() + 1).toString().padStart(2, '0')}. ${now.getDate().toString().padStart(2, '0')}. ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                                        const updatedTextContent = ex.textContent
                                          ? {
                                              ...ex.textContent,
                                              paragraphs: inlineDescription
                                                .split(/\n+/)
                                                .map((p) => p.trim())
                                                .filter(Boolean),
                                            }
                                          : undefined;
                                        const updated: ExhibitItem = {
                                          ...ex,
                                          title: inlineTitle.trim() || ex.title,
                                          artist: inlineArtist.trim(),
                                          description: inlineDescription.trim() || ex.description,
                                          textContent: updatedTextContent || ex.textContent,
                                          isCustomized: true,
                                          lastModified: formattedDate,
                                        };
                                        handleUpdateExhibit(updated);
                                        setInlineEditingId(null);
                                        setCatalogToast(`'${updated.title}' 수정 내용이 전시 도록에 안전하게 저장되었습니다!`);
                                        setTimeout(() => setCatalogToast(null), 3500);
                                      }}
                                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>저장</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex flex-wrap items-baseline gap-2">
                                      <span className="text-xs font-semibold text-slate-100">
                                        {ex.title}
                                      </span>
                                      {ex.lastModified && (
                                        <span className="text-[10px] text-slate-500 font-normal">
                                          {ex.lastModified}
                                        </span>
                                      )}
                                    </div>
                                    {ex.artist && (
                                      <div className="text-[11px] text-slate-400 mt-0.5">
                                        {ex.artist}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenedFromCatalog(true);
                                        setModalStartInEdit(false);
                                        setSelectedExhibit(ex);
                                        setShowCatalogModal(false);
                                      }}
                                      className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
                                    >
                                      감상
                                    </button>
                                    {isAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInlineEditingId(ex.id);
                                          setInlineTitle(ex.title);
                                          setInlineArtist(ex.artist || '');
                                          setInlineDescription(ex.description);
                                        }}
                                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer transition-colors"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>수정</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                                  {ex.description}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADMIN PASSWORD LOGIN MODAL ==================== */}
      {showAdminLoginModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setShowAdminLoginModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-slate-900 border-2 border-amber-500/60 p-6 space-y-4 shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  전시 도록 관리자 인증
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminLoginModal(false)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              전시 도록 수정 권한을 활성화하려면 관리자 비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  관리자 비밀번호
                </label>
                <input
                  type="password"
                  autoFocus
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminLoginError(null);
                  }}
                  placeholder="비밀번호 입력..."
                  className="w-full px-3 py-2 text-sm rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                />
                {adminLoginError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-medium">
                    {adminLoginError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(false)}
                  className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>인증 및 권한 활성화</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADMIN CHANGE PASSWORD MODAL ==================== */}
      {showChangePasswordModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setShowChangePasswordModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-slate-900 border-2 border-slate-700 p-6 space-y-4 shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  관리자 비밀번호 변경
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => {
                    setCurrentPasswordInput(e.target.value);
                    setChangePasswordError(null);
                  }}
                  placeholder="현재 비밀번호 입력..."
                  className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => {
                    setNewPasswordInput(e.target.value);
                    setChangePasswordError(null);
                  }}
                  placeholder="새 비밀번호 (2자 이상)..."
                  className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => {
                    setNewPasswordConfirm(e.target.value);
                    setChangePasswordError(null);
                  }}
                  placeholder="새 비밀번호 다시 입력..."
                  className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              {changePasswordError && (
                <p className="text-xs text-rose-400 font-medium">
                  {changePasswordError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow"
                >
                  변경 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VISITOR GUIDE MODAL ==================== */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-lg bg-slate-900 border-2 border-slate-700 p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">
                PixelVerse 2D 메타버스 전시관 이용 안내
              </h2>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-amber-300">
                  1. 2×2 전시실과 실제 출입문 이동:
                </strong>{' '}
                좌측 상단(1번 방), 좌측 하단(2번 방), 우측 상단(3번 방), 우측 하단(4번 방)으로 구성되어 있으며, 각 방의 출입문을 통해 캐릭터가 실제로 통과하여 이동할 수 있습니다.
              </p>
              <p>
                <strong className="text-amber-300">
                  2. 중앙 긴 복도와 캐릭터 스프라이트 변환:
                </strong>{' '}
                좌측 두 방(고대)과 우측 두 방(현대) 사이의 중앙 복도를 통과해 우측 영역으로 넘어가면 아바타가{' '}
                <span className="text-emerald-400 font-semibold">
                  초록색 야구잠바와 하얀색 긴 스커트를 입은 현대 여학생
                </span>
                의 모습으로 자동 변경되며, 다시 좌측으로 돌아오면 원래의{' '}
                <span className="text-amber-300 font-semibold">
                  고대 탐방객 디자인
                </span>
                으로 복원됩니다.
              </p>
              <p>
                <strong className="text-amber-300">
                  3. 방 입장 시 부드러운 조명 연출 (1~2초):
                </strong>{' '}
                관람객이 들어간 방은 어두운 상태에서 약 1.5초에 걸쳐 부드럽게 조명이 켜지며, 이전 방은 다시 어두워집니다. 중앙 복도에는 별도의 벽면 스콘스 및 경계선 조명이 작동합니다.
              </p>
              <p>
                <strong className="text-amber-300">
                  4. 각 방 3명의 NPC와 대화 말풍선:
                </strong>{' '}
                각 방마다 3명의 NPC가 방 내부에서만 벽과 전시물을 피해 천천히 걸어 다닙니다. 마우스로 NPC를 클릭하면 즉시 멈춰 서서 플레이어를 바라보며 말풍선으로 대사를 보여준 뒤, 일정 시간 후 다시 이동합니다.
              </p>
              <p>
                <strong className="text-amber-300">
                  5. 멀티미디어 전시물 (이미지 · 텍스트 · 영상):
                </strong>{' '}
                벽면과 중앙 단상의 전시물을 클릭하면 고해상도 이미지, 텍스트 아카이브, 실시간 영상을 감상할 수 있으며 직접 새로운 콘텐츠로 편집·배치할 수도 있습니다.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer"
              >
                확인 및 관람 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
