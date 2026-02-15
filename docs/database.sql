-- SCRIPT DE CONFIGURAÇÃO COMPROMISSO | SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Tabela de Perfis (Alunos e Professores)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile_type TEXT DEFAULT 'etec', -- 'etec', 'uni', 'teacher'
  institution TEXT,
  course TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Transmissões ao Vivo
CREATE TABLE IF NOT EXISTS lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id),
  teacher_name TEXT,
  youtube_id TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'finished'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Progresso de Vídeo (Regra de 80%)
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  watched_seconds FLOAT DEFAULT 0,
  total_seconds FLOAT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_ping TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- 4. Tabela de Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT,
  title TEXT,
  questions JSONB, -- Armazena o array de questões gerado pela IA
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Segurança)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Perfis visíveis por todos os autenticados" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem editar seu próprio perfil" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Lives visíveis por todos" ON lives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Progresso individual" ON video_progress FOR ALL TO authenticated USING (auth.uid() = user_id);
