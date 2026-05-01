"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/stores/useEditorStore";
import { useGhostTutorialStore } from "@/lib/stores/useGhostTutorialStore";

const resonanceLabelMap: Record<string, string> = {
  neutral: "нейтральність",
  depression: "депресія",
  panic: "паніка",
  isolation: "ізоляція",
  obsession: "одержимість",
  tenderness: "ніжність",
};

type HighlightFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function resolveHighlightFrame(targetId: string): HighlightFrame | null {
  const target = document.querySelector<HTMLElement>(`[data-ghost-target="${targetId}"]`);

  if (!target) {
    return null;
  }

  const rect = target.getBoundingClientRect();

  return {
    left: Math.max(rect.left - 10, 8),
    top: Math.max(rect.top - 10, 8),
    width: rect.width + 20,
    height: rect.height + 20,
  };
}

export function GhostOverlay() {
  const story = useEditorStore((state) => state.draftStory);
  const selectBeat = useEditorStore((state) => state.selectBeat);
  const updateBeatResonance = useEditorStore((state) => state.updateBeatResonance);
  const updateBeatAudioPrompt = useEditorStore((state) => state.updateBeatAudioPrompt);
  const updateBeatEmpathyCam = useEditorStore((state) => state.updateBeatEmpathyCam);

  const isActive = useGhostTutorialStore((state) => state.isActive);
  const currentStepIndex = useGhostTutorialStore((state) => state.currentStepIndex);
  const mode = useGhostTutorialStore((state) => state.mode);
  const steps = useGhostTutorialStore((state) => state.steps);
  const activate = useGhostTutorialStore((state) => state.activate);
  const dismiss = useGhostTutorialStore((state) => state.dismiss);
  const restart = useGhostTutorialStore((state) => state.restart);
  const nextStep = useGhostTutorialStore((state) => state.nextStep);
  const previousStep = useGhostTutorialStore((state) => state.previousStep);
  const goToStep = useGhostTutorialStore((state) => state.goToStep);
  const setMode = useGhostTutorialStore((state) => state.setMode);

  const [highlightFrame, setHighlightFrame] = useState<HighlightFrame | null>(null);

  const currentStep = steps[currentStepIndex] ?? steps[0];
  const isAiMode = mode === "ai";
  const stepTargetExists = Boolean(
    currentStep?.sceneId &&
      currentStep.beatId &&
      story.scenes.find((scene) => scene.id === currentStep.sceneId)?.beats.find((beat) => beat.id === currentStep.beatId),
  );

  useEffect(() => {
    if (!isActive || !currentStep) {
      setHighlightFrame(null);
      return;
    }

    const update = () => {
      setHighlightFrame(resolveHighlightFrame(currentStep.targetId));
    };

    const rafId = window.requestAnimationFrame(update);
    const intervalId = window.setInterval(update, 250);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearInterval(intervalId);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [currentStep, isActive, story]);

  const modeBody = useMemo(() => {
    if (!currentStep) {
      return null;
    }

    return isAiMode ? currentStep.aiGuidance : currentStep.manualGuidance;
  }, [currentStep, isAiMode]);

  if (!currentStep) {
    return null;
  }

  const ensureTemplateSelection = () => {
    const targetScene = story.scenes.find((scene) => scene.id === currentStep.sceneId);
    const targetBeat = targetScene?.beats.find((beat) => beat.id === currentStep.beatId);

    if (!targetScene || !targetBeat) {
      return null;
    }

    selectBeat(targetScene.id, targetBeat.id);
    return {
      sceneId: targetScene.id,
      beatId: targetBeat.id,
    };
  };

  const applyAiPass = () => {
    const selection = ensureTemplateSelection();

    if (!selection) {
      return;
    }

    if (currentStep.aiResonanceWeights) {
      updateBeatResonance(selection.beatId, currentStep.aiResonanceWeights);
    }

    if (currentStep.aiAudioPrompt) {
      updateBeatAudioPrompt(selection.beatId, currentStep.aiAudioPrompt);
    }

    if (currentStep.id === "empathy-camera") {
      updateBeatEmpathyCam(selection.beatId, true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isActive && highlightFrame ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: 1,
              scale: 1,
              left: highlightFrame.left,
              top: highlightFrame.top,
              width: highlightFrame.width,
              height: highlightFrame.height,
            }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed z-[70] rounded-[1.6rem] border border-accent/80 bg-transparent shadow-[0_0_0_1px_rgba(195,181,157,0.22),0_0_48px_rgba(195,181,157,0.16)]"
          >
            <div className="absolute -inset-1 rounded-[1.9rem] border border-white/8" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.aside
            key="ghost-overlay"
            initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 18, filter: "blur(12px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 right-5 z-[80] w-[min(30rem,calc(100vw-2rem))] rounded-[2rem] border border-border bg-black/75 p-5 shadow-[0_30px_120px_-42px_rgba(0,0,0,0.75)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.32em] text-accent opacity-84">Агент-привид</div>
                <h3 className="mt-2 font-serif text-[1.85rem] leading-[0.96] tracking-[-0.04em] text-foreground">
                  {currentStep.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full border border-border px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-foreground opacity-68 transition-opacity duration-300 hover:opacity-100"
              >
                Сховати
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-foreground opacity-76">{currentStep.rationale}</p>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-[1.4rem] border border-border bg-white/5 p-2">
              <button
                type="button"
                onClick={() => setMode("ai")}
                className={`rounded-[1rem] px-4 py-3 text-[11px] uppercase tracking-[0.24em] transition-all duration-300 ${isAiMode ? "bg-accent text-black" : "text-foreground opacity-72 hover:opacity-100"
                  }`}
              >
                Автогенерація ШІ
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`rounded-[1rem] px-4 py-3 text-[11px] uppercase tracking-[0.24em] transition-all duration-300 ${!isAiMode ? "bg-accent text-black" : "text-foreground opacity-72 hover:opacity-100"
                  }`}
              >
                Ручне налаштування
              </button>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-border bg-panel/70 p-4">
              <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-72">
                {isAiMode ? "Прохід ШІ" : "Ручний емпатичний прохід"}
              </div>
              <p className="mt-3 text-sm leading-7 text-foreground opacity-78">{modeBody}</p>

              {currentStep.aiResonanceWeights ? (
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-accent opacity-80">
                  {Object.entries(currentStep.aiResonanceWeights)
                    .filter(([, v]) => v > 0)
                    .map(([key, value]) => (
                      <span key={key}>{resonanceLabelMap[key] ?? key} {value.toFixed(2)}</span>
                    ))}
                </div>
              ) : null}

              {currentStep.aiAudioPrompt ? (
                <div className="mt-4 text-xs leading-6 text-foreground opacity-68">{currentStep.aiAudioPrompt}</div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                className="px-4 text-[11px] uppercase tracking-[0.24em]"
                onClick={applyAiPass}
                disabled={!isAiMode || !stepTargetExists}
              >
                Застосувати прохід ШІ
              </Button>
            </div>

            {!stepTargetExists ? (
              <div className="mt-3 text-xs leading-6 text-foreground opacity-62">
                Цей крок туторіалу лише підсвічує відповідні біти, які вже існують у твоїй поточній чернетці. Він ніколи не пересіває і не перезаписує історію.
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${index === currentStepIndex ? "w-10 bg-accent" : "w-2.5 bg-white/20 hover:bg-white/40"
                      }`}
                    aria-label={`Перейти до кроку туторіалу ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={previousStep}
                  className="rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-foreground opacity-72 transition-opacity duration-300 hover:opacity-100"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-full border border-accent px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-accent transition-all duration-300 hover:bg-accent hover:text-black"
                >
                  Далі
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={restart}
              className="mt-4 text-[10px] uppercase tracking-[0.24em] text-foreground opacity-56 transition-opacity duration-300 hover:opacity-100"
            >
              Перезапустити туторіал
            </button>
          </motion.aside>
        ) : (
          <motion.button
            key="ghost-resume"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.22 }}
            type="button"
            onClick={activate}
            className="fixed bottom-5 right-5 z-[80] rounded-full border border-accent bg-black/75 px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-accent shadow-bleed backdrop-blur-xl"
          >
            Покликати привида
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
