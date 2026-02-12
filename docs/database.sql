-- SCRIPT SQL DE INFRAESTRUTURA EDUCORE
-- Execute este script no SQL Editor do Supabase para criar a base de dados.

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE PERFIS (ESTUDANTES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  profile_type text CHECK (profile_type IN ('etec', 'uni')),
  institution text,
  course text,
  interests text,
  is_financial_aid_eligible boolean DEFAULT false,
  last_financial_simulation timestamptz,
  last_access timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3. TABELA DE PROFESSORES
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  subjects text,
  experience text,
  interests text,
  created_at timestamptz DEFAULT now()
);

-- 4. TRILHAS DE ESTUDO
CREATE TABLE IF NOT EXISTS public.learning_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES auth.users(id),
  teacher_name text,
  title text NOT NULL,
  description text,
  category text,
  image_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  created_at timestamptz DEFAULT now()
);

-- 5. MÓDULOS (CAPÍTULOS)
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id uuid REFERENCES public.learning_trails(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 6. CONTEÚDOS (AULAS / QUIZZES)
CREATE TABLE IF NOT EXISTS public.learning_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text CHECK (type IN ('video', 'pdf', 'text', 'quiz')),
  url text,
  description text, -- Armazena o JSON do quiz se type for 'quiz'
  created_at timestamptz DEFAULT now()
);

-- 7. LIVES (ESTÚDIO)
CREATE TABLE IF NOT EXISTS public.lives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES auth.users(id),
  teacher_name text,
  title text NOT NULL,
  description text,
  youtube_id text DEFAULT 'rfscVS0vtbw',
  start_time timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at timestamptz DEFAULT now()
);

-- 8. FÓRUNS E CHAT DE LIVE
CREATE TABLE IF NOT EXISTS public.forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id),
  author_name text,
  name text NOT NULL,
  description text,
  category text DEFAULT 'Geral',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid REFERENCES public.forums(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id),
  author_name text,
  content text NOT NULL,
  is_question boolean DEFAULT false,
  is_answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 9. MURAL DE AVISOS
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

-- 10. BIBLIOTECA DIGITAL
CREATE TABLE IF NOT EXISTS public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  type text,
  url text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- DESATIVAR RLS PARA DEMO (OPCIONAL MAS RECOMENDADO PARA APRESENTAÇÃO)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;
