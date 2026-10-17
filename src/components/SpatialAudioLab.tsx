import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Headphones,
  Play,
  Square,
  Repeat,
  Volume2,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { SOUND_LIBRARY } from '../data/soundLibrary';
import { SoundItem } from '../types';
import { soundEngine } from '../services/soundEngine';
import { haptics } from '../services/haptics';

export const SpatialAudioLab: React.FC = () => {
  const [selectedSoundId, setSelectedSoundId] = useState<string>('mosquito_buzz');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [puckPos, setPuckPos] = useState<{ x: number; y: number }>({ x: 0.6, y: -0.4 });
  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);
  const orbitAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const selectedSound =
    SOUND_LIBRARY.find((s) => s.id === selectedSoundId) || SOUND_LIBRARY[0];

  // Update sound engine panning when puck position changes
  useEffect(() => {
    // x: -1 (left ear) to +1 (right ear)
    soundEngine.setSpatialPanning(puckPos.x);
    // distance from center (0,0)
    const dist = Math.sqrt(puckPos.x * puckPos.x + puckPos.y * puckPos.y);
    const volumeFactor = Math.max(0.2, 1.2 - dist * 0.5);
    soundEngine.setMasterVolume(volumeFactor);
  }, [puckPos]);

  // Orbit loop
  useEffect(() => {
    if (!isOrbiting) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const step = () => {
      orbitAngleRef.current += 0.035;
      const radius = 0.75;
      const x = Math.cos(orbitAngleRef.current) * radius;
      const y = Math.sin(orbitAngleRef.current) * radius;
      setPuckPos({ x, y });
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOrbiting]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundEngine.stopAll();
      setIsPlaying(false);
      setIsOrbiting(false);
    } else {
      haptics.lightTap();
      soundEngine.play(selectedSound.synthPreset, {
        pitch: selectedSound.pitch,
        loop: true,
        spatialX: puckPos.x,
      });
      setIsPlaying(true);
    }
  };

  const handleStartOrbit = (soundId?: string) => {
    haptics.lightTap();
    if (soundId) setSelectedSoundId(soundId);
    const targetSound = soundId
      ? SOUND_LIBRARY.find((s) => s.id === soundId) || selectedSound
      : selectedSound;

    soundEngine.play(targetSound.synthPreset, {
      pitch: targetSound.pitch,
      loop: true,
      spatialX: puckPos.x,
    });
    setIsPlaying(true);
    setIsOrbiting(true);
  };

  const handleCanvasDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const relX = (clientX - rect.left) / rect.width; // 0 to 1
    const relY = (clientY - rect.top) / rect.height; // 0 to 1

    // Map to -1 to +1 coordinates
    const x = Math.max(-1, Math.min(1, (relX - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, (relY - 0.5) * 2));

    setIsOrbiting(false);
    setPuckPos({ x, y });
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-20">
      {/* Overview Note */}
      <div className="p-3.5 bg-neutral-900/80 rounded-2xl border border-neutral-800 text-xs text-neutral-300 flex items-center gap-3">
        <Headphones className="w-6 h-6 text-[#00FF66] shrink-0" />
        <div>
          <span className="font-semibold text-white block">3D Binaural Headphone Prank</span>
          Put headphones on your victim. Drag the sound puck or start an orbit to make the sound
          fly realistically around their head!
        </div>
      </div>

      {/* 3D Spatial Arena Visualizer */}
      <div
        onMouseMove={(e) => {
          if (e.buttons === 1) handleCanvasDrag(e);
        }}
        onTouchMove={handleCanvasDrag}
        onClick={handleCanvasDrag}
        className="relative w-full h-72 bg-gradient-to-b from-[#111317] to-neutral-950 border border-neutral-800/80 rounded-3xl overflow-hidden cursor-crosshair select-none touch-none flex items-center justify-center shadow-xl"
      >
        {/* Radar distance rings */}
        <div className="absolute w-56 h-56 rounded-full border border-neutral-800/60 pointer-events-none"></div>
        <div className="absolute w-40 h-40 rounded-full border border-neutral-800/80 pointer-events-none"></div>
        <div className="absolute w-24 h-24 rounded-full border border-dashed border-neutral-700/60 pointer-events-none"></div>

        {/* Crosshair guidelines */}
        <div className="absolute w-full h-px bg-neutral-800/40 pointer-events-none"></div>
        <div className="absolute h-full w-px bg-neutral-800/40 pointer-events-none"></div>

        {/* Ear Labels */}
        <span className="absolute left-3 text-[11px] font-mono-nums font-bold text-neutral-500">
          L (LEFT EAR)
        </span>
        <span className="absolute right-3 text-[11px] font-mono-nums font-bold text-neutral-500">
          R (RIGHT EAR)
        </span>
        <span className="absolute top-2 text-[10px] font-mono-nums text-neutral-600">
          ▲ NOSE / FRONT
        </span>
        <span className="absolute bottom-2 text-[10px] font-mono-nums text-neutral-600">
          ▼ BACK OF HEAD
        </span>

        {/* Center Victim Head Avatar */}
        <div className="relative z-10 w-20 h-24 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-[38px] border-2 border-neutral-700 flex flex-col items-center justify-center shadow-lg pointer-events-none">
          {/* Headphones band */}
          <div className="absolute -top-1 w-22 h-4 rounded-t-full border-t-4 border-neutral-500"></div>
          {/* Left ear cup */}
          <div className="absolute -left-3 w-3 h-8 bg-[#00FF66] rounded-full shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
          {/* Right ear cup */}
          <div className="absolute -right-3 w-3 h-8 bg-[#00FF66] rounded-full shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>

          <span className="text-[10px] font-bold text-neutral-300">VICTIM</span>
        </div>

        {/* Draggable Sound Puck */}
        <div
          className="absolute z-20 w-11 h-11 -ml-5.5 -mt-5.5 rounded-full bg-[#00FF66] text-black font-bold flex items-center justify-center shadow-[0_0_25px_rgba(0,255,102,0.8)] cursor-grab active:cursor-grabbing transition-transform"
          style={{
            left: `${((puckPos.x + 1) / 2) * 100}%`,
            top: `${((puckPos.y + 1) / 2) * 100}%`,
          }}
        >
          <Volume2 className="w-5 h-5 fill-current animate-pulse" />
        </div>
      </div>

      {/* Orbit & Presets Strip */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleStartOrbit('mosquito_buzz')}
          className="p-3 rounded-2xl bg-[#181B22] border border-neutral-800 hover:border-neutral-700 text-left transition-colors flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-[#00FF66]">
            <RotateCw className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Circling Mosquito</div>
            <div className="text-[10px] text-neutral-400">360° Continuous Orbit</div>
          </div>
        </button>

        <button
          onClick={() => handleStartOrbit('creepy_whisper')}
          className="p-3 rounded-2xl bg-[#181B22] border border-neutral-800 hover:border-neutral-700 text-left transition-colors flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Ghost Behind Head</div>
            <div className="text-[10px] text-neutral-400">Creepy whisper sweep</div>
          </div>
        </button>
      </div>

      {/* Audio Controls */}
      <div className="p-4 bg-[#181B22] rounded-2xl border border-neutral-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-neutral-400">Sound to Play in 3D:</label>
          <span className="text-xs font-mono-nums text-[#00FF66]">
            Pan: {puckPos.x > 0 ? `+${(puckPos.x * 100).toFixed(0)}% R` : `${(puckPos.x * 100).toFixed(0)}% L`}
          </span>
        </div>

        <select
          value={selectedSoundId}
          onChange={(e) => {
            setSelectedSoundId(e.target.value);
            if (isPlaying) {
              const next = SOUND_LIBRARY.find((s) => s.id === e.target.value);
              if (next) {
                soundEngine.play(next.synthPreset, {
                  pitch: next.pitch,
                  loop: true,
                  spatialX: puckPos.x,
                });
              }
            }
          }}
          className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm font-semibold text-neutral-100 focus:outline-none focus:border-[#00FF66]"
        >
          {SOUND_LIBRARY.map((snd) => (
            <option key={snd.id} value={snd.id}>
              {snd.name} ({snd.categoryName})
            </option>
          ))}
        </select>

        <button
          onClick={handleTogglePlay}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
            isPlaying
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
              : 'bg-[#00FF66] text-black shadow-lg shadow-[#00FF66]/20 hover:bg-[#00FF66]/90'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" /> STOP 3D AUDIO
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> START 3D AUDIO
            </>
          )}
        </button>
      </div>
    </div>
  );
};
