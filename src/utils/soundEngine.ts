class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlayingBgm = false;
  private bgmInterval: number | null = null;
  private stepIndex = 0;
  private currentWing: 'left_classic' | 'right_cyber' = 'left_classic';

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setWingMode(wing: 'left_classic' | 'right_cyber') {
    this.currentWing = wing;
  }

  public toggleBgm(): boolean {
    if (this.isPlayingBgm) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public startBgm() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (this.isPlayingBgm) return;

    this.isPlayingBgm = true;
    this.stepIndex = 0;

    // Traditional Chinese Pentatonic Melody (Gong, Shang, Jue, Zhi, Yu) for Ancient wing (고대: 진시황 지하궁전 & 진나라 마을)
    // Notes: D4, E4, G4, A4, B4, D5, E5, G5 with Guzheng/Dizi flute phrasing
    const ancientChineseNotes = [
      587.33, 440.0, 392.0, 329.63, 293.66, 392.0, 440.0, 587.33,
      659.25, 587.33, 440.0, 493.88, 440.0, 392.0, 329.63, 293.66,
      392.0, 440.0, 587.33, 659.25, 783.99, 659.25, 587.33, 440.0,
      493.88, 440.0, 392.0, 329.63, 392.0, 293.66, 293.66, 293.66,
    ];

    // Original Modern Ambient Chiptune sequence maintained for Modern wing (현대: 병마용갱 & 만리장성)
    const modernNotes = [
      293.66, 349.23, 440.0, 523.25, 659.25, 523.25, 440.0, 349.23,
      261.63, 329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 329.63,
      220.0, 293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 293.66,
      196.0, 261.63, 329.63, 392.0, 493.88, 392.0, 329.63, 261.63,
    ];

    const playStep = () => {
      if (!this.isPlayingBgm || !this.ctx) return;

      const now = this.ctx.currentTime;
      const isAncient = this.currentWing === 'left_classic';
      const notes = isAncient ? ancientChineseNotes : modernNotes;
      const freq = notes[this.stepIndex % notes.length];

      // Main melody oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isAncient) {
        // Chinese plucked string (Guzheng/Pipa) & flute timbre
        osc.type = this.stepIndex % 4 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.065, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      } else {
        // Modern ambient chiptune timbre
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.055, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isAncient ? 0.44 : 0.36));

      // Traditional resonant gong / bass drone every 8 steps
      if (this.stepIndex % 8 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = isAncient ? 'triangle' : 'sine';
        bassOsc.frequency.setValueAtTime(isAncient ? 146.83 : freq * 0.5, now); // D3 fundamental for Chinese mode

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(0.055, now + 0.06);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + (isAncient ? 2.4 : 1.8));

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + (isAncient ? 2.5 : 1.9));
      }

      this.stepIndex++;
    };

    playStep();
    this.bgmInterval = window.setInterval(playStep, 340);
  }

  public playTypewriterBlip() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750 + Math.random() * 200, now);
    gain.gain.setValueAtTime(0.012, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public playNpcTalk() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [440, 554.37, 659.25];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + idx * 0.045);
      gain.gain.setValueAtTime(0.03, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.08);
    });
  }

  public playTransformChime(toRightWing: boolean) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = toRightWing
      ? [330, 440, 554.37, 659.25, 880]
      : [880, 659.25, 554.37, 440, 330];

    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.055);
      gain.gain.setValueAtTime(0.05, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.18);
    });
  }

  public playExhibitOpen() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.06);
      gain.gain.setValueAtTime(0.045, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  }

  public playFootstep() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const soundEngine = new SoundEngine();
