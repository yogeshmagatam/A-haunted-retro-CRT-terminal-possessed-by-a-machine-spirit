/**
 * NecroShell Procedural Audio Engine
 * Maximum Loudness Mastering + Escalating Horror Synthesizer
 */

class NecroAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.masterGain = null;
    this.compressor = null;
    this.droneGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.humOsc = null;
    this.possessionLevel = 0;
    this.takeoverGain = null;
    this.darkDroneOsc = null;
    this.psychopathAudio = null;
    this.psychopathBuffer = null;
    this.psychopathSource = null;
    this.screamAudio1 = null;
    this.screamAudio2 = null;
    this.screamBuffer1 = null;
    this.screamBuffer2 = null;
    this.isPreloadingAssets = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master gain set high for maximum output volume
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

      // Aggressive Compressor to maximize perceived loudness (LUFS) without clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.001, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this.setupAmbientDrone();
      this.preloadAudioAssets();
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  async preloadAudioAssets() {
    if (this.isPreloadingAssets) return;
    this.isPreloadingAssets = true;
    try {
      if (typeof Audio !== 'undefined') {
        if (!this.psychopathAudio) {
          this.psychopathAudio = new Audio('/psychopath_laugh.mp3');
          this.psychopathAudio.preload = 'auto';
        }
        if (!this.screamAudio1) {
          this.screamAudio1 = new Audio('/scary_maze_scream.mp3');
          this.screamAudio1.preload = 'auto';
        }
        if (!this.screamAudio2) {
          this.screamAudio2 = new Audio('/jumpscare_scream.mp3');
          this.screamAudio2.preload = 'auto';
        }
      }

      if (this.ctx && typeof fetch !== 'undefined') {
        const fetchAndDecode = async (url) => {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const arrayBuf = await res.arrayBuffer();
              return await this.ctx.decodeAudioData(arrayBuf);
            }
          } catch (_) {}
          return null;
        };

        const [laughBuf, buf1, buf2] = await Promise.all([
          fetchAndDecode('/psychopath_laugh.mp3'),
          fetchAndDecode('/scary_maze_scream.mp3'),
          fetchAndDecode('/jumpscare_scream.mp3')
        ]);
        if (laughBuf) this.psychopathBuffer = laughBuf;
        if (buf1) this.screamBuffer1 = buf1;
        if (buf2) this.screamBuffer2 = buf2;
      }
    } catch (e) {
      console.warn('Preload audio assets failed:', e);
    }
  }

  enable() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = true;
    if (this.droneGain) {
      this.droneGain.gain.setTargetAtTime(0.18, this.ctx.currentTime, 0.2);
    }
  }

  disable() {
    this.enabled = false;
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
    }
  }

  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  setupAmbientDrone() {
    if (!this.ctx) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, this.ctx.currentTime);
    filter.Q.setValueAtTime(4, this.ctx.currentTime);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(55.8, this.ctx.currentTime);

    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'triangle';
    this.humOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

    this.droneOsc1.connect(filter);
    this.droneOsc2.connect(filter);
    this.humOsc.connect(humGain);

    filter.connect(this.droneGain);
    humGain.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.humOsc.start();
  }

  setPossessionLevel(level) {
    this.possessionLevel = Math.max(0, Math.min(100, level));
    if (!this.ctx || !this.enabled) return;

    const detune = (this.possessionLevel / 100) * 160;
    this.droneOsc1.detune.setTargetAtTime(detune, this.ctx.currentTime, 0.4);
    this.droneOsc2.detune.setTargetAtTime(-detune * 1.5, this.ctx.currentTime, 0.4);
  }

  playKeyClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const pitchVariation = (Math.random() - 0.5) * 80;
      const baseFreq = this.possessionLevel > 60 ? 320 : 850;
      osc.type = this.possessionLevel > 70 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq + pitchVariation, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (_) {}
  }

  playSpectralWhisper() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.4;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1300 + Math.random() * 800, now);
      filter.Q.setValueAtTime(5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch (_) {}
  }

  playGlitch() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.14);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch (_) {}
  }

  playExorcismChime() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [528, 660, 792, 1056];

      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.08 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.3);
      });
    } catch (_) {}
  }

  // =========================================================================
  // MAXIMUM LOUDNESS DEMONIC JUMPSCARE & ESCALATING AUDIO ENGINE
  // =========================================================================

  playTakeoverSound() {
    this.startEscalatingTakeover();
  }

  startEscalatingTakeover() {
    this.enable();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;

    // Base volume for suspense
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(0.7, now);
    }

    // Low-frequency ominous horror sub-bass drone (NO ALARM OR SIREN SOUND)
    this.takeoverGain = this.ctx.createGain();
    this.takeoverGain.gain.setValueAtTime(0.25, now);
    this.takeoverGain.connect(this.masterGain);

    this.darkDroneOsc = this.ctx.createOscillator();
    this.darkDroneOsc.type = 'sine';
    this.darkDroneOsc.frequency.setValueAtTime(45, now);
    this.darkDroneOsc.frequency.linearRampToValueAtTime(32, now + 15);
    this.darkDroneOsc.connect(this.takeoverGain);
    this.darkDroneOsc.start(now);

    // PLAY THE CREEPY PSYCHOPATH'S LAUGH THROUGHOUT THE COUNTDOWN!
    try {
      if (!this.psychopathAudio) {
        this.psychopathAudio = document.getElementById('psychopath-laugh-audio') || new Audio('/psychopath_laugh.mp3');
        this.psychopathAudio.preload = 'auto';
      }
      this.psychopathAudio.currentTime = 0;
      this.psychopathAudio.volume = 1.0;
      const p = this.psychopathAudio.play();
      if (p && p.catch) p.catch(() => {});
    } catch (err) {
      console.warn('Psychopath laugh playback error:', err);
    }

    // Also route through Web Audio if pre-decoded for eerie asylum spatial reverb & echo
    if (this.psychopathBuffer) {
      try {
        this.psychopathSource = this.ctx.createBufferSource();
        this.psychopathSource.buffer = this.psychopathBuffer;
        
        const laughGain = this.ctx.createGain();
        laughGain.gain.setValueAtTime(1.4, now);
        
        const echoDelay = this.ctx.createDelay();
        echoDelay.delayTime.setValueAtTime(0.24, now);
        const echoGain = this.ctx.createGain();
        echoGain.gain.setValueAtTime(0.35, now);
        
        this.psychopathSource.connect(laughGain);
        laughGain.connect(this.masterGain);
        laughGain.connect(echoDelay);
        echoDelay.connect(echoGain);
        echoGain.connect(echoDelay);
        echoGain.connect(this.masterGain);

        this.psychopathSource.start(now);
      } catch (_) {}
    }
  }

  // Tense rhythmic heartbeat thud during countdown to build suspense
  playSuspenseHeartbeat() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.18);

      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (_) {}
  }

  // Called every second during countdown (15s -> 0s)
  updateTakeoverIntensity(secondsRemaining) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Progress goes from 0.0 at 15s to 1.0 at 0s
    const progress = Math.max(0, Math.min(1, (15 - secondsRemaining) / 15));

    // Swell volume as the psychopath's laugh escalates
    if (this.masterGain && secondsRemaining > 3) {
      const targetVolume = 0.7 + (progress * 0.5);
      this.masterGain.gain.setTargetAtTime(targetVolume, now, 0.1);
    }

    // Deep suspense heartbeat thuds underneath the laugh
    if (secondsRemaining > 3) {
      this.playSuspenseHeartbeat();
    }

    // Layer unhinged manic psychopathic laughing bursts that climb in pitch and hysteria
    if (secondsRemaining === 12 || secondsRemaining === 9 || secondsRemaining === 6 || secondsRemaining === 4) {
      const pitchMultiplier = 1.0 + progress * 0.35;
      const burstVolume = 0.85 + progress * 0.45;
      this.playRapidLaughBurst(burstVolume, pitchMultiplier);
    }

    // THE CLIMAX: AT 3 SECONDS WHEN THE GHOST JUMPS OUT OF THE SCREEN:
    // This is where the terrifying, deafening REAL LIFE JUMPSCARE SCREAM erupts!
    if (secondsRemaining === 3) {
      this.playFinalGhostJumpscare();
    }
  }

  // Final deafening ghost jumpscare when ghost lunges out of the screen at the end
  playFinalGhostJumpscare() {
    this.enable();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;

    // Peak volume overdrive for the terrifying jumpscare scream
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(3.2, now);
    }

    // 1. PRIMARY: THE AUTHENTIC BLOOD-CURDLING REAL-LIFE SCREAMING AUDIO!
    // Trigger via HTML5 Audio Elements for instantaneous zero-latency playback
    try {
      if (!this.screamAudio1) {
        this.screamAudio1 = new Audio('/scary_maze_scream.mp3');
        this.screamAudio1.preload = 'auto';
      }
      this.screamAudio1.currentTime = 0;
      this.screamAudio1.volume = 1.0;
      const p1 = this.screamAudio1.play();
      if (p1 && p1.catch) p1.catch(() => {});

      if (!this.screamAudio2) {
        this.screamAudio2 = new Audio('/jumpscare_scream.mp3');
        this.screamAudio2.preload = 'auto';
      }
      this.screamAudio2.currentTime = 0;
      this.screamAudio2.volume = 0.9;
      const p2 = this.screamAudio2.play();
      if (p2 && p2.catch) p2.catch(() => {});
    } catch (err) {
      console.warn('HTML5 scream audio playback error:', err);
    }

    // Also trigger via Web Audio BufferSource if pre-decoded for maximum loudness & spatial presence
    if (this.screamBuffer1) {
      try {
        const source1 = this.ctx.createBufferSource();
        source1.buffer = this.screamBuffer1;
        const gain1 = this.ctx.createGain();
        gain1.gain.setValueAtTime(2.2, now);
        source1.connect(gain1);
        gain1.connect(this.masterGain);
        source1.start(now);
      } catch (_) {}
    }

    if (this.screamBuffer2) {
      try {
        const source2 = this.ctx.createBufferSource();
        source2.buffer = this.screamBuffer2;
        const gain2 = this.ctx.createGain();
        gain2.gain.setValueAtTime(1.8, now);
        source2.connect(gain2);
        gain2.connect(this.masterGain);
        source2.start(now);
      } catch (_) {}
    }

    // 2. High-Frequency Banshee Harmonic Shriek Layer (adds piercing ultrasonic frequency)
    const shrieker = this.ctx.createOscillator();
    shrieker.type = 'sawtooth';
    shrieker.frequency.setValueAtTime(2800, now);
    shrieker.frequency.exponentialRampToValueAtTime(750, now + 1.8);

    const shriekFilter = this.ctx.createBiquadFilter();
    shriekFilter.type = 'bandpass';
    shriekFilter.frequency.setValueAtTime(2400, now);
    shriekFilter.Q.setValueAtTime(3.5, now);

    const shriekGain = this.ctx.createGain();
    shriekGain.gain.setValueAtTime(1.2, now);
    shriekGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    shrieker.connect(shriekFilter);
    shriekFilter.connect(shriekGain);
    shriekGain.connect(this.masterGain);
    shrieker.start(now);
    shrieker.stop(now + 2.0);

    // 3. Deafening White-Noise Shockwave Glass Shatter Blast (CRT monitor shattering)
    const blast = this.ctx.createBufferSource();
    const bSize = Math.floor(this.ctx.sampleRate * 0.7);
    const bBuf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const bData = bBuf.getChannelData(0);
    for (let i = 0; i < bSize; i++) {
      bData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bSize * 0.2));
    }
    blast.buffer = bBuf;
    const blastGain = this.ctx.createGain();
    blastGain.gain.setValueAtTime(2.6, now);
    blastGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    blast.connect(blastGain);
    blastGain.connect(this.masterGain);
    blast.start(now);

    // 4. Subwoofer Earthquake Chest-Punch Impact (85Hz -> 20Hz deep sub rumble)
    const rumble = this.ctx.createOscillator();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(85, now);
    rumble.frequency.exponentialRampToValueAtTime(22, now + 1.8);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(2.4, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    rumble.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    rumble.start(now);
    rumble.stop(now + 2.1);
  }

  stopTakeoverSound() {
    try {
      if (this.darkDroneOsc) {
        this.darkDroneOsc.stop();
        this.darkDroneOsc = null;
      }
      if (this.psychopathAudio) {
        this.psychopathAudio.pause();
        this.psychopathAudio.currentTime = 0;
      }
      if (this.psychopathSource) {
        try { this.psychopathSource.stop(); } catch (_) {}
        this.psychopathSource = null;
      }
      if (this.screamAudio1) {
        this.screamAudio1.pause();
        this.screamAudio1.currentTime = 0;
      }
      if (this.screamAudio2) {
        this.screamAudio2.pause();
        this.screamAudio2.currentTime = 0;
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      }
    } catch (_) {}
  }

  // Fast manic laughing burst
  playRapidLaughBurst(volume = 1.0, pitchMult = 1.0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bursts = [
      { t: 0.00, dur: 0.14, f1: 620 * pitchMult, f2: 440 * pitchMult },
      { t: 0.15, dur: 0.13, f1: 660 * pitchMult, f2: 460 * pitchMult },
      { t: 0.29, dur: 0.14, f1: 590 * pitchMult, f2: 390 * pitchMult },
      { t: 0.44, dur: 0.22, f1: 540 * pitchMult, f2: 280 * pitchMult },
    ];

    bursts.forEach(b => {
      const start = now + b.t;
      const end = start + b.dur;

      // Unison detuned pair for double loudness
      [-8, 8].forEach(detune => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.detune.setValueAtTime(detune, start);
        osc.frequency.setValueAtTime(b.f1, start);
        osc.frequency.exponentialRampToValueAtTime(b.f2, end);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100 * pitchMult, start);
        filter.Q.setValueAtTime(4.5, start);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, start);
        gain.gain.linearRampToValueAtTime(volume * 0.8, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, end);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(end + 0.02);
      });
    });
  }

  // Full High-Impact Jumpscare Creepy Laugh with Triple-Unison Layering
  playCreepyLaugh(volumeMultiplier = 1.0) {
    this.enable();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // Peak master gain for shock
      if (this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(1.4 * volumeMultiplier, now);
      }

      // 1. Loud Explosive Transient (0ms)
      const jumpBurst = this.ctx.createBufferSource();
      const burstSize = Math.floor(this.ctx.sampleRate * 0.25);
      const burstBuffer = this.ctx.createBuffer(1, burstSize, this.ctx.sampleRate);
      const bData = burstBuffer.getChannelData(0);
      for (let i = 0; i < burstSize; i++) {
        bData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (burstSize * 0.2));
      }
      jumpBurst.buffer = burstBuffer;

      const jumpFilter = this.ctx.createBiquadFilter();
      jumpFilter.type = 'highpass';
      jumpFilter.frequency.setValueAtTime(300, now);

      const jumpGain = this.ctx.createGain();
      jumpGain.gain.setValueAtTime(1.2 * volumeMultiplier, now);
      jumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      jumpBurst.connect(jumpFilter);
      jumpFilter.connect(jumpGain);
      jumpGain.connect(this.masterGain);
      jumpBurst.start(now);

      // 2. Echo Delay Line
      const delay = this.ctx.createDelay();
      delay.delayTime.setValueAtTime(0.18, now);
      const delayGain = this.ctx.createGain();
      delayGain.gain.setValueAtTime(0.55, now);
      delay.connect(delayGain);
      delayGain.connect(delay);
      delayGain.connect(this.masterGain);

      // 3. Triple Unison Demonic Laugh Syllables
      const laughBursts = [
        { time: 0.04, duration: 0.22, startFreq: 560, endFreq: 380, gain: 1.1 },
        { time: 0.28, duration: 0.22, startFreq: 520, endFreq: 350, gain: 1.15 },
        { time: 0.52, duration: 0.20, startFreq: 490, endFreq: 320, gain: 1.2 },
        { time: 0.74, duration: 0.15, startFreq: 550, endFreq: 390, gain: 1.25 },
        { time: 0.91, duration: 0.16, startFreq: 510, endFreq: 360, gain: 1.25 },
        { time: 1.12, duration: 0.26, startFreq: 460, endFreq: 280, gain: 1.3 },
        { time: 1.42, duration: 0.30, startFreq: 410, endFreq: 240, gain: 1.3 },
        { time: 1.76, duration: 0.34, startFreq: 360, endFreq: 190, gain: 1.25 },
        { time: 2.15, duration: 1.05, startFreq: 320, endFreq: 100, gain: 1.35 },
      ];

      laughBursts.forEach(burst => {
        const burstStart = now + burst.time;
        const burstEnd = burstStart + burst.duration;

        // Triple detuned unison oscillators (-12, 0, +12 cents) for huge vocal spread
        [-12, 0, 12].forEach(detune => {
          const osc = this.ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.detune.setValueAtTime(detune, burstStart);
          osc.frequency.setValueAtTime(burst.startFreq, burstStart);
          osc.frequency.exponentialRampToValueAtTime(burst.endFreq, burstEnd);

          const subOsc = this.ctx.createOscillator();
          subOsc.type = 'triangle';
          subOsc.frequency.setValueAtTime(burst.startFreq * 0.5, burstStart);
          subOsc.frequency.exponentialRampToValueAtTime(burst.endFreq * 0.5, burstEnd);

          const formant = this.ctx.createBiquadFilter();
          formant.type = 'bandpass';
          formant.frequency.setValueAtTime(950 + (burst.startFreq - 300) * 1.5, burstStart);
          formant.Q.setValueAtTime(4.0, burstStart);

          const syllGain = this.ctx.createGain();
          syllGain.gain.setValueAtTime(0.01, burstStart);
          syllGain.gain.linearRampToValueAtTime(burst.gain * volumeMultiplier * 0.6, burstStart + 0.025);
          syllGain.gain.exponentialRampToValueAtTime(0.001, burstEnd);

          osc.connect(formant);
          subOsc.connect(formant);
          formant.connect(syllGain);
          syllGain.connect(this.masterGain);
          syllGain.connect(delay);

          osc.start(burstStart);
          subOsc.start(burstStart);
          osc.stop(burstEnd + 0.05);
          subOsc.stop(burstEnd + 0.05);
        });
      });

      // 4. Subwoofer Earthquake Rumble
      const rumble = this.ctx.createOscillator();
      const rumbleGain = this.ctx.createGain();
      rumble.type = 'sine';
      rumble.frequency.setValueAtTime(50, now);
      rumble.frequency.linearRampToValueAtTime(25, now + 3.8);
      rumbleGain.gain.setValueAtTime(0.55 * volumeMultiplier, now);
      rumbleGain.gain.linearRampToValueAtTime(0.001, now + 4.2);
      rumble.connect(rumbleGain);
      rumbleGain.connect(this.masterGain);
      rumble.start(now);
      rumble.stop(now + 4.3);

    } catch (err) {
      console.warn('Creepy laugh synthesis error:', err);
    }
  }
}

export const necroAudio = new NecroAudioEngine();
