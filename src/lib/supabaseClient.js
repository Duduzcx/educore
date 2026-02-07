
import { createClient } from '@supabase/supabase-js'

// Leitura das variáveis de ambiente do Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cria e exporta o cliente Supabase para ser usado em todo o aplicativo
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
