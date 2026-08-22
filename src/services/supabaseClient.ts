/* ==========================================================================
   SUPABASE CLIENT SERVICE & HYBRID ADAPTER
   Provides real-time Supabase database client initialization
   with seamless fallback to local mock adapter if unconfigured.
   ========================================================================== */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// NOTE: Supabase anon/publishable key is safe to include in client-side code.
// Security is enforced server-side via Row Level Security (RLS) policies.
// Env vars are preferred for overrides; hardcoded values are production fallbacks.
const supabaseUrl: string =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://bbrfstmvmyyrsnelnrtr.supabase.co';

const supabaseAnonKey: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_6Z9whHAI7noBIW4axK_Qjg_9TuBfbc7';

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
