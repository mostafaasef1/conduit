// Pure Web Audio API tactile telemetry synthesizer for CONDUIT
// Simulates piezo pipe-modem FSK chirps, frequency-droop chimes, and valve solenoids

class SonicTelemetry {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
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

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playPipeChirp();
    }
    return this.enabled;
  }

  // Simulates a 64-byte FSK acoustic packet hopping along a steel water pipe
  public playPipeChirp() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [1680, 2240, 1920, 2560];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.032);
      gain.gain.setValueAtTime(0.001, now + idx * 0.032);
      gain.gain.exponentialRampToValueAtTime(0.045, now + idx * 0.032 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.032 + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.032);
      osc.stop(now + idx * 0.032 + 0.032);
    });
  }

  // Amber/Crimson early warning chime for grid frequency droop or toxic water slug
  public playWarningTone(critical = false) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = critical ? [587.33, 440, 587.33] : [523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = critical ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.11);
      gain.gain.setValueAtTime(0.001, now + i * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.06, now + i * 0.11 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.095);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.1);
    });
  }

  // Mechanical solenoid lock sound for isolating water valves or air dampers
  public playValveLock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Warm 3-note confirmation when a family Proof-of-Life beacon arrives
  public playBeaconConfirm() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.065);
      gain.gain.setValueAtTime(0.001, now + idx * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.05, now + idx * 0.065 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.15);
    });
  }
}

export const sonic = new SonicTelemetry();
