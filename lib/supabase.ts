import { createClient } from '@supabase/supabase-js';
export * from './domain';

const normalize = (v: string | undefined) => (v ?? '').trim();
const supabaseUrl = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Client-side supabase client (anon key). Do NOT hardcode keys in repo.
// If these are missing in production, we want it to fail fast.
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});