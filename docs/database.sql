-- SCRIPT SQL PARA O SUPABASE - EDUCORE
-- Execute este código no SQL Editor do seu projeto Supabase para criar as tabelas necessárias.

-- 1. Tabelas de Perfil
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
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
  name text,
  email text,
  subjects text,
  experience text,
  interests text,
  created_at timestamptz DEFAULT now()
);

-- 2. Trilhas de Aprendizado
CREATE TABLE IF NOT EXISTS public.learning_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  teacher_id uuid REFERENCES auth.users(id),
  teacher_name text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id uuid REFERENCES public.learning_trails(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text CHECK (type IN ('video', 'pdf', 'text', 'quiz')),
  url text,
  description text, -- Armazena conteúdo texto ou JSON do Quiz
  created_at timestamptz DEFAULT now()
);

-- 3. Transmissões ao Vivo
CREATE TABLE IF NOT EXISTS public.lives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  teacher_id uuid REFERENCES auth.users(id),
  teacher_name text,
  youtube_id text DEFAULT 'rfscVS0vtbw',
  start_time timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- 4. Comunidade e Fórum
CREATE TABLE IF NOT EXISTS public.forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  author_id uuid REFERENCES auth.users(id),
  author_name text,
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

-- 5. Biblioteca e Chat
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

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id text NOT NULL, -- Pode ser UUID ou 'aurora-ai'
  receiver_id text NOT NULL,
  message text NOT NULL,
  file_name text,
  file_type text,
  file_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- DESATIVAR RLS PARA DEMO (Acesso total para testes)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;