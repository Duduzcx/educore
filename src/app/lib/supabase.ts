
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com Fallback de Build.
 * Evita erros de URL inválida durante o build no Netlify.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Garantia de que a URL comece com http para o criador do cliente
const validUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

export const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(validUrl, supabaseAnonKey);
