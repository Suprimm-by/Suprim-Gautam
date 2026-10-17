export type SoundCategory = 'classic' | 'shock' | 'animal' | 'tool';

export interface SoundItem {
  id: string;
  name: string;
  category: SoundCategory;
  categoryName: string;
  iconName: string;
  description: string;
  durationMs: number;
  pitch: number; // default pitch multiplier (0.5 - 2.0)
  loopable: boolean;
  hapticPattern?: number[];
  tags: string[];
  isSynthetic: boolean;
  synthPreset: string;
}

export type TriggerMode = 'countdown' | 'motion' | 'facedown';

export interface ActiveTrigger {
  id: string;
  soundId: string;
  mode: TriggerMode;
  delaySeconds: number;
  remainingSeconds: number;
  armed: boolean;
  stealthDisguise?: StealthDisguiseType;
}

export type StealthDisguiseType = 'dead_battery' | 'system_update' | 'incoming_call' | 'broken_screen' | 'calculator';

export interface AudioSettings {
  pitch: number;
  volume: number;
  loop: boolean;
  spatialPanning: number; // -1 (left) to 1 (right)
  spatialY: number; // front to back
  hapticsEnabled: boolean;
}
