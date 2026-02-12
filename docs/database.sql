-- SCRIPT SQL DEFINITIVO PARA EDUCORE (RODAR NO SUPABASE SQL EDITOR)

-- 1. DESATIVAR RLS TEMPORARIAMENTE (OPCIONAL, PARA APRESENTAÇÃO)
-- Se quiser manter segurança, remova essas linhas e configure políticas.
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.library_items DISABLE ROW LEVEL SECURITY;

-- 2. TABELA DE PERFIS (ESTUDANTES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text,
    email text,
    profile_type text DEFAULT 'etec', -- 'etec' ou 'uni'
    institution text,
    course text,
    is_financial_aid_eligible boolean DEFAULT false,
    last_access timestamptz DEFAULT now(),
    last_financial_simulation timestamptz,
    interests text,
    created_at timestamptz DEFAULT now()
);

-- 3. TABELA DE PROFESSORES (MENTORES)
CREATE TABLE IF NOT EXISTS public.teachers (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text,
    email text,
    subjects text,
    experience text,
    interests text,
    created_at timestamptz DEFAULT now()
);

-- 4. TRILHAS DE APRENDIZADO
CREATE TABLE IF NOT EXISTS public.learning_trails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    category text,
    description text,
    status text DEFAULT 'draft', -- 'draft' ou 'active'
    teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    teacher_name text,
    image_url text,
    target_audience text DEFAULT 'both', -- 'etec', 'uni' ou 'both'
    is_fundamental boolean DEFAULT false,
    is_new boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 5. MÓDULOS (CAPÍTULOS DAS TRILHAS)
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trail_id uuid REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    title text NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 6. CONTEÚDOS (AULAS, VIDEOS, QUIZZES)
CREATE TABLE IF NOT EXISTS public.learning_contents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id uuid REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    title text NOT NULL,
    type text DEFAULT 'video', -- 'video', 'pdf', 'text', 'quiz'
    url text,
    description text, -- Pode conter o JSON do Quiz
    created_at timestamptz DEFAULT now()
);

-- 7. TRANSMISSÕES AO VIVO (LIVES)
CREATE TABLE IF NOT EXISTS public.lives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    teacher_name text,
    teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    youtube_id text DEFAULT 'rfscVS0vtbw',
    start_time timestamptz NOT NULL,
    status text DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed'
    trail_id uuid REFERENCES public.learning_trails(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- 8. FÓRUNS DE DISCUSSÃO
CREATE TABLE IF NOT EXISTS public.forums (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    category text DEFAULT 'Geral',
    author_id uuid REFERENCES auth.users(id),
    author_name text,
    created_at timestamptz DEFAULT now()
);

-- 9. POSTS DO FÓRUM / CHAT DE LIVE
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id uuid REFERENCES public.forums(id) ON DELETE CASCADE, -- Ou ID da Live
    author_id uuid REFERENCES auth.users(id),
    author_name text,
    content text NOT NULL,
    is_question boolean DEFAULT false,
    is_answered boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 10. BIBLIOTECA DIGITAL
CREATE TABLE IF NOT EXISTS public.library_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    category text,
    type text DEFAULT 'PDF', -- 'Video', 'PDF', 'E-book'
    url text,
    image_url text,
    created_at timestamptz DEFAULT now()
);

-- 11. MENSAGENS DE CHAT DIRETO
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id text NOT NULL, -- Pode ser ID do usuário ou 'aurora-ai'
    receiver_id text NOT NULL,
    message text NOT NULL,
    file_url text,
    file_name text,
    file_type text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 12. PROGRESSO DO USUÁRIO
CREATE TABLE IF NOT EXISTS public.user_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    trail_id uuid REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    percentage integer DEFAULT 0,
    last_content_id uuid,
    updated_at timestamptz DEFAULT now()
);