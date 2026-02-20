
-- SCRIPT DE SINCRONIZAÇÃO INDUSTRIAL - COMPROMISSO | EDUCORI
-- Execute este script no SQL Editor do seu painel Supabase para ativar as funcionalidades avançadas.

-- 1. Atualiza a tabela de trilhas com as colunas administrativas e visuais
ALTER TABLE trails ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE trails ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE trails ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE trails ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all';
ALTER TABLE trails ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';
ALTER TABLE trails ADD COLUMN IF NOT EXISTS modules_count INTEGER DEFAULT 0;
ALTER TABLE trails ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true;

-- 2. Garante que a tabela de perfis (profiles) suporte todos os tipos de usuários
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_type TEXT; -- 'etec', 'uni', 'teacher', 'admin'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_access TIMESTAMPTZ DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_financial_aid_eligible BOOLEAN DEFAULT false;

-- 3. Estrutura de progresso real do aluno
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_id UUID,
  percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, trail_id)
);

-- 4. Habilita RLS (Row Level Security) básico para demonstração
ALTER TABLE trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso público para leitura de trilhas" ON trails FOR SELECT USING (true);
CREATE POLICY "Professores podem inserir trilhas" ON trails FOR INSERT WITH CHECK (true);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem seu próprio progresso" ON user_progress FOR ALL USING (auth.uid() = user_id);
