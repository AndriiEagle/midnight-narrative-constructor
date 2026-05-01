import type { AuthorialOverride, EmotionVector } from "@/lib/emotion/types";

export type MemoryCaptureSource = "choice" | "input" | "both";
export type RuntimeMemoryCaptureSource = Exclude<MemoryCaptureSource, "both">;

export type StoryMemoryResonance = {
  enabled: boolean;
  captureSource: MemoryCaptureSource;
  memoryKey: string;
  instructions: string;
  targetSceneIds: string[];
};

export type MemoryResonanceLedgerEntry = {
  key: string;
  source: RuntimeMemoryCaptureSource;
  capturedText: string;
  summary: string;
  gateWhisper: string;
  resonanceShift: EmotionVector;
  authorOverrides: Partial<AuthorialOverride>;
  targetSceneIds: string[];
  capturedAt: number;
};

export type MemoryResonanceRequestBeat = {
  id: string;
  text: string;
  speaker: string;
  resonanceWeights: EmotionVector;
  musicCueTrigger: string;
  imagePrompt: string;
  audioPrompt: string;
  requiresEmpathyCam: boolean;
};

export type MemoryResonanceRequestScene = {
  id: string;
  title: string;
  beats: MemoryResonanceRequestBeat[];
};

export type MemoryResonanceRequest = {
  storyTitle: string;
  sceneTitle: string;
  currentBeatText: string;
  capturedText: string;
  source: RuntimeMemoryCaptureSource;
  config: StoryMemoryResonance;
  previousMemories: Array<{
    key: string;
    source: RuntimeMemoryCaptureSource;
    summary: string;
    capturedText: string;
  }>;
  targetScenes: MemoryResonanceRequestScene[];
};

export type MemoryResonanceResponseBeat = {
  text: string;
  speaker: string;
  resonanceWeights: EmotionVector;
  musicCueTrigger: string;
  imagePrompt: string;
  audioPrompt: string;
  requiresEmpathyCam?: boolean;
};

export type MemoryResonanceResponseScene = {
  sceneId: string;
  beats: MemoryResonanceResponseBeat[];
};

export type MemoryResonanceResponse = {
  memoryEntry: {
    summary: string;
    gateWhisper: string;
    resonanceShift: EmotionVector;
    authorOverrides: Partial<AuthorialOverride>;
  };
  scenes: MemoryResonanceResponseScene[];
};

export function createDefaultMemoryResonance(): StoryMemoryResonance {
  return {
    enabled: false,
    captureSource: "input",
    memoryKey: "",
    instructions: "",
    targetSceneIds: [],
  };
}

export function normalizeStoryMemoryResonance(value: unknown): StoryMemoryResonance | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Partial<StoryMemoryResonance>;
  const captureSource =
    candidate.captureSource === "choice" || candidate.captureSource === "input" || candidate.captureSource === "both"
      ? candidate.captureSource
      : "input";

  const targetSceneIds = Array.isArray(candidate.targetSceneIds)
    ? candidate.targetSceneIds.filter((sceneId): sceneId is string => typeof sceneId === "string")
    : [];

  const normalized: StoryMemoryResonance = {
    enabled: typeof candidate.enabled === "boolean" ? candidate.enabled : false,
    captureSource,
    memoryKey: typeof candidate.memoryKey === "string" ? candidate.memoryKey : "",
    instructions: typeof candidate.instructions === "string" ? candidate.instructions : "",
    targetSceneIds,
  };

  const hasAnyValue =
    normalized.enabled ||
    normalized.memoryKey.trim().length > 0 ||
    normalized.instructions.trim().length > 0 ||
    normalized.targetSceneIds.length > 0;

  return hasAnyValue ? normalized : undefined;
}

export function canCaptureMemoryFromSource(
  config: StoryMemoryResonance | undefined,
  source: RuntimeMemoryCaptureSource,
): boolean {
  if (!config?.enabled) {
    return false;
  }

  return config.captureSource === "both" || config.captureSource === source;
}
