import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com Fallback de Build.
 * Evita o erro 'supabaseUrl is required' durante o build no Netlify/Vercel
 * quando as variáveis de ambiente não são injetadas no passo de compilação.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
