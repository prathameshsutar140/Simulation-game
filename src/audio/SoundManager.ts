/**
 * Procedural Web Audio synthesizer for MetroLife: Open World City Simulator
 * Zero external audio files, 100% generated in real time.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Engine oscillators
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineDrive: WaveShaperNode | null = null;
  private engineRunning: boolean = false;

  // Screech synth
  private screechGain: GainNode | null = null;
  private screechNoise: AudioBufferSourceNode | null = null;

  // Rain synth
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;

  // Horn
  private hornGain: GainNode | null = null;
  private hornOsc1: OscillatorNode | null = null;
  private hornOsc2: OscillatorNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.9;
      this.sfxGain.connect(this.masterGain);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.45;
      this.engineGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.35;
      this.ambientGain.connect(this.masterGain);

      this.setupEngineSynth();
      this.setupScreechSynth();
      this.setupRainSynth();
    } catch {
      // AudioContext not allowed before user gesture
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private makeDistortionCurve(amount: number = 20): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private setupEngineSynth() {
    if (!this.ctx || !this.engineGain) return;

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 450;
    this.engineFilter.Q.value = 2.5;

    this.engineDrive = this.ctx.createWaveShaper();
    (this.engineDrive as unknown as { curve: Float32Array }).curve = this.makeDistortionCurve(18);
    this.engineDrive.oversample = '2x';

    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.value = 55;

    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.value = 110;

    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = 'sine';
    this.engineSubOsc.frequency.value = 28;

    this.engineOsc1.connect(this.engineDrive);
    this.engineOsc2.connect(this.engineDrive);
    this.engineSubOsc.connect(this.engineDrive);

    this.engineDrive.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
    this.engineSubOsc.start();
    this.engineRunning = true;
  }

  private setupScreechSynth() {
    if (!this.ctx || !this.sfxGain) return;

    // Procedural white noise buffer for tire friction
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.screechGain = this.ctx.createGain();
    this.screechGain.gain.value = 0;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 4.0;

    this.screechNoise = this.ctx.createBufferSource();
    this.screechNoise.buffer = noiseBuffer;
    this.screechNoise.loop = true;
    this.screechNoise.connect(filter);
    filter.connect(this.screechGain);
    this.screechGain.connect(this.sfxGain);

    this.screechNoise.start();
  }

  private setupRainSynth() {
    if (!this.ctx || !this.ambientGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = noiseBuffer;
    this.rainSource.loop = true;
    this.rainSource.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.ambientGain);

    this.rainSource.start();
  }

  public updateEngineSound(rpmRatio: number, throttle: number, speedKmH: number) {
    if (!this.ctx || !this.engineRunning || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain) return;

    const t = this.ctx.currentTime;
    // Base frequency from idle 45Hz to max ~320Hz
    const baseFreq = 42 + rpmRatio * 220 + throttle * 35;
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, t, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, t, 0.05);
    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.05);
    }

    // Filter opens up as throttle and RPM increase
    const filterFreq = 300 + throttle * 2800 + rpmRatio * 1800;
    this.engineFilter.frequency.setTargetAtTime(filterFreq, t, 0.06);

    // Engine volume: higher when under throttle
    const targetGain = this.isMuted ? 0 : 0.18 + throttle * 0.45 + (speedKmH / 250) * 0.25;
    this.engineGain.gain.setTargetAtTime(targetGain, t, 0.08);
  }

  public updateScreech(slipAmount: number) {
    if (!this.ctx || !this.screechGain) return;
    const targetGain = this.isMuted ? 0 : Math.min(1.0, Math.max(0, slipAmount * 0.6));
    this.screechGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  public setRainActive(active: boolean) {
    if (!this.ctx || !this.rainGain) return;
    const target = active && !this.isMuted ? 0.4 : 0;
    this.rainGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.5);
  }

  public playHorn(start: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    if (start) {
      if (this.hornOsc1) return;
      this.hornGain = this.ctx.createGain();
      this.hornGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, t);

      this.hornOsc1 = this.ctx.createOscillator();
      this.hornOsc1.type = 'sawtooth';
      this.hornOsc1.frequency.value = 420;

      this.hornOsc2 = this.ctx.createOscillator();
      this.hornOsc2.type = 'sawtooth';
      this.hornOsc2.frequency.value = 510;

      this.hornOsc1.connect(this.hornGain);
      this.hornOsc2.connect(this.hornGain);
      this.hornGain.connect(this.sfxGain);

      this.hornOsc1.start();
      this.hornOsc2.start();
    } else {
      if (this.hornGain && this.hornOsc1 && this.hornOsc2) {
        this.hornGain.gain.setTargetAtTime(0, t, 0.05);
        setTimeout(() => {
          this.hornOsc1?.stop();
          this.hornOsc2?.stop();
          this.hornOsc1 = null;
          this.hornOsc2 = null;
          this.hornGain = null;
        }, 80);
      }
    }
  }

  public playGearShift() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    filter.type = 'lowpass';
    filter.frequency.value = 600;

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playCrash(speedKmH: number) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const intensity = Math.min(1.0, Math.max(0.2, speedKmH / 120));

    // Heavy low punch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);

    oscGain.gain.setValueAtTime(0.7 * intensity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  public playCheckpoint() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.28);
    });
  }

  public playMissionComplete() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const fanfare = [
      { f: 523.25, d: 0.12, w: 0 },
      { f: 659.25, d: 0.12, w: 0.12 },
      { f: 783.99, d: 0.12, w: 0.24 },
      { f: 1046.5, d: 0.4, w: 0.36 },
      { f: 880.0, d: 0.15, w: 0.76 },
      { f: 1046.5, d: 0.6, w: 0.92 }
    ];
    fanfare.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = note.f;
      gain.gain.setValueAtTime(0.4, t + note.w);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.w + note.d);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + note.w);
      osc.stop(t + note.w + note.d + 0.05);
    });
  }

  public playUiClick() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.04);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  public setVolumes(master: number, sfx: number, engine: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : master, t, 0.05);
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(sfx, t, 0.05);
    if (this.engineGain) this.engineGain.gain.setTargetAtTime(engine * 0.45, t, 0.05);
  }
}

export const sounds = new SoundManager();
