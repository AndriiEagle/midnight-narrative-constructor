"use client";

import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";

import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Slider } from "@/components/ui/slider";
import { getEmotionDualView } from "@/lib/emotion/authoring";
import { createEmotionVector } from "@/lib/emotion/profiles";
import { RESONANCE_PRESETS, getPresetDominantEmotions, isPresetApplied } from "@/lib/emotion/presets";
import { resolveEmotionalFrame } from "@/lib/emotion/resolver";
import type { EmotionId, EmotionVector, EmotionalSnapshot, ResolvedEmotionalFrame } from "@/lib/emotion/types";
import { useEditorStore } from "@/lib/stores/useEditorStore";
import { cn } from "@/lib/utils";

const emotionLabels: Record<EmotionId, string> = {
  neutral: "Нейтральність",
  depression: "Депресія",
  panic: "Паніка",
  isolation: "Ізоляція",
  obsession: "Одержимість",
  tenderness: "Ніжність",
};

const resonanceDefinitions: Array<{ key: EmotionId; label: string; accent: string }> = [
  { key: "neutral", label: "Нейтральність", accent: "from-stone-300 to-stone-100" },
  { key: "depression", label: "Депресія", accent: "from-slate-500 to-slate-300" },
  { key: "panic", label: "Паніка", accent: "from-amber-500 to-red-300" },
  { key: "isolation", label: "Ізоляція", accent: "from-cyan-600 to-blue-300" },
  { key: "obsession", label: "Одержимість", accent: "from-orange-500 to-amber-300" },
  { key: "tenderness", label: "Ніжність", accent: "from-rose-400 to-pink-200" },
];

