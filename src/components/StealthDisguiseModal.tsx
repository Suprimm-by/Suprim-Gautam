import React, { useState, useEffect } from 'react';
import {
  BatteryLow,
  PhoneCall,
  PhoneOff,
  Phone,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X,
  Volume2,
} from 'lucide-react';
import { StealthDisguiseType, SoundItem } from '../types';
import { soundEngine } from '../services/soundEngine';
import { haptics } from '../services/haptics';

interface StealthDisguiseModalProps {
  disguise: StealthDisguiseType;
  armedSound?: SoundItem;
  onExit: () => void;
  onDetonate?: () => void;
}

export const StealthDisguiseModal: React.FC<StealthDisguiseModalProps> = ({
  disguise,
  armedSound,
  onExit,
  onDetonate,
}) => {
  const [calcInput, setCalcInput] = useState<string>('0');
  const [calcPrev, setCalcPrev] = useState<string | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [updatePercent, setUpdatePercent] = useState<number>(14);
  const [callRings, setCallRings] = useState<number>(0);
  const [hasDetonated, setHasDetonated] = useState<boolean>(false);

  // Trigger detonation
  const triggerDetonation = () => {
    if (hasDetonated) return;
    setHasDetonated(true);
    haptics.bombExplode();
    if (armedSound) {
      soundEngine.play(armedSound.synthPreset, {
        pitch: armedSound.pitch,
        loop: false,
      });
    } else {
      soundEngine.play('fart_cannon', { pitch: 1.0 });
    }
    if (onDetonate) onDetonate();
  };

  // Simulate slow system update progress
  useEffect(() => {
    if (disguise === 'system_update') {
      const interval = setInterval(() => {
        setUpdatePercent((p) => (p < 99 ? p + 1 : 99));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [disguise]);

  // Simulate call vibration
  useEffect(() => {
    if (disguise === 'incoming_call') {
      const interval = setInterval(() => {
        haptics.vibrate([200, 100, 200, 800]);
        setCallRings((r) => r + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [disguise]);

  // Calculator logic
  const handleCalcNumber = (num: string) => {
    haptics.lightTap();
    setCalcInput((prev) => (prev === '0' ? num : prev + num));
  };

  const handleCalcOp = (op: string) => {
    haptics.lightTap();
    setCalcPrev(calcInput);
    setCalcOp(op);
    setCalcInput('0');
  };

  const handleCalcEquals = () => {
    haptics.lightTap();
    // Detonate prank sound when equals is pressed!
    triggerDetonation();
  };

  const handleCalcClear = () => {
    haptics.lightTap();
    setCalcInput('0');
    setCalcPrev(null);
    setCalcOp(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between select-none">
      {/* Secret Exit Button in top-right corner (very subtle for the prankster) */}
      <button
        onClick={onExit}
        title="Secret Exit"
        className="absolute top-3 right-3 z-50 p-2 text-neutral-800 hover:text-neutral-500 rounded-full transition-colors"
      >
        <X className="w-4 h-4 opacity-30 hover:opacity-100" />
      </button>

      {/* DISGUISE 1: DEAD BATTERY 1% */}
      {disguise === 'dead_battery' && (
        <div
          onClick={triggerDetonation}
          className="w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer"
        >
          <div className="relative w-28 h-52 border-4 border-neutral-700 rounded-3xl p-2 flex flex-col justify-end items-center mb-8">
            {/* Battery top nipple */}
            <div className="absolute -top-3 w-10 h-3 bg-neutral-700 rounded-t-md"></div>
            {/* Red 1% bar */}
            <div className="w-full h-4 bg-rose-600 rounded-lg animate-pulse mb-1"></div>
            <span className="text-rose-500 font-mono-nums font-bold text-xs">1%</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-500 text-xs font-mono-nums">
            <BatteryLow className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Connect to Power</span>
          </div>

          <p className="mt-8 text-[11px] text-neutral-700 text-center">
            (Tap screen to trigger secret prank bomb)
          </p>
        </div>
      )}

      {/* DISGUISE 2: SYSTEM UPDATE */}
      {disguise === 'system_update' && (
        <div
          onClick={triggerDetonation}
          className="w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer"
        >
          <RefreshCw className="w-16 h-16 text-neutral-500 animate-spin mb-6" />

          <h2 className="text-xl font-bold text-neutral-200 mb-2">
            Installing System Update
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mb-8">
            Your device will restart multiple times. Do not turn off your phone or disconnect
            from Wi-Fi.
          </p>

          <div className="w-full max-w-xs mb-3">
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${updatePercent}%` }}
              />
            </div>
          </div>

          <span className="text-xs font-mono-nums text-neutral-400">
            {updatePercent}% complete
          </span>

          <p className="mt-12 text-[11px] text-neutral-800">
            (Tap screen to detonate)
          </p>
        </div>
      )}

      {/* DISGUISE 3: INCOMING URGENT CALL */}
      {disguise === 'incoming_call' && (
        <div className="w-full h-full flex flex-col justify-between py-12 px-6 bg-gradient-to-b from-neutral-900 via-black to-neutral-950">
          <div className="flex flex-col items-center pt-8">
            <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center mb-4 shadow-xl">
              <Phone className="w-10 h-10 text-neutral-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">FBI Secret Service</h1>
            <span className="text-xs text-neutral-400 font-mono-nums">
              +1 (202) 324-3000 · Washington, D.C.
            </span>
            <span className="text-xs text-emerald-400 mt-2 animate-pulse">
              Incoming Call...
            </span>
          </div>

          <div className="w-full flex items-center justify-around pb-8">
            <button
              onClick={triggerDetonation}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-18 h-18 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 active:scale-95 transition-transform">
                <PhoneOff className="w-8 h-8" />
              </div>
              <span className="text-xs text-neutral-300 font-medium">Decline</span>
            </button>

            <button
              onClick={triggerDetonation}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-18 h-18 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 animate-bounce active:scale-95 transition-transform">
                <PhoneCall className="w-8 h-8" />
              </div>
              <span className="text-xs text-neutral-300 font-medium">Accept</span>
            </button>
          </div>
        </div>
      )}

      {/* DISGUISE 4: BROKEN CRACKED SCREEN */}
      {disguise === 'broken_screen' && (
        <div
          onClick={triggerDetonation}
          className="relative w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden"
        >
          {/* Cracked glass vector lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
            viewBox="0 0 400 800"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          >
            {/* Impact center */}
            <circle cx="200" cy="380" r="14" stroke="#FFF" strokeWidth="2.5" fill="none" />
            <circle cx="200" cy="380" r="32" stroke="#FFF" strokeWidth="1" strokeDasharray="4 2" />
            {/* Spiders */}
            <path d="M200 380 L60 120 L20 60" />
            <path d="M200 380 L320 80 L380 40" />
            <path d="M200 380 L350 480 L390 600" />
            <path d="M200 380 L80 620 L10 740" />
            <path d="M200 380 L220 780" />
            <path d="M120 280 L280 260 L310 390 L160 480 Z" strokeWidth="0.8" />
            <path d="M150 200 L210 110" />
            <path d="M280 440 L340 520" />
            <path d="M100 520 L40 450" />
          </svg>

          {/* Glitch colored bars */}
          <div className="w-full flex flex-col gap-1 opacity-70 mb-12">
            <div className="w-full h-1 bg-cyan-400"></div>
            <div className="w-full h-0.5 bg-rose-500"></div>
            <div className="w-full h-1.5 bg-emerald-400"></div>
          </div>

          <div className="z-10 bg-black/80 p-4 rounded-2xl border border-neutral-800 text-center">
            <p className="text-rose-500 font-mono text-sm font-bold animate-pulse">
              [HARDWARE DISPLAY ERROR]
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Digitizer cracked. Touch disabled.
            </p>
          </div>

          <p className="mt-12 text-[11px] text-neutral-800">
            (Tap screen to detonate sound)
          </p>
        </div>
      )}

      {/* DISGUISE 5: SECRET SPY CALCULATOR */}
      {disguise === 'calculator' && (
        <div className="w-full h-full max-w-sm flex flex-col justify-end p-5 bg-black">
          {/* Calculator Display */}
          <div className="w-full mb-6 px-2 text-right">
            <div className="text-xs text-neutral-500 h-5 font-mono">
              {calcPrev ? `${calcPrev} ${calcOp}` : ''}
            </div>
            <div className="text-5xl font-light text-white font-mono tracking-tight truncate">
              {calcInput}
            </div>
          </div>

          {/* Keypad */}
          <div className="w-full grid grid-cols-4 gap-3">
            <button
              onClick={handleCalcClear}
              className="h-16 rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors"
            >
              AC
            </button>
            <button
              onClick={() => handleCalcOp('+/-')}
              className="h-16 rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors"
            >
              ±
            </button>
            <button
              onClick={() => handleCalcOp('%')}
              className="h-16 rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors"
            >
              %
            </button>
            <button
              onClick={() => handleCalcOp('÷')}
              className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition-colors"
            >
              ÷
            </button>

            {['7', '8', '9'].map((n) => (
              <button
                key={n}
                onClick={() => handleCalcNumber(n)}
                className="h-16 rounded-full bg-neutral-800 text-white text-2xl font-normal active:bg-neutral-700 transition-colors"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleCalcOp('×')}
              className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition-colors"
            >
              ×
            </button>

            {['4', '5', '6'].map((n) => (
              <button
                key={n}
                onClick={() => handleCalcNumber(n)}
                className="h-16 rounded-full bg-neutral-800 text-white text-2xl font-normal active:bg-neutral-700 transition-colors"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleCalcOp('-')}
              className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition-colors"
            >
              -
            </button>

            {['1', '2', '3'].map((n) => (
              <button
                key={n}
                onClick={() => handleCalcNumber(n)}
                className="h-16 rounded-full bg-neutral-800 text-white text-2xl font-normal active:bg-neutral-700 transition-colors"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleCalcOp('+')}
              className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition-colors"
            >
              +
            </button>

            {/* Zero spans 2 columns */}
            <button
              onClick={() => handleCalcNumber('0')}
              className="col-span-2 h-16 rounded-full bg-neutral-800 text-white text-2xl font-normal pl-8 text-left active:bg-neutral-700 transition-colors"
            >
              0
            </button>
            <button
              onClick={() => handleCalcNumber('.')}
              className="h-16 rounded-full bg-neutral-800 text-white text-2xl font-normal active:bg-neutral-700 transition-colors"
            >
              .
            </button>
            {/* The EQUALS button triggers the prank explosion! */}
            <button
              onClick={handleCalcEquals}
              title="Calculate result or detonate"
              className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition-colors"
            >
              =
            </button>
          </div>

          <div className="w-full text-center mt-3 text-[10px] text-neutral-700">
            Pressing "=" detonates the armed sound!
          </div>
        </div>
      )}

      {/* Detonated Banner Notification if fired */}
      {hasDetonated && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-neutral-900/95 border border-[#00FF66] text-[#00FF66] px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          <span>PRANK DETONATED!</span>
          <button
            onClick={onExit}
            className="ml-2 text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded-full text-[10px]"
          >
            EXIT
          </button>
        </div>
      )}
    </div>
  );
};
