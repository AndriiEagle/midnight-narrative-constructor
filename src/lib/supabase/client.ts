import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
