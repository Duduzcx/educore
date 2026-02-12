
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Durante o build do Next.js (Netlify/Vercel), as variáveis de ambiente podem estar ausentes.
// Criamos uma verificação para não quebrar o processo de compilação.
const isBuildTime = !supabaseUrl || !supabaseKey;

if (!isBuildTime) {
  console.log('Supabase configurado com sucesso.');
} else if (process.env.NODE_ENV === 'production') {
  console.warn('Atenção: Variáveis do Supabase ausentes no ambiente de produção.');
}

// Para evitar múltiplas instâncias no ambiente de desenvolvimento com HMR,
// armazenamos o cliente em uma variável global.
const globalForSupabase = global as unknown as { supabase: ReturnType<typeof createClient> };

// Se as URLs estiverem vazias, criamos um cliente placeholder apenas para o build não falhar.
// Em runtime, isso será substituído pelos valores reais.
export const supabase = globalForSupabase.supabase ?? createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}
