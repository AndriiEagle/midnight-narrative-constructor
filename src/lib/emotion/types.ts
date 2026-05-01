export const emotionIds = [
  "neutral",
  "depression",
  "panic",
  "isolation",
  "obsession",
  "tenderness",
] as const;

export type EmotionId = (typeof emotionIds)[number];
export type EmotionVector = Record<EmotionId, number>;
export type TargetEmotionInput = EmotionId | Partial<Record<EmotionId, number>>;
export type EmotionalCSSVariables = Record<`--${string}`, string>;

export type AuthorialOverride = Partial<{
  bg: string;
  panel: string;
  text: string;
  accent: string;
  border: string;
  shadow: string;
  saturation: number;
  brightness: number;
  contrast: number;
  blurPx: number;
  vignette: number;
  grain: number;
  glow: number;
  audioGain: number;
  audioPitchSemitones: number;
  audioLowpassHz: number;
  reverbMix: number;
  transitionMs: number;
  easing: string;
}>;

export type EmotionalProfile = {
  id: EmotionId;
  label: string;
  colors: {
    bg: string;
    panel: string;
    text: string;
    accent: string;
    border: string;
    shadow: string;
  };
  image: {
    saturation: number;
    brightness: number;
    contrast: number;
    blurPx: number;
    vignette: number;
    grain: number;
    glow: number;
  };
  audio: {
    gain: number;
    pitchSemitones: number;
    lowpassHz: number;
    reverbMix: number;
  };
  defaultTransitionMs: number;
  easing: string;
};

export type SceneEmotionPayload = {
  sceneId: string;
  label?: string;
  targetEmotion?: TargetEmotionInput;
  overrides?: AuthorialOverride;
  transitionMs?: number;
  easing?: string;
};

export type BeatEmotionPayload = {
  beatId: string;
  sceneId?: string;
  weights?: Partial<Record<EmotionId, number>>;
  targetEmotion?: TargetEmotionInput;
  overrides?: AuthorialOverride;
  transitionMs?: number;
  easing?: string;
};

export type BeatHistoryEntry = {
  sceneId: string | null;
  beatId: string;
  weights: Partial<Record<EmotionId, number>>;
  dominantEmotion: EmotionId;
  dominantIntensity: number;
  transitionMs: number;
  at: number;
};

export type ResolvedEmotionalFrame = {
  beatCount: number;
  dominantEmotion: EmotionId;
  dominantIntensity: number;
  transitionMs: number;
  easing: string;
  vector: EmotionVector;
  cssVariables: EmotionalCSSVariables;
  image: {
    saturation: number;
    brightness: number;
    contrast: number;
    blurPx: number;
    vignette: number;
    grain: number;
    glow: number;
  };
  audio: {
    gain: number;
    pitchSemitones: number;
    lowpassHz: number;
    reverbMix: number;
  };
};

export type EmotionalSnapshot = {
  sceneId: string | null;
  beatId: string | null;
  beatCount: number;
  resonance: EmotionVector;
  sceneTarget: EmotionVector;
  beatTarget: EmotionVector;
  authorOverrides: AuthorialOverride;
  transitionMs: number;
  easing: string;
};
