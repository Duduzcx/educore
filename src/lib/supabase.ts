import { createClient } from '@supabase/supabase-js';

// Proteção robusta para o Build-Time no Netlify: 
// O Next.js tenta validar rotas de API durante o build. Se as variáveis não existirem,
// usamos placeholders para não quebrar a compilação.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
