"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { User } from "@supabase/supabase-js";

import { saveStoryToCloud } from "@/lib/actions/story";
import { isDeveloperBypassEnabled } from "@/lib/dev-access";
import { useEditorStore } from "@/lib/stores/useEditorStore";

import { AuthOverlay } from "./AuthOverlay";
import { createClient } from "@/lib/supabase/client";

export function PublishStoryButton() {
  const draftStory = useEditorStore((state) => state.draftStory);
  const [result, setResult] = useState<{ slug: string; novelId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showAuth, setShowAuth] = useState(false);

  const handlePublish = async (user?: User) => {
    startTransition(async () => {
      setError(null);
      // Ensure user ID is injected into the draft story if it doesn't already have one
      if (user) {
        // We set the user session context explicitly on the server via JWT natively,
        // but for safety we could also attach it. The RLS will check auth.uid().
      }

      const published = await saveStoryToCloud(draftStory);

      if (!published.ok) {
        setResult(null);
        setError(published.error);
        return;
      }

      setResult(published);
    });
  };

  const attemptPublish = async () => {
    if (isDeveloperBypassEnabled()) {
      // Dev unlock keeps the Studio frictionless while local authoring and archive testing are in flux.
      handlePublish();
      return;
    }

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session?.user) {
      setShowAuth(true); // Trigger login
    } else {
      handlePublish(data.session.user);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      {showAuth && (
        <AuthOverlay
          onClose={() => setShowAuth(false)}
          onAuthenticated={(user) => {
            setShowAuth(false);
            handlePublish(user);
          }}
        />
      )}

      <button
        type="button"
        onClick={attemptPublish}
        className="sticky top-4 min-h-14 rounded-full border border-accent bg-transparent px-7 py-3 text-sm uppercase tracking-[0.32em] text-accent shadow-bleed transition-all duration-500 hover:bg-accent hover:text-black disabled:pointer-events-none disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "Карбую в темний архів..." : "Опублікувати в архіві"}
      </button>

      {result ? (
        <Link
          href={`/n/${result.slug}`}
          className="text-[11px] uppercase tracking-[0.24em] text-accent opacity-80 transition-opacity duration-300 hover:opacity-100"
        >
          Відкрити /n/{result.slug}
        </Link>
      ) : null}

      {error ? <div className="max-w-sm text-right text-sm text-rose-300">{error}</div> : null}
    </div>
  );
}
