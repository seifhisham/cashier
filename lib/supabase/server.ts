import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

export function getServerSupabase(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}
