-- SCRIPT SQL DE INFRAESTRUTURA EDUCORE
-- Execute este código no SQL Editor do seu Supabase para criar todas as tabelas.

-- 1. LIMPEZA (OPCIONAL - CUIDADO)
-- DROP TABLE IF EXISTS forum_posts CASCADE;
-- DROP TABLE IF EXISTS forums CASCADE;
-- DROP TABLE IF EXISTS learning_contents CASCADE;
-- DROP TABLE IF EXISTS learning_modules CASCADE;
-- DROP TABLE IF EXISTS learning_trails CASCADE;
-- DROP TABLE IF EXISTS lives CASCADE;
-- DROP TABLE IF EXISTS teachers CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 2. TABELA DE ESTUDANTES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni')),
  institution TEXT,
  course TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMPTZ DEFAULT NOW(),
  last_financial_simulation TIMESTAMPTZ,
  interests TEXT
);

-- 3. TABELA DE PROFESSORES
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  subjects TEXT,
  experience TEXT,
  interests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRILHAS DE APRENDIZADO
CREATE TABLE IF NOT EXISTS learning_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  teacher_id UUID REFERENCES auth.users(id),
  teacher_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MÓDULOS (CAPÍTULOS)
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID REFERENCES learning_trails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTEÚDOS (AULAS E QUIZZES)
CREATE TABLE IF NOT EXISTS learning_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('video', 'pdf', 'text', 'quiz')),
  url TEXT,
  description TEXT, -- Para quizzes, armazenar JSON
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LIVES (ESTÚDIO)
CREATE TABLE IF NOT EXISTS lives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  teacher_name TEXT,
  teacher_id UUID REFERENCES auth.users(id),
  youtube_id TEXT,
  youtube_url TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  trail_id UUID REFERENCES learning_trails(id),
  status TEXT DEFAULT 'scheduled'
);

-- 8. FÓRUNS DE DISCUSSÃO
CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. POSTS DO FÓRUM (E CHAT DE LIVE)
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MURAL DE AVISOS
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DESATIVAR RLS PARA DEMONSTRAÇÃO (ACESSO TOTAL)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
