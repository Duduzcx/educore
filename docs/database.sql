-- SCRIPT SQL PARA O SUPABASE (RODAR NO SQL EDITOR)

-- 1. TABELA DE PERFIS DE ALUNOS
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 2. TABELA DE PROFESSORES
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  subjects TEXT,
  experience TEXT,
  interests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE LIVES (ATUALIZADA)
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES auth.users(id),
  teacher_name TEXT,
  youtube_id TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRILHAS DE ESTUDO
CREATE TABLE IF NOT EXISTS public.learning_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft',
  image_url TEXT,
  teacher_id UUID REFERENCES auth.users(id),
  teacher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MÓDULOS DAS TRILHAS
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTEÚDO DAS AULAS (VÍDEOS, PDFS, QUIZZES)
CREATE TABLE IF NOT EXISTS public.learning_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('video', 'pdf', 'text', 'quiz')),
  url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHAT E FÓRUNS
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS (ACESSO TOTAL PARA DEMO)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total profiles" ON public.profiles FOR ALL USING (true);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total teachers" ON public.teachers FOR ALL USING (true);

ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total lives" ON public.lives FOR ALL USING (true);

ALTER TABLE public.learning_trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total trails" ON public.learning_trails FOR ALL USING (true);

ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total modules" ON public.learning_modules FOR ALL USING (true);

ALTER TABLE public.learning_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total contents" ON public.learning_contents FOR ALL USING (true);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total posts" ON public.forum_posts FOR ALL USING (true);
