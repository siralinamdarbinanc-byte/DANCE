/**
 * Web Audio API Synth to play romantic tango/waltz melody previews in the browser
 */

class AudioPreviewEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private activeOscillators: OscillatorNode[] = [];
  private currentTrackId: string | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playTrackPreview(trackId: string, type: 'tango' | 'waltz' | 'solo' | 'fusion', onEnd?: () => void) {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    this.isPlaying = true;
    this.currentTrackId = trackId;

    // Define melody notes frequencies (Hz) for different dance preview feels
    let notes: number[] = [];
    let noteDuration = 0.4;

    if (type === 'tango') {
      // Passionate Tango minor melody (A minor / D minor)
      notes = [220, 261.63, 329.63, 440, 415.3, 329.63, 261.63, 220, 293.66, 349.23, 440, 523.25, 493.88];
      noteDuration = 0.35;
    } else if (type === 'waltz') {
      // 3/4 Waltz melody
      notes = [261.63, 329.63, 392.00, 329.63, 392.00, 293.66, 349.23, 440.00, 349.23, 440.00];
      noteDuration = 0.5;
    } else if (type === 'solo') {
      // Gentle romantic bridal solo
      notes = [329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63, 261.63, 329.63, 392.00];
      noteDuration = 0.6;
    } else {
      // Fusion
      notes = [220, 293.66, 329.63, 349.23, 440, 392.00, 329.63, 293.66];
      noteDuration = 0.45;
    }

    let startTime = this.audioCtx.currentTime + 0.05;

    notes.forEach((freq, index) => {
      if (!this.audioCtx || !this.isPlaying) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Warm string sound combination
      osc.type = index % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + index * noteDuration);

      // Envelope
      gain.gain.setValueAtTime(0.001, startTime + index * noteDuration);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + index * noteDuration + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + index * noteDuration + noteDuration - 0.02);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime + index * noteDuration);
      osc.stop(startTime + index * noteDuration + noteDuration);

      this.activeOscillators.push(osc);
    });

    const totalDuration = notes.length * noteDuration * 1000 + 200;
    setTimeout(() => {
      if (this.currentTrackId === trackId) {
        this.isPlaying = false;
        this.currentTrackId = null;
        if (onEnd) onEnd();
      }
    }, totalDuration);
  }

  public stop() {
    this.isPlaying = false;
    this.currentTrackId = null;
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.activeOscillators = [];
  }

  public getCurrentTrackId(): string | null {
    return this.isPlaying ? this.currentTrackId : null;
  }
}

export const audioSynth = new AudioPreviewEngine();
