"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "zustand";

import { BeatEditor } from "@/components/studio/BeatEditor";
import { BeatList } from "@/components/studio/BeatList";
import { GhostOverlay } from "@/components/studio/GhostOverlay";
import { PublishStoryButton } from "@/components/studio/PublishStoryButton";
import { ResonancePanel } from "@/components/studio/ResonancePanel";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/stores/useEditorStore";

export function StudioLayout() {
  const story = useEditorStore((state) => state.draftStory);

  const pastStates = useStore(useEditorStore.temporal, (state) => state.pastStates);
  const futureStates = useStore(useEditorStore.temporal, (state) => state.futureStates);
  const { undo, redo } = useEditorStore.temporal.getState();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(useEditorStore.persist.hasHydrated());
    const unsubscribe = useEditorStore.persist.onFinishHydration(() => setIsHydrated(true));

    return () => {
      unsubscribe();
    };
  }, []);

  function handleOpenDraftPlayer() {
    const draftPlayerWindow = window.open("/studio/play", "_blank", "noopener,noreferrer");
    draftPlayerWindow?.focus();
  }

  if (!isHydrated) {
    return (
      <main className="cinematic-shell min-h-dvh px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 h-32 animate-pulse rounded-[2rem] border border-border bg-panel/40 shadow-bleed" />
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <div className="h-[75vh] w-full animate-pulse rounded-[2rem] border border-border bg-panel/40" />
          <div className="h-[75vh] w-full animate-pulse rounded-[2rem] border border-border bg-panel/40" />
          <div className="h-[75vh] w-full animate-pulse rounded-[2rem] border border-border bg-panel/40" />
        </div>
      </main>
    );
  }

  return (
    <main className="cinematic-shell min-h-dvh px-4 py-4 sm:px-6 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="mb-4 flex flex-col gap-3 rounded-[2rem] border border-border bg-panel px-5 py-5 shadow-bleed lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-accent opacity-78">Стіл архітектора</div>
          <h1 className="mt-3 font-serif text-[clamp(2.3rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.04em] text-foreground">
            Пульт психологічного керування
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.26em] text-foreground opacity-58">
            <span>{story.scenes.length} сцен</span>
            <span>{story.scenes.reduce((sum, scene) => sum + scene.beats.length, 0)} бітів</span>
          </div>

          <div className="ml-2 flex items-center gap-2 border-l border-border/50 pl-4">
            <Button
              onClick={() => undo()}
              disabled={pastStates.length === 0}
              className="h-9 border-border bg-transparent px-3 text-[10px] uppercase tracking-[0.15em] text-foreground hover:border-accent disabled:pointer-events-none disabled:opacity-30"
              title="Скасувати (Ctrl+Z)"
            >
              Скасувати
            </Button>
            <Button
              onClick={() => redo()}
              disabled={futureStates.length === 0}
              className="h-9 border-border bg-transparent px-3 text-[10px] uppercase tracking-[0.15em] text-foreground hover:border-accent disabled:pointer-events-none disabled:opacity-30"
              title="Повторити (Ctrl+Shift+Z)"
            >
              Повторити
            </Button>
          </div>

          <Button
            onClick={handleOpenDraftPlayer}
            className="h-12 px-5 text-[10px] uppercase tracking-[0.22em]"
            title="Відкрити поточну чернетку в новій вкладці"
          >
            Зіграти чернетку
          </Button>

          <PublishStoryButton />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]"
      >
        <BeatList />
        <BeatEditor />
        <ResonancePanel />
      </motion.div>

      <GhostOverlay />
    </main>
  );
}
