import type {
  ResonanceWeights,
  Story,
  StoryBeat,
  StoryBeatChoice,
  StoryTextWindow,
} from "@/lib/types/story";
import { createEmptyStory, normalizeStoryTextWindow } from "@/lib/types/story";
import {
  normalizeStoryMemoryResonance,
  type StoryMemoryResonance,
} from "@/lib/memory-resonance/types";
import type {
  BeatInsert,
  BeatRow,
  NovelInsert,
  NovelRow,
  SceneInsert,
  SceneRow,
} from "@/lib/supabase/types";

type PersistedSceneMetadata = {
  imageUrl?: string;
  textWindow?: Partial<StoryTextWindow>;
};

type PersistedHyperPrompts = {
  imagePrompt: string;
  imageUrl?: string;
  audioPrompt: string;
  musicCueTrigger: string;
  textWindow?: StoryTextWindow;
  requiresEmpathyCam: boolean;
  memoryResonance?: StoryMemoryResonance;
};

function asChoices(value: unknown): StoryBeatChoice[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const choice = entry as Partial<StoryBeatChoice>;
    if (
      typeof choice.id !== "string" ||
      typeof choice.text !== "string" ||
      typeof choice.nextSceneId !== "string"
    ) {
      return [];
    }

    return [
      {
        id: choice.id,
        text: choice.text,
        nextSceneId: choice.nextSceneId,
      },
    ];
  });
}

function asResonanceWeights(value: unknown): ResonanceWeights {
  const weights = (value ?? {}) as Partial<ResonanceWeights>;

  return {
    neutral: typeof weights.neutral === "number" ? weights.neutral : 0.6,
    depression: typeof weights.depression === "number" ? weights.depression : 0.08,
    panic: typeof weights.panic === "number" ? weights.panic : 0.05,
    isolation: typeof weights.isolation === "number" ? weights.isolation : 0.04,
    obsession: typeof weights.obsession === "number" ? weights.obsession : 0.03,
    tenderness: typeof weights.tenderness === "number" ? weights.tenderness : 0.02,
  };
}

function asSceneMetadata(value: unknown): {
  imageUrl: string;
  textWindow: StoryTextWindow;
} {
  const metadata = (value ?? {}) as Partial<PersistedSceneMetadata>;

  return {
    imageUrl: typeof metadata.imageUrl === "string" ? metadata.imageUrl : "",
    textWindow: normalizeStoryTextWindow(metadata.textWindow),
  };
}

function asHyperPrompts(value: unknown): PersistedHyperPrompts {
  const prompts = (value ?? {}) as Partial<PersistedHyperPrompts>;

  return {
    imagePrompt: typeof prompts.imagePrompt === "string" ? prompts.imagePrompt : "",
    imageUrl: typeof prompts.imageUrl === "string" ? prompts.imageUrl : "",
    audioPrompt: typeof prompts.audioPrompt === "string" ? prompts.audioPrompt : "",
    musicCueTrigger:
      typeof prompts.musicCueTrigger === "string" ? prompts.musicCueTrigger : "попелястий-гул",
    textWindow: prompts.textWindow ? normalizeStoryTextWindow(prompts.textWindow) : undefined,
    requiresEmpathyCam:
      typeof prompts.requiresEmpathyCam === "boolean" ? prompts.requiresEmpathyCam : false,
    memoryResonance: normalizeStoryMemoryResonance(prompts.memoryResonance),
  };
}

export function storyToPersistenceRows(story: Story, slug: string): {
  novel: NovelInsert;
  scenes: SceneInsert[];
  beats: BeatInsert[];
} {
  const scenes: SceneInsert[] = [];
  const beats: BeatInsert[] = [];

  story.scenes.forEach((scene, sceneIndex) => {
    scenes.push({
      id: scene.id,
      novel_id: story.id,
      title: scene.title,
      order_index: sceneIndex,
      metadata_json: {
        imageUrl: scene.imageUrl ?? "",
        textWindow: normalizeStoryTextWindow(scene.textWindow),
      },
    });

    scene.beats.forEach((beat, beatIndex) => {
      beats.push({
        id: beat.id,
        scene_id: scene.id,
        order_index: beatIndex,
        text: beat.text,
        speaker: beat.speaker,
        resonance_weights_json: beat.resonanceWeights,
        hyper_prompts_json: {
          imagePrompt: beat.imagePrompt,
          imageUrl: beat.imageUrl ?? "",
          audioPrompt: beat.audioPrompt,
          musicCueTrigger: beat.musicCueTrigger,
          textWindow: beat.textWindow ? normalizeStoryTextWindow(beat.textWindow) : undefined,
          requiresEmpathyCam: beat.requiresEmpathyCam ?? scene.requiresEmpathyCam ?? false,
          memoryResonance: beat.memoryResonance,
        },
        choices_json: beat.choices ?? [],
      });
    });
  });

  return {
    novel: {
      id: story.id,
      title: story.title,
      slug,
      created_at: new Date().toISOString(),
    },
    scenes,
    beats,
  };
}

export function persistenceRowsToStory(params: {
  novel: NovelRow;
  scenes: SceneRow[];
  beats: BeatRow[];
}): Story {
  const { novel, scenes, beats } = params;

  return createEmptyStory({
    id: novel.id,
    title: novel.title,
    globalSettings: {
      nightGateEnabled: true,
      defaultSpeaker: "Оповідач",
      defaultMusicCueTrigger: "попелястий-гул",
      ambienceProfile: "ashen",
    },
    scenes: scenes
      .slice()
      .sort((left, right) => left.order_index - right.order_index)
      .map((scene) => {
        const metadata = asSceneMetadata(scene.metadata_json);

        return {
          id: scene.id,
          title: scene.title,
          imageUrl: metadata.imageUrl,
          textWindow: metadata.textWindow,
          beats: beats
            .filter((beat) => beat.scene_id === scene.id)
            .sort((left, right) => left.order_index - right.order_index)
            .map<StoryBeat>((beat) => {
              const resonanceWeights = asResonanceWeights(beat.resonance_weights_json);
              const hyperPrompts = asHyperPrompts(beat.hyper_prompts_json);
              const choices = asChoices(beat.choices_json);

              return {
                id: beat.id,
                text: beat.text,
                speaker: beat.speaker,
                resonanceWeights,
                musicCueTrigger: hyperPrompts.musicCueTrigger,
                imagePrompt: hyperPrompts.imagePrompt,
                imageUrl: hyperPrompts.imageUrl,
                audioPrompt: hyperPrompts.audioPrompt,
                textWindow: hyperPrompts.textWindow,
                requiresEmpathyCam: hyperPrompts.requiresEmpathyCam,
                choices,
                memoryResonance: hyperPrompts.memoryResonance,
              };
            }),
        };
      }),
  });
}
