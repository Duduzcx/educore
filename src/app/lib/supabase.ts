import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com Fallback de Build.
 * Evita o erro 'supabaseUrl is required' durante o build no Netlify/Vercel
 * quando as variáveis de ambiente não são injetadas no passo de compilação.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Se as chaves estiverem vazias, usamos placeholders seguros para evitar crash no build
const isConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder'
);

export const isSupabaseConfigured = isConfigured;
