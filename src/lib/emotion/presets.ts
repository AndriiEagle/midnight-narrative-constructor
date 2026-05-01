import { emotionIds, type EmotionId, type EmotionVector } from "./types";

export type ResonancePreset = {
  id: string;
  label: string;
  synopsis: string;
  direction: string;
  weights: EmotionVector;
};

export const RESONANCE_PRESETS: ResonancePreset[] = [
  {
    id: "bureaucratic-cruelty",
    label: "Бюрократична жорстокість",
    synopsis: "Система звучить упорядковано, поки шкода стає процедурою.",
    direction: "Холодний процес, мало милості, інституційний тиск.",
    weights: {
      neutral: 0.1,
      depression: 0.54,
      panic: 0.1,
      isolation: 0.34,
      obsession: 0.16,
      tenderness: 0,
    },
  },
  {
    id: "false-intimacy",
    label: "Фальшива близькість",
    synopsis: "Тепло присутнє, але воно здається поставленим, переконливим і небезпечним.",
    direction: "Використовуй, коли сцена має спершу спокусити, а вже потім зрадити.",
    weights: {
      neutral: 0.14,
      depression: 0.16,
      panic: 0.08,
      isolation: 0.14,
      obsession: 0.22,
      tenderness: 0.48,
    },
  },
  {
    id: "moral-numbness",
    label: "Моральне оніміння",
    synopsis: "Осуд сплющився у втому, дистанцію й мертву мову.",
    direction: "Найкраще для наслідків, публічного дискурсу й виснаженого сумління.",
    weights: {
      neutral: 0.12,
      depression: 0.6,
      panic: 0.04,
      isolation: 0.22,
      obsession: 0.08,
      tenderness: 0.02,
    },
  },
  {
    id: "surveillance-tenderness",
    label: "Ніжність під наглядом",
    synopsis: "Турбота справжня, але її вимірюють, зчитують і спостерігають за нею.",
    direction: "М'якість під аудитом, близькість із камерою в кімнаті.",
    weights: {
      neutral: 0.08,
      depression: 0.14,
      panic: 0.16,
      isolation: 0.3,
      obsession: 0.12,
      tenderness: 0.42,
    },
  },
  {
    id: "ritual-dread",
    label: "Ритуальний жах",
    synopsis: "Сцена відчувається церемоніальною, неминучою і вже наполовину вирішеною.",
    direction: "Добре для повторюваних дій, формальної мови й бітів, навантажених долею.",
    weights: {
      neutral: 0.06,
      depression: 0.24,
      panic: 0.28,
      isolation: 0.16,
      obsession: 0.34,
      tenderness: 0,
    },
  },
];

export function getPresetDominantEmotions(weights: EmotionVector, count = 2): EmotionId[] {
  return [...emotionIds]
    .sort((left, right) => weights[right] - weights[left])
    .slice(0, count);
}

export function isPresetApplied(current: EmotionVector, target: EmotionVector, tolerance = 0.005): boolean {
  return emotionIds.every((emotionId) => Math.abs(current[emotionId] - target[emotionId]) <= tolerance);
}
