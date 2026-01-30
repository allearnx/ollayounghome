import { createClient } from '@supabase/supabase-js';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`${name} is required`);
  }
  return v.trim();
}

/**
 * Server-side Supabase client for public (anon) reads.
 * - Uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - Safe for read-only operations guarded by RLS policies (e.g. "Anyone can view ...")
 * - Avoids requiring SUPABASE_SERVICE_ROLE_KEY in Preview/SSG builds.
 */
export function getSupabasePublic() {
  const url = requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, anonKey);
}

