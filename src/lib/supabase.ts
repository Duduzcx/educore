
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase!');
}

// Para evitar múltiplas instâncias no ambiente de desenvolvimento com HMR (Hot Module Replacement),
// armazenamos o cliente em uma variável global.
// Isso garante que a mesma instância seja reutilizada em recarregamentos.
const globalForSupabase = global as unknown as { supabase: ReturnType<typeof createClient> };

export const supabase = globalForSupabase.supabase ?? createClient(supabaseUrl, supabaseKey);

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}
