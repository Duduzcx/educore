import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Verifica se as credenciais do Supabase estão configuradas no ambiente.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'SUA_URL_DO_PROJETO_SUPABASE')

/**
 * Instância única do cliente Supabase para uso em toda a aplicação.
 */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

/**
 * Função helper para criar novos clientes se necessário (compatibilidade).
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
