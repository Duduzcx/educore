
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Configuração Industrial do Cliente Supabase.
 * As variáveis devem ser configuradas no painel do Netlify/Vercel.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Verifica se as credenciais do Supabase estão configuradas.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
)

/**
 * Detecta se a chave configurada é a secreta (service_role) em vez da pública (anon).
 */
export const isUsingSecretKeyInBrowser = typeof window !== 'undefined' && supabaseAnonKey.length > 100;

/**
 * Função helper para criar novos clientes com tratamento de erro de inicialização.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    return createSupabaseClient('https://placeholder-project.supabase.co', 'placeholder-key')
  }
  
  try {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (e) {
    console.error("Erro crítico na inicialização do Supabase:", e);
    return createSupabaseClient('https://placeholder-project.supabase.co', 'placeholder-key')
  }
}

export const supabase = createClient()
