/* ==========================================================================
   SUPABASE CLIENT SERVICE & HYBRID ADAPTER
   Provides real-time Supabase database client initialization
   with seamless fallback to local mock adapter if unconfigured.
   ========================================================================== */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vite embeds VITE_* env vars at build time using static analysis.
// Must use import.meta.env.VITE_* directly (no TypeScript casting) for Vite to pick them up.
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseUrl.includes('your-project-ref') &&
    supabaseUrl.startsWith('https://')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
