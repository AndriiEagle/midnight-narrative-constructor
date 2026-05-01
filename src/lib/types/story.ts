import type { BeatEmotionPayload, EmotionVector } from "@/lib/emotion/types";
import type { StoryMemoryResonance } from "@/lib/memory-resonance/types";

export type ResonanceWeights = EmotionVector;

export type StoryGlobalSettings = {
  nightGateEnabled: boolean;
  defaultSpeaker: string;
  defaultMusicCueTrigger: string;
  ambienceProfile: "hollow" | "velvet" | "ashen";
};

export type StoryTextWindowFontFamily = "serif" | "sans" | "mono";

export type StoryTextWindow = {
  width: number;
  minHeight: number;
  anchorX: number;
  anchorY: number;
  fontSize: number;
  lineHeight: number;
  fontFamily: StoryTextWindowFontFamily;
};

export const STORY_TEXT_WINDOW_WIDTH_RANGE = {
  min: 320,
  max: 1180,
  default: 760,
} as const;

export const STORY_TEXT_WINDOW_HEIGHT_RANGE = {
  min: 180,
  max: 720,
  default: 260,
} as const;

export const STORY_TEXT_WINDOW_ANCHOR_X_RANGE = {
  min: 12,
  max: 88,
  default: 50,
} as const;

export const STORY_TEXT_WINDOW_ANCHOR_Y_RANGE = {
  min: 16,
  max: 82,
  default: 38,
} as const;

export const STORY_TEXT_WINDOW_FONT_SIZE_RANGE = {
  min: 28,
  max: 120,
  default: 58,
} as const;

export const STORY_TEXT_WINDOW_LINE_HEIGHT_RANGE = {
  min: 0.82,
  max: 1.24,
  default: 0.94,
} as const;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeFontFamily(value?: string | null): StoryTextWindowFontFamily {
  if (value === "sans" || value === "mono") {
    return value;
  }

  return "serif";
}

export function normalizeStoryTextWindow(
  value?: Partial<StoryTextWindow> | null,
): StoryTextWindow {
  return {
    width: clampNumber(
      typeof value?.width === "number"
        ? value.width
        : STORY_TEXT_WINDOW_WIDTH_RANGE.default,
      STORY_TEXT_WINDOW_WIDTH_RANGE.min,
      STORY_TEXT_WINDOW_WIDTH_RANGE.max,
    ),
    minHeight: clampNumber(
      typeof value?.minHeight === "number"
        ? value.minHeight
        : STORY_TEXT_WINDOW_HEIGHT_RANGE.default,
      STORY_TEXT_WINDOW_HEIGHT_RANGE.min,
      STORY_TEXT_WINDOW_HEIGHT_RANGE.max,
    ),
    anchorX: clampNumber(
      typeof value?.anchorX === "number"
        ? value.anchorX
        : STORY_TEXT_WINDOW_ANCHOR_X_RANGE.default,
      STORY_TEXT_WINDOW_ANCHOR_X_RANGE.min,
      STORY_TEXT_WINDOW_ANCHOR_X_RANGE.max,
    ),
    anchorY: clampNumber(
      typeof value?.anchorY === "number"
        ? value.anchorY
        : STORY_TEXT_WINDOW_ANCHOR_Y_RANGE.default,
      STORY_TEXT_WINDOW_ANCHOR_Y_RANGE.min,
      STORY_TEXT_WINDOW_ANCHOR_Y_RANGE.max,
    ),
    fontSize: clampNumber(
      typeof value?.fontSize === "number"
        ? value.fontSize
        : STORY_TEXT_WINDOW_FONT_SIZE_RANGE.default,
      STORY_TEXT_WINDOW_FONT_SIZE_RANGE.min,
      STORY_TEXT_WINDOW_FONT_SIZE_RANGE.max,
    ),
    lineHeight: clampNumber(
      typeof value?.lineHeight === "number"
        ? value.lineHeight
        : STORY_TEXT_WINDOW_LINE_HEIGHT_RANGE.default,
      STORY_TEXT_WINDOW_LINE_HEIGHT_RANGE.min,
      STORY_TEXT_WINDOW_LINE_HEIGHT_RANGE.max,
    ),
    fontFamily: normalizeFontFamily(value?.fontFamily),
  };
}

