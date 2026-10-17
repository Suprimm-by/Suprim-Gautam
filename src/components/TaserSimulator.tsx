import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, ShieldCheck, Zap, BatteryCharging } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { haptics } from '../services/haptics';

interface TaserSimulatorProps {
  onClose: () => void;
}

export const TaserSimulator: React.FC<TaserSimulatorProps> = ({ onClose }) => {
  const [isArmed, setIsArmed] = useState(true);
  const [isFiring, setIsFiring] = useState(false);
  const [voltage, setVoltage] = useState(50000);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const vibrationIntervalRef = useRef<number | null>(null);

  // Electrical arc generator on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isFiring && isArmed) {
        // Draw primary violent arcs between the two contact nodes
        const startX = 65;
        const startY = 110;
        const endX = 235;
        const endY = 110;

        // Draw multiple plasma branches
        const branches = 3;
        for (let b = 0; b < branches; b++) {
          ctx.beginPath();
          ctx.moveTo(startX, startY);

          let currentX = startX;
          let currentY = startY;
          const steps = 14;
          const stepX = (endX - startX) / steps;

          for (let i = 1; i < steps; i++) {
            currentX += stepX;
            currentY = startY + (Math.random() - 0.5) * 55;
            ctx.lineTo(currentX, currentY);
          }

          ctx.lineTo(endX, endY);
          ctx.strokeStyle = b === 0 ? '#FFFFFF' : '#38BDF8';
          ctx.lineWidth = b === 0 ? 3 : 1.5;
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 18;
          ctx.stroke();
        }

        // Draw sparks
        for (let s = 0; s < 8; s++) {
          const sparkX = startX + Math.random() * (endX - startX);
          const sparkY = startY + (Math.random() - 0.5) * 60;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, Math.random() * 2.5 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isFiring, isArmed]);

  // Handle firing audio & haptics
  useEffect(() => {
    if (isFiring && isArmed) {
      soundEngine.play('taser_shock', { loop: true });
      haptics.taserSparks();
      vibrationIntervalRef.current = window.setInterval(() => {
        haptics.taserSparks();
      }, 300);
      setVoltage(Math.floor(48000 + Math.random() * 4000));
    } else {
      soundEngine.stopAll();
      haptics.stop();
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      setVoltage(50000);
    }

    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
    };
  }, [isFiring, isArmed]);

  const handleStartFire = () => {
    if (!isArmed) {
      haptics.lightTap();
      return;
    }
    setIsFiring(true);
  };

  const handleStopFire = () => {
    setIsFiring(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-sm bg-[#111317] border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center transition-colors ${
          isFiring && isArmed ? 'shadow-[0_0_50px_rgba(56,189,248,0.25)]' : ''
        }`}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isArmed ? 'bg-rose-500 animate-pulse' : 'bg-neutral-500'
              }`}
            ></span>
            <span className="text-sm font-semibold text-neutral-200">
              Stun Gun X-500
            </span>
          </div>
          <button
            onClick={() => {
              soundEngine.stopAll();
              haptics.stop();
              onClose();
            }}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Electrodes & Arc Chamber */}
        <div className="relative w-full h-48 bg-neutral-950 border border-neutral-800/80 rounded-2xl overflow-hidden mb-4 select-none flex items-center justify-center">
          {/* Left metal prong */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 w-7 h-16 bg-gradient-to-r from-neutral-400 to-neutral-200 rounded-l-md border-r-2 border-cyan-400 shadow-md"></div>
          {/* Right metal prong */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-7 h-16 bg-gradient-to-l from-neutral-400 to-neutral-200 rounded-r-md border-l-2 border-cyan-400 shadow-md"></div>

          {/* Spark canvas */}
          <canvas
            ref={canvasRef}
            width={300}
            height={192}
            className="w-full h-full pointer-events-none"
          />

          {/* Flash glow */}
          {isFiring && isArmed && (
            <div className="absolute inset-0 bg-cyan-400/10 pointer-events-none animate-pulse"></div>
          )}

          <div className="absolute bottom-2 text-center text-[11px] font-mono-nums text-neutral-500">
            {isFiring && isArmed
              ? '⚡ HIGH VOLTAGE DISCHARGE'
              : isArmed
              ? 'SAFETY OFF · READY TO FIRE'
              : 'SAFETY LOCK ENGAGED'}
          </div>
        </div>

        {/* Readouts */}
        <div className="w-full grid grid-cols-2 gap-2 mb-4 font-mono-nums text-xs">
          <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col">
            <span className="text-neutral-500 text-[10px]">POTENTIAL</span>
            <span className="text-cyan-400 font-bold text-sm">
              {isFiring && isArmed ? voltage.toLocaleString() : '50,000'} V
            </span>
          </div>
          <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col">
            <span className="text-neutral-500 text-[10px]">BATTERY CELL</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <BatteryCharging className="w-4 h-4" /> 98%
            </div>
          </div>
        </div>

        {/* Safety Toggle */}
        <div className="w-full flex items-center justify-between p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            {isArmed ? (
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-xs font-medium text-neutral-300">
              Safety Switch: {isArmed ? 'ARMED' : 'LOCKED'}
            </span>
          </div>
          <button
            onClick={() => {
              haptics.lightTap();
              setIsArmed(!isArmed);
              if (isFiring) setIsFiring(false);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              isArmed
                ? 'bg-rose-500 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {isArmed ? 'DISARM' : 'ARM'}
          </button>
        </div>

        {/* Big Hold-to-Fire Trigger */}
        <div className="w-full flex flex-col items-center">
          <button
            onMouseDown={handleStartFire}
            onMouseUp={handleStopFire}
            onMouseLeave={handleStopFire}
            onTouchStart={handleStartFire}
            onTouchEnd={handleStopFire}
            disabled={!isArmed}
            className={`w-full py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 select-none touch-none transition-all duration-150 ${
              !isArmed
                ? 'bg-neutral-800/50 text-neutral-600 cursor-not-allowed border border-neutral-800'
                : isFiring
                ? 'bg-cyan-400 text-black shadow-[0_0_30px_rgba(56,189,248,0.7)] scale-[0.98]'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 shadow-lg active:scale-95'
            }`}
          >
            <Zap className={`w-5 h-5 ${isFiring ? 'fill-black' : 'fill-cyan-400 text-cyan-400'}`} />
            {isFiring ? 'DISCHARGING...' : 'HOLD TRIGGER TO ZAP'}
          </button>
          <span className="text-[11px] text-neutral-500 mt-2">
            Press and hold to continuously shock
          </span>
        </div>
      </div>
    </div>
  );
};
