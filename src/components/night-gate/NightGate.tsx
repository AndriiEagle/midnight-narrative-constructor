"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useDarknessStatus } from "@/lib/night/useDarknessStatus";
import { audioEngine } from "@/lib/audio/AudioEngine";

type NightGateProps = {
  children: ReactNode;
  developerOverride?: boolean;
};

export function NightGate({ children, developerOverride = false }: NightGateProps) {
  const { phase, canEnter, localTimeLabel, developerOverride: overrideActive } = useDarknessStatus({
    developerOverride,
  });
  const [hasEntered, setHasEntered] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const copy = useMemo(() => {
    if (phase === "daylight") {
      return {
        eyebrow: "Locked To The Sun",
        title: "The outside world is too bright. Return when it disappears.",
        body: "This story opens only after the day has finished looking at you.",
      };
    }

    if (phase === "dusk") {
      return {
        eyebrow: "Threshold State",
        title: "Almost. Wait for the darkness.",
        body: "The ritual begins only when the light has fully left the glass.",
      };
    }

    return {
      eyebrow: overrideActive ? "Override Accepted" : "Night Gate",
      title: "The night has accepted you. Put on your headphones.",
      body: "Your first touch wakes the room. After that, the story and the ambience move together.",
    };
  }, [overrideActive, phase]);

  if (hasEntered && canEnter) {
    return <>{children}</>;
  }

  return (
    <main className="cinematic-shell flex min-h-dvh items-center justify-center px-6 py-10">
      <motion.section
        initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-border bg-panel px-7 py-10 shadow-bleed sm:px-12 sm:py-14"
        style={{ backdropFilter: "blur(calc(var(--blur-amount) * 1.6))", opacity: 0.94 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_52%)]" />
        <div className="relative flex flex-col items-center gap-7 text-center">
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.32em] text-accent opacity-80">{copy.eyebrow}</div>
            <h1 className="cinematic-copy mx-auto max-w-2xl font-serif text-[clamp(2.3rem,6vw,5.25rem)] leading-[0.94] tracking-[-0.04em]">
              {copy.title}
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-7 text-foreground opacity-72 sm:text-base">{copy.body}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.24em] text-foreground opacity-58">
            <span>local time {localTimeLabel}</span>
            <span>{overrideActive ? "developer override" : phase}</span>
            {audioReady ? <span>audio awake</span> : null}
          </div>

          {canEnter ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsEntering(true);
                  const ready = await audioEngine.init();
                  setAudioReady(ready);
                  setHasEntered(true);
                } finally {
                  setIsEntering(false);
                }
              }}
              disabled={isEntering}
              className="min-h-16 min-w-48 rounded-full border border-accent bg-transparent px-8 py-4 text-sm uppercase tracking-[0.34em] text-accent shadow-bleed transition-all duration-500 hover:bg-accent hover:text-black"
            >
              {isEntering ? "Awakening" : "Enter"}
            </button>
          ) : null}
        </div>
      </motion.section>
    </main>
  );
}
