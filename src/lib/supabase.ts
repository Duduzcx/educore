import { createClient } from '@supabase/supabase-js';

// Proteção para o Build-Time: Durante a compilação no Netlify, as variáveis podem estar ausentes.
// Usamos URLs de placeholder para que o objeto 'supabase' seja instanciado sem erros,
// mas as chamadas reais só ocorrerão em tempo de execução com as variáveis reais.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
