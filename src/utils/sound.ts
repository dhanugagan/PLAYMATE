// Synthesized Web Audio sound effects & Guess-the-Sound clips (no external audio assets required)

class SoundFX {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq: number, duration = 0.12, type: OscillatorType = 'sine', volume = 0.12, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  click() {
    this.playTone(540, 0.06, 'triangle', 0.08);
  }

  flip() {
    this.playTone(420, 0.08, 'sine', 0.07);
    this.playTone(620, 0.08, 'sine', 0.06, 0.04);
  }

  correct() {
    this.playTone(523.25, 0.12, 'triangle', 0.11, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.12, 0.08);
    this.playTone(783.99, 0.2, 'triangle', 0.12, 0.16);
  }

  wrong() {
    this.playTone(210, 0.16, 'sawtooth', 0.08, 0);
    this.playTone(165, 0.22, 'sawtooth', 0.08, 0.1);
  }

  levelUp() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((n, i) => this.playTone(n, 0.16, 'triangle', 0.11, i * 0.075));
  }

  victory() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => this.playTone(n, 0.24, 'triangle', 0.13, i * 0.09));
  }

  // Synthesized recognizable sound clips for Game #40 (Guess the Sound)
  playClip(clipId: string) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (clipId === 'siren') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(920, now + 0.4);
      osc.frequency.linearRampToValueAtTime(520, now + 0.8);
      osc.frequency.linearRampToValueAtTime(920, now + 1.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.35);
    } else if (clipId === 'bird') {
      [0, 0.22, 0.48].forEach((offset) => {
        const now = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(2900, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(2100, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      });
    } else if (clipId === 'piano') {
      [261.63, 329.63, 392.0, 523.25].forEach((freq, i) => {
        this.playTone(freq, 0.45, 'triangle', 0.11, i * 0.16);
      });
    } else if (clipId === 'clock') {
      [0, 0.35, 0.7, 1.05].forEach((offset, idx) => {
        this.playTone(idx % 2 === 0 ? 1150 : 880, 0.04, 'square', 0.09, offset);
      });
    } else if (clipId === 'laser') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } else if (clipId === 'train') {
      [0, 0.45].forEach((offset) => {
        this.playTone(311.13, 0.35, 'sawtooth', 0.06, offset);
        this.playTone(392.0, 0.35, 'sawtooth', 0.06, offset);
      });
    } else if (clipId === 'frog') {
      [0, 0.32].forEach((offset) => {
        const now = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      });
    } else {
      // Telephone ring / bell
      [0, 0.12, 0.24, 0.65, 0.77, 0.89].forEach((offset) => {
        this.playTone(1240, 0.09, 'sine', 0.1, offset);
      });
    }
  }
}

export const soundFX = new SoundFX();
