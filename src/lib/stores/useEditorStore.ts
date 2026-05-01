"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { temporal } from "zundo";

import { createVerticalSliceStory } from "@/lib/data/injectVerticalSlice";
import type { EmotionVector } from "@/lib/emotion/types";
import { createDefaultMemoryResonance, type MemoryCaptureSource } from "@/lib/memory-resonance/types";
import { localizeLegacyEnglishDraft } from "@/lib/studio/localizeLegacyDraft";
import type { Story, StoryBeat, StoryScene, StoryTextWindow } from "@/lib/types/story";
import { createEmptyBeat, createEmptyScene, createEmptyStory, normalizeStoryTextWindow } from "@/lib/types/story";

type EditorStore = {
  draftStory: Story;
  selectedSceneId: string;
  selectedBeatId: string;
  loadStory: (story: Story) => void;
  selectBeat: (sceneId: string, beatId: string) => void;
  addScene: () => void;
  deleteScene: (sceneId: string) => void;
  addBeat: (sceneId: string) => void;
  deleteBeat: (sceneId: string, beatId: string) => void;
  moveBeatUp: (sceneId: string, beatId: string) => void;
  moveBeatDown: (sceneId: string, beatId: string) => void;
  moveBeatToIndex: (sceneId: string, beatId: string, newIndex: number) => void;
  updateBeatText: (beatId: string, text: string) => void;
  updateBeatResonance: (beatId: string, weights: Partial<EmotionVector>) => void;
  updateBeatSpeaker: (beatId: string, speaker: string) => void;
  updateBeatMusicCue: (beatId: string, cue: string) => void;
  updateBeatImagePrompt: (beatId: string, imagePrompt: string) => void;
  updateBeatImageUrl: (beatId: string, imageUrl: string) => void;
  updateBeatAudioPrompt: (beatId: string, audioPrompt: string) => void;
  updateBeatTextWindow: (beatId: string, patch: Partial<StoryTextWindow>) => void;
  setBeatTextWindow: (beatId: string, textWindow: StoryTextWindow | null) => void;
  updateBeatEmpathyCam: (beatId: string, requiresEmpathyCam: boolean) => void;
  updateBeatMemoryResonance: (
    beatId: string,
    patch: Partial<{
      enabled: boolean;
      captureSource: MemoryCaptureSource;
      memoryKey: string;
      instructions: string;
    }>,
  ) => void;
  toggleBeatMemoryTargetScene: (beatId: string, sceneId: string) => void;
  addBeatChoice: (beatId: string) => void;
  updateBeatChoiceText: (beatId: string, choiceId: string, text: string) => void;
  updateBeatChoiceTarget: (beatId: string, choiceId: string, nextSceneId: string) => void;
  deleteBeatChoice: (beatId: string, choiceId: string) => void;
  updateSceneTitle: (sceneId: string, title: string) => void;
  updateSceneImageUrl: (sceneId: string, imageUrl: string) => void;
  updateSceneTextWindow: (sceneId: string, patch: Partial<StoryTextWindow>) => void;
  resetSceneTextWindow: (sceneId: string) => void;
  updateStoryTitle: (title: string) => void;
  injectGeneratedBeats: (sceneId: string, beats: StoryBeat[]) => void;
};

const initialStory = createEmptyStory(createVerticalSliceStory());

function findBeatLocation(story: Story, beatId: string) {
  for (const scene of story.scenes) {
    const beat = scene.beats.find((candidate) => candidate.id === beatId);

    if (beat) {
      return { scene, beat };
    }
  }

  return null;
}

function updateBeatInStory(story: Story, beatId: string, updater: (beat: StoryBeat, scene: StoryScene) => StoryBeat): Story {
  return {
    ...story,
    scenes: story.scenes.map((scene) => ({
      ...scene,
      beats: scene.beats.map((beat) => (beat.id === beatId ? updater(beat, scene) : beat)),
    })),
  };
}

function updateSceneInStory(story: Story, sceneId: string, updater: (scene: StoryScene) => StoryScene): Story {
  return {
    ...story,
    scenes: story.scenes.map((scene) => (scene.id === sceneId ? updater(scene) : scene)),
  };
}

