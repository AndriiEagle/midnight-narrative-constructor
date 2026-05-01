"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

import { isDeveloperBypassEnabled } from "@/lib/dev-access";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { storyToPersistenceRows } from "@/lib/supabase/story-persistence";
import type { Database } from "@/lib/supabase/types";
import type { Story } from "@/lib/types/story";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function resolveUniqueSlug(
  supabase: SupabaseClient<Database>,
  title: string,
  novelId: string,
) {
  const baseSlug = slugify(title) || "midnight-narrative";
  let candidate = baseSlug;
  let suffix = 1;

  for (;;) {
    const { data, error } = await supabase
      .from("novels")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to resolve novel slug: ${error.message}`);
    }

    if (!data || data.id === novelId) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

export type SaveStoryToCloudResult =
  | {
      ok: true;
      novelId: string;
      slug: string;
    }
  | {
      ok: false;
      error: string;
    };

function createDeveloperPublishClient(): SupabaseClient<Database> | null {
  if (!isDeveloperBypassEnabled()) {
    return null;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return null;
  }

  const { supabaseUrl } = getSupabaseConfig();

  // Dev-only publish bypass. This intentionally uses the service role on the server
  // so local authoring can publish without an interactive login flow.
  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function saveStoryToCloud(draftStory: Story): Promise<SaveStoryToCloudResult> {
  try {
    const developerBypassClient = createDeveloperPublishClient();
    const supabase = developerBypassClient ?? (await createClient());

    if (!developerBypassClient) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Не вдалося перевірити автентифікованого автора: ${authError.message}`);
      }

      if (!user) {
        return {
          ok: false,
          error: isDeveloperBypassEnabled()
            ? "Режим обхідного доступу увімкнено, але для публікації все одно потрібен `SUPABASE_SERVICE_ROLE_KEY` або активна сесія."
            : "Для публікації потрібна автентифікація.",
        };
      }
    }

    const { data: existingNovel, error: existingNovelError } = await supabase
      .from("novels")
      .select("slug")
      .eq("id", draftStory.id)
      .maybeSingle();

    if (existingNovelError) {
      throw new Error(`Не вдалося перевірити поточний стан новели: ${existingNovelError.message}`);
    }

    const slug = await resolveUniqueSlug(supabase, draftStory.title, draftStory.id);
    const { novel, scenes, beats } = storyToPersistenceRows(draftStory, slug);
    const { error: saveError } = await supabase.rpc("save_story_archive", {
      p_novel: novel,
      p_scenes: scenes,
      p_beats: beats,
    });

    if (saveError) {
      throw new Error(`Не вдалося атомарно зберегти архів історії: ${saveError.message}`);
    }

    revalidatePath("/studio");
    revalidatePath(`/n/${slug}`);

    if (existingNovel?.slug && existingNovel.slug !== slug) {
      revalidatePath(`/n/${existingNovel.slug}`);
    }

    return {
      ok: true,
      novelId: draftStory.id,
      slug,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не вдалося опублікувати архів історії.",
    };
  }
}
