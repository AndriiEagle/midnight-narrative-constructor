"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  STORY_TEXT_WINDOW_FONT_SIZE_RANGE,
  type StoryTextWindow,
  type StoryTextWindowFontFamily,
} from "@/lib/types/story";
import { cn } from "@/lib/utils";

type AuthorTarget = "scene" | "beat";

type PlayerAuthorPanelProps = {
  isOpen: boolean;
  target: AuthorTarget;
  activeTextWindow: StoryTextWindow;
  currentSceneTitle: string;
  currentBeatIndex: number;
  activeImageSourceLabel: string | null;
  beatHasOverride: boolean;
  onToggle: () => void;
  onTargetChange: (target: AuthorTarget) => void;
  onFontFamilyChange: (fontFamily: StoryTextWindowFontFamily) => void;
  onFontSizeChange: (fontSize: number) => void;
  onReset: () => void;
};

const fontOptions: Array<{
  id: StoryTextWindowFontFamily;
  label: string;
  preview: string;
  className: string;
}> = [
  {
    id: "serif",
    label: "Романний",
    preview: "Абетка",
    className: "font-serif",
  },
  {
    id: "sans",
    label: "Чіткий",
    preview: "Абетка",
    className: "font-sans",
  },
  {
    id: "mono",
    label: "Техно",
    preview: "АБВ123",
    className: "font-mono",
  },
];

export function PlayerAuthorPanel({
  isOpen,
  target,
  activeTextWindow,
  currentSceneTitle,
  currentBeatIndex,
  activeImageSourceLabel,
  beatHasOverride,
  onToggle,
  onTargetChange,
  onFontFamilyChange,
  onFontSizeChange,
  onReset,
}: PlayerAuthorPanelProps) {
  const isBeatResetDisabled = target === "beat" && !beatHasOverride;

  return (
    <div className="pointer-events-none fixed left-4 top-4 z-[70] flex flex-col items-start gap-3 sm:left-6 sm:top-6">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border shadow-bleed backdrop-blur-md transition-all duration-300",
          isOpen
            ? "border-accent bg-panel text-accent"
            : "border-border/70 bg-panel/88 text-foreground hover:border-accent hover:text-accent",
        )}
        aria-pressed={isOpen}
        aria-label={isOpen ? "Сховати авторський режим" : "Показати авторський режим"}
      >
        <span className="text-sm font-medium tracking-[0.18em]">Aa</span>
      </button>

      {isOpen ? (
        <aside className="pointer-events-auto w-[min(22rem,calc(100vw-2rem))] rounded-[1.8rem] border border-border/70 bg-panel/92 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-78">Авторський режим</div>
              <div className="mt-2 text-sm leading-6 text-foreground/64">
                {currentSceneTitle} · Біт {currentBeatIndex + 1}
              </div>
            </div>
            {activeImageSourceLabel ? (
              <div className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-accent">
                {activeImageSourceLabel}
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onTargetChange("scene")}
              className={cn(
                "rounded-[1rem] border px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors",
                target === "scene"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border/60 bg-black/10 text-foreground/66 hover:border-accent/40 hover:text-accent",
              )}
            >
              Вся сцена
            </button>
            <button
              type="button"
              onClick={() => onTargetChange("beat")}
              className={cn(
                "rounded-[1rem] border px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors",
                target === "beat"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border/60 bg-black/10 text-foreground/66 hover:border-accent/40 hover:text-accent",
              )}
            >
              Лише цей біт
            </button>
          </div>

          <div className="mt-4 text-[11px] leading-6 text-foreground/58">
            Тягни верхню смугу текстового вікна, а праву, нижню або кутову ручку використовуй для розміру.
          </div>

          <div className="mt-4 space-y-3 rounded-[1.25rem] border border-border/60 bg-black/16 p-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-accent opacity-74">Шрифт</div>
            <div className="grid grid-cols-3 gap-2">
              {fontOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onFontFamilyChange(option.id)}
                  className={cn(
                    "rounded-[1rem] border px-2 py-3 text-center transition-colors",
                    activeTextWindow.fontFamily === option.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border/60 bg-black/10 text-foreground/66 hover:border-accent/40 hover:text-accent",
                  )}
                >
                  <div className={cn("text-lg leading-none", option.className)}>{option.preview}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.16em]">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-border/60 bg-black/16 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[10px] uppercase tracking-[0.24em] text-accent opacity-74">Розмір шрифту</div>
              <div className="text-sm tabular-nums text-foreground">{activeTextWindow.fontSize}px</div>
            </div>
            <div className="mt-3">
              <Slider
                min={STORY_TEXT_WINDOW_FONT_SIZE_RANGE.min}
                max={STORY_TEXT_WINDOW_FONT_SIZE_RANGE.max}
                step={1}
                value={[activeTextWindow.fontSize]}
                onValueChange={(value) => onFontSizeChange(value[0] ?? activeTextWindow.fontSize)}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-foreground/66">
            <div className="rounded-[1.1rem] border border-border/60 bg-black/12 px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-accent opacity-72">Вікно</div>
              <div className="mt-2 tabular-nums">
                {activeTextWindow.width}px × {activeTextWindow.minHeight}px
              </div>
            </div>
            <div className="rounded-[1.1rem] border border-border/60 bg-black/12 px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-accent opacity-72">Позиція</div>
              <div className="mt-2 tabular-nums">
                {activeTextWindow.anchorX.toFixed(0)}% / {activeTextWindow.anchorY.toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={onReset}
              disabled={isBeatResetDisabled}
              className="border-border/60 bg-transparent px-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-accent hover:text-accent"
            >
              {target === "beat"
                ? beatHasOverride
                  ? "Прибрати override біта"
                  : "Біт наслідує сцену"
                : "Скинути макет"}
            </Button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
