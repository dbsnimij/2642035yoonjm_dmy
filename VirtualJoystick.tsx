import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Compass } from 'lucide-react';

interface VirtualJoystickProps {
  onVectorChange: (vx: number, vy: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onVectorChange,
}) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const MAX_RADIUS = 38;

  const updateFromClientXY = useCallback(
    (clientX: number, clientY: number) => {
      if (!baseRef.current) return;
      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        setKnobPos({ x: 0, y: 0 });
        onVectorChange(0, 0);
        return;
      }

      const clampedDist = Math.min(dist, MAX_RADIUS);
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * clampedDist;
      const ky = Math.sin(angle) * clampedDist;

      setKnobPos({ x: kx, y: ky });

      // Normalized vector (-1 to 1)
      const normX = kx / MAX_RADIUS;
      const normY = ky / MAX_RADIUS;
      onVectorChange(normX, normY);
    },
    [onVectorChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFromClientXY(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    updateFromClientXY(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onVectorChange(0, 0);
  };

  useEffect(() => {
    const handleWindowBlur = () => {
      setIsDragging(false);
      setKnobPos({ x: 0, y: 0 });
      onVectorChange(0, 0);
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [onVectorChange]);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="mb-1.5 flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/90 border border-slate-700/80 rounded text-[11px] font-medium text-slate-300 shadow-md">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span className="whitespace-nowrap">조이스틱 이동 · WASD</span>
      </div>

      {/* Pixel-Styled Joystick Base */}
      <div
        ref={baseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-28 h-28 rounded-full bg-slate-900/90 border-2 border-amber-500/70 shadow-[0_0_24px_rgba(0,0,0,0.75)] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        aria-label="캐릭터 이동 조이스틱"
      >
        {/* Crosshair directional guides */}
        <div className="absolute inset-3 rounded-full border border-slate-700/70 pointer-events-none" />
        <div className="absolute w-full h-[1px] bg-slate-700/60 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-slate-700/60 pointer-events-none" />

        {/* Cardinal Labels */}
        <span className="absolute top-1.5 text-[9px] font-mono text-slate-400 pointer-events-none">
          N
        </span>
        <span className="absolute bottom-1.5 text-[9px] font-mono text-slate-400 pointer-events-none">
          S
        </span>
        <span className="absolute left-2 text-[9px] font-mono text-slate-400 pointer-events-none">
          W
        </span>
        <span className="absolute right-2 text-[9px] font-mono text-slate-400 pointer-events-none">
          E
        </span>

        {/* Draggable Stick Knob */}
        <div
          style={{
            transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
          }}
          className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-shadow pointer-events-none ${
            isDragging
              ? 'bg-amber-400 border-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.8)]'
              : 'bg-slate-800 border-amber-400/90 shadow-md'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-sm ${
              isDragging ? 'bg-slate-950' : 'bg-amber-400'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
