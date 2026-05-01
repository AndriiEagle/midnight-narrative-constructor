import type { EmotionalProfile, EmotionId, EmotionVector, TargetEmotionInput } from "./types";
import { emotionIds } from "./types";

export const DEFAULT_TRANSITION_MS = 1600;
export const DEFAULT_EASING = "power2.out";

export function createEmotionVector(seed?: Partial<Record<EmotionId, number>>): EmotionVector {
  return emotionIds.reduce<EmotionVector>(
    (vector, emotionId) => {
      vector[emotionId] = seed?.[emotionId] ?? 0;
      return vector;
    },
    {} as EmotionVector,
  );
}

export function normalizeEmotionInput(input?: TargetEmotionInput): EmotionVector {
  if (!input) {
    return createEmotionVector();
  }

  if (typeof input === "string") {
    return createEmotionVector({ [input]: 1 });
  }

  return createEmotionVector(input);
}

export const EMOTION_PROFILES: Record<EmotionId, EmotionalProfile> = {
  neutral: {
    id: "neutral",
    label: "Neutral Tension",
    colors: {
      bg: "#0b0d12",
      panel: "#12161d",
      text: "#ece7db",
      accent: "#b38c6a",
      border: "#28303d",
      shadow: "#05070b",
    },
    image: {
      saturation: 0.92,
      brightness: 0.94,
      contrast: 1.02,
      blurPx: 0.2,
      vignette: 0.24,
      grain: 0.03,
      glow: 0.12,
    },
    audio: {
      gain: 0.42,
      pitchSemitones: 0,
      lowpassHz: 10800,
      reverbMix: 0.12,
    },
    defaultTransitionMs: 1600,
    easing: DEFAULT_EASING,
  },
  depression: {
    id: "depression",
    label: "Depression",
    colors: {
      bg: "#07090d",
      panel: "#10141a",
      text: "#c8cdd5",
      accent: "#677180",
      border: "#1f2732",
      shadow: "#020306",
    },
    image: {
      saturation: 0.46,
      brightness: 0.78,
      contrast: 0.92,
      blurPx: 0.8,
      vignette: 0.42,
      grain: 0.05,
      glow: 0.06,
    },
    audio: {
      gain: 0.32,
      pitchSemitones: -1.4,
      lowpassHz: 5200,
      reverbMix: 0.22,
    },
    defaultTransitionMs: 2400,
    easing: "power2.inOut",
  },
  panic: {
    id: "panic",
    label: "Panic",
    colors: {
      bg: "#14080b",
      panel: "#1d1014",
      text: "#f5e8df",
      accent: "#d06d44",
      border: "#5f2a1f",
      shadow: "#0b0304",
    },
    image: {
      saturation: 0.78,
      brightness: 0.88,
      contrast: 1.15,
      blurPx: 1.25,
      vignette: 0.54,
      grain: 0.08,
      glow: 0.28,
    },
    audio: {
      gain: 0.68,
      pitchSemitones: 1.6,
      lowpassHz: 14200,
      reverbMix: 0.1,
    },
    defaultTransitionMs: 850,
    easing: "power3.out",
  },
  isolation: {
    id: "isolation",
    label: "Isolation",
    colors: {
      bg: "#081018",
      panel: "#0e1824",
      text: "#dbe4ea",
      accent: "#6e8798",
      border: "#233545",
      shadow: "#03070b",
    },
    image: {
      saturation: 0.58,
      brightness: 0.84,
      contrast: 1,
      blurPx: 0.55,
      vignette: 0.35,
      grain: 0.04,
      glow: 0.09,
    },
    audio: {
      gain: 0.38,
      pitchSemitones: -0.3,
      lowpassHz: 7600,
      reverbMix: 0.28,
    },
    defaultTransitionMs: 1800,
    easing: "power2.out",
  },
  obsession: {
    id: "obsession",
    label: "Obsession",
    colors: {
      bg: "#110d0d",
      panel: "#1a1412",
      text: "#efe3d6",
      accent: "#b88256",
      border: "#4a3224",
      shadow: "#050302",
    },
    image: {
      saturation: 0.82,
      brightness: 0.9,
      contrast: 1.08,
      blurPx: 0.4,
      vignette: 0.38,
      grain: 0.06,
      glow: 0.21,
    },
    audio: {
      gain: 0.52,
      pitchSemitones: 0.8,
      lowpassHz: 9800,
      reverbMix: 0.18,
    },
    defaultTransitionMs: 1350,
    easing: "power2.inOut",
  },
  tenderness: {
    id: "tenderness",
    label: "Tenderness",
    colors: {
      bg: "#111213",
      panel: "#191b1d",
      text: "#f3ede4",
      accent: "#c7ab88",
      border: "#363130",
      shadow: "#040404",
    },
    image: {
      saturation: 1.02,
      brightness: 0.98,
      contrast: 1.01,
      blurPx: 0.18,
      vignette: 0.16,
      grain: 0.02,
      glow: 0.2,
    },
    audio: {
      gain: 0.46,
      pitchSemitones: -0.1,
      lowpassHz: 12600,
      reverbMix: 0.2,
    },
    defaultTransitionMs: 1900,
    easing: "power1.out",
  },
};
