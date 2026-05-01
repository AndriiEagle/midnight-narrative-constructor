"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { PlayerAuthorPanel } from "@/components/player/PlayerAuthorPanel";
import { ConversationInput } from "@/components/player/ConversationInput";
import { EmpathyCameraOverlay } from "@/components/player/EmpathyCameraOverlay";
import { audioEngine } from "@/lib/audio/AudioEngine";
import { createEmotionVector } from "@/lib/emotion/profiles";
import { accumulateResonance } from "@/lib/emotion/resolver";
import type { EmotionVector } from "@/lib/emotion/types";
import {
  canCaptureMemoryFromSource,
  type MemoryResonanceLedgerEntry,
  type MemoryResonanceRequest,
  type MemoryResonanceResponse,
  type MemoryResonanceResponseScene,
  type RuntimeMemoryCaptureSource,
} from "@/lib/memory-resonance/types";
import {
  STORY_TEXT_WINDOW_ANCHOR_X_RANGE,
  STORY_TEXT_WINDOW_ANCHOR_Y_RANGE,
  STORY_TEXT_WINDOW_HEIGHT_RANGE,
  STORY_TEXT_WINDOW_WIDTH_RANGE,
  normalizeStoryTextWindow,
  resolveStoryTextWindow,
  type StoryTextWindow,
  type StoryTextWindowFontFamily,
} from "@/lib/types/story";
import type { Story, StoryBeat, StoryBeatChoice, StoryScene } from "@/lib/types/story";
import { useEditorStore } from "@/lib/stores/useEditorStore";
import { useEmotionalStore } from "@/stores/use-emotional-store";

// Keep the authored empathy-camera flag in story data, but do not surface the
// fake surveillance layer again until there is a real capture/verification loop
// behind it. Atmospheric UI that implies sensing without actual sensing is misleading.
const EMPATHY_CAMERA_RUNTIME_ENABLED = false;

type PlayerRuntimeProps = {
  story: Story;
  mode?: "viewer" | "author";
};

function mergePromptLayer(basePrompt: string, generatedPrompt: string): string {
  const normalizedBase = basePrompt.trim();
  const normalizedGenerated = generatedPrompt.trim();

  if (!normalizedBase) {
    return normalizedGenerated;
  }

  if (!normalizedGenerated || normalizedGenerated === normalizedBase) {
    return normalizedBase;
  }

  if (normalizedGenerated.includes(normalizedBase)) {
    return normalizedGenerated;
  }

  if (normalizedBase.includes(normalizedGenerated)) {
    return normalizedBase;
  }

  return `${normalizedBase}; ${normalizedGenerated}`;
}

function mergeResonanceWeights(baseWeights: EmotionVector, generatedWeights: EmotionVector): EmotionVector {
  return createEmotionVector({
    neutral: (baseWeights.neutral + generatedWeights.neutral) / 2,
    depression: (baseWeights.depression + generatedWeights.depression) / 2,
    panic: (baseWeights.panic + generatedWeights.panic) / 2,
    isolation: (baseWeights.isolation + generatedWeights.isolation) / 2,
    obsession: (baseWeights.obsession + generatedWeights.obsession) / 2,
    tenderness: (baseWeights.tenderness + generatedWeights.tenderness) / 2,
  });
}

function mergePersonalizedScene(baseScene: StoryScene, generatedScene: MemoryResonanceResponseScene): StoryScene {
  return {
    ...baseScene,
    beats: baseScene.beats.map((beat, index) => {
      const generatedBeat = generatedScene.beats[index];

      if (!generatedBeat) {
        return beat;
      }

      return {
        ...beat,
        text: generatedBeat.text,
        speaker: generatedBeat.speaker,
        resonanceWeights: mergeResonanceWeights(beat.resonanceWeights, generatedBeat.resonanceWeights),
        musicCueTrigger: generatedBeat.musicCueTrigger,
        imagePrompt: mergePromptLayer(beat.imagePrompt, generatedBeat.imagePrompt),
        audioPrompt: mergePromptLayer(beat.audioPrompt, generatedBeat.audioPrompt),
        requiresEmpathyCam:
          typeof generatedBeat.requiresEmpathyCam === "boolean" ? generatedBeat.requiresEmpathyCam : beat.requiresEmpathyCam,
      };
    }),
  };
}

function uniqueSceneIds(sceneIds: string[]): string[] {
  return Array.from(new Set(sceneIds.filter(Boolean)));
}

