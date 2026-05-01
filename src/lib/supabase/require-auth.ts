import { NextResponse } from "next/server";

import { isDeveloperBypassEnabled } from "@/lib/dev-access";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function requireAuthenticatedUser() {
  // Temporary local-dev bypass so AI routes can run without a Supabase session.
  if (isDeveloperBypassEnabled()) {
    return {
      bypass: true as const,
    };
  }

  if (!hasSupabaseConfig()) {
    return {
      response: NextResponse.json({ error: "Supabase не налаштовано" }, { status: 503 }),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      response: NextResponse.json({ error: "Потрібна автентифікація" }, { status: 401 }),
    };
  }

  return {
    supabase,
    user,
  };
}
