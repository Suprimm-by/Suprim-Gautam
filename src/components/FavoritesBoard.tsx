import React from 'react';
import { Star, Play, Square, Plus, VolumeX, ShieldAlert } from 'lucide-react';
import { SoundItem } from '../types';
import { SOUND_LIBRARY } from '../data/soundLibrary';
import { haptics } from '../services/haptics';

interface FavoritesBoardProps {
  favoriteIds: string[];
  activeSoundId: string | null;
  onPlay: (sound: SoundItem) => void;
  onStop: () => void;
  onSelectSlotSound: (slotIndex: number, soundId: string) => void;
  onRemoveFavorite: (soundId: string) => void;
}

export const FavoritesBoard: React.FC<FavoritesBoardProps> = ({
  favoriteIds,
  activeSoundId,
  onPlay,
  onStop,
  onSelectSlotSound,
  onRemoveFavorite,
}) => {
  // Ensure 4 slots
  const slots: (SoundItem | null)[] = [0, 1, 2, 3].map((index) => {
    const id = favoriteIds[index];
    if (!id) return null;
    return SOUND_LIBRARY.find((s) => s.id === id) || null;
  });

  return (
    <div className="w-full flex flex-col gap-4 pb-20">
      {/* Top Description */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            Quick Action Soundboard
          </h2>
          <p className="text-xs text-neutral-400">
            Top 4 instant-fire prank buttons for rapid 1-tap deployment.
          </p>
        </div>

        {activeSoundId && (
          <button
            onClick={() => {
              haptics.lightTap();
              onStop();
            }}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/30 animate-pulse"
          >
            <VolumeX className="w-4 h-4" />
            PANIC MUTE
          </button>
        )}
      </div>

      {/* 2x2 Big Button Grid */}
      <div className="grid grid-cols-2 gap-3">
        {slots.map((sound, slotIdx) => {
          if (!sound) {
            return (
              <div
                key={slotIdx}
                className="h-36 p-4 rounded-3xl border-2 border-dashed border-neutral-800 bg-[#16181E] flex flex-col items-center justify-center text-center gap-2 group hover:border-neutral-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-500 group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-neutral-400">
                  Slot #{slotIdx + 1} Empty
                </div>
                <select
                  onChange={(e) => onSelectSlotSound(slotIdx, e.target.value)}
                  defaultValue=""
                  className="mt-1 text-[11px] p-1.5 bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg focus:outline-none"
                >
                  <option value="" disabled>
                    Assign Sound...
                  </option>
                  {SOUND_LIBRARY.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          const isPlaying = activeSoundId === sound.id;

          return (
            <div
              key={slotIdx}
              onClick={() => {
                if (isPlaying) {
                  haptics.lightTap();
                  onStop();
                } else {
                  if (sound.hapticPattern) haptics.vibrate(sound.hapticPattern);
                  onPlay(sound);
                }
              }}
              className={`relative h-36 p-4 rounded-3xl border cursor-pointer select-none flex flex-col justify-between transition-all duration-200 active:scale-95 shadow-md ${
                isPlaying
                  ? 'bg-neutral-900 border-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.3)] scale-[1.02]'
                  : 'bg-[#181B22] border-neutral-800 hover:border-neutral-700 hover:bg-[#1F232D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-nums font-bold text-neutral-500">
                  SLOT #{slotIdx + 1}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.lightTap();
                    onRemoveFavorite(sound.id);
                  }}
                  title="Remove from board"
                  className="text-neutral-500 hover:text-rose-400 text-xs p-1 rounded-md"
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="font-bold text-base text-white tracking-tight leading-tight">
                  {sound.name}
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono-nums">
                  {sound.categoryName}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isPlaying ? 'text-[#00FF66]' : 'text-neutral-400'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" /> PLAYING
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> 1-TAP FIRE
                    </>
                  )}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono-nums">
                  {(sound.durationMs / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Swap Hint */}
      <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
        <span>To change favorites, click the ★ star icon on any sound in the Sounds tab.</span>
      </div>
    </div>
  );
};
