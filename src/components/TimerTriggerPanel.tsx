import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Smartphone,
  EyeOff,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  Volume2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SoundItem, StealthDisguiseType } from '../types';
import { SOUND_LIBRARY } from '../data/soundLibrary';
import { soundEngine } from '../services/soundEngine';
import { haptics } from '../services/haptics';
import prankStealthRadar from '../assets/images/prank_stealth_radar_1792222400876.jpg';

interface TimerTriggerPanelProps {
  initialSound?: SoundItem;
  onArmedStealthLaunch: (disguise: StealthDisguiseType, sound: SoundItem) => void;
}

export const TimerTriggerPanel: React.FC<TimerTriggerPanelProps> = ({
  initialSound,
  onArmedStealthLaunch,
}) => {
  const [activeTab, setActiveTab] = useState<'countdown' | 'motion'>('countdown');
  const [selectedSoundId, setSelectedSoundId] = useState<string>(
    initialSound?.id || SOUND_LIBRARY[0].id
  );
  const [countdownSeconds, setCountdownSeconds] = useState<number>(10);
  const [customSeconds, setCustomSeconds] = useState<string>('15');
  const [isArmed, setIsArmed] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [silentCountdown, setSilentCountdown] = useState<boolean>(true);
  const [chosenDisguise, setChosenDisguise] = useState<StealthDisguiseType | 'none'>('none');

  // Motion Sensor State
  const [motionSensitivity, setMotionSensitivity] = useState<number>(12); // Threshold
  const [motionArmed, setMotionArmed] = useState<boolean>(false);
  const [motionGraceSeconds, setMotionGraceSeconds] = useState<number>(0);
  const [currentMotionValue, setCurrentMotionValue] = useState<number>(0);
  const [motionPermissionState, setMotionPermissionState] = useState<string>('idle');

  const countdownTimerRef = useRef<number | null>(null);
  const lastAccRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  const selectedSound = SOUND_LIBRARY.find((s) => s.id === selectedSoundId) || SOUND_LIBRARY[0];

  // Sync initial sound if changed
  useEffect(() => {
    if (initialSound) {
      setSelectedSoundId(initialSound.id);
    }
  }, [initialSound]);

  // Handle countdown tick down
  useEffect(() => {
    if (isArmed && timeLeft > 0) {
      countdownTimerRef.current = window.setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Detonate!
            detonateSound();
            setIsArmed(false);
            return 0;
          }
          if (!silentCountdown) {
            haptics.countdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [isArmed, timeLeft, silentCountdown]);

  // Motion sensor listener
  useEffect(() => {
    if (!motionArmed || motionGraceSeconds > 0) return;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const deltaX = Math.abs(acc.x - lastAccRef.current.x);
      const deltaY = Math.abs(acc.y - lastAccRef.current.y);
      const deltaZ = Math.abs(acc.z - lastAccRef.current.z);
      const totalDelta = deltaX + deltaY + deltaZ;

      setCurrentMotionValue(Math.min(50, Math.round(totalDelta * 10) / 10));

      lastAccRef.current = { x: acc.x, y: acc.y, z: acc.z };

      if (totalDelta > motionSensitivity) {
        detonateSound();
        setMotionArmed(false);
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [motionArmed, motionGraceSeconds, motionSensitivity]);

  // Motion grace period countdown
  useEffect(() => {
    if (motionArmed && motionGraceSeconds > 0) {
      const timer = setTimeout(() => {
        setMotionGraceSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [motionArmed, motionGraceSeconds]);

  const detonateSound = () => {
    haptics.bombExplode();
    soundEngine.play(selectedSound.synthPreset, {
      pitch: selectedSound.pitch,
      loop: false,
    });
  };

  const handleArmCountdown = () => {
    haptics.lightTap();
    const secs = countdownSeconds;
    setTimeLeft(secs);
    setIsArmed(true);

    if (chosenDisguise !== 'none') {
      onArmedStealthLaunch(chosenDisguise, selectedSound);
    }
  };

  const handleCancelCountdown = () => {
    haptics.lightTap();
    setIsArmed(false);
    setTimeLeft(0);
  };

  const handleRequestMotionPermissionAndArm = async () => {
    haptics.lightTap();
    // iOS 13+ permission request
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const perm = await (
          DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        setMotionPermissionState(perm);
      } catch {
        setMotionPermissionState('denied');
      }
    }

    setMotionGraceSeconds(3); // 3-second grace to set phone down
    setMotionArmed(true);

    if (chosenDisguise !== 'none') {
      onArmedStealthLaunch(chosenDisguise, selectedSound);
    }
  };

  const handleDisarmMotion = () => {
    haptics.lightTap();
    setMotionArmed(false);
    setMotionGraceSeconds(0);
    setCurrentMotionValue(0);
  };

  const simulateMotionBump = () => {
    setCurrentMotionValue(25);
    setTimeout(() => {
      detonateSound();
      setMotionArmed(false);
    }, 150);
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-20">
      {/* Top Segmented Mode Selector */}
      <div className="grid grid-cols-2 p-1 bg-neutral-900 rounded-2xl border border-neutral-800">
        <button
          onClick={() => {
            haptics.lightTap();
            setActiveTab('countdown');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'countdown'
              ? 'bg-[#00FF66] text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Countdown Bomb
        </button>
        <button
          onClick={() => {
            haptics.lightTap();
            setActiveTab('motion');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'motion'
              ? 'bg-[#00FF66] text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Motion Sensor Tripwire
        </button>
      </div>

      {/* Target Sound Selector */}
      <div className="p-4 bg-[#181B22] rounded-2xl border border-neutral-800/80">
        <label className="block text-xs font-medium text-neutral-400 mb-2">
          Payload Sound to Detonate:
        </label>
        <select
          value={selectedSoundId}
          disabled={isArmed || motionArmed}
          onChange={(e) => setSelectedSoundId(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm font-semibold text-neutral-100 focus:outline-none focus:border-[#00FF66]"
        >
          {SOUND_LIBRARY.map((snd) => (
            <option key={snd.id} value={snd.id}>
              {snd.name} ({snd.categoryName})
            </option>
          ))}
        </select>
      </div>

      {/* COUNTDOWN BOMB TAB */}
      {activeTab === 'countdown' && (
        <div className="p-5 bg-[#181B22] rounded-2xl border border-neutral-800/80 flex flex-col items-center">
          {isArmed ? (
            /* Armed Countdown Active View */
            <div className="w-full flex flex-col items-center py-4">
              <div className="relative w-36 h-36 rounded-full border-4 border-neutral-800 flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-spin border-t-transparent opacity-80"></div>
                <div className="text-center font-mono-nums">
                  <div className="text-4xl font-extrabold text-amber-400 tracking-tight">
                    {timeLeft}s
                  </div>
                  <div className="text-[10px] text-neutral-400 tracking-wider">
                    ARMED & TICKING
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-400 text-center max-w-xs mb-5">
                Place the phone near your victim. Detonating{' '}
                <span className="text-white font-medium">{selectedSound.name}</span> in{' '}
                {timeLeft} seconds.
              </p>

              <button
                onClick={handleCancelCountdown}
                className="w-full py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-xl font-bold text-sm transition-colors"
              >
                DISARM & CANCEL
              </button>
            </div>
          ) : (
            /* Setup View */
            <div className="w-full flex flex-col gap-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-2">
                  Timer Duration:
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 30, 60].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        haptics.lightTap();
                        setCountdownSeconds(sec);
                      }}
                      className={`py-2 rounded-xl text-xs font-mono-nums font-bold border transition-colors ${
                        countdownSeconds === sec
                          ? 'bg-[#00FF66] text-black border-[#00FF66]'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-neutral-400">Custom (sec):</span>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={customSeconds}
                    onChange={(e) => {
                      setCustomSeconds(e.target.value);
                      const num = parseInt(e.target.value, 10);
                      if (!isNaN(num) && num > 0) setCountdownSeconds(num);
                    }}
                    className="w-20 p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-center text-xs font-mono-nums text-white focus:outline-none focus:border-[#00FF66]"
                  />
                </div>
              </div>

              {/* Stealth Disguise on Arm Option */}
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                    Auto-Stealth Disguise
                  </span>
                  <span className="text-[10px] text-neutral-400">When armed</span>
                </div>
                <select
                  value={chosenDisguise}
                  onChange={(e) =>
                    setChosenDisguise(e.target.value as StealthDisguiseType | 'none')
                  }
                  className="w-full p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-200"
                >
                  <option value="none">No Disguise (Keep app open)</option>
                  <option value="dead_battery">Fake Dead Battery 1% Screen</option>
                  <option value="system_update">Fake OS Update (Installing...)</option>
                  <option value="incoming_call">Fake Urgent Incoming Call</option>
                  <option value="broken_screen">Fake Broken/Cracked Screen</option>
                  <option value="calculator">Fake Secret Spy Calculator</option>
                </select>
              </div>

              {/* Silent ticking toggle */}
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={silentCountdown}
                  onChange={(e) => setSilentCountdown(e.target.checked)}
                  className="rounded accent-[#00FF66]"
                />
                <span>Stealth Mode (Zero ticking sounds or vibration while counting down)</span>
              </label>

              {/* Arm Button */}
              <button
                onClick={handleArmCountdown}
                className="w-full py-4 mt-2 bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-transform active:scale-[0.98]"
              >
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                ARM COUNTDOWN BOMB ({countdownSeconds}s)
              </button>
            </div>
          )}
        </div>
      )}

      {/* MOTION SENSOR TRIPWIRE TAB */}
      {activeTab === 'motion' && (
        <div className="p-5 bg-[#181B22] rounded-2xl border border-neutral-800/80 flex flex-col items-center">
          {motionArmed ? (
            /* Armed Motion State */
            <div className="w-full flex flex-col items-center py-4">
              <div className="relative w-36 h-36 rounded-full border-4 border-neutral-800 flex items-center justify-center mb-4">
                <div
                  className={`absolute inset-0 rounded-full border-4 ${
                    motionGraceSeconds > 0
                      ? 'border-amber-400 animate-pulse'
                      : 'border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.4)]'
                  }`}
                ></div>
                <div className="text-center font-mono-nums">
                  {motionGraceSeconds > 0 ? (
                    <>
                      <div className="text-4xl font-extrabold text-amber-400">
                        {motionGraceSeconds}s
                      </div>
                      <div className="text-[10px] text-neutral-400">SET PHONE DOWN</div>
                    </>
                  ) : (
                    <>
                      <div className="text-xl font-extrabold text-[#00FF66]">
                        {currentMotionValue.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        THRESHOLD: {motionSensitivity}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full max-w-xs mb-4">
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1 font-mono-nums">
                  <span>Motion Level</span>
                  <span>
                    {currentMotionValue > motionSensitivity
                      ? 'TRIPPED!'
                      : `${Math.round((currentMotionValue / motionSensitivity) * 100)}%`}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full transition-all duration-75 ${
                      currentMotionValue > motionSensitivity ? 'bg-rose-500' : 'bg-[#00FF66]'
                    }`}
                    style={{
                      width: `${Math.min(100, (currentMotionValue / motionSensitivity) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-neutral-400 text-center max-w-xs mb-4">
                {motionGraceSeconds > 0
                  ? 'Grace period: place phone on table, chair, or victim bag now!'
                  : 'Tripwire active! Any movement or bump will detonate immediately.'}
              </p>

              {/* Desktop / Manual bump trigger helper */}
              <button
                onClick={simulateMotionBump}
                className="mb-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold border border-neutral-700 transition-colors"
              >
                Simulate Accidental Bump / Pick Up
              </button>

              <button
                onClick={handleDisarmMotion}
                className="w-full py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-xl font-bold text-sm transition-colors"
              >
                DISARM SENSOR
              </button>
            </div>
          ) : (
            /* Setup Motion Trigger */
            <div className="w-full flex flex-col gap-4">
              {/* Tactical Tripwire Radar Graphic Banner */}
              <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <img
                  src={prankStealthRadar}
                  alt="Tactical Motion Tripwire HUD"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181B22] via-[#181B22]/30 to-transparent"></div>
                <div className="absolute top-2.5 left-3 text-[10px] font-mono-nums font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>MOTION TRIPWIRE SECTOR 7 · GYRO ACTIVE</span>
                </div>
                <div className="absolute bottom-2.5 left-3 text-xs font-semibold text-white">
                  Covert Displacement Trigger
                </div>
              </div>

              <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                <span className="font-semibold text-white block mb-1">
                  How the Tripwire Works:
                </span>
                Arm the sensor, and you will have 3 seconds to place the phone down (e.g. face
                down on a table, couch cushion, or inside someone's backpack). As soon as anyone
                picks up or tilts the phone, it blasts{' '}
                <span className="text-[#00FF66] font-medium">{selectedSound.name}</span>!
              </div>

              {/* Sensitivity Slider */}
              <div>
                <div className="flex justify-between text-xs text-neutral-400 font-mono-nums mb-1.5">
                  <span>Trigger Sensitivity:</span>
                  <span className="text-[#00FF66]">
                    {motionSensitivity <= 7
                      ? 'Hair-Trigger (Ultra Sensitive)'
                      : motionSensitivity <= 14
                      ? 'Medium (Standard Pick Up)'
                      : 'Firm (Hard Shake Only)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="25"
                  step="1"
                  value={motionSensitivity}
                  onChange={(e) => setMotionSensitivity(Number(e.target.value))}
                  className="w-full accent-[#00FF66] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Stealth Disguise on Arm Option */}
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                    Auto-Stealth Disguise
                  </span>
                  <span className="text-[10px] text-neutral-400">When armed</span>
                </div>
                <select
                  value={chosenDisguise}
                  onChange={(e) =>
                    setChosenDisguise(e.target.value as StealthDisguiseType | 'none')
                  }
                  className="w-full p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-200"
                >
                  <option value="none">No Disguise (Keep app open)</option>
                  <option value="dead_battery">Fake Dead Battery 1% Screen</option>
                  <option value="system_update">Fake OS Update (Installing...)</option>
                  <option value="incoming_call">Fake Urgent Incoming Call</option>
                  <option value="broken_screen">Fake Broken/Cracked Screen</option>
                  <option value="calculator">Fake Secret Spy Calculator</option>
                </select>
              </div>

              {/* Arm Button */}
              <button
                onClick={handleRequestMotionPermissionAndArm}
                className="w-full py-4 bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-transform active:scale-[0.98]"
              >
                <Smartphone className="w-4 h-4 stroke-[2.5]" />
                ARM MOTION TRIPWIRE (3s GRACE)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
