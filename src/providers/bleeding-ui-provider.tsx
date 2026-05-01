"use client";

import type { HTMLAttributes } from "react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

import type { ResolvedEmotionalFrame } from "../lib/emotion/types";
import { useEmotionalStore } from "../stores/use-emotional-store";

type BleedingUISyncTarget = "self" | "document" | "body";

export type BleedingUIProviderProps = HTMLAttributes<HTMLDivElement> & {
  syncTargets?: BleedingUISyncTarget[];
  disableAnimation?: boolean;
  onFrameChange?: (frame: ResolvedEmotionalFrame, previousFrame: ResolvedEmotionalFrame | undefined) => void;
};

function resolveTargets(scopeElement: HTMLDivElement, syncTargets: BleedingUISyncTarget[]): HTMLElement[] {
  const targets = new Set<HTMLElement>();

  for (const target of syncTargets) {
    if (target === "self") {
      targets.add(scopeElement);
      continue;
    }

    if (target === "document") {
      targets.add(document.documentElement);
      continue;
    }

    if (target === "body") {
      targets.add(document.body);
    }
  }

  return Array.from(targets);
}

function applyFrameToTarget(target: HTMLElement, frame: ResolvedEmotionalFrame, animate: boolean) {
  target.dataset.emotion = frame.dominantEmotion;
  target.style.setProperty("--ui-dominant-intensity", frame.cssVariables["--ui-dominant-intensity"]);
  target.style.setProperty("--ui-transition-ms", frame.cssVariables["--ui-transition-ms"]);

  if (!animate) {
    for (const [token, value] of Object.entries(frame.cssVariables)) {
      target.style.setProperty(token, value);
    }
    return;
  }

  gsap.killTweensOf(target);
  gsap.to(target, {
    duration: Math.max(frame.transitionMs, 120) / 1000,
    ease: frame.easing,
    overwrite: "auto",
    ...frame.cssVariables,
  });
}

export function BleedingUIProvider({
  children,
  syncTargets = ["self", "document"],
  disableAnimation = false,
  onFrameChange,
  ...rest
}: BleedingUIProviderProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const syncKey = syncTargets.join("|");
  const uniqueTargets = useMemo(() => Array.from(new Set(syncTargets)), [syncKey]);

  useLayoutEffect(() => {
    const scopeElement = scopeRef.current;
    if (!scopeElement) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targetElements = resolveTargets(scopeElement, uniqueTargets);
    const initialFrame = useEmotionalStore.getState().resolvedFrame;

    for (const target of targetElements) {
      applyFrameToTarget(target, initialFrame, false);
    }

    const unsubscribe = useEmotionalStore.subscribe(
      (state) => state.resolvedFrame,
      (frame, previousFrame) => {
        const shouldAnimate = !disableAnimation && !mediaQuery.matches;
        const liveTargets = resolveTargets(scopeElement, uniqueTargets);

        for (const target of liveTargets) {
          applyFrameToTarget(target, frame, shouldAnimate);
        }

        onFrameChange?.(frame, previousFrame);
      },
    );

    return () => {
      const liveTargets = resolveTargets(scopeElement, uniqueTargets);

      for (const target of liveTargets) {
        gsap.killTweensOf(target);
      }

      unsubscribe();
    };
  }, [disableAnimation, onFrameChange, uniqueTargets]);

  return (
    <div ref={scopeRef} data-bleeding-ui="" {...rest}>
      {children}
    </div>
  );
}
