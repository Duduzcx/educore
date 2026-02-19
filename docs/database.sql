-- SCRIPT DE ATUALIZAÇÃO INDUSTRIAL COMPROMISSO
-- Rode este script no seu editor SQL do Supabase para sincronizar as colunas.

-- 1. Tabela de Trilhas (Trails)
ALTER TABLE IF EXISTS public.trails ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS public.trails ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all';
ALTER TABLE IF EXISTS public.trails ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE IF EXISTS public.trails ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE IF EXISTS public.trails ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';

-- 2. Tabela de Mensagens de Live (Live Messages)
-- Garante que o status 'is_answered' exista para mentoria.
ALTER TABLE IF EXISTS public.live_messages ADD COLUMN IF NOT EXISTS is_answered BOOLEAN DEFAULT false;

-- 3. Tabela de Perfis (Profiles)
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_financial_aid_eligible BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS class_id TEXT;

-- 4. Notificações de Alertas de Risco (Simulação para Dashboard 360)
-- Este comando atualiza o schema cache do PostgREST.
NOTIFY pgrst, 'reload schema';