"use client";

import { useRef, useState, type ChangeEvent, type RefObject } from "react";

import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { createDefaultMemoryResonance, type MemoryCaptureSource } from "@/lib/memory-resonance/types";
import { STORY_TEXT_WINDOW_HEIGHT_RANGE, STORY_TEXT_WINDOW_WIDTH_RANGE, normalizeStoryTextWindow } from "@/lib/types/story";
import { STORY_IMAGE_ACCEPT, optimizeStoryImageFile } from "@/lib/studio/imageUpload";
import { useEditorStore } from "@/lib/stores/useEditorStore";

type ImageAssetFieldProps = {
  eyebrow: string;
  title: string;
  description: string;
  value: string;
  emptyState: string;
  uploadLabel: string;
  busy: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onUploadClick: () => void;
  onClear: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  inputRef: RefObject<HTMLInputElement | null>;
};

function ImageAssetField({
  eyebrow,
  title,
  description,
  value,
  emptyState,
  uploadLabel,
  busy,
  error,
  onChange,
  onUploadClick,
  onClear,
  onFileChange,
  inputRef,
}: ImageAssetFieldProps) {
  const hasImage = value.trim().length > 0;

  return (
    <div className="rounded-[1.6rem] border border-border/70 bg-black/15 p-4 shadow-bleed">
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-72">{eyebrow}</div>
        <h3 className="text-lg font-medium tracking-[0.01em] text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-foreground/62">{description}</p>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">URL зображення</label>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://... або data:image/..."
          className="h-12 rounded-[1.4rem]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={onUploadClick}
          disabled={busy}
          className="px-4 text-[11px] uppercase tracking-[0.22em]"
        >
          {busy ? "Обробляю файл..." : uploadLabel}
        </Button>

        {hasImage ? (
          <Button
            type="button"
            onClick={onClear}
            className="border-border/60 bg-transparent px-4 text-[11px] uppercase tracking-[0.22em]"
          >
            Очистити
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={STORY_IMAGE_ACCEPT}
        className="hidden"
        onChange={onFileChange}
      />

      {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}

      <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-border/60 bg-black/25">
        {hasImage ? (
          <img src={value} alt={title} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center px-6 text-center text-sm leading-6 text-foreground/52">
            {emptyState}
          </div>
        )}
      </div>
    </div>
  );
}

type TextWindowControlProps = {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

function TextWindowControl({
  label,
  description,
  value,
  min,
  max,
  onChange,
}: TextWindowControlProps) {
  return (
    <div className="rounded-[1.4rem] border border-border/60 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[18rem]">
          <div className="text-sm font-medium text-foreground">{label}</div>
          <p className="mt-1 text-sm leading-6 text-foreground/56">{description}</p>
        </div>

        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => {
            if (!event.target.value) {
              return;
            }

            const nextValue = Number(event.target.value);
            if (Number.isFinite(nextValue)) {
              onChange(nextValue);
            }
          }}
          className="h-11 w-28 rounded-xl px-3 text-center text-sm tabular-nums"
        />
      </div>

      <div className="mt-4 space-y-3">
        <Slider
          min={min}
          max={max}
          step={10}
          value={[value]}
          onValueChange={(nextValue) => onChange(nextValue[0] ?? value)}
        />
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-foreground/44">
          <span>{min}px</span>
          <span>{max}px</span>
        </div>
      </div>
    </div>
  );
}

export function BeatEditor() {
  const story = useEditorStore((state) => state.draftStory);
  const selectedSceneId = useEditorStore((state) => state.selectedSceneId);
  const selectedBeatId = useEditorStore((state) => state.selectedBeatId);
  const addScene = useEditorStore((state) => state.addScene);
  const addBeat = useEditorStore((state) => state.addBeat);
  const updateStoryTitle = useEditorStore((state) => state.updateStoryTitle);
  const updateBeatText = useEditorStore((state) => state.updateBeatText);
  const updateBeatSpeaker = useEditorStore((state) => state.updateBeatSpeaker);
  const updateBeatMusicCue = useEditorStore((state) => state.updateBeatMusicCue);
  const updateBeatImagePrompt = useEditorStore((state) => state.updateBeatImagePrompt);
  const updateBeatImageUrl = useEditorStore((state) => state.updateBeatImageUrl);
  const updateBeatAudioPrompt = useEditorStore((state) => state.updateBeatAudioPrompt);
  const updateBeatMemoryResonance = useEditorStore((state) => state.updateBeatMemoryResonance);
  const toggleBeatMemoryTargetScene = useEditorStore((state) => state.toggleBeatMemoryTargetScene);
  const addBeatChoice = useEditorStore((state) => state.addBeatChoice);
  const updateBeatChoiceText = useEditorStore((state) => state.updateBeatChoiceText);
  const updateBeatChoiceTarget = useEditorStore((state) => state.updateBeatChoiceTarget);
  const deleteBeatChoice = useEditorStore((state) => state.deleteBeatChoice);
  const updateSceneImageUrl = useEditorStore((state) => state.updateSceneImageUrl);
  const updateSceneTextWindow = useEditorStore((state) => state.updateSceneTextWindow);

  const selectedScene = story.scenes.find((scene) => scene.id === selectedSceneId) ?? story.scenes[0];
  const selectedBeat = selectedScene?.beats.find((beat) => beat.id === selectedBeatId) ?? selectedScene?.beats[0];
  const memoryResonance = selectedBeat?.memoryResonance ?? createDefaultMemoryResonance();
  const selectedSceneIndex = selectedScene ? story.scenes.findIndex((scene) => scene.id === selectedScene.id) : -1;
  const selectedBeatIndex = selectedScene?.beats.findIndex((beat) => beat.id === selectedBeat?.id) ?? -1;
  const futureSceneTargets = story.scenes.filter((_, index) => index > selectedSceneIndex);
  const selectedSceneTextWindow = normalizeStoryTextWindow(selectedScene?.textWindow);

  const sceneImageInputRef = useRef<HTMLInputElement>(null);
  const beatImageInputRef = useRef<HTMLInputElement>(null);
  const [sceneImageError, setSceneImageError] = useState<string | null>(null);
  const [beatImageError, setBeatImageError] = useState<string | null>(null);
  const [sceneImageBusy, setSceneImageBusy] = useState(false);
  const [beatImageBusy, setBeatImageBusy] = useState(false);

  const handleSceneImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !selectedScene) {
      return;
    }

    setSceneImageError(null);
    setSceneImageBusy(true);

    try {
      const nextImageUrl = await optimizeStoryImageFile(file);
      updateSceneImageUrl(selectedScene.id, nextImageUrl);
    } catch (error) {
      setSceneImageError(error instanceof Error ? error.message : "Не вдалося підготувати зображення сцени.");
    } finally {
      setSceneImageBusy(false);
    }
  };

  const handleBeatImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !selectedBeat) {
      return;
    }

    setBeatImageError(null);
    setBeatImageBusy(true);

    try {
      const nextImageUrl = await optimizeStoryImageFile(file);
      updateBeatImageUrl(selectedBeat.id, nextImageUrl);
    } catch (error) {
      setBeatImageError(error instanceof Error ? error.message : "Не вдалося підготувати зображення біта.");
    } finally {
      setBeatImageBusy(false);
    }
  };

  const handleOpenDraftPlayer = () => {
    const draftPlayerWindow = window.open("/studio/play", "_blank", "noopener,noreferrer");
    draftPlayerWindow?.focus();
  };

  if (!selectedScene || !selectedBeat) {
    return (
      <section className="flex h-full min-h-[32rem] flex-col rounded-[2rem] border border-border bg-panel p-5 shadow-bleed">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-accent opacity-80">Полотно</div>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.6rem)] leading-[0.98] tracking-[-0.04em]">Вибраний біт</h2>
        </div>

        <StudioEmptyState
          title={selectedScene ? "У цій сцені немає бітів" : "Сцену не вибрано"}
          description={
            selectedScene
              ? "Додай біт, щоб почати писати діалог, промпти, вибори та динамічне ШІ-продовження."
              : "Спершу створи сцену, і тоді тут можна буде редагувати її біти та логіку розгалуження."
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
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-[32rem] flex-col rounded-[2rem] border border-border bg-panel p-5 shadow-bleed">
      <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5">
        <div className="text-[11px] uppercase tracking-[0.3em] text-accent opacity-80">Полотно</div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Назва історії</label>
            <Input
              value={story.title}
              onChange={(event) => updateStoryTitle(event.target.value)}
              className="h-12 rounded-[1.4rem] text-base tracking-[0.02em]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Мовець</label>
            <Input
              value={selectedBeat.speaker}
              onChange={(event) => updateBeatSpeaker(selectedBeat.id, event.target.value)}
              className="h-12 rounded-[1.4rem]"
            />
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-accent opacity-72">{selectedScene.title}</div>
          <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,3.6rem)] leading-[0.98] tracking-[-0.04em]">
            Вибраний біт
          </h2>
        </div>
        <div className="text-[11px] uppercase tracking-[0.26em] text-foreground opacity-52">
          Сцена {selectedSceneIndex + 1} · Біт {selectedBeatIndex + 1}
        </div>
      </div>

      <div className="grid flex-1 gap-4">
        <Textarea
          value={selectedBeat.text}
          onChange={(event) => updateBeatText(selectedBeat.id, event.target.value)}
          className="min-h-[18rem] flex-1 bg-black/10 font-serif text-[clamp(1.125rem,2vw,1.5rem)] leading-9 tracking-[-0.015em]"
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <ImageAssetField
            eyebrow="Фон сцени"
            title="Зображення сцени"
            description="Це базовий фон для всієї сцени. Якщо в окремого біта є власна картинка, вона тимчасово перекриє сцену лише на ньому."
            value={selectedScene.imageUrl ?? ""}
            emptyState="Фон сцени ще не задано. Плеєр покаже лише атмосферні шари без окремого зображення."
            uploadLabel="Завантажити фон"
            busy={sceneImageBusy}
            error={sceneImageError}
            onChange={(value) => {
              setSceneImageError(null);
              updateSceneImageUrl(selectedScene.id, value);
            }}
            onUploadClick={() => sceneImageInputRef.current?.click()}
            onClear={() => {
              setSceneImageError(null);
              updateSceneImageUrl(selectedScene.id, "");
            }}
            onFileChange={handleSceneImageUpload}
            inputRef={sceneImageInputRef}
          />

          <div className="rounded-[1.6rem] border border-border/70 bg-black/15 p-4 shadow-bleed">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-72">Вікно тексту</div>
              <h3 className="text-lg font-medium tracking-[0.01em] text-foreground">Розмір текстового вікна сцени</h3>
              <p className="text-sm leading-6 text-foreground/62">
                Ці параметри керують шириною і висотою напівпрозорого вікна, в якому плеєр показує текст усіх бітів цієї сцени.
              </p>
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-border/60 bg-black/20 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-accent/82">
              Поточний розмір: {selectedSceneTextWindow.width}px × {selectedSceneTextWindow.minHeight}px
            </div>

            <div className="mt-4 grid gap-4">
              <TextWindowControl
                label="Ширина"
                description="Максимальна ширина текстового вікна в плеєрі."
                value={selectedSceneTextWindow.width}
                min={STORY_TEXT_WINDOW_WIDTH_RANGE.min}
                max={STORY_TEXT_WINDOW_WIDTH_RANGE.max}
                onChange={(value) => updateSceneTextWindow(selectedScene.id, { width: value })}
              />

              <TextWindowControl
                label="Мінімальна висота"
                description="Базова висота вікна навіть для коротких фраз."
                value={selectedSceneTextWindow.minHeight}
                min={STORY_TEXT_WINDOW_HEIGHT_RANGE.min}
                max={STORY_TEXT_WINDOW_HEIGHT_RANGE.max}
                onChange={(value) => updateSceneTextWindow(selectedScene.id, { minHeight: value })}
              />
            </div>
          </div>
        </div>

        <ImageAssetField
          eyebrow="Кадр біта"
          title="Зображення цього біта"
          description="Якщо додати тут картинку, саме вона з’явиться в плеєрі на поточному біті замість фонового зображення сцени."
          value={selectedBeat.imageUrl ?? ""}
          emptyState="Для цього біта окремого кадру ще немає. Якщо нічого не додати, буде використано фон сцени."
          uploadLabel="Завантажити кадр"
          busy={beatImageBusy}
          error={beatImageError}
          onChange={(value) => {
            setBeatImageError(null);
            updateBeatImageUrl(selectedBeat.id, value);
          }}
          onUploadClick={() => beatImageInputRef.current?.click()}
          onClear={() => {
            setBeatImageError(null);
            updateBeatImageUrl(selectedBeat.id, "");
          }}
          onFileChange={handleBeatImageUpload}
          inputRef={beatImageInputRef}
        />

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Музичний тригер</label>
            <Input
              value={selectedBeat.musicCueTrigger}
              onChange={(event) => updateBeatMusicCue(selectedBeat.id, event.target.value)}
              className="h-12 rounded-[1.4rem]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Промпт зображення</label>
            <Input
              value={selectedBeat.imagePrompt}
              onChange={(event) => updateBeatImagePrompt(selectedBeat.id, event.target.value)}
              className="h-12 rounded-[1.4rem]"
            />
          </div>
          <div className="space-y-2" data-ghost-target="ghost-audio-prompt">
            <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Аудіопромпт</label>
            <Input
              value={selectedBeat.audioPrompt}
              onChange={(event) => updateBeatAudioPrompt(selectedBeat.id, event.target.value)}
              className="h-12 rounded-[1.4rem]"
            />
          </div>
        </div>

        <div className="mb-4 mt-8 border-t border-border pt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[12px] uppercase tracking-[0.2em] text-accent opacity-80">Резонанс пам'яті гравця</h3>
              <InfoTooltip
                label="Як працює резонанс пам'яті"
                content="Коли цей біт захоплює вибір або відповідь гравця, рушій тихо перетворює цей сигнал на тривале емоційне зміщення й починає наперед готувати майбутні сцени, які ти вибереш тут."
                side="right"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                updateBeatMemoryResonance(selectedBeat.id, {
                  enabled: !memoryResonance.enabled,
                })
              }
              className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                memoryResonance.enabled
                  ? "border-accent bg-accent/10 text-accent hover:bg-accent/20"
                  : "border-border/70 bg-black/10 text-foreground opacity-68 hover:border-accent/40 hover:text-accent"
              }`}
            >
              {memoryResonance.enabled ? "Пам'ять активна" : "Увімкнути пам'ять"}
            </button>
          </div>

          <p className="mb-4 max-w-3xl text-sm leading-6 text-foreground opacity-62">
            Використовуй це, коли біт має непомітно зібрати щось важливе від гравця, а потім завчасно персоналізувати наступні сцени, поки основна гілка рухається далі.
          </p>

          {memoryResonance.enabled ? (
            <div className="grid gap-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Тригер захоплення</label>
                  <select
                    value={memoryResonance.captureSource}
                    onChange={(event) =>
                      updateBeatMemoryResonance(selectedBeat.id, {
                        captureSource: event.target.value as MemoryCaptureSource,
                      })
                    }
                    className="h-12 w-full cursor-pointer rounded-[1.4rem] border border-border bg-panel px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="input">Вільне введення</option>
                    <option value="choice">Вибір варіанту</option>
                    <option value="both">Обидва варіанти, залежно від того, що станеться тут</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Ключ пам'яті</label>
                  <Input
                    value={memoryResonance.memoryKey}
                    onChange={(event) =>
                      updateBeatMemoryResonance(selectedBeat.id, {
                        memoryKey: event.target.value,
                      })
                    }
                    placeholder="наприклад: прихований сором, голод до схвалення, рефлекс спостереження"
                    className="h-12 rounded-[1.4rem]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Інструкція персоналізації</label>
                <Textarea
                  value={memoryResonance.instructions}
                  onChange={(event) =>
                    updateBeatMemoryResonance(selectedBeat.id, {
                      instructions: event.target.value,
                    })
                  }
                  placeholder="Поясни рушію, що саме витягти з вибору або відповіді гравця і як ця пам'ять має непомітно викривити подальші сцени, формулювання, аудіонапругу й саме відчуття дозволеності в кімнаті."
                  className="min-h-[8rem] bg-black/10 leading-7"
                />
              </div>

              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Цільові майбутні сцени</div>
                <div className="text-sm leading-6 text-foreground opacity-58">
                  Тут можна підготувати лише сцени після поточної. Резонанс пам'яті планує вперед, а не назад.
                </div>
                {futureSceneTargets.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {futureSceneTargets.map((scene) => {
                      const isSelected = memoryResonance.targetSceneIds.includes(scene.id);

                      return (
                        <button
                          key={scene.id}
                          type="button"
                          onClick={() => toggleBeatMemoryTargetScene(selectedBeat.id, scene.id)}
                          className={`rounded-[1.4rem] border px-4 py-4 text-left transition-all duration-300 ${
                            isSelected
                              ? "border-accent bg-accent/10 text-accent shadow-bleed"
                              : "border-border bg-black/10 text-foreground opacity-72 hover:border-accent/40 hover:opacity-100"
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-[0.24em] opacity-68">
                            {isSelected ? "Тіньова черга активна" : "Майбутня сцена"}
                          </div>
                          <div className="mt-2 text-base">{scene.title}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-border/60 bg-transparent px-4 py-5 text-sm leading-6 text-foreground/60">
                    Додай щонайменше ще одну сцену, щоб вирішити, куди саме ця пам'ять має тихо приземлитися.
                  </div>
                )}
              </div>

              <div className="rounded-[1.4rem] border border-border/60 bg-black/20 px-4 py-4 text-sm leading-6 text-foreground/62">
                Гравець не чекатиме на цю генерацію. Якщо вибрана майбутня сцена ще не готова, зіграє авторська версія, а тіньова перехопить керування лише після завершення.
              </div>
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-border/60 bg-transparent px-4 py-5 text-sm leading-6 text-foreground/60">
              Тут вимкнено. Цей біт не записуватиме вибір гравця чи вільне введення в довготривалий резонанс.
            </div>
          )}
        </div>

        <div className="mb-4 mt-8 border-t border-border pt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[12px] uppercase tracking-[0.2em] text-accent opacity-80">Розгалуження сюжету (вибори)</h3>
              <InfoTooltip
                label="Як працює розгалуження"
                content="Кожен вибір може перекинути гравця в іншу сцену. Залиш вибір на 'Завершити історію тут', якщо цей варіант має обірвати поточну гілку замість переходу далі."
                side="right"
              />
            </div>
            <button
              type="button"
              onClick={() => addBeatChoice(selectedBeat.id)}
              className="cursor-pointer rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-accent transition-colors hover:border-accent hover:bg-accent/20"
            >
              + Додати вибір
            </button>
          </div>

          <p className="mb-4 max-w-3xl text-sm leading-6 text-foreground opacity-62">
            Обери сцену, куди гравець перейде після натискання на варіант. Залиш вибір на{" "}
            <span className="text-accent opacity-100">Завершити історію тут</span>, якщо ця гілка має закінчитися на цьому біті.
          </p>

          <div className="flex flex-col gap-3">
            {(selectedBeat.choices ?? []).map((choice) => (
              <div key={choice.id} className="rounded-xl border border-border/50 bg-black/20 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    value={choice.text}
                    onChange={(event) => updateBeatChoiceText(selectedBeat.id, choice.id, event.target.value)}
                    placeholder="Текст вибору..."
                    className="h-10 min-w-[200px] flex-1"
                  />
                  <select
                    value={choice.nextSceneId}
                    onChange={(event) => updateBeatChoiceTarget(selectedBeat.id, choice.id, event.target.value)}
                    className="h-10 w-48 cursor-pointer rounded-lg border border-border bg-panel px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Завершити історію тут</option>
                    {story.scenes.map((scene) => (
                      <option key={scene.id} value={scene.id} className="bg-panel">
                        {scene.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteBeatChoice(selectedBeat.id, choice.id)}
                    className="cursor-pointer rounded-lg border border-red-900/30 text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 flex h-10 w-10 items-center justify-center"
                  >
                    x
                  </button>
                </div>
                {!choice.nextSceneId ? (
                  <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-accent opacity-76">
                    Цільову сцену не вибрано. Цей варіант завершує поточну гілку.
                  </div>
                ) : null}
              </div>
            ))}

            {(selectedBeat.choices ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-transparent p-6 text-center">
                <div className="text-[11px] uppercase tracking-[0.2em] text-foreground opacity-58">
                  Виборів ще немає. Історія продовжиться лінійно.
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground opacity-60">
                  Якщо це стане останнім бітом не фінальної сцени, гравець зможе вільно писати або говорити, щоб продовжити історію за допомогою ШІ.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
