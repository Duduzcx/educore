import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

/**
 * Cliente Supabase com proteção para Build-Time.
 * Durante o build do NextJS (Netlify), as variáveis de ambiente podem não estar presentes.
 * Usamos URLs de placeholder para evitar que o build exploda.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);