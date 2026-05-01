"use client";

import { useEffect, useState } from "react";

import { PlayerRuntime } from "@/components/player/PlayerRuntime";
import { useEditorStore } from "@/lib/stores/useEditorStore";

export default function StudioDraftPlayPage() {
  const story = useEditorStore((state) => state.draftStory);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(useEditorStore.persist.hasHydrated());
    const unsubscribe = useEditorStore.persist.onFinishHydration(() => setIsHydrated(true));

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof document === "undefined") {
      return;
    }

    if (document.fullscreenElement || typeof document.documentElement.requestFullscreen !== "function") {
      return;
    }

    void document.documentElement.requestFullscreen().catch(() => undefined);
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <main className="cinematic-shell flex min-h-dvh items-center justify-center px-6 py-10">
        <section className="w-full max-w-3xl rounded-[2rem] border border-border bg-panel px-7 py-10 text-center shadow-bleed sm:px-12 sm:py-14">
          <div className="text-[11px] uppercase tracking-[0.32em] text-accent opacity-80">Чернетка готується</div>
          <h1 className="cinematic-copy mx-auto mt-3 max-w-2xl font-serif text-[clamp(2.3rem,6vw,5rem)] leading-[0.94] tracking-[-0.04em]">
            Відкриваю поточну версію історії для програвання.
          </h1>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="fixed right-4 top-4 z-50 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (typeof document === "undefined") {
              return;
            }

            void document.documentElement.requestFullscreen?.().catch(() => undefined);
          }}
          className="rounded-full border border-border/70 bg-panel/88 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground shadow-bleed backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
        >
          Повний екран
        </button>
        <a
          href="/studio"
          className="rounded-full border border-border/70 bg-panel/88 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground shadow-bleed backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
        >
          Назад у studio
        </a>
      </div>

      <PlayerRuntime story={story} mode="author" />
    </>
  );
}
