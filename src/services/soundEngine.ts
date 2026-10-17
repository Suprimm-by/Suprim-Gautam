/**
 * High-Fidelity Procedural Sound Synthesis Engine for PrankFX
 * Generates zero-latency, studio-grade sound effects directly via Web Audio API.
 * Supports real-time pitch shifting, spatial panning, continuous loop, and envelopes.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private activeNodes: { stop: () => void; id: string }[] = [];
  private currentPlayingId: string | null = null;
  private onStateChangeListeners: ((isPlaying: boolean, soundId: string | null) => void)[] = [];

  constructor() {
    // AudioContext will initialize on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.9;

      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.masterGain.connect(this.pannerNode);
        this.pannerNode.connect(this.ctx.destination);
      } else {
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(cb: (isPlaying: boolean, soundId: string | null) => void) {
    this.onStateChangeListeners.push(cb);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== cb);
    };
  }

  private notifyState(isPlaying: boolean, soundId: string | null) {
    this.currentPlayingId = isPlaying ? soundId : null;
    this.onStateChangeListeners.forEach(cb => cb(isPlaying, soundId));
  }

  public getIsPlaying(): boolean {
    return this.activeNodes.length > 0;
  }

  public getCurrentSoundId(): string | null {
    return this.currentPlayingId;
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1.5, val)), this.ctx.currentTime, 0.05);
    }
  }

  public setSpatialPanning(pan: number) {
    if (this.pannerNode && this.ctx) {
      this.pannerNode.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime, 0.05);
    }
  }

  public stopAll() {
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch {
        // Node might have already finished
      }
    });
    this.activeNodes = [];
    this.notifyState(false, null);
  }

  // Create white noise buffer
  private createNoiseBuffer(duration: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext uninitialized');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Create soft distortion curve
  private makeDistortionCurve(amount: number = 20): Float32Array<ArrayBuffer> {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const buffer = new ArrayBuffer(n_samples * 4);
    const curve = new Float32Array(buffer);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Main Dispatcher for Playing a Sound Preset
   */
  public play(presetId: string, options: { pitch?: number; loop?: boolean; volume?: number; spatialX?: number } = {}) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Apply spatial & options
    if (options.spatialX !== undefined) {
      this.setSpatialPanning(options.spatialX);
    }
    const pitch = options.pitch || 1.0;
    const isLoop = !!options.loop;

    this.stopAll();
    this.notifyState(true, presetId);

    const now = this.ctx.currentTime;
    const dest = this.masterGain;

    switch (presetId) {
      // CLASSIC & FUNNY
      case 'fart_wet':
        this.synthWetFart(now, pitch, dest, isLoop, presetId);
        break;
      case 'fart_squeak':
        this.synthSqueakFart(now, pitch, dest, isLoop, presetId);
        break;
      case 'fart_cannon':
        this.synthCannonFart(now, pitch, dest, isLoop, presetId);
        break;
      case 'burp_belch':
        this.synthBurp(now, pitch, dest, isLoop, presetId);
        break;
      case 'hair_clipper':
        this.synthHairClipper(now, pitch, dest, isLoop, presetId);
        break;
      case 'air_horn':
        this.synthAirHorn(now, pitch, dest, isLoop, presetId);
        break;

      // SHOCK & SURPRISE
      case 'glass_break':
        this.synthGlassBreak(now, pitch, dest, presetId);
        break;
      case 'doorbell_chime':
        this.synthDoorbell(now, pitch, dest, presetId);
        break;
      case 'door_knock':
        this.synthDoorKnock(now, pitch, dest, presetId);
        break;
      case 'horror_scream':
        this.synthHorrorScream(now, pitch, dest, isLoop, presetId);
        break;
      case 'creepy_whisper':
        this.synthCreepyWhisper(now, pitch, dest, isLoop, presetId);
        break;

      // ANIMAL PRANKS
      case 'dog_bark':
        this.synthDogBark(now, pitch, dest, isLoop, presetId);
        break;
      case 'cat_screech':
        this.synthCatScreech(now, pitch, dest, isLoop, presetId);
        break;
      case 'mosquito_buzz':
        this.synthMosquito(now, pitch, dest, isLoop, presetId);
        break;

      // TOOL & UTILITY
      case 'police_siren':
        this.synthPoliceSiren(now, pitch, dest, isLoop, presetId);
        break;
      case 'car_alarm':
        this.synthCarAlarm(now, pitch, dest, isLoop, presetId);
        break;
      case 'taser_shock':
        this.synthTaser(now, pitch, dest, isLoop, presetId);
        break;
      case 'sneeze':
        this.synthSneeze(now, pitch, dest, presetId);
        break;
      case 'cough':
        this.synthCough(now, pitch, dest, presetId);
        break;

      default:
        // Default fun bounce fallback
        this.synthWetFart(now, pitch, dest, isLoop, presetId);
        break;
    }
  }

  // --- SYNTHESIZERS ---

  private synthAirHorn(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const baseFreqs = [293.66, 370.0, 440.0, 587.3]; // D4, F#4, A4, D5 chord
    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0.001, now);
    hornGain.gain.exponentialRampToValueAtTime(0.7, now + 0.04);

    const duration = isLoop ? 100 : 1.4;
    if (!isLoop) {
      hornGain.gain.setValueAtTime(0.65, now + duration - 0.2);
      hornGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    const oscs: OscillatorNode[] = [];
    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq * pitch, now);
      // slight brass punch bend
      osc.frequency.exponentialRampToValueAtTime(freq * pitch * 1.02, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * pitch, now + 0.2);
      osc.connect(hornGain);
      osc.start(now);
      if (!isLoop) osc.stop(now + duration + 0.05);
      oscs.push(osc);
    });

    hornGain.connect(dest);

    const stopFn = () => {
      oscs.forEach(o => {
        try { o.stop(); } catch { /* ignore */ }
      });
      hornGain.disconnect();
    };

    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthWetFart(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 60 : 1.2;
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.exponentialRampToValueAtTime(0.9, now + 0.03);

    // Sub rumble
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    const startF = 85 * pitch;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(25, startF * 0.4), now + (isLoop ? 1.0 : duration));

    // LFO flutter for bubbling texture
    const lfo = this.ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(24, now);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(45 * pitch, now);
    lfo.connect(osc.frequency);
    lfo.start(now);

    // Modulated noise burst for wet spray sound
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(2.0);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350 * pitch, now);
    filter.Q.value = 3.5;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isLoop ? duration : 0.9));

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);

    osc.connect(master);
    osc.start(now);

    if (!isLoop) {
      master.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.stop(now + duration + 0.05);
      noise.stop(now + duration + 0.05);
      lfo.stop(now + duration + 0.05);
    }

    master.connect(dest);

    const stopFn = () => {
      try {
        osc.stop();
        noise.stop();
        lfo.stop();
      } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthSqueakFart(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 60 : 0.85;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(680 * pitch, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(140 * pitch, now + 0.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    if (!isLoop) osc.stop(now + duration);

    const stopFn = () => {
      try { osc.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthCannonFart(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = 1.6;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(32 * pitch, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250 * pitch, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(1.0, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + duration);

    const stopFn = () => {
      try { osc.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
      if (this.activeNodes.length === 0) this.notifyState(false, null);
    }, duration * 1000);
  }

  private synthBurp(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 60 : 1.3;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(110 * pitch, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(50 * pitch, now + duration);

    // Throat resonance filter
    const formant = this.ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(450 * pitch, now);
    formant.Q.value = 4.0;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(18, now); // throat flutter
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, now);
    lfo.connect(formant.frequency);
    lfo.start(now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.85, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(formant);
    formant.connect(gain);
    gain.connect(dest);
    osc.start(now);
    if (!isLoop) {
      osc.stop(now + duration);
      lfo.stop(now + duration);
    }

    const stopFn = () => {
      try { osc.stop(); lfo.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  public synthHairClipper(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 100 : 3.0;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'sawtooth';

    // 120Hz motor buzz
    const baseHz = 115 * pitch;
    osc1.frequency.setValueAtTime(baseHz, now);
    osc2.frequency.setValueAtTime(baseHz * 2.01, now);

    // Friction blade noise
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(3.0);
    noise.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2400 * pitch, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gain);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.05);

    if (!isLoop) {
      gain.gain.setValueAtTime(0.65, now + duration - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
      noise.stop(now + duration);
    }

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start(now);
    osc2.start(now);
    noise.start(now);

    const stopFn = () => {
      try {
        osc1.stop();
        osc2.stop();
        noise.stop();
      } catch { /* ignore */ }
    };

    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  public synthTaser(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 100 : 2.5;

    // High voltage arc pulse oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45 * pitch, now);

    const waveshaper = this.ctx.createWaveShaper();
    waveshaper.curve = this.makeDistortionCurve(50);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800 * pitch, now);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(2.0);
    noise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200 * pitch, now);
    noiseFilter.Q.value = 5.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.8, now + 0.04);

    osc.connect(waveshaper);
    waveshaper.connect(filter);
    filter.connect(gain);

    noise.connect(noiseFilter);
    noiseFilter.connect(gain);

    gain.connect(dest);

    osc.start(now);
    noise.start(now);

    if (!isLoop) {
      gain.gain.setValueAtTime(0.8, now + duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.stop(now + duration);
      noise.stop(now + duration);
    }

    const stopFn = () => {
      try {
        osc.stop();
        noise.stop();
      } catch { /* ignore */ }
    };

    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthGlassBreak(now: number, pitch: number, dest: GainNode, presetId: string) {
    if (!this.ctx) return;
    const duration = 1.8;

    // Explosive noise shatter
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(2.0);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200 * pitch, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.9, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + 1.0);

    // Resonant glass shards ring
    const shards = [1900, 2800, 3950, 5200, 7100];
    const oscs: OscillatorNode[] = [];
    shards.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * pitch, now);

      oscGain.gain.setValueAtTime(0.01, now + idx * 0.03);
      oscGain.gain.linearRampToValueAtTime(0.2, now + idx * 0.03 + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(now + idx * 0.03);
      osc.stop(now + duration);
      oscs.push(osc);
    });

    const stopFn = () => {
      try { noise.stop(); oscs.forEach(o => o.stop()); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
      if (this.activeNodes.length === 0) this.notifyState(false, null);
    }, duration * 1000);
  }

  private synthDoorbell(now: number, pitch: number, dest: GainNode, presetId: string) {
    if (!this.ctx) return;
    const duration = 2.4;

    // Ding (880Hz A5)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880 * pitch, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.7, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain1);
    gain1.connect(dest);
    osc1.start(now);
    osc1.stop(now + 1.2);

    // Dong (659Hz E5)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25 * pitch, now + 0.65);

    gain2.gain.setValueAtTime(0.001, now + 0.65);
    gain2.gain.linearRampToValueAtTime(0.75, now + 0.67);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(now + 0.65);
    osc2.stop(now + duration);

    const stopFn = () => {
      try { osc1.stop(); osc2.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
      if (this.activeNodes.length === 0) this.notifyState(false, null);
    }, duration * 1000);
  }

  private synthDoorKnock(now: number, pitch: number, dest: GainNode, presetId: string) {
    if (!this.ctx) return;
    const duration = 1.3;
    const knocks = [0, 0.28, 0.56];
    const oscs: OscillatorNode[] = [];

    knocks.forEach(offset => {
      if (!this.ctx) return;
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(45 * pitch, t + 0.08);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.9, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.15);
      oscs.push(osc);
    });

    const stopFn = () => {
      try { oscs.forEach(o => o.stop()); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
      if (this.activeNodes.length === 0) this.notifyState(false, null);
    }, duration * 1000);
  }

  private synthHorrorScream(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 60 : 2.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    // Terror rise
    osc.frequency.setValueAtTime(320 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(1180 * pitch, now + 0.6);
    osc.frequency.linearRampToValueAtTime(950 * pitch, now + duration);

    // Shriek vibrato
    const lfo = this.ctx.createOscillator();
    lfo.type = 'triangle';
    lfo.frequency.setValueAtTime(14, now);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(90, now);
    lfo.connect(osc.frequency);
    lfo.start(now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.75, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    if (!isLoop) {
      osc.stop(now + duration);
      lfo.stop(now + duration);
    }

    const stopFn = () => {
      try { osc.stop(); lfo.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthCreepyWhisper(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 60 : 3.0;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(3.5);
    noise.loop = isLoop;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 * pitch, now);
    filter.Q.value = 8.0;

    // Ghost sweep
    filter.frequency.exponentialRampToValueAtTime(1600 * pitch, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(500 * pitch, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(now);
    if (!isLoop) noise.stop(now + duration);

    const stopFn = () => {
      try { noise.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthDogBark(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 60 : 1.2;
    const barks = [0, 0.4];
    const oscs: OscillatorNode[] = [];

    barks.forEach(offset => {
      if (!this.ctx) return;
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      osc.frequency.setValueAtTime(260 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(80 * pitch, t + 0.22);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750 * pitch, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.85, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.3);
      oscs.push(osc);
    });

    const stopFn = () => {
      try { oscs.forEach(o => o.stop()); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthCatScreech(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 60 : 1.8;

    // Yowl tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(450 * pitch, now);
    osc.frequency.linearRampToValueAtTime(820 * pitch, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(320 * pitch, now + duration);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Hiss overlay
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(2.0);
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200 * pitch, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + 0.9);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    if (!isLoop) osc.stop(now + duration);

    const stopFn = () => {
      try { osc.stop(); noise.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthMosquito(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 120 : 4.0;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    const baseF = 720 * pitch;
    osc1.frequency.setValueAtTime(baseF, now);
    osc2.frequency.setValueAtTime(baseF * 2.05, now);

    // Buzz pitch jitter LFO
    const jitter = this.ctx.createOscillator();
    jitter.type = 'sine';
    jitter.frequency.setValueAtTime(35, now);
    const jitterGain = this.ctx.createGain();
    jitterGain.gain.setValueAtTime(25, now);
    jitter.connect(osc1.frequency);
    jitter.connect(osc2.frequency);
    jitter.start(now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.1);

    if (!isLoop) {
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
      jitter.stop(now + duration);
    }

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);
    osc1.start(now);
    osc2.start(now);

    const stopFn = () => {
      try {
        osc1.stop();
        osc2.stop();
        jitter.stop();
      } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthPoliceSiren(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 100 : 3.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    // American Wail Siren: 650Hz to 1250Hz repeating
    const cycle = 1.0;
    const cycles = Math.ceil(duration / cycle);
    for (let i = 0; i < cycles; i++) {
      const t = now + i * cycle;
      osc.frequency.setValueAtTime(650 * pitch, t);
      osc.frequency.linearRampToValueAtTime(1250 * pitch, t + 0.5 * cycle);
      osc.frequency.linearRampToValueAtTime(650 * pitch, t + cycle);
    }

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.05);

    if (!isLoop) {
      gain.gain.setValueAtTime(0.65, now + duration - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.stop(now + duration);
    }

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);

    const stopFn = () => {
      try { osc.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthCarAlarm(now: number, pitch: number, dest: GainNode, isLoop: boolean, presetId: string) {
    if (!this.ctx) return;
    const duration = isLoop ? 100 : 3.0;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';

    // Rapid alternating 850Hz & 1100Hz pulses
    const pulseLen = 0.12;
    const pulses = Math.ceil(duration / pulseLen);
    for (let i = 0; i < pulses; i++) {
      const t = now + i * pulseLen;
      const f = i % 2 === 0 ? 850 * pitch : 1150 * pitch;
      osc.frequency.setValueAtTime(f, t);
    }

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.05);

    if (!isLoop) {
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.stop(now + duration);
    }

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);

    const stopFn = () => {
      try { osc.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    if (!isLoop) {
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
        if (this.activeNodes.length === 0) this.notifyState(false, null);
      }, duration * 1000);
    }
  }

  private synthSneeze(now: number, pitch: number, dest: GainNode, presetId: string) {
    if (!this.ctx) return;
    const duration = 1.2;

    // Inhalation "Ah-"
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320 * pitch, now);
    osc.frequency.linearRampToValueAtTime(540 * pitch, now + 0.35);

    oscGain.gain.setValueAtTime(0.01, now);
    oscGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.45);

    // Explosive "-Choo!" burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(1.0);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 * pitch, now + 0.4);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now + 0.4);
    noiseGain.gain.linearRampToValueAtTime(0.9, now + 0.43);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now + 0.4);
    noise.stop(now + duration);

    const stopFn = () => {
      try { osc.stop(); noise.stop(); } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
      if (this.activeNodes.length === 0) this.notifyState(false, null);
    }, duration * 1000);
  }

  private synthCough(now: number, pitch: number, dest: GainNode, presetId: string) {
    if (!this.ctx) return;
    const duration = 1.1;
    const coughs = [0, 0.32];
    const oscs: AudioNode[] = [];

    coughs.forEach(offset => {
      if (!this.ctx) return;
      const t = now + offset;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 * pitch, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.85, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      noise.start(t);
      noise.stop(t + 0.25);
      oscs.push(noise);
    });

    const stopFn = () => {
      try {
        oscs.forEach(o => {
          if ('stop' in o && typeof (o as AudioBufferSourceNode).stop === 'function') {
            (o as AudioBufferSourceNode).stop();
          }
        });
      } catch { /* ignore */ }
    };
    this.activeNodes.push({ stop: stopFn, id: presetId });
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => n.id !== presetId);
      if (this.activeNodes.length === 0) this.notifyState(false, null);
    }, duration * 1000);
  }
}

export const soundEngine = new SoundEngine();
