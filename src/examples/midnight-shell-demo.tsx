"use client";

import { useEffect } from "react";

import type { BeatEmotionPayload } from "../lib/emotion/types";
import { BleedingUIProvider } from "../providers/bleeding-ui-provider";
import { useEmotionalStore } from "../stores/use-emotional-store";

const introBeats: BeatEmotionPayload[] = [
  {
    beatId: "door-locks",
    weights: { isolation: 0.12, depression: 0.05 },
    targetEmotion: { isolation: 0.2 },
  },
  {
    beatId: "phone-vibrates",
    weights: { panic: 0.18, obsession: 0.08 },
    targetEmotion: { panic: 0.35, obsession: 0.16 },
    transitionMs: 950,
  },
  {
    beatId: "empty-corridor",
    weights: { depression: 0.14, isolation: 0.1, panic: -0.06 },
    targetEmotion: { depression: 0.32, isolation: 0.22 },
    transitionMs: 1800,
  },
  {
    beatId: "voice-in-the-wall",
    weights: { obsession: 0.2, panic: 0.12 },
    targetEmotion: { obsession: 0.42, panic: 0.16 },
    overrides: { blurPx: 1.4, grain: 0.11 },
    transitionMs: 1100,
  },
];

export function MidnightShellDemo() {
  const frame = useEmotionalStore((state) => state.resolvedFrame);
  const enterScene = useEmotionalStore((state) => state.enterScene);
  const applyBeat = useEmotionalStore((state) => state.applyBeat);
  const reset = useEmotionalStore((state) => state.reset);

  useEffect(() => {
    enterScene({
      sceneId: "intro-alley",
      targetEmotion: { isolation: 0.26, depression: 0.12 },
      transitionMs: 1700,
    });
  }, [enterScene]);

  return (
    <BleedingUIProvider className="midnight-shell">
      <main className="midnight-shell__card">
        <p className="midnight-shell__eyebrow">Midnight Narrative Constructor</p>
        <h1 className="midnight-shell__title">Bleeding UI Runtime</h1>
        <p className="midnight-shell__copy">
          Each beat mutates the emotional vector in the store. The provider listens outside React and lerps only CSS
          custom properties, so the interface darkens by accumulation instead of hard scene cuts.
        </p>
        <div className="midnight-shell__meta">
          <span>Dominant: {frame.dominantEmotion}</span>
          <span>Intensity: {frame.dominantIntensity.toFixed(2)}</span>
          <span>Transition: {frame.transitionMs}ms</span>
          <span>Audio gain: {frame.audio.gain.toFixed(2)}</span>
        </div>
        <div className="midnight-shell__controls">
          {introBeats.map((beat) => (
            <button key={beat.beatId} type="button" onClick={() => applyBeat(beat)}>
              {beat.beatId}
            </button>
          ))}
          <button type="button" onClick={() => reset()}>
            reset bleed
          </button>
        </div>
      </main>
    </BleedingUIProvider>
  );
}
