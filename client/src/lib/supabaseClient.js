import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('placeholder')
  );
};

export const getSupabaseConfigStatus = () => {
  if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    return {
      configured: false,
      message: 'VITE_SUPABASE_URL is missing or using placeholder in .env'
    };
  }
  if (!supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
    return {
      configured: false,
      message: 'VITE_SUPABASE_ANON_KEY is missing or using placeholder in .env'
    };
  }
  return { configured: true, message: 'Supabase configured' };
};

// Create client using actual URL/key if valid, or a safe dummy client that fails cleanly on queries
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-launchpad.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
