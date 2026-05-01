"use client";

export type AudioMood = {
  gain: number;
  lowpassHz: number;
  detuneCents: number;
  noiseMix: number;
};

export type AudioFrameInput = {
  gain: number;
  pitchSemitones: number;
  lowpassHz: number;
  reverbMix: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function frameToMood(frame: AudioFrameInput): AudioMood {
  return {
    gain: clamp(frame.gain * 0.14, 0.03, 0.14),
    lowpassHz: clamp(frame.lowpassHz * 0.65, 700, 9500),
    detuneCents: clamp(frame.pitchSemitones * -18, -160, 20),
    noiseMix: clamp(0.014 + frame.reverbMix * 0.06, 0.012, 0.09),
  };
}

class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private lfoGain: GainNode | null = null;
  private droneA: OscillatorNode | null = null;
  private droneB: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private initialized = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }

    if (!this.context) {
      const AudioContextCtor = window.AudioContext;

      if (!AudioContextCtor) {
        return null;
      }

      this.context = new AudioContextCtor();
    }

    return this.context;
  }

  private createNoiseBuffer(context: AudioContext) {
    const seconds = 2;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.35;
    }

    return buffer;
  }

  private ensureGraph(context: AudioContext) {
    if (this.initialized) {
      return;
    }

    this.masterGain = context.createGain();
    this.masterGain.gain.value = 0.0001;

    this.filter = context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 5200;
    this.filter.Q.value = 0.8;

    this.droneGain = context.createGain();
    this.droneGain.gain.value = 0.42;

    this.noiseGain = context.createGain();
    this.noiseGain.gain.value = 0.016;

    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = 140;

    this.droneA = context.createOscillator();
    this.droneA.type = "triangle";
    this.droneA.frequency.value = 61.5;

    this.droneB = context.createOscillator();
    this.droneB.type = "sine";
    this.droneB.frequency.value = 92.25;

    this.lfo = context.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = 0.07;

    this.noise = context.createBufferSource();
    this.noise.buffer = this.createNoiseBuffer(context);
    this.noise.loop = true;

    this.droneA.connect(this.droneGain);
    this.droneB.connect(this.droneGain);
    this.droneGain.connect(this.filter);

    this.noise.connect(this.noiseGain);
    this.noiseGain.connect(this.filter);

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);

    this.filter.connect(this.masterGain);
    this.masterGain.connect(context.destination);

    this.droneA.start();
    this.droneB.start();
    this.noise.start();
    this.lfo.start();

    this.initialized = true;
  }

  async init() {
    const context = this.ensureContext();

    if (!context) {
      return false;
    }

    this.ensureGraph(context);

    if (context.state === "suspended") {
      await context.resume();
    }

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(context.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.055, context.currentTime + 1.8);
    }

    return true;
  }

  setMoodFromFrame(frame: AudioFrameInput) {
    const context = this.context;

    if (!context || !this.initialized || !this.filter || !this.masterGain || !this.noiseGain || !this.droneA || !this.droneB) {
      return;
    }

    const mood = frameToMood(frame);
    const when = context.currentTime;

    this.filter.frequency.cancelScheduledValues(when);
    this.filter.frequency.linearRampToValueAtTime(mood.lowpassHz, when + 1.6);

    this.masterGain.gain.cancelScheduledValues(when);
    this.masterGain.gain.linearRampToValueAtTime(mood.gain, when + 1.4);

    this.noiseGain.gain.cancelScheduledValues(when);
    this.noiseGain.gain.linearRampToValueAtTime(mood.noiseMix, when + 1.4);

    this.droneA.detune.cancelScheduledValues(when);
    this.droneA.detune.linearRampToValueAtTime(mood.detuneCents, when + 1.8);

    this.droneB.detune.cancelScheduledValues(when);
    this.droneB.detune.linearRampToValueAtTime(mood.detuneCents * 0.85, when + 1.8);
  }
}

export const audioEngine = new AudioEngine();
