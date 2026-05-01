"use client";

import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";

import { DEFAULT_EASING, DEFAULT_TRANSITION_MS, createEmotionVector, normalizeEmotionInput } from "../lib/emotion/profiles";
import { accumulateResonance, resolveEmotionalFrame } from "../lib/emotion/resolver";
import type {
  AuthorialOverride,
  BeatEmotionPayload,
  BeatHistoryEntry,
  EmotionalSnapshot,
  EmotionVector,
  ResolvedEmotionalFrame,
  SceneEmotionPayload,
} from "../lib/emotion/types";

const HISTORY_LIMIT = 40;

type EmotionalStoreState = EmotionalSnapshot & {
  resolvedFrame: ResolvedEmotionalFrame;
  history: BeatHistoryEntry[];
  enterScene: (payload: SceneEmotionPayload) => void;
  applyBeat: (payload: BeatEmotionPayload) => void;
  setManualOverrides: (overrides: AuthorialOverride) => void;
  clearManualOverrides: () => void;
  hydrateSnapshot: (snapshot: Partial<EmotionalSnapshot>) => void;
  reset: () => void;
};

function createFallbackStorage() {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  };
}

function createSnapshot(overrides?: Partial<EmotionalSnapshot>): EmotionalSnapshot {
  return {
    sceneId: null,
    beatId: null,
    beatCount: 0,
    resonance: createEmotionVector(),
    sceneTarget: createEmotionVector(),
    beatTarget: createEmotionVector(),
    authorOverrides: {},
    transitionMs: DEFAULT_TRANSITION_MS,
    easing: DEFAULT_EASING,
    ...overrides,
  };
}

function withResolvedFrame(snapshot: EmotionalSnapshot): Pick<EmotionalStoreState, keyof EmotionalSnapshot | "resolvedFrame"> {
  return {
    ...snapshot,
    resolvedFrame: resolveEmotionalFrame(snapshot),
  };
}

function trimHistory(history: BeatHistoryEntry[]): BeatHistoryEntry[] {
  return history.slice(-HISTORY_LIMIT);
}

const initialSnapshot = createSnapshot();

export const useEmotionalStore = create<EmotionalStoreState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        ...withResolvedFrame(initialSnapshot),
        history: [],
        enterScene: (payload) =>
          set((state) => {
            const snapshot = createSnapshot({
              ...state,
              sceneId: payload.sceneId,
              beatId: null,
              sceneTarget: normalizeEmotionInput(payload.targetEmotion),
              beatTarget: createEmotionVector(),
              authorOverrides: payload.overrides ? { ...state.authorOverrides, ...payload.overrides } : state.authorOverrides,
              transitionMs: payload.transitionMs ?? state.transitionMs,
              easing: payload.easing ?? state.easing,
            });

            return {
              ...state,
              ...withResolvedFrame(snapshot),
            };
          }),
        applyBeat: (payload) =>
          set((state) => {
            const resonance = accumulateResonance(state.resonance, payload.weights);
            const beatCount = state.beatCount + 1;
            const snapshot = createSnapshot({
              ...state,
              sceneId: payload.sceneId ?? state.sceneId,
              beatId: payload.beatId,
              beatCount,
              resonance,
              beatTarget: normalizeEmotionInput(payload.targetEmotion),
              authorOverrides: payload.overrides ? { ...state.authorOverrides, ...payload.overrides } : state.authorOverrides,
              transitionMs: payload.transitionMs ?? state.transitionMs,
              easing: payload.easing ?? state.easing,
            });
            const resolved = withResolvedFrame(snapshot);

            return {
              ...state,
              ...resolved,
              history: trimHistory([
                ...state.history,
                {
                  sceneId: snapshot.sceneId,
                  beatId: payload.beatId,
                  weights: payload.weights ?? {},
                  dominantEmotion: resolved.resolvedFrame.dominantEmotion,
                  dominantIntensity: resolved.resolvedFrame.dominantIntensity,
                  transitionMs: resolved.resolvedFrame.transitionMs,
                  at: Date.now(),
                },
              ]),
            };
          }),
        setManualOverrides: (overrides) =>
          set((state) => {
            const snapshot = createSnapshot({
              ...state,
              authorOverrides: { ...state.authorOverrides, ...overrides },
            });

            return {
              ...state,
              ...withResolvedFrame(snapshot),
            };
          }),
        clearManualOverrides: () =>
          set((state) => {
            const snapshot = createSnapshot({
              ...state,
              authorOverrides: {},
            });

            return {
              ...state,
              ...withResolvedFrame(snapshot),
            };
          }),
        hydrateSnapshot: (partialSnapshot) =>
          set((state) => {
            const snapshot = createSnapshot({
              ...state,
              ...partialSnapshot,
              resonance: partialSnapshot.resonance ?? state.resonance,
              sceneTarget: partialSnapshot.sceneTarget ?? state.sceneTarget,
              beatTarget: partialSnapshot.beatTarget ?? state.beatTarget,
            });

            return {
              ...state,
              ...withResolvedFrame(snapshot),
            };
          }),
        reset: () => ({
          ...withResolvedFrame(initialSnapshot),
          history: [],
        }),
      }),
      {
        name: "midnight-narrative-emotional-store",
        storage: createJSONStorage(() =>
          typeof window !== "undefined" ? window.localStorage : createFallbackStorage(),
        ),
        partialize: (state) => ({
          sceneId: state.sceneId,
          beatId: state.beatId,
          beatCount: state.beatCount,
          resonance: state.resonance,
          sceneTarget: state.sceneTarget,
          beatTarget: state.beatTarget,
          authorOverrides: state.authorOverrides,
          transitionMs: state.transitionMs,
          easing: state.easing,
          history: state.history,
        }),
        merge: (persistedState, currentState) => {
          const merged = {
            ...currentState,
            ...(persistedState as Partial<EmotionalStoreState>),
          };
          const snapshot = createSnapshot({
            sceneId: merged.sceneId,
            beatId: merged.beatId,
            beatCount: merged.beatCount,
            resonance: merged.resonance as EmotionVector,
            sceneTarget: merged.sceneTarget as EmotionVector,
            beatTarget: merged.beatTarget as EmotionVector,
            authorOverrides: merged.authorOverrides,
            transitionMs: merged.transitionMs,
            easing: merged.easing,
          });

          return {
            ...merged,
            ...withResolvedFrame(snapshot),
          };
        },
      },
    ),
  ),
);
