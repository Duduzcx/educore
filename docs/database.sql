-- SCRIPT SQL DEFINITIVO PARA EDUCORE
-- Execute no SQL Editor do Supabase

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELAS DE PERFIL
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(255),
  email varchar(255),
  profile_type text CHECK (profile_type IN ('etec', 'uni')),
  institution text,
  course text,
  is_financial_aid_eligible boolean DEFAULT false,
  last_access timestamptz DEFAULT now(),
  last_financial_simulation timestamptz,
  interests text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(255),
  email varchar(255),
  subjects text,
  experience text,
  interests text,
  created_at timestamptz DEFAULT now()
);

-- 3. TRILHAS E CONTEÚDOS
CREATE TABLE IF NOT EXISTS public.learning_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  category varchar(100),
  description text,
  status text DEFAULT 'draft',
  teacher_id uuid REFERENCES auth.users(id),
  teacher_name varchar(255),
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id uuid REFERENCES public.learning_trails(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  type text CHECK (type IN ('video', 'pdf', 'text', 'quiz')),
  url text,
  description text, -- Armazena texto da aula ou JSON do quiz
  created_at timestamptz DEFAULT now()
);

-- 4. LIVES
CREATE TABLE IF NOT EXISTS public.lives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  teacher_id uuid REFERENCES auth.users(id),
  teacher_name varchar(255),
  youtube_id varchar(100),
  start_time timestamptz NOT NULL,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

-- 5. COMUNIDADE E FÓRUM
CREATE TABLE IF NOT EXISTS public.forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description text,
  category varchar(100),
  author_id uuid REFERENCES auth.users(id),
  author_name varchar(255),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid REFERENCES public.forums(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id),
  author_name varchar(255),
  is_question boolean DEFAULT false,
  is_answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 6. BIBLIOTECA
CREATE TABLE IF NOT EXISTS public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  category varchar(100),
  type text,
  url text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- 7. DESATIVAR RLS PARA DEMO (OPCIONAL)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;