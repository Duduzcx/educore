-- 1) Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Tabelas Base
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(255),
  email varchar(255),
  profile_type varchar(50),
  institution varchar(255),
  course varchar(255),
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

-- 3) Sistema de Trilhas e Aulas
CREATE TABLE IF NOT EXISTS public.learning_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  category varchar(100),
  description text,
  status varchar(20) DEFAULT 'draft',
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
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
  type varchar(20) DEFAULT 'video', -- video, pdf, text, quiz
  url text,
  description text, -- Pode ser o corpo do texto ou JSON do quiz IA
  created_at timestamptz DEFAULT now()
);

-- 4) Sistema de Lives
CREATE TABLE IF NOT EXISTS public.lives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  teacher_name varchar(255),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  youtube_id varchar(50),
  youtube_url text,
  start_time timestamptz NOT NULL,
  status varchar(20) DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

-- 5) Comunidade e Fórum
CREATE TABLE IF NOT EXISTS public.forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description text,
  category varchar(100),
  author_id uuid,
  author_name varchar(255),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid REFERENCES public.forums(id) ON DELETE CASCADE,
  author_id uuid,
  author_name varchar(255),
  content text NOT NULL,
  is_question boolean DEFAULT false,
  is_answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 6) Chat Direto
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id varchar(255) NOT NULL,
  receiver_id varchar(255) NOT NULL,
  message text NOT NULL,
  file_url text,
  file_name varchar(255),
  file_type varchar(100),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 7) Biblioteca Digital
CREATE TABLE IF NOT EXISTS public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  category varchar(100),
  type varchar(20), -- PDF, Video, E-book
  url text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- 8) DESATIVAR RLS PARA MODO APRESENTAÇÃO (DEMO)
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

-- 9) Permissões Básicas
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;