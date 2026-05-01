"use client";

import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { AIGeneratorModal } from "@/components/studio/AIGeneratorModal";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Input } from "@/components/ui/input";
import { VERTICAL_SLICE_IDS } from "@/lib/data/injectVerticalSlice";
import { useEditorStore } from "@/lib/stores/useEditorStore";
import type { StoryBeat } from "@/lib/types/story";
import { cn } from "@/lib/utils";

type SortableBeatItemProps = {
  beat: StoryBeat;
  sceneId: string;
  beatIndex: number;
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
  isSelected: boolean;
};

// Extracted into a sub-component so useSortable hook can manage each item's drag state.
function SortableBeatItem({
  beat,
  sceneId,
  beatIndex,
  isFirst,
  isLast,
  canDelete,
  isSelected,
}: SortableBeatItemProps) {
  const selectBeat = useEditorStore((state) => state.selectBeat);
  const deleteBeat = useEditorStore((state) => state.deleteBeat);
  const moveBeatUp = useEditorStore((state) => state.moveBeatUp);
  const moveBeatDown = useEditorStore((state) => state.moveBeatDown);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: beat.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("group relative flex items-center shadow-none", isDragging && "opacity-50 blur-[1px]")}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-6 z-10 flex h-full cursor-grab items-center px-2 opacity-40 transition-all hover:text-accent group-hover:opacity-100 active:cursor-grabbing"
        title="Перетягни, щоб змінити порядок біта"
        aria-label="Перетягни, щоб змінити порядок біта"
      >
        <svg fill="currentColor" width="12" height="20" viewBox="0 0 12 20" aria-hidden="true" opacity="0.6">
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="4" cy="10" r="1.5" />
          <circle cx="4" cy="16" r="1.5" />
          <circle cx="8" cy="4" r="1.5" />
          <circle cx="8" cy="10" r="1.5" />
          <circle cx="8" cy="16" r="1.5" />
        </svg>
      </div>

      <button
        type="button"
        onClick={() => selectBeat(sceneId, beat.id)}
        className={cn(
          "w-full rounded-[1.2rem] border px-3 py-3 text-left transition-all duration-300",
          isSelected
            ? "border-accent bg-black/30 text-foreground shadow-bleed"
            : "border-border bg-transparent text-foreground opacity-72 hover:border-accent hover:opacity-100",
        )}
      >
        <div className="text-[10px] uppercase tracking-[0.28em] text-accent opacity-70">Біт {beatIndex + 1}</div>
        <div className="mt-2 line-clamp-2 pr-16 text-sm leading-6">{beat.text}</div>
      </button>

      {/* Legacy beat controls (up/down/delete) - visible on hover or when selected. */}
      <div
        className={cn(
          "pointer-events-none absolute right-2 top-2 flex items-center gap-1 transition-opacity duration-200",
          isSelected ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
        )}
      >
        {!isFirst ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              moveBeatUp(sceneId, beat.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-panel text-[10px] text-accent opacity-80 transition-all hover:border-accent hover:opacity-100"
            title="Перемістити вгору"
            aria-label="Перемістити біт вгору"
          >
            ^
          </button>
        ) : null}
        {!isLast ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              moveBeatDown(sceneId, beat.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-panel text-[10px] text-accent opacity-80 transition-all hover:border-accent hover:opacity-100"
            title="Перемістити вниз"
            aria-label="Перемістити біт вниз"
          >
            v
          </button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteBeat(sceneId, beat.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-rose-500/30 bg-panel text-[10px] text-rose-400 opacity-80 transition-all hover:border-rose-500 hover:bg-rose-500/10 hover:opacity-100"
            title="Видалити біт"
            aria-label="Видалити біт"
          >
            x
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function BeatList() {
  const story = useEditorStore((state) => state.draftStory);
  const selectedBeatId = useEditorStore((state) => state.selectedBeatId);
  const addScene = useEditorStore((state) => state.addScene);
  const deleteScene = useEditorStore((state) => state.deleteScene);
  const addBeat = useEditorStore((state) => state.addBeat);
  const updateSceneTitle = useEditorStore((state) => state.updateSceneTitle);
  const moveBeatToIndex = useEditorStore((state) => state.moveBeatToIndex);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // allows buttons inside draggable area to be clicked without triggering drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (sceneId: string, event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const scene = useEditorStore.getState().draftStory.scenes.find((s) => s.id === sceneId);
        if (!scene) return;

        const newIndex = scene.beats.findIndex((b) => b.id === over.id);
        if (newIndex !== -1) {
          moveBeatToIndex(sceneId, active.id as string, newIndex);
        }
      }
    },
    [moveBeatToIndex],
  );

  return (
    <aside className="flex h-full min-h-[32rem] flex-col rounded-[2rem] border border-border bg-panel p-4 pl-6 shadow-bleed">
      <div className="mb-4 flex items-center justify-between gap-3 pl-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-accent opacity-80">Хребет історії</div>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="font-serif text-2xl tracking-[-0.03em] text-foreground">Сцени та біти</h2>
            <InfoTooltip
              label="Як працює порядок сцен і бітів"
              content="Сцени визначають великі вузли історії. Біти — це покрокові репліки всередині сцени, і їх можна переставляти, перетягуючи крапкову ручку."
              side="right"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 pl-2">
        <Button className="px-4 text-[11px] uppercase tracking-[0.24em]" onClick={addScene}>
          Додати сцену
        </Button>
        <AIGeneratorModal />
      </div>

      <div className="mb-4 pl-2 text-[11px] uppercase tracking-[0.24em] text-foreground opacity-54">
        Перетягуйте біти за крапкову ручку, щоб змінити їхній порядок.
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto pl-2 pr-2">
        {story.scenes.length === 0 ? (
          <StudioEmptyState
            title="Сцен ще немає"
            description="Почни зі сцени, а потім додай біти або згенеруй їх із rough-чернетки за допомогою ШІ."
            className="min-h-[18rem]"
          >
            <Button className="px-4 text-[11px] uppercase tracking-[0.24em]" onClick={addScene}>
              Додати сцену
            </Button>
          </StudioEmptyState>
        ) : null}

        {story.scenes.map((scene, sceneIndex) => (
          <section
            key={scene.id}
            className="rounded-[1.5rem] border border-border bg-black/10 p-3"
            data-ghost-target={
              scene.id === VERTICAL_SLICE_IDS.scenes.falseMorning
                ? "ghost-scene-false-morning"
                : scene.id === VERTICAL_SLICE_IDS.scenes.nightJob
                  ? "ghost-scene-night-job"
                  : undefined
            }
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="group/scene min-w-0 flex flex-1 flex-col">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-accent opacity-60">
                  <span>Сцена {sceneIndex + 1}</span>
                  {story.scenes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteScene(scene.id)}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-rose-500/30 text-[10px] text-rose-400 opacity-0 transition-opacity hover:border-rose-500 hover:bg-rose-500/10 group-hover/scene:opacity-100"
                      title="Видалити сцену"
                    >
                      x
                    </button>
                  )}
                </div>
                <Input
                  value={scene.title}
                  onChange={(event) => updateSceneTitle(scene.id, event.target.value)}
                  className="-ml-2 h-10 rounded-xl border border-transparent bg-transparent px-2 py-0 text-sm uppercase tracking-[0.2em] text-foreground transition-colors hover:border-border focus:border-accent focus:ring-0"
                />
              </div>
              <Button
                className="px-3 text-[10px] uppercase tracking-[0.24em]"
                onClick={() => addBeat(scene.id)}
                data-ghost-target={
                  scene.id === VERTICAL_SLICE_IDS.scenes.falseMorning ? "ghost-add-beat-false-morning" : undefined
                }
              >
                Додати біт
              </Button>
            </div>

            {/* DND Context wrapping ONLY the beats of the current scene */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(scene.id, event)}
            >
              <SortableContext items={scene.beats.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {scene.beats.length === 0 ? (
                    <StudioEmptyState
                      title="Ця сцена порожня"
                      description="Додай біт вручну або скористайся ШІ-генератором, щоб перетворити чернетку на кінематографічні сюжетні моменти."
                      className="min-h-[12rem] border-border/50 bg-black/5 px-4 py-6"
                    >
                      <Button className="px-4 text-[11px] uppercase tracking-[0.24em]" onClick={() => addBeat(scene.id)}>
                        Додати біт
                      </Button>
                    </StudioEmptyState>
                  ) : null}

                  {scene.beats.map((beat, beatIndex) => {
                    const isSelected = beat.id === selectedBeatId;
                    const isFirst = beatIndex === 0;
                    const isLast = beatIndex === scene.beats.length - 1;
                    const canDelete = scene.beats.length > 1;

                    return (
                      <SortableBeatItem
                        key={beat.id}
                        beat={beat}
                        sceneId={scene.id}
                        beatIndex={beatIndex}
                        isFirst={isFirst}
                        isLast={isLast}
                        canDelete={canDelete}
                        isSelected={isSelected}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        ))}
      </div>
    </aside>
  );
}
