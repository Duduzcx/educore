
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Configuração Industrial do Cliente Supabase.
 * Detecta automaticamente se as chaves são válidas ou se há risco de segurança.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Verifica se as credenciais do Supabase estão minimamente configuradas.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
)

/**
 * Alerta de Segurança: Detecta se a chave configurada é a secreta (service_role).
 * Chaves service_role costumam ser muito longas e nunca devem estar no NEXT_PUBLIC.
 */
export const isUsingSecretKeyInBrowser = typeof window !== 'undefined' && supabaseAnonKey.length > 150;

if (isUsingSecretKeyInBrowser) {
  console.warn("⚠️ [SEGURANÇA] Chave 'service_role' detectada no navegador. O Supabase bloqueará o login real. O modo de simulação será ativado automaticamente para os botões de demo.");
}

/**
 * Função helper para criar novos clientes com tratamento de erro.
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
    return createSupabaseClient('https://placeholder-project.supabase.co', 'placeholder-key')
  }
}

export const supabase = createClient()
