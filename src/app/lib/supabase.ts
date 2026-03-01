
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// URL do projeto (mantida do ambiente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qjdcexrirmortchemeli.supabase.co'

// Chave fornecida pelo usuário para teste (limpa de duplicidade)
const TEST_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZGNleHJpcm9ydGNoZW1lemlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODg0MzksImV4cCI6MjA4NTk2NDQzOX0.bOnOPy-AkPokgOON6f3KJb7TD2u6HceZ5UL86Xk0Vi0'

const supabaseAnonKey = TEST_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Verifica se as credenciais do Supabase estão configuradas.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'SUA_URL_DO_PROJETO_SUPABASE'
)

/**
 * Instância única do cliente Supabase.
 */
export const supabase = createClient()

/**
 * Função helper para criar novos clientes.
 */
export function createClient() {
  return createSupabaseClient(
    isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
    isSupabaseConfigured ? supabaseAnonKey : 'placeholder'
  )
}
