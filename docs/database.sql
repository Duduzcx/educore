-- SCRIPT SQL DEFINITIVO EDUCORE
-- Execute este script no SQL Editor do Supabase para criar a estrutura completa.

-- 1. TABELAS DE PERFIS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  subjects TEXT,
  experience TEXT,
  interests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELAS DE CONTEÚDO (TRILHAS)
CREATE TABLE IF NOT EXISTS public.learning_trails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  teacher_id UUID REFERENCES auth.users(id),
  teacher_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('video', 'pdf', 'text', 'quiz')),
  url TEXT,
  description TEXT, -- Para QUIZ, armazena o JSON das questões
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELAS DE COMUNICAÇÃO E LIVES
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_name TEXT,
  teacher_id UUID REFERENCES auth.users(id),
  youtube_id TEXT,
  youtube_url TEXT,
  start_time TIMESTAMPTZ NOT NULL, -- NOVO: Obrigatório para agendamento
  trail_id UUID REFERENCES public.learning_trails(id),
  status TEXT DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id TEXT, -- Pode ser ID da Live ou Categoria
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELAS DE BIBLIOTECA
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT,
  url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DESATIVAR RLS PARA DEMO (OPCIONAL MAS RECOMENDADO PARA APRESENTAÇÃO)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;
