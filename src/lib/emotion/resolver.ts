import { DEFAULT_EASING, DEFAULT_TRANSITION_MS, EMOTION_PROFILES, createEmotionVector } from "./profiles";
import type { EmotionalSnapshot, EmotionId, EmotionVector, ResolvedEmotionalFrame } from "./types";
import { emotionIds } from "./types";

const SCENE_TARGET_INFLUENCE = 0.72;
const BEAT_TARGET_INFLUENCE = 1.15;
const HISTORY_DECAY = 0.92;
const PANIC_DECAY = 0.88;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function accumulateResonance(
  current: EmotionVector,
  shift?: Partial<Record<EmotionId, number>>,
): EmotionVector {
  const next = createEmotionVector();

  for (const emotionId of emotionIds) {
    const decay = emotionId === "panic" ? PANIC_DECAY : HISTORY_DECAY;
    const incoming = shift?.[emotionId] ?? 0;
    next[emotionId] = clamp(current[emotionId] * decay + incoming, 0, 1.75);
  }

  return next;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const source =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const value = Number.parseInt(source, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function toRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1).toFixed(3)})`;
}

function blendHex(weightedColors: Array<[string, number]>): string {
  let totalWeight = 0;
  let r = 0;
  let g = 0;
  let b = 0;

  for (const [hex, weight] of weightedColors) {
    if (weight <= 0) {
      continue;
    }

    const [cr, cg, cb] = hexToRgb(hex);
    totalWeight += weight;
    r += cr * weight;
    g += cg * weight;
    b += cb * weight;
  }

  if (totalWeight === 0) {
    return "#000000";
  }

  return rgbToHex([r / totalWeight, g / totalWeight, b / totalWeight]);
}

function blendScalar(weightedValues: Array<[number, number]>, fallback: number): number {
  let totalWeight = 0;
  let total = 0;

  for (const [value, weight] of weightedValues) {
    if (weight <= 0) {
      continue;
    }

    totalWeight += weight;
    total += value * weight;
  }

  return totalWeight === 0 ? fallback : total / totalWeight;
}

function buildCompositeVector(snapshot: EmotionalSnapshot): EmotionVector {
  const composite = createEmotionVector({
    neutral: 1 + snapshot.resonance.neutral * 0.45 + snapshot.sceneTarget.neutral * 0.35 + snapshot.beatTarget.neutral,
  });

  for (const emotionId of emotionIds) {
    if (emotionId === "neutral") {
      continue;
    }

    composite[emotionId] = clamp(
      snapshot.resonance[emotionId] +
        snapshot.sceneTarget[emotionId] * SCENE_TARGET_INFLUENCE +
        snapshot.beatTarget[emotionId] * BEAT_TARGET_INFLUENCE,
      0,
      2.25,
    );
  }

  return composite;
}

function resolveDominantEmotion(vector: EmotionVector): { id: EmotionId; intensity: number } {
  let dominant: EmotionId = "neutral";
  let strongest = vector.neutral;

  for (const emotionId of emotionIds) {
    if (vector[emotionId] > strongest) {
      dominant = emotionId;
      strongest = vector[emotionId];
    }
  }

  const total = Object.values(vector).reduce((sum, value) => sum + value, 0);
  return {
    id: dominant,
    intensity: total === 0 ? 0 : clamp(strongest / total, 0, 1),
  };
}

export function resolveEmotionalFrame(snapshot: EmotionalSnapshot): ResolvedEmotionalFrame {
  const vector = buildCompositeVector(snapshot);
  const { id: dominantEmotion, intensity } = resolveDominantEmotion(vector);
  const weights = emotionIds.map((emotionId) => [emotionId, vector[emotionId]] as const);
  const dominantProfile = EMOTION_PROFILES[dominantEmotion];

  const bg = snapshot.authorOverrides.bg ?? blendHex(weights.map(([id, weight]) => [EMOTION_PROFILES[id].colors.bg, weight]));
  const panel =
    snapshot.authorOverrides.panel ?? blendHex(weights.map(([id, weight]) => [EMOTION_PROFILES[id].colors.panel, weight]));
  const text =
    snapshot.authorOverrides.text ?? blendHex(weights.map(([id, weight]) => [EMOTION_PROFILES[id].colors.text, weight]));
  const accent =
    snapshot.authorOverrides.accent ??
    blendHex(weights.map(([id, weight]) => [EMOTION_PROFILES[id].colors.accent, weight]));
  const border =
    snapshot.authorOverrides.border ??
    blendHex(weights.map(([id, weight]) => [EMOTION_PROFILES[id].colors.border, weight]));
  const shadow =
    snapshot.authorOverrides.shadow ??
    blendHex(weights.map(([id, weight]) => [EMOTION_PROFILES[id].colors.shadow, weight]));

  const saturation = clamp(
    snapshot.authorOverrides.saturation ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].image.saturation, weight]),
        EMOTION_PROFILES.neutral.image.saturation,
      ),
    0.2,
    1.4,
  );
  const brightness = clamp(
    snapshot.authorOverrides.brightness ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].image.brightness, weight]),
        EMOTION_PROFILES.neutral.image.brightness,
      ),
    0.45,
    1.2,
  );
  const contrast = clamp(
    snapshot.authorOverrides.contrast ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].image.contrast, weight]),
        EMOTION_PROFILES.neutral.image.contrast,
      ),
    0.8,
    1.35,
  );
  const blurPx = clamp(
    snapshot.authorOverrides.blurPx ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].image.blurPx, weight]),
        EMOTION_PROFILES.neutral.image.blurPx,
      ),
    0,
    8,
  );
  const vignette = clamp(
    snapshot.authorOverrides.vignette ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].image.vignette, weight]),
        EMOTION_PROFILES.neutral.image.vignette,
      ),
    0,
    0.75,
  );
  const grain = clamp(
    snapshot.authorOverrides.grain ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].image.grain, weight]),
        EMOTION_PROFILES.neutral.image.grain,
      ),
    0,
    0.16,
  );
  const glow = clamp(
    snapshot.authorOverrides.glow ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].image.glow, weight]),
        EMOTION_PROFILES.neutral.image.glow,
      ),
    0,
    0.45,
  );

  const audioGain = clamp(
    snapshot.authorOverrides.audioGain ??
      blendScalar(weights.map(([id, weight]) => [EMOTION_PROFILES[id].audio.gain, weight]), EMOTION_PROFILES.neutral.audio.gain),
    0,
    1,
  );
  const audioPitchSemitones = clamp(
    snapshot.authorOverrides.audioPitchSemitones ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].audio.pitchSemitones, weight]),
        EMOTION_PROFILES.neutral.audio.pitchSemitones,
      ),
    -6,
    6,
  );
  const audioLowpassHz = clamp(
    snapshot.authorOverrides.audioLowpassHz ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].audio.lowpassHz, weight]),
        EMOTION_PROFILES.neutral.audio.lowpassHz,
      ),
    1200,
    18000,
  );
  const reverbMix = clamp(
    snapshot.authorOverrides.reverbMix ??
      blendScalar(
        weights.map(([id, weight]) => [EMOTION_PROFILES[id].audio.reverbMix, weight]),
        EMOTION_PROFILES.neutral.audio.reverbMix,
      ),
    0,
    1,
  );

  const transitionMs = Math.round(
    clamp(
      snapshot.authorOverrides.transitionMs ?? snapshot.transitionMs ?? dominantProfile.defaultTransitionMs ?? DEFAULT_TRANSITION_MS,
      120,
      6000,
    ),
  );
  const easing = snapshot.authorOverrides.easing ?? snapshot.easing ?? dominantProfile.easing ?? DEFAULT_EASING;

  return {
    beatCount: snapshot.beatCount,
    dominantEmotion,
    dominantIntensity: intensity,
    transitionMs,
    easing,
    vector,
    cssVariables: {
      "--ui-bg": bg,
      "--ui-panel": panel,
      "--ui-text": text,
      "--ui-accent": accent,
      "--ui-border": border,
      "--ui-shadow-color": toRgba(shadow, 0.36 + vignette * 0.28),
      "--ui-accent-glow": toRgba(accent, 0.08 + glow * 0.62),
      "--ui-focus-ring": toRgba(accent, 0.22 + intensity * 0.38),
      "--ui-selection-bg": toRgba(accent, 0.24),
      "--ui-selection-text": text,
      "--ui-saturation": saturation.toFixed(3),
      "--ui-brightness": brightness.toFixed(3),
      "--ui-contrast": contrast.toFixed(3),
      "--ui-blur": `${blurPx.toFixed(2)}px`,
      "--ui-vignette": vignette.toFixed(3),
      "--ui-grain": grain.toFixed(3),
      "--ui-glow": glow.toFixed(3),
      "--ui-dominant-intensity": intensity.toFixed(3),
      "--ui-transition-ms": `${transitionMs}ms`,
    },
    image: {
      saturation,
      brightness,
      contrast,
      blurPx,
      vignette,
      grain,
      glow,
    },
    audio: {
      gain: audioGain,
      pitchSemitones: audioPitchSemitones,
      lowpassHz: audioLowpassHz,
      reverbMix,
    },
  };
}
