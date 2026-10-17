import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Clock,
  EyeOff,
  Star,
  Search,
  Sliders,
  Scissors,
  ZapOff,
  Compass,
  AlertCircle,
  Play,
  RotateCcw,
  Bomb,
  Sparkles,
} from 'lucide-react';
import { SoundItem, SoundCategory, StealthDisguiseType, AudioSettings } from './types';
import { SOUND_LIBRARY } from './data/soundLibrary';
import { soundEngine } from './services/soundEngine';
import { haptics } from './services/haptics';
import { SoundCard } from './components/SoundCard';
import { RazorSimulator } from './components/RazorSimulator';
import { TaserSimulator } from './components/TaserSimulator';
import { TimerTriggerPanel } from './components/TimerTriggerPanel';
import { StealthDisguiseModal } from './components/StealthDisguiseModal';
import { StealthTabPanel } from './components/StealthTabPanel';
import { SpatialAudioLab } from './components/SpatialAudioLab';
import { FavoritesBoard } from './components/FavoritesBoard';
import { SoundSettingsDrawer } from './components/SoundSettingsDrawer';
import { Header } from './components/Header';
import { BottomNav, MainTabType } from './components/BottomNav';

import prankBackdrop from './assets/images/prank_cyber_backdrop_1792222399715.jpg';
import prankSoundBomb from './assets/images/prank_sound_bomb_1792222400047.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('sounds');
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio Playback State
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('prankfx_favorites');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return ['fart_wet', 'hair_clipper', 'air_horn', 'taser_shock'];
  });

  // Audio global settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    pitch: 1.0,
    volume: 1.0,
    loop: false,
    spatialPanning: 0,
    spatialY: 0,
    hapticsEnabled: true,
  });

  // Drawers & Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [simulatorMode, setSimulatorMode] = useState<'razor' | 'taser' | null>(null);
  const [activeDisguise, setActiveDisguise] = useState<StealthDisguiseType | null>(null);
  const [armedPayloadSound, setArmedPayloadSound] = useState<SoundItem | undefined>(undefined);
  const [timerInitialSound, setTimerInitialSound] = useState<SoundItem | undefined>(undefined);
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState<boolean>(false);

  // Sync favorites with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('prankfx_favorites', JSON.stringify(favoriteIds));
    } catch {
      // Ignore
    }
  }, [favoriteIds]);

  // Subscribe to SoundEngine state
  useEffect(() => {
    const unsubscribe = soundEngine.subscribe((isPlaying, soundId) => {
      setPlayingSoundId(isPlaying ? soundId : null);
    });
    return () => unsubscribe();
  }, []);

  // Update sound engine master controls
  useEffect(() => {
    soundEngine.setMasterVolume(audioSettings.volume);
    soundEngine.setSpatialPanning(audioSettings.spatialPanning);
    haptics.setEnabled(audioSettings.hapticsEnabled);
  }, [audioSettings]);

  const handlePlaySound = (sound: SoundItem) => {
    soundEngine.play(sound.synthPreset, {
      pitch: audioSettings.pitch !== 1.0 ? audioSettings.pitch : sound.pitch,
      loop: audioSettings.loop,
      spatialX: audioSettings.spatialPanning,
    });
  };

  const handleStopAll = () => {
    soundEngine.stopAll();
    haptics.stop();
  };

  const handleToggleFavorite = (soundId: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(soundId)) {
        return prev.filter((id) => id !== soundId);
      }
      if (prev.length >= 4) {
        // Replace last if already 4
        return [...prev.slice(0, 3), soundId];
      }
      return [...prev, soundId];
    });
  };

  const handleQuickArmTimer = (sound: SoundItem) => {
    setTimerInitialSound(sound);
    setActiveTab('triggers');
  };

  const handleOpenSimulator = (soundId: string) => {
    if (soundId === 'hair_clipper') setSimulatorMode('razor');
    if (soundId === 'taser_shock') setSimulatorMode('taser');
  };

  const handleLaunchDisguise = (disguise: StealthDisguiseType, sound: SoundItem) => {
    setArmedPayloadSound(sound);
    setActiveDisguise(disguise);
  };

  // Filter sounds
  const filteredSounds = SOUND_LIBRARY.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories: { id: SoundCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Sounds' },
    { id: 'classic', label: 'Classic & Funny' },
    { id: 'shock', label: 'Shock & Surprise' },
    { id: 'animal', label: 'Animals' },
    { id: 'tool', label: 'Tools & Sirens' },
  ];

  const activeSoundObj = SOUND_LIBRARY.find((s) => s.id === playingSoundId);

  return (
    <div className="min-h-screen bg-[#0D0F12] text-neutral-100 flex flex-col items-center justify-start font-sans antialiased selection:bg-[#00FF66] selection:text-black">
      {/* Container wrapper (handles full screen vs phone mockup mode) */}
      <div
        className={`w-full min-h-screen flex flex-col transition-all duration-300 relative ${
          isPhoneFrameMode
            ? 'max-w-md my-6 rounded-[44px] border-8 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden bg-[#12141A]'
            : 'max-w-3xl bg-[#12141A] shadow-2xl min-h-screen'
        }`}
      >
        {/* Prank Cyber Ambient Graphic Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          <img
            src={prankBackdrop}
            alt="PrankFX Cyber Background Artwork"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-20 mix-blend-screen scale-105 filter blur-[0.3px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#12141A]/95 via-[#12141A]/80 to-[#12141A]/95"></div>
        </div>

        {/* Phone Frame Notch (in phone mockup view) */}
        {isPhoneFrameMode && (
          <div className="w-full flex justify-center pt-2 pb-1 bg-[#111317] relative z-10">
            <div className="w-28 h-4 bg-black rounded-full flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-800"></div>
              <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
            </div>
          </div>
        )}

        {/* Global Top App Bar */}
        <div className="relative z-20">
          <Header
            activeSoundName={activeSoundObj ? activeSoundObj.name : null}
            onPanicStop={handleStopAll}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isFrameMode={isPhoneFrameMode}
            onToggleFrameMode={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
          />
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto w-full relative z-10">
          {/* TAB 1: ALL SOUNDS BROWSER */}
          {activeTab === 'sounds' && (
            <div className="flex flex-col gap-4">
              {/* Featured Sound Bomb Hero Graphic */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-800/80 bg-neutral-900/80 shadow-xl group">
                <div className="relative h-36 sm:h-44 w-full overflow-hidden">
                  <img
                    src={prankSoundBomb}
                    alt="Cyber Sound Bomb 3D Graphic"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-[#12141A]/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#12141A]/90 via-transparent to-transparent"></div>

                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono-nums font-bold text-[#00FF66] tracking-wider uppercase">
                        <Sparkles className="w-3 h-3 text-[#00FF66]" />
                        <span>INSTANT MEGABOMB</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                        Sonic Detonator
                      </h2>
                      <p className="text-xs text-neutral-300 line-clamp-1 max-w-xs">
                        High-voltage acoustic blast with sub-bass rumble
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const bombSound =
                          SOUND_LIBRARY.find((s) => s.id === 'fart_cannon') ||
                          SOUND_LIBRARY[0];
                        handlePlaySound(bombSound);
                        haptics.bombExplode();
                      }}
                      className="px-3.5 py-2 bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#00FF66]/30 transition-transform active:scale-95 shrink-0"
                    >
                      <Bomb className="w-3.5 h-3.5 fill-black" />
                      FIRE NOW
                    </button>
                  </div>
                </div>
              </div>

              {/* Search & Simulators Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search fart, razor, horn, siren..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#00FF66] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Quick Simulators Shortcuts */}
                <button
                  onClick={() => setSimulatorMode('razor')}
                  title="Open Hair Clipper simulator"
                  className="px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <Scissors className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span className="hidden sm:inline">Razor Sim</span>
                </button>

                <button
                  onClick={() => setSimulatorMode('taser')}
                  title="Open Stun Gun simulator"
                  className="px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <ZapOff className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Taser Sim</span>
                </button>
              </div>

              {/* Category Segmented Scrollable Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        haptics.lightTap();
                        setSelectedCategory(cat.id);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#00FF66] text-black font-semibold shadow-sm'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800/80'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Sound Count & Quick Pitch Banner */}
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1 font-mono-nums">
                <span>
                  Showing {filteredSounds.length} sounds
                </span>
                {audioSettings.pitch !== 1.0 && (
                  <span className="text-[#00FF66] font-semibold">
                    Pitch Shift: {audioSettings.pitch.toFixed(1)}x
                  </span>
                )}
              </div>

              {/* Sounds Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredSounds.map((sound) => (
                  <SoundCard
                    key={sound.id}
                    sound={sound}
                    isPlaying={playingSoundId === sound.id}
                    isFavorite={favoriteIds.includes(sound.id)}
                    pitch={audioSettings.pitch !== 1.0 ? audioSettings.pitch : sound.pitch}
                    isLoop={audioSettings.loop}
                    onPlay={handlePlaySound}
                    onStop={handleStopAll}
                    onToggleFavorite={handleToggleFavorite}
                    onQuickArmTimer={handleQuickArmTimer}
                    onOpenSimulator={handleOpenSimulator}
                  />
                ))}
              </div>

              {filteredSounds.length === 0 && (
                <div className="py-12 text-center text-neutral-500 flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  <p className="text-sm">No prank sounds match "{searchQuery}"</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-xs text-[#00FF66] underline mt-1"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMER / TRIGGERS */}
          {activeTab === 'triggers' && (
            <TimerTriggerPanel
              initialSound={timerInitialSound}
              onArmedStealthLaunch={handleLaunchDisguise}
            />
          )}

          {/* TAB 3: STEALTH DISGUISES */}
          {activeTab === 'stealth' && (
            <StealthTabPanel onLaunchDisguise={handleLaunchDisguise} />
          )}

          {/* TAB 4: FAVORITES SOUNDBOARD */}
          {activeTab === 'favorites' && (
            <FavoritesBoard
              favoriteIds={favoriteIds}
              activeSoundId={playingSoundId}
              onPlay={handlePlaySound}
              onStop={handleStopAll}
              onSelectSlotSound={(slotIdx, soundId) => {
                setFavoriteIds((prev) => {
                  const updated = [...prev];
                  updated[slotIdx] = soundId;
                  return updated;
                });
              }}
              onRemoveFavorite={(soundId) => {
                setFavoriteIds((prev) => prev.filter((id) => id !== soundId));
              }}
            />
          )}

          {/* TAB 5: 3D SPATIAL AUDIO */}
          {activeTab === 'spatial' && <SpatialAudioLab />}
        </main>

        {/* Global Bottom Navigation */}
        <BottomNav currentTab={activeTab} onChangeTab={setActiveTab} />

        {/* Hair Clipper Simulator Modal */}
        {simulatorMode === 'razor' && (
          <RazorSimulator onClose={() => setSimulatorMode(null)} />
        )}

        {/* Stun Gun Simulator Modal */}
        {simulatorMode === 'taser' && (
          <TaserSimulator onClose={() => setSimulatorMode(null)} />
        )}

        {/* Stealth Disguise Fullscreen Overlay */}
        {activeDisguise && (
          <StealthDisguiseModal
            disguise={activeDisguise}
            armedSound={armedPayloadSound}
            onExit={() => {
              setActiveDisguise(null);
              setArmedPayloadSound(undefined);
            }}
          />
        )}

        {/* Audio Tuning Drawer */}
        <SoundSettingsDrawer
          settings={audioSettings}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateSettings={(newSettings) =>
            setAudioSettings((prev) => ({ ...prev, ...newSettings }))
          }
        />
      </div>
    </div>
  );
}
