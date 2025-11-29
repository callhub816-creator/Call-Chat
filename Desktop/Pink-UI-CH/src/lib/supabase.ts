import { createClient } from '@supabase/supabase-js';

// Pick VITE_ vars (Vite project). Fall back to REACT_APP_ if present.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || (process.env.REACT_APP_SUPABASE_URL as string);
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || (process.env.REACT_APP_SUPABASE_ANON_KEY as string);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Do not throw in runtime; log so developer knows to configure env.
  console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

export default supabase;
