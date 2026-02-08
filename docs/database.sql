
-- SCRIPT DE INFRAESTRUTURA EDUCORE
-- COPIE E COLE NO SQL EDITOR DO SUPABASE E CLIQUE EM "RUN"

-- 1. TABELA DE PERFIS (ESTUDANTES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    profile_type TEXT DEFAULT 'etec',
    institution TEXT,
    course TEXT,
    interests TEXT,
    is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
    last_financial_simulation TIMESTAMPTZ,
    last_access TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PROFESSORES / MENTORES
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    subjects TEXT,
    experience TEXT,
    interests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE TRILHAS DE APRENDIZADO
CREATE TABLE IF NOT EXISTS public.learning_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    teacher_id UUID REFERENCES auth.users(id),
    teacher_name TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE MÓDULOS (CAPÍTULOS)
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE CONTEÚDOS (AULAS / QUIZZES)
CREATE TABLE IF NOT EXISTS public.learning_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'video', 'pdf', 'text', 'quiz'
    url TEXT,
    description TEXT, -- Contém o texto da aula ou o JSON do quiz
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE LIVES
CREATE TABLE IF NOT EXISTS public.lives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_name TEXT,
    teacher_id UUID REFERENCES auth.users(id),
    youtube_id TEXT,
    youtube_url TEXT,
    url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    trail_id UUID REFERENCES public.learning_trails(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE FÓRUNS E DISCUSSÕES
CREATE TABLE IF NOT EXISTS public.forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Geral',
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA DE MENSAGENS (CHAT / FÓRUM / LIVES)
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL, -- Pode ser ID de Live ou ID de Fórum
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    content TEXT NOT NULL,
    is_question BOOLEAN DEFAULT FALSE,
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA DE AVISOS (MURAL)
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal', -- 'banner', 'popup', 'normal'
    author TEXT,
    read_by UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABELA DE BIBLIOTECA DIGITAL
CREATE TABLE IF NOT EXISTS public.library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    url TEXT,
    description TEXT,
    image_url TEXT,
    author TEXT,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABELA DE PROGRESSO DO USUÁRIO
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    percentage INTEGER DEFAULT 0,
    last_access TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, trail_id)
);

-- DESATIVAR RLS PARA FACILITAR A DEMO (MODO APRESENTAÇÃO)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;
