import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase Blindado para Build e Produção.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Durante o build do Next.js, as variáveis podem estar vazias. 
// Usamos fallbacks válidos sintaticamente para não quebrar a compilação.
const finalUrl = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder-project.supabase.co';

const finalKey = supabaseAnonKey || 'placeholder-key';

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('http')
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn("⚠️ SUPABASE EM MODO DEMO: Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
