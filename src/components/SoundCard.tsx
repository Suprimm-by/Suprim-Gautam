import React from 'react';
import {
  Wind,
  Zap,
  Bomb,
  Flame,
  Scissors,
  Megaphone,
  Sparkles,
  Bell,
  Hand,
  Skull,
  Ghost,
  Dog,
  Cat,
  Bug,
  Siren,
  Car,
  ZapOff,
  Activity,
  Volume2,
  Star,
  Play,
  Square,
  Repeat,
  Clock,
} from 'lucide-react';
import { SoundItem } from '../types';
import { haptics } from '../services/haptics';

interface SoundCardProps {
  sound: SoundItem;
  isPlaying: boolean;
  isFavorite: boolean;
  pitch: number;
  isLoop: boolean;
  onPlay: (sound: SoundItem) => void;
  onStop: () => void;
  onToggleFavorite: (soundId: string) => void;
  onQuickArmTimer: (sound: SoundItem) => void;
  onOpenSimulator?: (soundId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wind,
  Zap,
  Bomb,
  Flame,
  Scissors,
  Megaphone,
  Sparkles,
  Bell,
  Hand,
  Skull,
  Ghost,
  Dog,
  Cat,
  Bug,
  Siren,
  Car,
  ZapOff,
  Activity,
  Volume2,
};

export const SoundCard: React.FC<SoundCardProps> = ({
  sound,
  isPlaying,
  isFavorite,
  pitch,
  isLoop,
  onPlay,
  onStop,
  onToggleFavorite,
  onQuickArmTimer,
  onOpenSimulator,
}) => {
  const IconComponent = ICON_MAP[sound.iconName] || Volume2;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      haptics.lightTap();
      onStop();
    } else {
      if (sound.hapticPattern) {
        haptics.vibrate(sound.hapticPattern);
      } else {
        haptics.lightTap();
      }
      onPlay(sound);
    }
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.lightTap();
    onToggleFavorite(sound.id);
  };

  const handleArm = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.lightTap();
    onQuickArmTimer(sound);
  };

  const hasSpecialSimulator = sound.id === 'hair_clipper' || sound.id === 'taser_shock';

  return (
    <div
      onClick={handlePlayToggle}
      className={`group relative flex flex-col justify-between p-3.5 rounded-2xl transition-all duration-200 cursor-pointer select-none text-left border ${
        isPlaying
          ? 'bg-neutral-900 border-[#00FF66] shadow-[0_0_24px_rgba(0,255,102,0.25)] scale-[1.01]'
          : 'bg-[#181B22] border-neutral-800/80 hover:border-neutral-700 hover:bg-[#1E222B] active:scale-[0.98]'
      }`}
    >
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
            isPlaying
              ? 'bg-[#00FF66] text-black shadow-lg shadow-[#00FF66]/30'
              : 'bg-neutral-800/90 text-neutral-200 group-hover:text-white group-hover:bg-neutral-700/80'
          }`}
        >
          <IconComponent className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div className="flex items-center gap-1">
          {hasSpecialSimulator && onOpenSimulator && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptics.lightTap();
                onOpenSimulator(sound.id);
              }}
              title="Open full interactive simulator"
              className="p-1.5 rounded-lg text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-700 text-[#00FF66] border border-[#00FF66]/30 transition-colors"
            >
              SIM
            </button>
          )}

          <button
            onClick={handleArm}
            title="Arm countdown timer prank"
            className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800/60 transition-colors"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={handleFav}
            title={isFavorite ? 'Remove from quick board' : 'Add to quick board'}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-neutral-500 hover:text-amber-300 hover:bg-neutral-800/60'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Middle content */}
      <div>
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-semibold text-sm text-neutral-100 truncate group-hover:text-white">
            {sound.name}
          </h3>
          {isPlaying && (
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF66]"></span>
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
          {sound.description}
        </p>
      </div>

      {/* Bottom metadata & state */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400 font-mono-nums">
        <span className="truncate">
          {(sound.durationMs / 1000).toFixed(1)}s · {pitch !== 1 ? `${pitch.toFixed(1)}x` : '1.0x'}
        </span>

        <div className="flex items-center gap-1.5">
          {isLoop && (
            <span title="Loop enabled">
              <Repeat className="w-3.5 h-3.5 text-[#00FF66]" />
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
              isPlaying
                ? 'bg-[#00FF66]/20 text-[#00FF66]'
                : 'bg-neutral-800 text-neutral-400 group-hover:text-neutral-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-2.5 h-2.5 fill-current" /> STOP
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 fill-current" /> PLAY
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
