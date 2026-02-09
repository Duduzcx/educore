-- SCRIPT SQL DE INFRAESTRUTURA EDUCORE
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Tabelas de Identidade
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

-- 2. Tabelas de Conteúdo Pedagógico
CREATE TABLE IF NOT EXISTS public.learning_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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
  description text, -- Armazena texto ou JSON do Quiz
  created_at timestamptz DEFAULT now()
);

-- 3. Transmissões ao Vivo
CREATE TABLE IF NOT EXISTS public.lives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  teacher_name text,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  youtube_id text,
  youtube_url text,
  start_time timestamptz,
  trail_id uuid REFERENCES public.learning_trails(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Comunicação e Fórum
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
  content text,
  is_question boolean DEFAULT false,
  is_answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id),
  receiver_id text, -- ID do usuário ou 'aurora-ai'
  message text,
  file_name text,
  file_type text,
  file_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. Biblioteca e Avisos
CREATE TABLE IF NOT EXISTS public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text,
  category text,
  url text,
  description text,
  status text DEFAULT 'approved',
  author text,
  user_id uuid REFERENCES auth.users(id),
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  priority text,
  author text,
  read_by uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 6. Analytics
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  content_id uuid REFERENCES public.learning_contents(id),
  score integer,
  total integer,
  created_at timestamptz DEFAULT now()
);

-- 7. Desativar RLS para Modo Apresentação (Facilita a demo)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions DISABLE ROW LEVEL SECURITY;