export function resolveStoryTextWindow(
  sceneValue?: Partial<StoryTextWindow> | null,
  beatValue?: Partial<StoryTextWindow> | null,
): StoryTextWindow {
  return normalizeStoryTextWindow({
    ...normalizeStoryTextWindow(sceneValue),
    ...(beatValue ?? {}),
  });
}

export type StoryBeatChoice = {
  id: string;
  text: string;
  nextSceneId: string;
};

export type StoryBeat = {
  id: string;
  text: string;
  speaker: string;
  resonanceWeights: ResonanceWeights;
  musicCueTrigger: string;
  imagePrompt: string;
  imageUrl?: string;
  audioPrompt: string;
  textWindow?: StoryTextWindow;
  requiresEmpathyCam?: boolean;
  choices?: StoryBeatChoice[];
  memoryResonance?: StoryMemoryResonance;
};

export type StoryScene = {
  id: string;
  title: string;
  imageUrl?: string;
  textWindow?: StoryTextWindow;
  requiresEmpathyCam?: boolean;
  beats: StoryBeat[];
};

export type Story = {
  id: string;
  title: string;
  globalSettings: StoryGlobalSettings;
  scenes: StoryScene[];
};

export function createEmptyBeat(seed: Partial<StoryBeat> = {}): StoryBeat {
  return {
    id: seed.id ?? crypto.randomUUID(),
    text: seed.text ?? "Тут чекає тиша.",
    speaker: seed.speaker ?? "Оповідач",
    resonanceWeights: seed.resonanceWeights ?? {
      neutral: 0.6,
      depression: 0.08,
      panic: 0.05,
      isolation: 0.04,
      obsession: 0.03,
      tenderness: 0.02,
    },
    musicCueTrigger: seed.musicCueTrigger ?? "порожня-кімната",
    imagePrompt:
      seed.imagePrompt ??
      "знебарвлений коридор квартири, тьмяне світло, психологічна напруга",
    imageUrl: seed.imageUrl ?? "",
    audioPrompt:
      seed.audioPrompt ??
      "низький гул, далека вентиляція, легке шипіння стрічки, стримане серцебиття",
    textWindow: seed.textWindow ? normalizeStoryTextWindow(seed.textWindow) : undefined,
    requiresEmpathyCam: seed.requiresEmpathyCam ?? false,
    choices: seed.choices ?? [],
    memoryResonance: seed.memoryResonance,
  };
}

export function createEmptyScene(seed: Partial<StoryScene> = {}): StoryScene {
  return {
    id: seed.id ?? crypto.randomUUID(),
    title: seed.title ?? "Сцена без назви",
    imageUrl: seed.imageUrl ?? "",
    textWindow: normalizeStoryTextWindow(seed.textWindow),
    requiresEmpathyCam: seed.requiresEmpathyCam ?? false,
    beats: seed.beats?.map((beat) => createEmptyBeat(beat)) ?? [createEmptyBeat()],
  };
}

export function createEmptyStory(seed: Partial<Story> = {}): Story {
  return {
    id: seed.id ?? crypto.randomUUID(),
    title: seed.title ?? "Нічна чернетка",
    globalSettings: seed.globalSettings ?? {
      nightGateEnabled: true,
      defaultSpeaker: "Оповідач",
      defaultMusicCueTrigger: "оксамитовий-гул",
      ambienceProfile: "ashen",
    },
    scenes:
      seed.scenes?.map((scene) => createEmptyScene(scene)) ??
      [createEmptyScene({ title: "Початковий поріг" })],
  };
}

export type RuntimeBeatPayload = BeatEmotionPayload & {
  beat: StoryBeat;
  scene: StoryScene;
};