function EmotionDualViewTooltip({ emotionId }: { emotionId: EmotionId }) {
  const dualView = getEmotionDualView(emotionId);

  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-78">Подвійний погляд</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1rem] border border-border/70 bg-black/20 p-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-accent opacity-82">Авторський сенс</div>
          <p className="mt-2 text-xs leading-6 text-foreground opacity-84">{dualView.authorMeaning.summary}</p>
          <div className="mt-3 space-y-2">
            {dualView.authorMeaning.cues.map((cue) => (
              <p key={cue} className="text-[11px] leading-6 text-foreground opacity-66">
                {cue}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-[1rem] border border-border/70 bg-black/20 p-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-accent opacity-82">Ефект рушія</div>
          <p className="mt-2 text-xs leading-6 text-foreground opacity-84">{dualView.engineEffect.summary}</p>
          <div className="mt-3 space-y-2">
            {dualView.engineEffect.cues.map((cue) => (
              <p key={cue} className="text-[11px] leading-6 text-foreground opacity-66">
                {cue}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function applyFrameToElement(element: HTMLElement | null, frame: ResolvedEmotionalFrame) {
  if (!element) return;

  const target: Record<string, string> = {};
  for (const [key, value] of Object.entries(frame.cssVariables)) {
    target[key] = value;
  }

  gsap.to(element, {
    ...target,
    duration: frame.transitionMs / 1000,
    ease: frame.easing,
    overwrite: true,
  });
}

function buildPreviewSnapshot(weights: EmotionVector): EmotionalSnapshot {
  return {
    sceneId: null,
    beatId: null,
    beatCount: 0,
    resonance: createEmotionVector(),
    sceneTarget: createEmotionVector(),
    beatTarget: weights,
    authorOverrides: {},
    transitionMs: 700,
    easing: "power2.out",
  };
}

export function ResonancePanel() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  const story = useEditorStore((state) => state.draftStory);
  const selectedSceneId = useEditorStore((state) => state.selectedSceneId);
  const selectedBeatId = useEditorStore((state) => state.selectedBeatId);
  const addScene = useEditorStore((state) => state.addScene);
  const addBeat = useEditorStore((state) => state.addBeat);
  const updateBeatResonance = useEditorStore((state) => state.updateBeatResonance);

  const selectedScene = story.scenes.find((scene) => scene.id === selectedSceneId) ?? story.scenes[0];
  const selectedBeat = selectedScene?.beats.find((beat) => beat.id === selectedBeatId) ?? selectedScene?.beats[0];
  const selectedSceneIndex = selectedScene ? story.scenes.findIndex((scene) => scene.id === selectedScene.id) : -1;
  const selectedBeatIndex = selectedScene?.beats.findIndex((beat) => beat.id === selectedBeat?.id) ?? -1;

  const resolvedFrame = useMemo(() => {
    if (!selectedBeat) return null;
    return resolveEmotionalFrame(buildPreviewSnapshot(selectedBeat.resonanceWeights));
  }, [selectedBeat]);

  const activePresetId = useMemo(
    () =>
      selectedBeat
        ? RESONANCE_PRESETS.find((preset) => isPresetApplied(selectedBeat.resonanceWeights, preset.weights))?.id ?? null
        : null,
    [selectedBeat],
  );

  const localizedPlayerPayload = useMemo(
    () =>
      selectedBeat
        ? {
            ідентифікатор: `Сцена ${selectedSceneIndex + 1} / Біт ${selectedBeatIndex + 1}`,
            репліка: selectedBeat.text,
            мовець: selectedBeat.speaker,
            резонанс: {
              нейтральність: selectedBeat.resonanceWeights.neutral,
              депресія: selectedBeat.resonanceWeights.depression,
              паніка: selectedBeat.resonanceWeights.panic,
              ізоляція: selectedBeat.resonanceWeights.isolation,
              одержимість: selectedBeat.resonanceWeights.obsession,
              ніжність: selectedBeat.resonanceWeights.tenderness,
            },
            музичний_тригер: selectedBeat.musicCueTrigger,
            промпт_зображення: selectedBeat.imagePrompt,
            аудіопромпт: selectedBeat.audioPrompt,
            камера_емпатії: selectedBeat.requiresEmpathyCam ?? false,
            вибори: (selectedBeat.choices ?? []).map((choice) => ({
              ідентифікатор: choice.text || "Вибір",
              текст: choice.text,
              наступна_сцена:
                story.scenes.find((scene) => scene.id === choice.nextSceneId)?.title || "Завершити історію тут",
            })),
          }
        : {},
    [selectedBeat, selectedBeatIndex, selectedSceneIndex, story.scenes],
  );

  useEffect(() => {
    if (!resolvedFrame || !isPreviewVisible) return;
    applyFrameToElement(previewRef.current, resolvedFrame);
  }, [isPreviewVisible, resolvedFrame]);

  if (!selectedBeat) {
    return (
      <aside className="flex h-full min-h-[32rem] flex-col gap-5 rounded-[2rem] border border-border bg-panel p-5 shadow-bleed">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-accent opacity-80">Керування резонансом</div>
            <h2 className="mt-2 font-serif text-2xl tracking-[-0.03em] text-foreground">Психологічні ваги</h2>
          </div>
          <InfoTooltip
            side="left"
            label="Що змінюють психологічні ваги"
            content="Ці слайдери керують тим, як колір, блюр, ритм і звук реагують, коли гравець доходить до вибраного біта."
          />
        </div>

        <StudioEmptyState
          title={selectedScene ? "Біт не вибрано" : "Сцена недоступна"}
          description={
            selectedScene
              ? "Створи біт для цієї сцени, щоб налаштувати її емоційний колір, рух і звуковий дизайн."
              : "Спершу додай сцену, і тоді керування резонансом оживе для вибраного біта."
          }
          className="flex-1"
        >
          {selectedScene ? (
            <Button className="px-4 text-[11px] uppercase tracking-[0.24em]" onClick={() => addBeat(selectedScene.id)}>
              Додати біт
            </Button>
          ) : (
            <Button className="px-4 text-[11px] uppercase tracking-[0.24em]" onClick={addScene}>
              Додати сцену
            </Button>
          )}
        </StudioEmptyState>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-[32rem] flex-col gap-5 rounded-[2rem] border border-border bg-panel p-5 shadow-bleed">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-accent opacity-80">Керування резонансом</div>
          <h2 className="mt-2 font-serif text-2xl tracking-[-0.03em] text-foreground">Психологічні ваги</h2>
          <p className="mt-3 max-w-xs text-sm leading-6 text-foreground opacity-64">
            Налаштуй, як гравець бачить, чує й відчуває цей біт.
          </p>
        </div>
        <InfoTooltip
          side="left"
          label="Що змінюють психологічні ваги"
          panelClassName="w-[32rem]"
          content={
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-78">Подвійний погляд</div>
              <p className="text-xs leading-6 text-foreground opacity-84">
                Кожна емоція тепер має два шари: <span className="text-accent">авторський сенс</span> пояснює, коли її
                застосовувати в письмі, а <span className="text-accent">ефект рушія</span> пояснює, що саме рантайм
                реально змінює в темпі, зображенні та звуці.
              </p>
              <p className="text-[11px] leading-6 text-foreground opacity-66">
                Це прибирає ворожіння. Ти більше не штовхаєш абстрактні ярлики настрою, а режисуєш конкретний досвід
                гравця.
              </p>
            </div>
          }
        />
      </div>

      <div className="rounded-[1.5rem] border border-border/70 bg-black/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-72">Прев'ю сцени</div>
            <p className="mt-2 max-w-xs text-sm leading-6 text-foreground opacity-62">
              Це лише швидкий атмосферний перегляд. Якщо він зараз не потрібен, його можна сховати.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setIsPreviewVisible((current) => !current)}
            className="h-9 border-border bg-transparent px-3 text-[10px] uppercase tracking-[0.18em] text-foreground hover:border-accent"
          >
            {isPreviewVisible ? "Сховати прев'ю" : "Показати прев'ю"}
          </Button>
        </div>

        {isPreviewVisible ? (
          <div
            ref={previewRef}
            className="mt-4 overflow-hidden rounded-[1.75rem] border p-5"
            style={{
              borderColor: "var(--ui-border)",
              color: "var(--ui-text)",
              background:
                "radial-gradient(circle at top, var(--ui-accent-glow) 0%, transparent 48%), linear-gradient(180deg, var(--ui-panel) 0%, var(--ui-bg) 100%)",
              boxShadow: "0 24px 90px -40px var(--ui-shadow-color)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--ui-accent)] opacity-80">Прев'ю в режимі бога</div>
            <div className="mt-4 font-serif text-[1.7rem] leading-tight tracking-[-0.04em]">{selectedBeat.speaker}</div>
            <p className="mt-4 text-sm leading-7 opacity-86">{selectedBeat.text}</p>
            {resolvedFrame ? (
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.26em] opacity-60">
                <span>домінанта: {emotionLabels[resolvedFrame.dominantEmotion]}</span>
                <span>інтенсивність: {(resolvedFrame.dominantIntensity * 100).toFixed(0)}%</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-[1.35rem] border border-dashed border-border/60 bg-transparent px-4 py-5 text-sm leading-6 text-foreground/58">
            Прев'ю приховано. Натисни кнопку вище, якщо захочеш його повернути.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-72">Пресети резонансу</div>
            <p className="mt-2 max-w-xs text-sm leading-6 text-foreground opacity-62">
              Почни з кінематографічного наміру, а потім тонко відкалібруй слайдери нижче.
            </p>
          </div>
          <InfoTooltip
            side="left"
            panelClassName="w-[30rem]"
            label="Що роблять пресети резонансу"
            content={
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-78">Логіка пресету</div>
                <p className="text-xs leading-6 text-foreground opacity-84">
                  Це не загальні настрої. Кожен пресет це наративна постава з готовою емоційною сумішшю для рушія.
                </p>
                <p className="text-[11px] leading-6 text-foreground opacity-66">
                  Застосуй пресет, коли вже знаєш намір сцени, а потім підкрути вручну, якщо біту потрібні точніший
                  відтінок тиску, тепла або жаху.
                </p>
              </div>
            }
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {RESONANCE_PRESETS.map((preset) => {
            const dominantEmotions = getPresetDominantEmotions(preset.weights);
            const isActive = activePresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => updateBeatResonance(selectedBeat.id, preset.weights)}
                className={cn(
                  "rounded-[1.25rem] border p-3 text-left transition-all duration-300",
                  isActive
                    ? "border-accent bg-accent/10 shadow-bleed"
                    : "border-border bg-black/10 hover:border-accent/60 hover:bg-black/20",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-accent opacity-84">{preset.label}</div>
                    <p className="mt-2 text-sm leading-6 text-foreground opacity-78">{preset.synopsis}</p>
                  </div>
                  {isActive ? (
                    <span className="rounded-full border border-accent/40 bg-accent/12 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-accent">
                      Застосовано
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-[11px] leading-5 text-foreground opacity-56">{preset.direction}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {dominantEmotions.map((emotionId) => (
                    <span
                      key={emotionId}
                      className="rounded-full border border-border/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground opacity-66"
                    >
                      {emotionLabels[emotionId]}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        {resonanceDefinitions.map((definition) => {
          const value = selectedBeat.resonanceWeights[definition.key];

          return (
            <div
              key={definition.key}
              className="space-y-3"
              data-ghost-target={definition.key === "depression" ? "ghost-slider-depression" : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-accent opacity-68">
                    <span>{definition.label}</span>
                    <InfoTooltip
                      label={`Що змінює "${definition.label}"`}
                      content={<EmotionDualViewTooltip emotionId={definition.key} />}
                      side="left"
                      panelClassName="w-[34rem]"
                      triggerClassName="h-4 w-4 text-[9px]"
                    />
                  </div>
                  <div className="mt-1 text-sm text-foreground opacity-68">{(value * 100).toFixed(0)}%</div>
                </div>
                <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${definition.accent}`} />
              </div>

              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[value]}
                onValueChange={([nextValue]) => {
                  updateBeatResonance(selectedBeat.id, { [definition.key]: nextValue });
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex-1 rounded-[1.5rem] border border-border bg-black/10 p-4">
        <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-accent opacity-72">Дані для плеєра</div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-foreground opacity-74">
          {JSON.stringify(localizedPlayerPayload, null, 2)}
        </pre>
      </div>
    </aside>
  );
}
