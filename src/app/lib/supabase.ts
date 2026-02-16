import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com Fallback de Build.
 * Evita o erro 'supabaseUrl is required' durante o build no Netlify/Vercel
 * quando as variáveis de ambiente não são injetadas no passo de compilação.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Se as chaves reais estiverem vazias, o isConfigured será falso para uso em diagnósticos
export const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
