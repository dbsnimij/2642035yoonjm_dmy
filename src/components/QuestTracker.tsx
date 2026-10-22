import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { NPCEntity, StrictRoomId } from '../types/metaverse';

interface QuestTrackerProps {
  npcs: NPCEntity[];
  onResetQuests?: () => void;
}

interface RoomGroup {
  id: StrictRoomId;
  name: string;
  era: '고대' | '현대';
  eraColor: string;
}

const ROOM_GROUPS: RoomGroup[] = [
  {
    id: 'room1',
    name: '1. 진시황의 지하궁전',
    era: '고대',
    eraColor: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
  },
  {
    id: 'room2',
    name: '2. 진나라 마을',
    era: '고대',
    eraColor: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
  },
  {
    id: 'room3',
    name: '3. 병마용갱',
    era: '현대',
    eraColor: 'bg-sky-900/60 text-sky-300 border-sky-500/40',
  },
  {
    id: 'room4',
    name: '4. 만리장성',
    era: '현대',
    eraColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40',
  },
];

export const QuestTracker: React.FC<QuestTrackerProps> = ({ npcs, onResetQuests }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  const totalNpcs = npcs.length;
  const talkedNpcs = npcs.filter((n) => n.hasTalked).length;
  const progressPercent =
    totalNpcs > 0 ? Math.round((talkedNpcs / totalNpcs) * 100) : 0;
  const isAllCompleted = totalNpcs > 0 && talkedNpcs === totalNpcs;

  const handleConfirmReset = () => {
    onResetQuests?.();
    setShowConfirmReset(false);
  };

  return (
    <aside
      aria-label="탐방 퀘스트 현황"
      className="absolute top-4 right-4 z-30 w-72 sm:w-80 rounded-xl bg-slate-950/92 backdrop-blur-md border border-slate-700/80 shadow-2xl transition-all duration-200 select-none overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-b border-slate-800/80">
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 cursor-pointer flex-1 select-none"
        >
          <Award
            className={`w-4 h-4 flex-shrink-0 ${
              isAllCompleted ? 'text-amber-400 animate-bounce' : 'text-amber-400/90'
            }`}
          />
          <h2 className="text-xs font-bold tracking-wide text-slate-100 flex items-center gap-1.5 truncate">
            <span>인물 탐방 퀘스트</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
              {talkedNpcs}/{totalNpcs}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {/* Quick Header Reset Button */}
          <button
            type="button"
            title="퀘스트 초기화"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmReset(true);
              setIsExpanded(true);
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>초기화</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? '퀘스트 창 접기' : '퀘스트 창 펼치기'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-3.5 py-2 bg-slate-900/60 border-b border-slate-800/50">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400 font-medium">대화 진행률</span>
          <span className="font-mono font-bold text-amber-300">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isAllCompleted
                ? 'bg-gradient-to-r from-emerald-400 to-amber-300'
                : 'bg-gradient-to-r from-amber-500 to-amber-300'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Expandable NPC Checklist Body */}
      {isExpanded && (
        <div className="max-h-[400px] overflow-y-auto p-3 space-y-3 divide-y divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Confirmation Box for Reset */}
          {showConfirmReset && (
            <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-xs text-rose-100 shadow-inner">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-200">
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>퀘스트를 초기화하시겠습니까?</span>
              </div>
              <p className="text-[11px] text-rose-300/90 mb-2 leading-relaxed">
                모든 인물과의 대화 완료 상태 및 퀴즈 진행 기록이 초기 상태로 되돌아갑니다.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2.5 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-2.5 py-1 text-[11px] font-bold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1 shadow"
                >
                  <RotateCcw className="w-3 h-3" />
                  초기화 실행
                </button>
              </div>
            </div>
          )}

          {isAllCompleted && !showConfirmReset && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <div>
                  <p className="font-bold">탐방 퀘스트 전체 달성!</p>
                  <p className="text-[10px] text-emerald-300/80 mt-0.5">
                    고대와 현대를 아우르는 모든 인물과의 대화를 마쳤습니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>처음부터 다시 탐방하기 (초기화)</span>
              </button>
            </div>
          )}

          {ROOM_GROUPS.map((group) => {
            const groupNpcs = npcs.filter((n) => n.roomId === group.id);
            if (groupNpcs.length === 0) return null;

            return (
              <div key={group.id} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-200">
                    {group.name}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${group.eraColor}`}
                  >
                    {group.era}
                  </span>
                </div>

                <div className="space-y-1">
                  {groupNpcs.map((npc) => (
                    <div
                      key={npc.id}
                      className={`flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors ${
                        npc.hasTalked
                          ? 'bg-emerald-950/40 text-emerald-300/90'
                          : 'bg-slate-900/40 text-slate-300 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {npc.hasTalked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        )}
                        <span
                          className={`truncate font-medium ${
                            npc.hasTalked ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {npc.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                        {npc.role.replace(/ \((고정|유령)\)/, '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Quest Reset Footer Button */}
          <div className="pt-2.5">
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-900/90 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/40 transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>퀘스트 진행도 초기화</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
