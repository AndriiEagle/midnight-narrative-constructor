"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Textarea } from "@/components/ui/textarea";
import { PromptMaster } from "@/lib/ai/PromptMaster";
import { useEditorStore } from "@/lib/stores/useEditorStore";

export function AIGeneratorModal() {
  const scenes = useEditorStore((state) => state.draftStory.scenes);
  const selectedSceneId = useEditorStore((state) => state.selectedSceneId);
  const injectGeneratedBeats = useEditorStore((state) => state.injectGeneratedBeats);

  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0],
    [scenes, selectedSceneId],
  );

  return (
    <>
      <Button className="px-4 text-[11px] uppercase tracking-[0.24em]" onClick={() => setOpen(true)}>
        Продиктувати ШІ
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 py-8 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-3xl rounded-[2rem] border border-border bg-panel p-6 shadow-bleed"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.32em] text-accent opacity-80">Конвеєр PromptMaster</div>
                  <div className="mt-2 flex items-center gap-3">
                    <h3 className="font-serif text-[clamp(2rem,4vw,3.6rem)] leading-[0.94] tracking-[-0.04em]">
                      Згенерувати біти з будь-якої чернетки
                    </h3>
                    <InfoTooltip
                      label="Що сюди можна вставити"
                      side="right"
                      content="Встав грубі нотатки, план сцени, транскрипт або повну чернетку. Генератор розіб'є це на біти й наперед заповнить настрій, візуальні та аудіопромпти."
                    />
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground opacity-72">
                    Встав будь-який текст, чернеткову сцену чи транскрипт, і PromptMaster розіб'є його на кінематографічні
                    біти, призначить емоційні ваги та згенерує промпти зображення й звуку для вибраної сцени:{" "}
                    {selectedScene?.title ?? "Невідома сцена"}.
                  </p>
                </div>

                <Button className="px-4 text-[10px] uppercase tracking-[0.26em]" onClick={() => setOpen(false)} disabled={isLoading}>
                  Закрити
                </Button>
              </div>

              <div className="space-y-4">
                <Textarea
                  value={transcript}
                  onChange={(event) => {
                    setTranscript(event.target.value);
                    setError(null);
                  }}
                  placeholder="Встав будь-який текст, чернетку, транскрипт або план сцени. ШІ розіб'є це на кінематографічні біти, призначить емоції та підготує переходи."
                  className="min-h-[18rem] bg-black/10 text-base leading-8"
                />

                <div className="text-sm leading-6 text-foreground opacity-60">
                  Порада: сирий і неохайний ввід підходить. Одного абзацу достатньо, щоб згенерувати придатний каркас сцени.
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-foreground opacity-56">
                    {isLoading ? "Аналізую психологічний резонанс..." : "Відповідь моделі ШІ триває приблизно 5-15 секунд"}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="px-5 text-[11px] uppercase tracking-[0.24em]"
                      onClick={async () => {
                        const normalizedTranscript = transcript.trim();

                        if (!normalizedTranscript) {
                          setError("Встав текст або транскрипт перед запуском PromptMaster.");
                          return;
                        }

                        if (!selectedScene) {
                          setError("Вибери сцену перед генерацією бітів.");
                          return;
                        }

                        try {
                          setIsLoading(true);
                          setError(null);

                          const generatedBeats = await PromptMaster.generateBeatsFromTranscript(normalizedTranscript);

                          if (generatedBeats.length === 0) {
                            setError("PromptMaster не знайшов у цьому транскрипті жодного кінематографічного біта.");
                            return;
                          }

                          injectGeneratedBeats(selectedScene.id, generatedBeats);
                          setTranscript("");
                          setOpen(false);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "PromptMaster не зміг згенерувати відповідь.");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Аналізую..." : "Згенерувати біти"}
                    </Button>
                  </div>
                </div>

                {error ? <div className="text-sm leading-6 text-rose-300">{error}</div> : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