function createFallbackStorage() {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  };
}

function migratePersistedEditorState(persistedState: unknown) {
  if (!persistedState || typeof persistedState !== "object") {
    return persistedState;
  }

  const state = persistedState as Partial<Pick<EditorStore, "draftStory" | "selectedSceneId" | "selectedBeatId">>;

  if (!state.draftStory) {
    return state;
  }

  return {
    ...state,
    draftStory: createEmptyStory(localizeLegacyEnglishDraft(state.draftStory)),
  };
}

export const useEditorStore = create<EditorStore>()(
  temporal(
    persist(
      (set, get) => ({
        draftStory: initialStory,
        selectedSceneId: initialStory.scenes[0].id,
        selectedBeatId: initialStory.scenes[0].beats[0].id,
        loadStory: (story) => {
          const normalizedStory = createEmptyStory(story);
          const firstScene = normalizedStory.scenes[0];
          const firstBeat = firstScene?.beats[0];

          set({
            draftStory: normalizedStory,
            selectedSceneId: firstScene?.id ?? "",
            selectedBeatId: firstBeat?.id ?? "",
          });
        },
        selectBeat: (sceneId, beatId) => {
          set({
            selectedSceneId: sceneId,
            selectedBeatId: beatId,
          });
        },
        addScene: () => {
          const sceneCount = get().draftStory.scenes.length + 1;
          const nextScene = createEmptyScene({
            id: `scene-${sceneCount}`,
            title: `Сцена ${sceneCount}`,
            beats: [
              createEmptyBeat({
                id: `beat-${sceneCount}-1`,
                speaker: get().draftStory.globalSettings.defaultSpeaker,
                musicCueTrigger: get().draftStory.globalSettings.defaultMusicCueTrigger,
              }),
            ],
          });

          set((state) => ({
            draftStory: {
              ...state.draftStory,
              scenes: [...state.draftStory.scenes, nextScene],
            },
            selectedSceneId: nextScene.id,
            selectedBeatId: nextScene.beats[0].id,
          }));
        },
        deleteScene: (sceneId) => {
          set((state) => {
            const { scenes } = state.draftStory;
            // Cannot delete the final scene
            if (scenes.length <= 1) return state;

            const sceneIndex = scenes.findIndex((s) => s.id === sceneId);
            if (sceneIndex === -1) return state;

            const nextScenes = scenes.filter((s) => s.id !== sceneId);
            const nextSelectedSceneIndex = Math.min(sceneIndex, nextScenes.length - 1);
            const nextSelectedScene = nextScenes[nextSelectedSceneIndex];

            return {
              draftStory: {
                ...state.draftStory,
                scenes: nextScenes,
              },
              selectedSceneId: nextSelectedScene?.id ?? state.selectedSceneId,
              selectedBeatId: nextSelectedScene?.beats[0]?.id ?? state.selectedBeatId,
            };
          });
        },
        addBeat: (sceneId) => {
          set((state) => {
            const scene = state.draftStory.scenes.find((candidate) => candidate.id === sceneId);

            if (!scene) {
              return state;
            }

            const beatCount = scene.beats.length + 1;
            const nextBeat = createEmptyBeat({
              id: `${sceneId}-beat-${beatCount}`,
              speaker: state.draftStory.globalSettings.defaultSpeaker,
              musicCueTrigger: state.draftStory.globalSettings.defaultMusicCueTrigger,
            });

            return {
              draftStory: {
                ...state.draftStory,
                scenes: state.draftStory.scenes.map((candidate) =>
                  candidate.id === sceneId ? { ...candidate, beats: [...candidate.beats, nextBeat] } : candidate,
                ),
              },
              selectedSceneId: sceneId,
              selectedBeatId: nextBeat.id,
            };
          });
        },
        deleteBeat: (sceneId, beatId) => {
          set((state) => {
            const scene = state.draftStory.scenes.find((s) => s.id === sceneId);
            if (!scene || scene.beats.length <= 1) {
              return state;
            }

            const beatIndex = scene.beats.findIndex((b) => b.id === beatId);
            if (beatIndex === -1) {
              return state;
            }

            const nextBeats = scene.beats.filter((b) => b.id !== beatId);
            const nextSelectedIndex = Math.min(beatIndex, nextBeats.length - 1);
            const nextSelectedBeat = nextBeats[nextSelectedIndex];

            return {
              draftStory: {
                ...state.draftStory,
                scenes: state.draftStory.scenes.map((s) =>
                  s.id === sceneId ? { ...s, beats: nextBeats } : s,
                ),
              },
              selectedSceneId: sceneId,
              selectedBeatId: nextSelectedBeat?.id ?? state.selectedBeatId,
            };
          });
        },
        moveBeatUp: (sceneId, beatId) => {
          set((state) => {
            const scene = state.draftStory.scenes.find((s) => s.id === sceneId);
            if (!scene) return state;

            const index = scene.beats.findIndex((b) => b.id === beatId);
            if (index <= 0) return state;

            const nextBeats = [...scene.beats];
            [nextBeats[index - 1], nextBeats[index]] = [nextBeats[index], nextBeats[index - 1]];

            return {
              draftStory: {
                ...state.draftStory,
                scenes: state.draftStory.scenes.map((s) =>
                  s.id === sceneId ? { ...s, beats: nextBeats } : s,
                ),
              },
            };
          });
        },
        moveBeatDown: (sceneId, beatId) => {
          set((state) => {
            const scene = state.draftStory.scenes.find((s) => s.id === sceneId);
            if (!scene) return state;

            const index = scene.beats.findIndex((b) => b.id === beatId);
            if (index === -1 || index >= scene.beats.length - 1) return state;

            const nextBeats = [...scene.beats];
            [nextBeats[index], nextBeats[index + 1]] = [nextBeats[index + 1], nextBeats[index]];

            return {
              draftStory: {
                ...state.draftStory,
                scenes: state.draftStory.scenes.map((s) =>
                  s.id === sceneId ? { ...s, beats: nextBeats } : s,
                ),
              },
            };
          });
        },
        moveBeatToIndex: (sceneId, beatId, newIndex) => {
          set((state) => {
            const scene = state.draftStory.scenes.find((s) => s.id === sceneId);
            if (!scene) return state;

            const oldIndex = scene.beats.findIndex((b) => b.id === beatId);
            if (oldIndex === -1) return state;

            const nextBeats = [...scene.beats];
            const [movedBeat] = nextBeats.splice(oldIndex, 1);

            // boundary safety for newIndex
            const safeIndex = Math.max(0, Math.min(newIndex, nextBeats.length));
            nextBeats.splice(safeIndex, 0, movedBeat);

            return {
              draftStory: {
                ...state.draftStory,
                scenes: state.draftStory.scenes.map((s) =>
                  s.id === sceneId ? { ...s, beats: nextBeats } : s,
                ),
              },
            };
          });
        },
        updateBeatText: (beatId, text) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              text,
            })),
          }));
        },
        updateBeatResonance: (beatId, weights) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              resonanceWeights: {
                ...beat.resonanceWeights,
                ...weights,
              },
            })),
          }));
        },
        updateBeatSpeaker: (beatId, speaker) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              speaker,
            })),
          }));
        },
        updateBeatMusicCue: (beatId, cue) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              musicCueTrigger: cue,
            })),
          }));
        },
        updateBeatImagePrompt: (beatId, imagePrompt) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              imagePrompt,
            })),
          }));
        },
        updateBeatImageUrl: (beatId, imageUrl) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              imageUrl,
            })),
          }));
        },
        updateBeatAudioPrompt: (beatId, audioPrompt) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              audioPrompt,
            })),
          }));
        },
        updateBeatTextWindow: (beatId, patch) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat, scene) => ({
              ...beat,
              textWindow: normalizeStoryTextWindow({
                ...(beat.textWindow ?? scene.textWindow ?? normalizeStoryTextWindow()),
                ...patch,
              }),
            })),
          }));
        },
        setBeatTextWindow: (beatId, textWindow) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              textWindow: textWindow ? normalizeStoryTextWindow(textWindow) : undefined,
            })),
          }));
        },
        updateBeatEmpathyCam: (beatId, requiresEmpathyCam) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              requiresEmpathyCam,
            })),
          }));
        },
        updateBeatMemoryResonance: (beatId, patch) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              memoryResonance: {
                ...(beat.memoryResonance ?? createDefaultMemoryResonance()),
                ...patch,
              },
            })),
          }));
        },
        toggleBeatMemoryTargetScene: (beatId, sceneId) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => {
              const memoryResonance = beat.memoryResonance ?? createDefaultMemoryResonance();
              const targetSceneIds = memoryResonance.targetSceneIds.includes(sceneId)
                ? memoryResonance.targetSceneIds.filter((candidate) => candidate !== sceneId)
                : [...memoryResonance.targetSceneIds, sceneId];

              return {
                ...beat,
                memoryResonance: {
                  ...memoryResonance,
                  targetSceneIds,
                },
              };
            }),
          }));
        },
        addBeatChoice: (beatId) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              choices: [
                ...(beat.choices ?? []),
                {
                  id: crypto.randomUUID(),
                  text: "Новий вибір",
                  nextSceneId: "",
                },
              ],
            })),
          }));
        },
        updateBeatChoiceText: (beatId, choiceId, text) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              choices: (beat.choices ?? []).map((c) =>
                c.id === choiceId ? { ...c, text } : c
              ),
            })),
          }));
        },
        updateBeatChoiceTarget: (beatId, choiceId, nextSceneId) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              choices: (beat.choices ?? []).map((c) =>
                c.id === choiceId ? { ...c, nextSceneId } : c
              ),
            })),
          }));
        },
        deleteBeatChoice: (beatId, choiceId) => {
          set((state) => ({
            draftStory: updateBeatInStory(state.draftStory, beatId, (beat) => ({
              ...beat,
              choices: (beat.choices ?? []).filter((c) => c.id !== choiceId),
            })),
          }));
        },
        updateSceneTitle: (sceneId, title) => {
          set((state) => ({
            draftStory: updateSceneInStory(state.draftStory, sceneId, (scene) => ({
              ...scene,
              title,
            })),
          }));
        },
        updateSceneImageUrl: (sceneId, imageUrl) => {
          set((state) => ({
            draftStory: updateSceneInStory(state.draftStory, sceneId, (scene) => ({
              ...scene,
              imageUrl,
            })),
          }));
        },
        updateSceneTextWindow: (sceneId, patch) => {
          set((state) => ({
            draftStory: updateSceneInStory(state.draftStory, sceneId, (scene) => ({
              ...scene,
              textWindow: normalizeStoryTextWindow({
                ...(scene.textWindow ?? {}),
                ...patch,
              }),
            })),
          }));
        },
        resetSceneTextWindow: (sceneId) => {
          set((state) => ({
            draftStory: updateSceneInStory(state.draftStory, sceneId, (scene) => ({
              ...scene,
              textWindow: normalizeStoryTextWindow(),
            })),
          }));
        },
        updateStoryTitle: (title) => {
          set((state) => ({
            draftStory: {
              ...state.draftStory,
              title,
            },
          }));
        },
        injectGeneratedBeats: (sceneId, beats) => {
          set((state) => {
            const targetScene = state.draftStory.scenes.find((scene) => scene.id === sceneId);

            if (!targetScene || beats.length === 0) {
              return state;
            }

            return {
              draftStory: {
                ...state.draftStory,
                scenes: state.draftStory.scenes.map((scene) =>
                  scene.id === sceneId ? { ...scene, beats: [...scene.beats, ...beats] } : scene,
                ),
              },
              selectedSceneId: sceneId,
              selectedBeatId: beats[0].id,
            };
          });
        },
      }),
      {
        name: "midnight-constructor-editor-draft",
        version: 4,
        migrate: (persistedState) => migratePersistedEditorState(persistedState),
        storage: createJSONStorage(() =>
          typeof window !== "undefined" ? window.localStorage : createFallbackStorage(),
        ),
        partialize: (state) => ({
          draftStory: state.draftStory,
          selectedSceneId: state.selectedSceneId,
          selectedBeatId: state.selectedBeatId,
        }),
      },
    )
  )
);
export function getSelectedBeatState() {
  const { draftStory, selectedBeatId } = useEditorStore.getState();
  return findBeatLocation(draftStory, selectedBeatId);
}
