import { createClient } from '@supabase/supabase-js';

// Proteção para o Build-Time no Netlify: 
// Se as variáveis estiverem vazias durante a compilação, o NextJS não quebra.
// As chamadas reais só funcionarão no navegador/runtime com as variáveis configuradas no Netlify.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
