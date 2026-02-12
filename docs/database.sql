-- SCRIPT SQL COMPLETO PARA O EDUCORE (SUPABASE)
-- Execute no SQL Editor do seu projeto Supabase

-- 1. Limpeza (Opcional - Use com cuidado)
-- DROP TABLE IF EXISTS quiz_submissions CASCADE;
-- DROP TABLE IF EXISTS forum_posts CASCADE;
-- DROP TABLE IF EXISTS forums CASCADE;
-- DROP TABLE IF EXISTS lives CASCADE;
-- DROP TABLE IF EXISTS notices CASCADE;
-- DROP TABLE IF EXISTS library_items CASCADE;
-- DROP TABLE IF EXISTS learning_contents CASCADE;
-- DROP TABLE IF EXISTS learning_modules CASCADE;
-- DROP TABLE IF EXISTS learning_trails CASCADE;
-- DROP TABLE IF EXISTS teachers CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Tabela: Estudantes
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  profile_type TEXT DEFAULT 'etec', -- 'etec' ou 'uni'
  institution TEXT,
  course TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMPTZ DEFAULT NOW(),
  last_financial_simulation TIMESTAMPTZ,
  interests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela: Professores
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subjects TEXT,
  experience TEXT,
  interests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela: Trilhas de Estudo
CREATE TABLE IF NOT EXISTS learning_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft', -- 'draft' ou 'active'
  image_url TEXT,
  teacher_id UUID REFERENCES teachers(id),
  teacher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela: Módulos (Capítulos)
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID REFERENCES learning_trails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela: Conteúdo das Aulas (Vídeo, PDF, Texto, Quiz)
CREATE TABLE IF NOT EXISTS learning_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'video', 'pdf', 'text', 'quiz'
  url TEXT,
  description TEXT, -- Para 'text' ou o JSON do 'quiz'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela: Transmissões ao Vivo
CREATE TABLE IF NOT EXISTS lives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  teacher_id UUID REFERENCES teachers(id),
  teacher_name TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela: Mural de Avisos
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT DEFAULT 'low',
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela: Fórum de Discussão
CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabela: Mensagens do Fórum / Chat Live
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabela: Biblioteca Digital
CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT, -- 'PDF', 'Video', 'E-book'
  url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabela: Chat Direto
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL, -- Pode ser UUID ou 'aurora-ai'
  receiver_id TEXT NOT NULL,
  message TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DESATIVAR RLS PARA DEMO (FACILITAR APRESENTAÇÃO)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE library_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
