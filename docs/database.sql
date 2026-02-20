
-- SCRIPT DE SINCRONIZAÇÃO DO BANCO DE DADOS COMPROMISSO
-- Rode este script no SQL Editor do Supabase para evitar erros de coluna inexistente.

-- 1. Atualiza a tabela de trilhas (Trails)
ALTER TABLE trails ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE trails ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE trails ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE trails ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all';
ALTER TABLE trails ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';

-- 2. Atualiza a tabela de perfis (Profiles)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_access TIMESTAMPTZ DEFAULT now();

-- 3. Cria suporte para progresso do usuário (User Progress)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_id UUID,
  percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, trail_id)
);