function buildFallbackResonance(): EmotionVector {
  return createEmotionVector({
    neutral: 0.3,
    depression: 0.1,
    panic: 0.1,
    isolation: 0.1,
    obsession: 0.1,
    tenderness: 0.1,
  });
}

type AuthorTarget = "scene" | "beat";
type ResizeEdge = "right" | "bottom" | "corner";

type AuthorGesture =
  | {
      type: "drag";
      pointerId: number;
      stageRect: DOMRect;
      boxRect: DOMRect;
    }
  | {
      type: "resize";
      pointerId: number;
      edge: ResizeEdge;
      startX: number;
      startY: number;
      initialWindow: StoryTextWindow;
    };

const textWindowFontClassName: Record<StoryTextWindowFontFamily, string> = {
  serif: "font-serif tracking-[-0.045em]",
  sans: "font-sans tracking-[-0.03em]",
  mono: "font-mono tracking-[-0.026em]",
};

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function PlayerRuntime({ story: initialStory, mode = "viewer" }: PlayerRuntimeProps) {
  const isAuthorRuntime = mode === "author";
  const [story, setStory] = useState(initialStory);
  const [currentSceneId, setCurrentSceneId] = useState(initialStory.scenes[0]?.id ?? "");
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [audioReady, setAudioReady] = useState(true);
  const [endedByChoice, setEndedByChoice] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const [personalizedScenesById, setPersonalizedScenesById] = useState<Record<string, StoryScene>>({});
  const [memoryLedger, setMemoryLedger] = useState<MemoryResonanceLedgerEntry[]>([]);
  const [isAuthorPanelOpen, setIsAuthorPanelOpen] = useState(false);
  const [authorTarget, setAuthorTarget] = useState<AuthorTarget>("scene");

  const pendingSceneTokenRef = useRef<Record<string, string>>({});
  const stageRef = useRef<HTMLElement | null>(null);
  const textWindowRef = useRef<HTMLDivElement | null>(null);
  const authorGestureRef = useRef<AuthorGesture | null>(null);
  const initialStoryIdRef = useRef(initialStory.id);

  const resolvedFrame = useEmotionalStore((state) => state.resolvedFrame);
  const resonance = useEmotionalStore((state) => state.resonance);
  const authorOverrides = useEmotionalStore((state) => state.authorOverrides);
  const applyBeat = useEmotionalStore((state) => state.applyBeat);
  const enterScene = useEmotionalStore((state) => state.enterScene);
  const hydrateSnapshot = useEmotionalStore((state) => state.hydrateSnapshot);
  const reset = useEmotionalStore((state) => state.reset);
  const updateSceneTextWindow = useEditorStore((state) => state.updateSceneTextWindow);
  const updateBeatTextWindow = useEditorStore((state) => state.updateBeatTextWindow);
  const setBeatTextWindow = useEditorStore((state) => state.setBeatTextWindow);
  const resetSceneTextWindow = useEditorStore((state) => state.resetSceneTextWindow);

  const emotionalStateRef = useRef({
    resonance,
    authorOverrides,
  });

  useEffect(() => {
    emotionalStateRef.current = {
      resonance,
      authorOverrides,
    };
  }, [resonance, authorOverrides]);

  const resolveSceneById = useCallback(
    (sceneId: string) => personalizedScenesById[sceneId] ?? story.scenes.find((scene) => scene.id === sceneId),
    [personalizedScenesById, story.scenes],
  );

  const currentScene = resolveSceneById(currentSceneId) ?? resolveSceneById(story.scenes[0]?.id ?? "");
  const currentBeat = currentScene?.beats[currentBeatIndex];
  const currentSceneTextWindow = normalizeStoryTextWindow(currentScene?.textWindow);
  const activeTextWindow = resolveStoryTextWindow(currentScene?.textWindow, currentBeat?.textWindow);
  const beatHasTextWindowOverride = Boolean(currentBeat?.textWindow);
  const activeImageUrl =
    (currentBeat?.imageUrl ?? "").trim() || (currentScene?.imageUrl ?? "").trim();
  const activeImageSourceBadge = (currentBeat?.imageUrl ?? "").trim()
    ? "кадр біта"
    : (currentScene?.imageUrl ?? "").trim()
      ? "фон сцени"
      : null;
  const activeImageSourceLabel = (currentBeat?.imageUrl ?? "").trim()
    ? "кадр біта"
    : (currentScene?.imageUrl ?? "").trim()
      ? "фон сцени"
      : null;

  const isLastScene = story.scenes.findIndex((scene) => scene.id === currentScene?.id) === story.scenes.length - 1;
  const isLastBeatInScene = currentBeatIndex === (currentScene?.beats.length ?? 0) - 1;
  const isLastBeatTotal = endedByChoice || (isLastScene && isLastBeatInScene);

  const choices: StoryBeatChoice[] = currentBeat?.choices ?? [];
  const hasChoices = !endedByChoice && choices.length > 0;
  const empathyCameraRequested = currentBeat?.requiresEmpathyCam ?? currentScene?.requiresEmpathyCam ?? false;
  const empathyCameraActive = EMPATHY_CAMERA_RUNTIME_ENABLED && empathyCameraRequested;

  const isConversationReady = isLastBeatInScene && !hasChoices && !isLastBeatTotal;
  const showConversationInput = (isConversationReady || (isLastScene && isLastBeatInScene)) && !hasChoices && !endedByChoice;
  const canAdvanceByTap = !isAuthorRuntime || !isAuthorPanelOpen;

  const applyAuthorTextWindowPatch = useCallback(
    (patch: Partial<StoryTextWindow>) => {
      if (!currentScene || !currentBeat) {
        return;
      }

      if (authorTarget === "beat") {
        updateBeatTextWindow(currentBeat.id, patch);
        return;
      }

      updateSceneTextWindow(currentScene.id, patch);
    },
    [authorTarget, currentBeat, currentScene, updateBeatTextWindow, updateSceneTextWindow],
  );

  const handleAuthorFontFamilyChange = useCallback(
    (fontFamily: StoryTextWindowFontFamily) => {
      applyAuthorTextWindowPatch({ fontFamily });
    },
    [applyAuthorTextWindowPatch],
  );

  const handleAuthorFontSizeChange = useCallback(
    (fontSize: number) => {
      applyAuthorTextWindowPatch({ fontSize });
    },
    [applyAuthorTextWindowPatch],
  );

  const handleResetAuthorLayout = useCallback(() => {
    if (!currentScene || !currentBeat) {
      return;
    }

    if (authorTarget === "beat") {
      if (beatHasTextWindowOverride) {
        setBeatTextWindow(currentBeat.id, null);
      }
      return;
    }

    resetSceneTextWindow(currentScene.id);
  }, [authorTarget, beatHasTextWindowOverride, currentBeat, currentScene, resetSceneTextWindow, setBeatTextWindow]);

  const handleAuthorDragStart = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!isAuthorRuntime || !isAuthorPanelOpen || !stageRef.current || !textWindowRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      authorGestureRef.current = {
        type: "drag",
        pointerId: event.pointerId,
        stageRect: stageRef.current.getBoundingClientRect(),
        boxRect: textWindowRef.current.getBoundingClientRect(),
      };
    },
    [isAuthorPanelOpen, isAuthorRuntime],
  );

  const handleAuthorResizeStart = useCallback(
    (edge: ResizeEdge) => (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!isAuthorRuntime || !isAuthorPanelOpen) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      authorGestureRef.current = {
        type: "resize",
        pointerId: event.pointerId,
        edge,
        startX: event.clientX,
        startY: event.clientY,
        initialWindow: activeTextWindow,
      };
    },
    [activeTextWindow, isAuthorPanelOpen, isAuthorRuntime],
  );

  useEffect(() => {
    if (!isAuthorRuntime || !isAuthorPanelOpen) {
      authorGestureRef.current = null;
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const gesture = authorGestureRef.current;

      if (!gesture || !currentScene || !currentBeat) {
        return;
      }

      if (gesture.type === "drag") {
        const horizontalPadding = 16;
        const verticalPadding = 16;
        const halfWidth = gesture.boxRect.width / 2;
        const halfHeight = gesture.boxRect.height / 2;
        const nextCenterX = clampNumber(
          event.clientX - gesture.stageRect.left,
          halfWidth + horizontalPadding,
          Math.max(halfWidth + horizontalPadding, gesture.stageRect.width - halfWidth - horizontalPadding),
        );
        const nextCenterY = clampNumber(
          event.clientY - gesture.stageRect.top,
          halfHeight + verticalPadding,
          Math.max(halfHeight + verticalPadding, gesture.stageRect.height - halfHeight - verticalPadding),
        );

        applyAuthorTextWindowPatch({
          anchorX: clampNumber(
            (nextCenterX / gesture.stageRect.width) * 100,
            STORY_TEXT_WINDOW_ANCHOR_X_RANGE.min,
            STORY_TEXT_WINDOW_ANCHOR_X_RANGE.max,
          ),
          anchorY: clampNumber(
            (nextCenterY / gesture.stageRect.height) * 100,
            STORY_TEXT_WINDOW_ANCHOR_Y_RANGE.min,
            STORY_TEXT_WINDOW_ANCHOR_Y_RANGE.max,
          ),
        });
        return;
      }

      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      const nextWidth =
        gesture.edge === "right" || gesture.edge === "corner"
          ? clampNumber(
              gesture.initialWindow.width + deltaX,
              STORY_TEXT_WINDOW_WIDTH_RANGE.min,
              STORY_TEXT_WINDOW_WIDTH_RANGE.max,
            )
          : gesture.initialWindow.width;
      const nextMinHeight =
        gesture.edge === "bottom" || gesture.edge === "corner"
          ? clampNumber(
              gesture.initialWindow.minHeight + deltaY,
              STORY_TEXT_WINDOW_HEIGHT_RANGE.min,
              STORY_TEXT_WINDOW_HEIGHT_RANGE.max,
            )
          : gesture.initialWindow.minHeight;

      applyAuthorTextWindowPatch({
        width: nextWidth,
        minHeight: nextMinHeight,
      });
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (authorGestureRef.current?.pointerId === event.pointerId) {
        authorGestureRef.current = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [applyAuthorTextWindowPatch, currentBeat, currentScene, isAuthorPanelOpen, isAuthorRuntime]);

  const prewarmMemoryResonance = useCallback(
    async (source: RuntimeMemoryCaptureSource, capturedText: string) => {
      if (!currentBeat || !currentScene) {
        return;
      }

      const config = currentBeat.memoryResonance;
      const normalizedCapturedText = capturedText.trim();

      if (!config || !normalizedCapturedText || !canCaptureMemoryFromSource(config, source)) {
        return;
      }

      const currentSceneIndex = story.scenes.findIndex((scene) => scene.id === currentScene.id);
      const targetSceneIds = uniqueSceneIds(
        (config?.targetSceneIds ?? []).filter(
          (sceneId) =>
            sceneId !== currentScene.id &&
            story.scenes.findIndex((scene) => scene.id === sceneId) > currentSceneIndex,
        ),
      );

      if (targetSceneIds.length === 0) {
        return;
      }

      const targetScenes = targetSceneIds
        .map((sceneId) => resolveSceneById(sceneId))
        .filter((scene): scene is StoryScene => Boolean(scene))
        .map((scene) => ({
          id: scene.id,
          title: scene.title,
          beats: scene.beats.map((beat) => ({
            id: beat.id,
            text: beat.text,
            speaker: beat.speaker,
            resonanceWeights: beat.resonanceWeights,
            musicCueTrigger: beat.musicCueTrigger,
            imagePrompt: beat.imagePrompt,
            audioPrompt: beat.audioPrompt,
            requiresEmpathyCam: beat.requiresEmpathyCam ?? scene.requiresEmpathyCam ?? false,
          })),
        }));

      if (targetScenes.length === 0) {
        return;
      }

      const requestToken = crypto.randomUUID();
      for (const sceneId of targetSceneIds) {
        pendingSceneTokenRef.current[sceneId] = requestToken;
      }

      const payload: MemoryResonanceRequest = {
        storyTitle: story.title,
        sceneTitle: currentScene.title,
        currentBeatText: currentBeat.text,
        capturedText: normalizedCapturedText,
        source,
        config,
        previousMemories: memoryLedger.map((entry) => ({
          key: entry.key,
          source: entry.source,
          summary: entry.summary,
          capturedText: entry.capturedText,
        })),
        targetScenes,
      };

      try {
        const response = await fetch("/api/memory-resonance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          if (response.status === 401) {
            return;
          }

          const errorData = await response.json().catch(() => ({ error: "Memory resonance failed" }));
          throw new Error(errorData.error || "Memory resonance failed");
        }

        const data = (await response.json()) as MemoryResonanceResponse;
        const emotionalState = emotionalStateRef.current;

        hydrateSnapshot({
          resonance: accumulateResonance(emotionalState.resonance, data.memoryEntry.resonanceShift),
          authorOverrides: {
            ...emotionalState.authorOverrides,
            ...data.memoryEntry.authorOverrides,
          },
        });

        setMemoryLedger((prev) => [
          ...prev,
          {
            key: config.memoryKey || "latent-memory",
            source,
            capturedText: normalizedCapturedText,
            summary: data.memoryEntry.summary,
            gateWhisper: data.memoryEntry.gateWhisper,
            resonanceShift: data.memoryEntry.resonanceShift,
            authorOverrides: data.memoryEntry.authorOverrides,
            targetSceneIds,
            capturedAt: Date.now(),
          },
        ]);

        setPersonalizedScenesById((prev) => {
          const next = { ...prev };

          for (const generatedScene of data.scenes) {
            if (pendingSceneTokenRef.current[generatedScene.sceneId] !== requestToken) {
              continue;
            }

            const baseScene = prev[generatedScene.sceneId] ?? story.scenes.find((scene) => scene.id === generatedScene.sceneId);
            if (!baseScene) {
              continue;
            }

            next[generatedScene.sceneId] = mergePersonalizedScene(baseScene, generatedScene);
          }

          return next;
        });
      } catch (error) {
        console.error("Player memory resonance failed:", error);
      } finally {
        for (const sceneId of targetSceneIds) {
          if (pendingSceneTokenRef.current[sceneId] === requestToken) {
            delete pendingSceneTokenRef.current[sceneId];
          }
        }
      }
    },
    [currentBeat, currentScene, hydrateSnapshot, memoryLedger, resolveSceneById, story.scenes, story.title],
  );

  useEffect(() => {
    const firstScene = initialStory.scenes[0];
    const firstBeat = firstScene?.beats[0];

    if (isAuthorRuntime && initialStoryIdRef.current === initialStory.id) {
      const nextScene = initialStory.scenes.find((scene) => scene.id === currentSceneId) ?? firstScene;
      const nextBeatIndex = nextScene
        ? clampNumber(currentBeatIndex, 0, Math.max(nextScene.beats.length - 1, 0))
        : 0;
      const nextBeat = nextScene?.beats[nextBeatIndex];

      setStory(initialStory);
      setCurrentSceneId(nextScene?.id ?? "");
      setCurrentBeatIndex(nextBeatIndex);
      setEndedByChoice(false);
      setConversationHistory([]);
      setPersonalizedScenesById({});
      setMemoryLedger([]);
      pendingSceneTokenRef.current = {};

      if (nextScene && nextBeat) {
        enterScene({ sceneId: nextScene.id });
        applyBeat({
          beatId: `${nextScene.id}:${nextBeat.id}`,
          sceneId: nextScene.id,
          weights: nextBeat.resonanceWeights,
          targetEmotion: nextBeat.resonanceWeights,
        });
      }

      return;
    }

    initialStoryIdRef.current = initialStory.id;

    setStory(initialStory);
    setCurrentSceneId(firstScene?.id ?? "");
    setCurrentBeatIndex(0);
    setConversationHistory([]);
    setPersonalizedScenesById({});
    setMemoryLedger([]);
    pendingSceneTokenRef.current = {};

    if (firstScene && firstBeat) {
      setEndedByChoice(false);
      reset();
      enterScene({ sceneId: firstScene.id });
      applyBeat({
        beatId: `${firstScene.id}:${firstBeat.id}`,
        sceneId: firstScene.id,
        weights: firstBeat.resonanceWeights,
        targetEmotion: firstBeat.resonanceWeights,
      });
    }
  }, [applyBeat, currentBeatIndex, currentSceneId, enterScene, initialStory, isAuthorRuntime, reset]);

  useEffect(() => {
    if (audioReady) {
      audioEngine.setMoodFromFrame(resolvedFrame.audio);
    }
  }, [resolvedFrame, audioReady]);

  const advanceBeat = useCallback(() => {
    if (!currentScene || hasChoices || isLastBeatTotal) {
      return;
    }

    if (!isLastBeatInScene) {
      const nextIndex = currentBeatIndex + 1;
      const nextBeat = currentScene.beats[nextIndex];
      setCurrentBeatIndex(nextIndex);
      setEndedByChoice(false);

      applyBeat({
        beatId: `${currentScene.id}:${nextBeat.id}`,
        sceneId: currentScene.id,
        weights: nextBeat.resonanceWeights,
        targetEmotion: nextBeat.resonanceWeights,
      });
      return;
    }

    if (!isLastScene) {
      const currentSceneIndex = story.scenes.findIndex((scene) => scene.id === currentScene.id);
      const nextSceneId = story.scenes[currentSceneIndex + 1]?.id;
      const nextScene = nextSceneId ? resolveSceneById(nextSceneId) : null;
      const nextBeat = nextScene?.beats[0];

      if (!nextScene || !nextBeat) {
        return;
      }

      setCurrentSceneId(nextScene.id);
      setCurrentBeatIndex(0);
      setEndedByChoice(false);
      enterScene({ sceneId: nextScene.id });
      applyBeat({
        beatId: `${nextScene.id}:${nextBeat.id}`,
        sceneId: nextScene.id,
        weights: nextBeat.resonanceWeights,
        targetEmotion: nextBeat.resonanceWeights,
      });
    }
  }, [
    currentBeatIndex,
    currentScene,
    hasChoices,
    isLastBeatInScene,
    isLastBeatTotal,
    isLastScene,
    story.scenes,
    applyBeat,
    enterScene,
    resolveSceneById,
  ]);

  const handleChoice = useCallback(
    (event: React.MouseEvent, choice: StoryBeatChoice) => {
      event.stopPropagation();

      if (choice.nextSceneId) {
        void prewarmMemoryResonance("choice", choice.text);
      }

      const targetScene = resolveSceneById(choice.nextSceneId);
      if (!targetScene || !targetScene.beats[0]) {
        setEndedByChoice(true);
        return;
      }

      setEndedByChoice(false);
      setCurrentSceneId(targetScene.id);
      setCurrentBeatIndex(0);
      enterScene({ sceneId: targetScene.id });

      const nextBeat = targetScene.beats[0];
      applyBeat({
        beatId: `${targetScene.id}:${nextBeat.id}`,
        sceneId: targetScene.id,
        weights: nextBeat.resonanceWeights,
        targetEmotion: nextBeat.resonanceWeights,
      });
    },
    [applyBeat, currentBeat, enterScene, prewarmMemoryResonance, resolveSceneById],
  );

  const resetSequence = useCallback(
    (event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
      }

      const firstScene = initialStory.scenes[0];
      const firstBeat = firstScene?.beats[0];

      setStory(initialStory);
      setPersonalizedScenesById({});
      setMemoryLedger([]);
      setConversationHistory([]);
      pendingSceneTokenRef.current = {};
      setEndedByChoice(false);
      setCurrentSceneId(firstScene?.id ?? "");
      setCurrentBeatIndex(0);
      reset();

      if (firstScene && firstBeat) {
        enterScene({ sceneId: firstScene.id });
        applyBeat({
          beatId: `${firstScene.id}:${firstBeat.id}`,
          sceneId: firstScene.id,
          weights: firstBeat.resonanceWeights,
          targetEmotion: firstBeat.resonanceWeights,
        });
      }
    },
    [applyBeat, enterScene, initialStory, reset],
  );

  const handleNarrativeResponse = useCallback(
    (beatData: any) => {
      const normalizedPlayerInput = typeof beatData._playerInput === "string" ? beatData._playerInput.trim() : "";

      if (currentBeat?.memoryResonance) {
        void prewarmMemoryResonance("input", normalizedPlayerInput);
      }

      const newBeat: StoryBeat = {
        id: crypto.randomUUID(),
        text: beatData.text,
        speaker: beatData.speaker || "Narrator",
        resonanceWeights: beatData.resonanceWeights || buildFallbackResonance(),
        musicCueTrigger: beatData.musicCueTrigger || "conversational-drift",
        imagePrompt: beatData.imagePrompt || "",
        imageUrl: beatData.imageUrl || "",
        audioPrompt: beatData.audioPrompt || "",
        choices: [],
      };

      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: currentBeat?.text || "" },
        ...(normalizedPlayerInput ? [{ role: "user", content: normalizedPlayerInput }] : []),
      ]);

      setPersonalizedScenesById((prev) => {
        if (!prev[currentSceneId]) {
          return prev;
        }

        return {
          ...prev,
          [currentSceneId]: {
            ...prev[currentSceneId],
            beats: [...prev[currentSceneId].beats, newBeat],
          },
        };
      });

      setStory((prev) => {
        const personalizedScene = personalizedScenesById[currentSceneId];
        if (personalizedScene) {
          return prev;
        }

        const updatedScenes = prev.scenes.map((scene) => {
          if (scene.id !== currentSceneId) {
            return scene;
          }

          return { ...scene, beats: [...scene.beats, newBeat] };
        });

        return { ...prev, scenes: updatedScenes };
      });

      const nextIndex = currentBeatIndex + 1;
      setCurrentBeatIndex(nextIndex);
      setEndedByChoice(false);
      applyBeat({
        beatId: `${currentSceneId}:${newBeat.id}`,
        sceneId: currentSceneId,
        weights: newBeat.resonanceWeights,
        targetEmotion: newBeat.resonanceWeights,
      });
    },
    [applyBeat, currentBeat, currentBeatIndex, currentSceneId, personalizedScenesById, prewarmMemoryResonance],
  );

  if (!currentBeat) {
    return null;
  }

  return (
    <>
      {isAuthorRuntime ? (
        <PlayerAuthorPanel
          isOpen={isAuthorPanelOpen}
          target={authorTarget}
          activeTextWindow={activeTextWindow}
          currentSceneTitle={currentScene?.title ?? ""}
          currentBeatIndex={currentBeatIndex}
          activeImageSourceLabel={activeImageSourceBadge}
          beatHasOverride={beatHasTextWindowOverride}
          onToggle={() => setIsAuthorPanelOpen((current) => !current)}
          onTargetChange={setAuthorTarget}
          onFontFamilyChange={handleAuthorFontFamilyChange}
          onFontSizeChange={handleAuthorFontSizeChange}
          onReset={handleResetAuthorLayout}
        />
      ) : null}
      <main
      role={canAdvanceByTap && !hasChoices && !isLastBeatTotal ? "button" : undefined}
      tabIndex={canAdvanceByTap && !hasChoices && !isLastBeatTotal ? 0 : -1}
      onClick={hasChoices || isLastBeatTotal || !canAdvanceByTap ? undefined : advanceBeat}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && canAdvanceByTap && !hasChoices && !isLastBeatTotal) {
          event.preventDefault();
          advanceBeat();
        }
      }}
      className={`cinematic-shell min-h-dvh outline-none ${
        canAdvanceByTap && !hasChoices && !isLastBeatTotal ? "cursor-pointer" : ""
      }`}
      aria-label={
        hasChoices
          ? "Обрати варіант"
          : isLastBeatTotal
            ? "Гілку історії завершено"
            : "Перейти до наступного біта історії"
      }
    >
      <section
        ref={stageRef}
        className="relative min-h-dvh w-full overflow-hidden px-4 pb-6 pt-24 text-left text-foreground sm:px-6 sm:pb-8 sm:pt-24"
      >
        <EmpathyCameraOverlay active={empathyCameraActive} />
        <AnimatePresence initial={false}>
          {activeImageUrl ? (
            <motion.img
              key={`${currentScene?.id ?? "scene"}:${currentBeat.id}:${currentBeat.imageUrl?.trim() ? "beat" : "scene"}`}
              src={activeImageUrl}
              alt=""
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 0.48, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,14,0.24)_0%,rgba(2,6,10,0.54)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.34)_100%)] opacity-90" />
        <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-6">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-accent/84 backdrop-blur-md">
            {story.title ? <span>{story.title}</span> : null}
            <span>
              {currentScene?.title} · Біт {currentBeatIndex + 1}
            </span>
          </div>
        </div>
        <div
          className="absolute z-20"
          style={{
            left: `${activeTextWindow.anchorX}%`,
            top: `${activeTextWindow.anchorY}%`,
            width: `min(${activeTextWindow.width}px, calc(100vw - 2rem))`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.div
            ref={textWindowRef}
            layout
            className="relative flex w-full items-center justify-center rounded-[2.3rem] border border-white/10 bg-black/34 px-6 py-7 shadow-[0_36px_100px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:px-8 sm:py-9"
            style={{
              minHeight: `${activeTextWindow.minHeight}px`,
            }}
          >
            {isAuthorRuntime && isAuthorPanelOpen ? (
              <>
                <div className="pointer-events-none absolute left-5 top-4 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-accent">
                  {authorTarget === "beat" ? "редагування біта" : "редагування сцени"}
                </div>
                <button
                  type="button"
                  onPointerDown={handleAuthorDragStart}
                  aria-label="Перетягнути вікно"
                  className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-white/12 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/72 backdrop-blur-sm transition-colors hover:border-accent/40 hover:text-accent"
                >
                  тягни
                </button>
                <button
                  type="button"
                  onPointerDown={handleAuthorResizeStart("right")}
                  className="absolute right-[-10px] top-1/2 h-16 w-5 -translate-y-1/2 rounded-full border border-white/12 bg-black/42 text-transparent"
                  aria-label="Змінити ширину"
                />
                <button
                  type="button"
                  onPointerDown={handleAuthorResizeStart("bottom")}
                  className="absolute bottom-[-10px] left-1/2 h-5 w-16 -translate-x-1/2 rounded-full border border-white/12 bg-black/42 text-transparent"
                  aria-label="Змінити висоту"
                />
                <button
                  type="button"
                  onPointerDown={handleAuthorResizeStart("corner")}
                  className="absolute bottom-[-12px] right-[-12px] h-8 w-8 rounded-full border border-accent/40 bg-black/55 text-transparent shadow-[0_0_30px_rgba(195,181,157,0.18)]"
                  aria-label="Змінити розмір"
                />
              </>
            ) : null}
            <motion.p
              key={currentBeat.id}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`cinematic-copy w-full text-center ${textWindowFontClassName[activeTextWindow.fontFamily]}`}
              style={{
                fontSize: `min(${activeTextWindow.fontSize}px, 11vw)`,
                lineHeight: activeTextWindow.lineHeight,
              }}
            >
              {currentBeat.text}
            </motion.p>
          </motion.div>
        </div>
        <div className="relative mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-5xl flex-col items-center justify-end gap-4 pb-2">
          <div className="hidden flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.28em] text-accent opacity-78">
            {story.title ? <span>{story.title}</span> : null}
            <span>
              {currentScene?.title} · Біт {currentBeatIndex + 1}
            </span>
            <span>
              {resolvedFrame.dominantEmotion} {resolvedFrame.dominantIntensity.toFixed(2)}
            </span>
            <span>фільтр {Math.round(resolvedFrame.audio.lowpassHz)} гц</span>
            {activeImageSourceLabel ? <span>{activeImageSourceLabel}</span> : null}
            {empathyCameraActive ? <span>камера емпатії активна</span> : null}
          </div>

          <motion.div
            layout
            className="hidden"
            style={{
              maxWidth: `${currentSceneTextWindow.width}px`,
              minHeight: `${currentSceneTextWindow.minHeight}px`,
            }}
          >
            <motion.p
              key={currentBeat.id}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="cinematic-copy w-full text-center font-serif text-[clamp(2.4rem,7vw,5.2rem)] leading-[0.98] tracking-[-0.042em]"
            >
              {currentBeat.text}
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {hasChoices && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 flex w-full max-w-md flex-col items-center gap-4"
              >
                {choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={(event) => handleChoice(event, choice)}
                    className="w-full rounded-2xl border border-border/60 bg-black/40 px-6 py-4 text-center text-[13px] uppercase tracking-[0.24em] text-foreground shadow-bleed backdrop-blur-md transition-all duration-300 hover:border-accent hover:bg-accent/10 hover:text-accent"
                  >
                    {choice.text}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`max-w-2xl text-center text-sm uppercase tracking-[0.24em] text-foreground opacity-60 ${
              isAuthorRuntime && isAuthorPanelOpen ? "hidden" : ""
            }`}
          >
            {isLastBeatTotal && !hasChoices
              ? endedByChoice
                ? "ця гілка завершується тут"
                : "кімната дійшла до фінальної форми"
              : hasChoices
                ? "обери свій варіант"
                : isConversationReady
                  ? "дай відповідь, щоб продовжити історію"
                  : empathyCameraActive
                    ? "прочитай рядок уголос і продовжуй далі"
                    : "торкнися будь-де, щоб перейти далі"}
          </div>

          {isAuthorRuntime && isAuthorPanelOpen ? (
            <div className="max-w-2xl text-center text-sm uppercase tracking-[0.24em] text-accent/80">
              режим автора: тягни вікно, міняй шрифт і дивись результат одразу на кадрі
            </div>
          ) : null}

          <AnimatePresence>
            {showConversationInput && (
              <ConversationInput
                currentBeatText={currentBeat?.text || ""}
                onNarrativeResponse={handleNarrativeResponse}
                conversationHistory={conversationHistory}
              />
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="hidden rounded-full border border-border bg-panel px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-accent opacity-90 shadow-bleed">
              текст, звук і фон працюють разом
            </span>
            {isAuthorRuntime && isAuthorPanelOpen && activeImageSourceBadge ? (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-accent shadow-bleed">
                зараз показано {activeImageSourceBadge}
              </span>
            ) : null}
            {empathyCameraActive ? (
              <span className="rounded-full border border-rose-500/40 bg-rose-500/8 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-rose-200 shadow-[0_0_24px_rgba(244,63,94,0.14)]">
                оверлей відстеження активний
              </span>
            ) : null}
            {isLastBeatTotal && !hasChoices ? (
              <button
                type="button"
                onClick={resetSequence}
                className="cursor-pointer rounded-full border border-border bg-panel px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground shadow-bleed transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                почати знову
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
