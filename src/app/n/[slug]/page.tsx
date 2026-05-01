import { notFound } from "next/navigation";

import { NightGate } from "@/components/night-gate/NightGate";
import { PlayerRuntime } from "@/components/player/PlayerRuntime";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { persistenceRowsToStory } from "@/lib/supabase/story-persistence";
import { createClient } from "@/lib/supabase/server";

type NovelPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NovelPage({ params }: NovelPageProps) {
  const { slug } = await params;
  if (!hasSupabaseConfig()) {
    return (
      <main className="cinematic-shell flex min-h-dvh items-center justify-center px-6 py-10">
        <section className="w-full max-w-3xl rounded-[2rem] border border-border bg-panel px-7 py-10 text-center shadow-bleed sm:px-12 sm:py-14">
          <div className="text-[11px] uppercase tracking-[0.32em] text-accent opacity-80">Archive Unavailable</div>
          <h1 className="cinematic-copy mx-auto mt-3 max-w-2xl font-serif text-[clamp(2.3rem,6vw,5rem)] leading-[0.94] tracking-[-0.04em]">
            This archive cannot open until Supabase is connected.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground opacity-72 sm:text-base">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to unlock
            persisted novels on public routes.
          </p>
          <div className="mt-6 text-[11px] uppercase tracking-[0.24em] text-foreground opacity-58">requested slug {slug}</div>
        </section>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: novel, error: novelError } = await supabase
    .from("novels")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (novelError) {
    throw new Error(`Failed to load novel archive: ${novelError.message}`);
  }

  if (!novel) {
    notFound();
  }

  const { data: scenes, error: scenesError } = await supabase
    .from("scenes")
    .select("*")
    .eq("novel_id", novel.id)
    .order("order_index", { ascending: true });

  if (scenesError) {
    throw new Error(`Failed to load archived scenes: ${scenesError.message}`);
  }

  const sceneIds = scenes.map((scene) => scene.id);
  const { data: beats, error: beatsError } =
    sceneIds.length === 0
      ? { data: [], error: null }
      : await supabase.from("beats").select("*").in("scene_id", sceneIds).order("order_index", { ascending: true });

  if (beatsError) {
    throw new Error(`Failed to load archived beats: ${beatsError.message}`);
  }

  const story = persistenceRowsToStory({
    novel,
    scenes,
    beats,
  });

  const developerOverride = process.env.NEXT_PUBLIC_NIGHT_GATE_OVERRIDE === "true";

  return (
    <NightGate developerOverride={developerOverride}>
      <PlayerRuntime story={story} />
    </NightGate>
  );
}
