import React, { useState, useEffect, useRef } from 'react';
import { X, Power, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { haptics } from '../services/haptics';

interface RazorSimulatorProps {
  onClose: () => void;
}

interface HairStrand {
  x: number;
  y: number;
  length: number;
  angle: number;
  cut: boolean;
  fallSpeed: number;
}

export const RazorSimulator: React.FC<RazorSimulatorProps> = ({ onClose }) => {
  const [isOn, setIsOn] = useState(false);
  const [rpm, setRpm] = useState(7200);
  const [cutCount, setCutCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hairsRef = useRef<HairStrand[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const vibrationIntervalRef = useRef<number | null>(null);

  // Initialize hairs
  const initHairs = () => {
    const hairs: HairStrand[] = [];
    for (let i = 0; i < 90; i++) {
      hairs.push({
        x: Math.random() * 320,
        y: 60 + Math.random() * 220,
        length: 18 + Math.random() * 16,
        angle: (Math.random() - 0.5) * 0.8,
        cut: false,
        fallSpeed: 2 + Math.random() * 4,
      });
    }
    hairsRef.current = hairs;
    setCutCount(0);
  };

  useEffect(() => {
    initHairs();
    return () => {
      soundEngine.stopAll();
      haptics.stop();
      if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Handle razor motor state
  useEffect(() => {
    if (isOn) {
      const pitch = rpm / 7000;
      soundEngine.play('hair_clipper', { loop: true, pitch });
      
      // Vibration loop
      haptics.razorContinuous();
      vibrationIntervalRef.current = window.setInterval(() => {
        haptics.razorContinuous();
      }, 400);
    } else {
      soundEngine.stopAll();
      haptics.stop();
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
    }

    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
    };
  }, [isOn, rpm]);

  // Canvas drawing loop for hair simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let teethOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isOn) {
        teethOffset = (teethOffset + 1.2) % 6;
      }

      // Draw hairs
      hairsRef.current.forEach((hair) => {
        if (hair.cut) {
          hair.y += hair.fallSpeed;
          hair.x += Math.sin(hair.y * 0.05) * 0.5;
        }

        ctx.save();
        ctx.strokeStyle = hair.cut ? '#71717A' : '#D4D4D8';
        ctx.lineWidth = hair.cut ? 1.5 : 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hair.x, hair.y);
        ctx.lineTo(
          hair.x + Math.sin(hair.angle) * hair.length,
          hair.y - Math.cos(hair.angle) * hair.length
        );
        ctx.stroke();
        ctx.restore();
      });

      // Filter out off-screen cut hairs
      hairsRef.current = hairsRef.current.filter((h) => h.y < canvas.height + 30);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOn]);

  // Touch / mouse interaction to cut hairs
  const handlePointerInteract = (clientX: number, clientY: number) => {
    if (!isOn || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((clientY - rect.top) / rect.height) * canvasRef.current.height;

    let newlyCut = 0;
    hairsRef.current.forEach((hair) => {
      if (!hair.cut) {
        const dx = hair.x - x;
        const dy = hair.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 32) {
          hair.cut = true;
          newlyCut++;
        }
      }
    });

    if (newlyCut > 0) {
      setCutCount((prev) => prev + newlyCut);
      haptics.lightTap();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-[#12141A] border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse"></span>
            <span className="text-sm font-semibold text-neutral-200">
              Barber Razor Pro
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

        {/* Shave Screen Preview Canvas */}
        <div className="relative w-full h-56 bg-neutral-950 border border-neutral-800/80 rounded-2xl overflow-hidden mb-5 select-none touch-none">
          <canvas
            ref={canvasRef}
            width={320}
            height={224}
            className="w-full h-full cursor-crosshair"
            onMouseMove={(e) => {
              if (e.buttons === 1) handlePointerInteract(e.clientX, e.clientY);
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (touch) handlePointerInteract(touch.clientX, touch.clientY);
            }}
          />

          <div className="absolute top-2 left-3 text-[11px] text-neutral-400 font-mono-nums flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Hairs Shaved: {cutCount}</span>
          </div>

          <button
            onClick={initHairs}
            title="Reset hairs"
            className="absolute top-2 right-2 p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-800/70"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {!isOn && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
              <span className="text-xs font-medium text-neutral-300 bg-neutral-900/90 px-3 py-1.5 rounded-full border border-neutral-700">
                Power on to start shaving
              </span>
            </div>
          )}
        </div>

        {/* Realistic Razor Body */}
        <div className="relative flex flex-col items-center">
          {/* Steel Razor Head with vibrating teeth */}
          <div className="relative w-36 h-12 bg-gradient-to-b from-neutral-200 to-neutral-400 rounded-t-xl border-t border-x border-neutral-300 shadow-inner flex flex-col items-center justify-start overflow-hidden">
            {/* Teeth */}
            <div
              className={`flex gap-1 w-full justify-center pt-0.5 transition-transform ${
                isOn ? 'animate-pulse' : ''
              }`}
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-3.5 bg-neutral-700 rounded-b-xs"
                />
              ))}
            </div>
            {/* Gold blade stripe */}
            <div className="w-full h-1 bg-amber-400 mt-1"></div>
          </div>

          {/* Ergonomic handle */}
          <div className="w-28 h-32 bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-950 rounded-b-3xl border border-neutral-700 flex flex-col items-center justify-between p-3 shadow-lg">
            {/* Grip ridges */}
            <div className="w-16 flex flex-col gap-1 opacity-60">
              <div className="h-0.5 bg-neutral-600 rounded"></div>
              <div className="h-0.5 bg-neutral-600 rounded"></div>
              <div className="h-0.5 bg-neutral-600 rounded"></div>
            </div>

            {/* Power Toggle Button */}
            <button
              onClick={() => setIsOn(!isOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                isOn
                  ? 'bg-[#00FF66] text-black shadow-[0_0_20px_rgba(0,255,102,0.6)] scale-105'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              <Power className="w-6 h-6 stroke-[2.5]" />
            </button>

            <span className="text-[10px] font-mono-nums text-neutral-400 tracking-wider">
              {isOn ? 'RUNNING' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* RPM & Pitch Slider */}
        <div className="w-full mt-5 px-2">
          <div className="flex justify-between text-xs text-neutral-400 font-mono-nums mb-1.5">
            <span>Motor Speed:</span>
            <span className="text-[#00FF66]">{rpm} RPM</span>
          </div>
          <input
            type="range"
            min={4500}
            max={9800}
            step={100}
            value={rpm}
            onChange={(e) => setRpm(Number(e.target.value))}
            className="w-full accent-[#00FF66] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
