import React from 'react';
import { X, Sliders, Volume2, Repeat, Vibrate, RotateCcw } from 'lucide-react';
import { AudioSettings } from '../types';
import { haptics } from '../services/haptics';

interface SoundSettingsDrawerProps {
  settings: AudioSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
}

export const SoundSettingsDrawer: React.FC<SoundSettingsDrawerProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    haptics.lightTap();
    onUpdateSettings({
      pitch: 1.0,
      volume: 1.0,
      loop: false,
      hapticsEnabled: true,
      spatialPanning: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#16181F] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00FF66]" />
            <h3 className="font-bold text-base text-white">Audio Tuning Studio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white bg-neutral-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Pitch Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono-nums">
            <span className="text-neutral-400 font-medium">Pitch Modulation:</span>
            <span className="text-[#00FF66] font-bold">
              {settings.pitch.toFixed(2)}x{' '}
              {settings.pitch < 0.8
                ? '(Deep Demon)'
                : settings.pitch > 1.4
                ? '(Helium Squeak)'
                : '(Natural)'}
            </span>
          </div>
          <input
            type="range"
            min={0.4}
            max={2.2}
            step={0.05}
            value={settings.pitch}
            onChange={(e) => onUpdateSettings({ pitch: Number(e.target.value) })}
            className="w-full accent-[#00FF66] h-2 bg-neutral-900 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono-nums">
            <span>0.4x (Ultra Deep)</span>
            <span>1.0x (Original)</span>
            <span>2.2x (High Pitch)</span>
          </div>
        </div>

        {/* Master Volume */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono-nums">
            <span className="text-neutral-400 font-medium">Master Gain:</span>
            <span className="text-[#00FF66] font-bold">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.5}
            step={0.05}
            value={settings.volume}
            onChange={(e) => onUpdateSettings({ volume: Number(e.target.value) })}
            className="w-full accent-[#00FF66] h-2 bg-neutral-900 rounded-lg cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Continuous Loop */}
          <button
            onClick={() => {
              haptics.lightTap();
              onUpdateSettings({ loop: !settings.loop });
            }}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-colors ${
              settings.loop
                ? 'bg-neutral-900 border-[#00FF66] text-[#00FF66]'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Repeat className="w-4 h-4" />
              <span className="text-[10px] font-mono-nums font-bold">
                {settings.loop ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Continuous Loop</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Keep playing sound</div>
          </button>

          {/* Haptics */}
          <button
            onClick={() => {
              haptics.lightTap();
              const next = !settings.hapticsEnabled;
              haptics.setEnabled(next);
              onUpdateSettings({ hapticsEnabled: next });
            }}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-colors ${
              settings.hapticsEnabled
                ? 'bg-neutral-900 border-[#00FF66] text-[#00FF66]'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Vibrate className="w-4 h-4" />
              <span className="text-[10px] font-mono-nums font-bold">
                {settings.hapticsEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Device Vibration</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Physical haptic sync</div>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#00FF66] text-black font-bold text-xs rounded-xl hover:bg-[#00FF66]/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
