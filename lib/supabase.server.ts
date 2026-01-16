import { createClient } from '@supabase/supabase-js';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`${name} is required`);
  }
  return v.trim();
}

/**
 * Server-side Supabase client (service role).
 * - Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
 * - Never import this from client components.
 */
export function getSupabaseAdmin() {
  const url = requiredEnv('SUPABASE_URL');
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey);
}

