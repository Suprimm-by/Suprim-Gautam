import React, { useState } from 'react';
import {
  BatteryLow,
  RefreshCw,
  PhoneCall,
  Sparkles,
  Calculator,
  Play,
  EyeOff,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { StealthDisguiseType, SoundItem } from '../types';
import { SOUND_LIBRARY } from '../data/soundLibrary';
import { haptics } from '../services/haptics';

interface StealthTabPanelProps {
  onLaunchDisguise: (disguise: StealthDisguiseType, sound: SoundItem) => void;
}

export const StealthTabPanel: React.FC<StealthTabPanelProps> = ({ onLaunchDisguise }) => {
  const [selectedDisguise, setSelectedDisguise] =
    useState<StealthDisguiseType>('dead_battery');
  const [selectedSoundId, setSelectedSoundId] = useState<string>('fart_cannon');

  const selectedSound =
    SOUND_LIBRARY.find((s) => s.id === selectedSoundId) || SOUND_LIBRARY[0];

  const disguises = [
    {
      id: 'dead_battery' as StealthDisguiseType,
      name: 'Dead Battery 1%',
      desc: 'Darkened screen with a red low battery icon. Looks like a dead phone.',
      icon: BatteryLow,
      victimBait: 'Leave it on a coffee table. Anyone who taps it triggers the bomb!',
    },
    {
      id: 'system_update' as StealthDisguiseType,
      name: 'OS System Update',
      desc: 'Mimics an official Android/iOS system update installation at 14%.',
      icon: RefreshCw,
      victimBait: 'Victim won\'t dare touch it until you tell them to check progress.',
    },
    {
      id: 'incoming_call' as StealthDisguiseType,
      name: 'Urgent FBI Call',
      desc: 'Simulates an urgent call from "FBI Special Agent". Accepting or declining detonates.',
      icon: PhoneCall,
      victimBait: 'Hand your phone: "Quick, can you decline this call for me?"',
    },
    {
      id: 'broken_screen' as StealthDisguiseType,
      name: 'Shattered Display',
      desc: 'Realistic spiderweb glass cracks and hardware color distortion lines.',
      icon: Sparkles,
      victimBait: 'Pretend you dropped your phone near a friend: "Oh no, look what happened!"',
    },
    {
      id: 'calculator' as StealthDisguiseType,
      name: 'Secret Spy Calculator',
      desc: 'Working calculator app. Pressing "=" detonates the armed sound explosion.',
      icon: Calculator,
      victimBait: 'Ask a friend: "Can you help me calculate this bill quickly?"',
    },
  ];

  const handleLaunch = () => {
    haptics.lightTap();
    onLaunchDisguise(selectedDisguise, selectedSound);
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-20">
      {/* Intro Banner */}
      <div className="p-3.5 bg-neutral-900/80 rounded-2xl border border-neutral-800 text-xs text-neutral-300 flex items-start gap-3">
        <EyeOff className="w-5 h-5 text-[#00FF66] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block">Stealth Prank Disguises</span>
          Lock your screen with an innocent disguise so victims don't suspect a prank app is
          running. Touching the screen or interacting detonates the chosen payload sound!
        </div>
      </div>

      {/* Payload Sound Selection */}
      <div className="p-4 bg-[#181B22] rounded-2xl border border-neutral-800/80">
        <label className="block text-xs font-medium text-neutral-400 mb-2">
          Payload Sound to Detonate on Interaction:
        </label>
        <select
          value={selectedSoundId}
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

      {/* Disguise Cards Grid */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-medium text-neutral-400 px-1">
          Choose Your Screen Disguise:
        </label>

        {disguises.map((d) => {
          const Icon = d.icon;
          const isSelected = selectedDisguise === d.id;

          return (
            <div
              key={d.id}
              onClick={() => {
                haptics.lightTap();
                setSelectedDisguise(d.id);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
                isSelected
                  ? 'bg-neutral-900 border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.15)]'
                  : 'bg-[#181B22] border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#00FF66] text-black font-bold'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{d.name}</h4>
                    <p className="text-xs text-neutral-400">{d.desc}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-[#00FF66] bg-[#00FF66]' : 'border-neutral-700'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-300 flex items-center gap-1.5">
                  <span className="text-[#00FF66] font-semibold">Victim Bait:</span>
                  <span>{d.victimBait}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Launch CTA */}
      <button
        onClick={handleLaunch}
        className="w-full py-4 mt-2 bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-transform active:scale-[0.98]"
      >
        <EyeOff className="w-4 h-4 stroke-[2.5]" />
        ENTER STEALTH MODE NOW
      </button>

      <span className="text-[11px] text-neutral-500 text-center block">
        * A subtle "X" is hidden in the top-right corner to disarm and exit at any time.
      </span>
    </div>
  );
};
