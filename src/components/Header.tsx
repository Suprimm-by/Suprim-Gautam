import React from 'react';
import { Sliders, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { haptics } from '../services/haptics';

interface HeaderProps {
  activeSoundName: string | null;
  onPanicStop: () => void;
  onOpenSettings: () => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSoundName,
  onPanicStop,
  onOpenSettings,
  isFrameMode,
  onToggleFrameMode,
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-4 px-4 py-3 bg-[#111317]/95 backdrop-blur-md border-b border-neutral-800/80 sticky top-0 z-30">
      {/* Zone 1: Single Brand Wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-display text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
          <span className="text-[#00FF66]">PRANK</span>FX
        </span>
        <span className="text-[10px] font-mono-nums px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
          PRO
        </span>
      </div>

      {/* Zone 2: Active Sound Status (Unboxed text) */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 truncate">
        {activeSoundName ? (
          <div className="flex items-center gap-2 text-[#00FF66] truncate font-medium">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping shrink-0" />
            <span className="truncate">Playing: {activeSoundName}</span>
          </div>
        ) : (
          <span className="text-neutral-500 text-xs">Ready · Studio Audio Engine</span>
        )}
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Desktop frame preview toggle for testing mobile ergonomics */}
        <button
          onClick={onToggleFrameMode}
          title={isFrameMode ? 'Switch to Full-Width View' : 'Preview Phone Frame'}
          className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 text-xs transition-colors hidden md:flex items-center gap-1.5"
        >
          {isFrameMode ? (
            <>
              <Monitor className="w-3.5 h-3.5" /> Full
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" /> Phone
            </>
          )}
        </button>

        {activeSoundName && (
          <button
            onClick={() => {
              haptics.lightTap();
              onPanicStop();
            }}
            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-rose-600/30 transition-transform active:scale-95"
          >
            <VolumeX className="w-3.5 h-3.5" />
            MUTE
          </button>
        )}

        <button
          onClick={() => {
            haptics.lightTap();
            onOpenSettings();
          }}
          title="Audio Tuning & Pitch"
          className="p-2 rounded-xl text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 transition-colors"
        >
          <Sliders className="w-4 h-4 text-[#00FF66]" />
        </button>
      </div>
    </header>
  );
};
