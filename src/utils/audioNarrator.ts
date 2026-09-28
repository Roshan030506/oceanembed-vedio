export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: 'female' | 'male' | 'neutral';
  persona: string;
}

class AudioNarratorManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;
  private rate: number = 1.0;
  private selectedVoiceId: string = 'default';
  private availableVoices: SpeechSynthesisVoice[] = [];
  private onSpeakingChangeCallbacks: ((isSpeaking: boolean) => void)[] = [];
  private onWaveformUpdateCallbacks: ((level: number) => void)[] = [];
  private animationFrameId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
    this.startWaveformLoop();
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.availableVoices = voices.filter(v => v.lang.startsWith('en'));
  }

  public getVoices(): VoiceOption[] {
    const list: VoiceOption[] = [
      { id: 'en-US-natural-f', name: 'Dr. Sarah Lin (Marine Scientist - US)', lang: 'en-US', gender: 'female', persona: 'Clear, academic, measured' },
      { id: 'en-GB-natural-m', name: 'Dr. David Evans (Oceanographer - UK)', lang: 'en-GB', gender: 'male', persona: 'Distinguished, warm, authoritative' },
      { id: 'en-US-natural-m', name: 'Marcus Vance (AI Engineering Lead - US)', lang: 'en-US', gender: 'male', persona: 'Crisp, technical, modern' },
    ];

    if (this.availableVoices.length > 0) {
      this.availableVoices.slice(0, 5).forEach((v, idx) => {
        if (!list.some(item => item.id === v.voiceURI)) {
          list.push({
            id: v.voiceURI,
            name: `${v.name} (${v.lang})`,
            lang: v.lang,
            gender: v.name.toLowerCase().includes('female') ? 'female' : 'neutral',
            persona: 'System Voice',
          });
        }
      });
    }

    return list;
  }

  public setVoice(voiceId: string) {
    this.selectedVoiceId = voiceId;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.1, this.audioCtx?.currentTime || 0);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public setRate(speed: number) {
    this.rate = Math.max(0.5, Math.min(2.0, speed));
  }

  public speak(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    if (!this.synth) {
      this.playFallbackBeep(onEnd);
      return;
    }

    try {
      this.synth.cancel(); // Stop any pending speech
    } catch {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    // Match voice if possible
    if (this.availableVoices.length > 0) {
      const match = this.availableVoices.find(v => 
        v.voiceURI === this.selectedVoiceId || 
        v.name.includes(this.selectedVoiceId) ||
        (this.selectedVoiceId.includes('GB') && v.lang.includes('GB')) ||
        (this.selectedVoiceId.includes('US') && v.lang.includes('US'))
      );
      if (match) {
        utterance.voice = match;
      } else {
        utterance.voice = this.availableVoices[0];
      }
    }

    utterance.onstart = () => {
      this.notifySpeaking(true);
    };

    utterance.onend = () => {
      this.notifySpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.notifySpeaking(false);
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch {
      this.playFallbackBeep(onEnd);
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.notifySpeaking(false);
    this.stopFallbackBeep();
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      try {
        this.synth.pause();
      } catch {
        // ignore
      }
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      try {
        this.synth.resume();
      } catch {
        // ignore
      }
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && (this.synth.speaking || this.synth.pending));
  }

  public onSpeakingChange(cb: (isSpeaking: boolean) => void) {
    this.onSpeakingChangeCallbacks.push(cb);
    return () => {
      this.onSpeakingChangeCallbacks = this.onSpeakingChangeCallbacks.filter(c => c !== cb);
    };
  }

  public onWaveformUpdate(cb: (level: number) => void) {
    this.onWaveformUpdateCallbacks.push(cb);
    return () => {
      this.onWaveformUpdateCallbacks = this.onWaveformUpdateCallbacks.filter(c => c !== cb);
    };
  }

  private notifySpeaking(speaking: boolean) {
    this.onSpeakingChangeCallbacks.forEach(cb => cb(speaking));
  }

  private playFallbackBeep(onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05 * this.volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
      this.notifySpeaking(true);
      setTimeout(() => {
        this.notifySpeaking(false);
        if (onEnd) onEnd();
      }, 500);
    } catch {
      if (onEnd) onEnd();
    }
  }

  private stopFallbackBeep() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {
        // ignore
      }
      this.oscillator = null;
    }
  }

  private startWaveformLoop() {
    let phase = 0;
    const update = () => {
      phase += 0.15;
      const speaking = this.isSpeaking();
      const level = speaking 
        ? 0.4 + 0.5 * Math.sin(phase) * Math.sin(phase * 2.3) + Math.random() * 0.2
        : 0.05 + 0.03 * Math.sin(phase * 0.5);

      this.onWaveformUpdateCallbacks.forEach(cb => cb(Math.max(0.02, Math.min(1.0, level))));
      this.animationFrameId = requestAnimationFrame(update);
    };
    if (typeof window !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(update);
    }
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.stop();
  }
}

export const audioNarrator = new AudioNarratorManager();
