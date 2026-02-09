-- SCRIPT SQL PARA CONFIGURAÇÃO DO EDUCORE NO SUPABASE
-- Execute este código no SQL Editor do Supabase para criar a infraestrutura de dados.

-- 1. DESATIVAR RLS (Para facilidade em ambiente de prototipagem/demo)
-- Nota: Em produção, você deve configurar políticas específicas para cada tabela.

-- 2. TABELA DE PERFIS DE ESTUDANTES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    profile_type TEXT CHECK (profile_type IN ('etec', 'uni')),
    institution TEXT,
    course TEXT,
    is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
    last_access TIMESTAMPTZ DEFAULT NOW(),
    last_financial_simulation TIMESTAMPTZ,
    interests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE PROFESSORES/MENTORES
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    subjects TEXT,
    experience TEXT,
    interests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE TRILHAS DE ESTUDO
CREATE TABLE IF NOT EXISTS public.learning_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
    teacher_id UUID REFERENCES auth.users(id),
    teacher_name TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE MÓDULOS (CAPÍTULOS)
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE CONTEÚDOS (AULAS/QUIZZES)
CREATE TABLE IF NOT EXISTS public.learning_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('video', 'pdf', 'text', 'quiz')),
    url TEXT,
    description TEXT, -- Para quizzes, armazenar JSON das perguntas aqui
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE LIVES
CREATE TABLE IF NOT EXISTS public.lives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_name TEXT,
    teacher_id UUID REFERENCES auth.users(id),
    youtube_id TEXT,
    youtube_url TEXT,
    url TEXT,
    start_time TIMESTAMPTZ,
    trail_id UUID REFERENCES public.learning_trails(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA DE MURAL DE AVISOS
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    priority TEXT DEFAULT 'normal',
    author TEXT,
    read_by JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA DE CHATS E FÓRUNS
CREATE TABLE IF NOT EXISTS public.forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID, -- Pode ser ID do Fórum ou ID da Live para chat ao vivo
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    content TEXT,
    is_question BOOLEAN DEFAULT FALSE,
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABELA DE BIBLIOTECA DIGITAL
CREATE TABLE IF NOT EXISTS public.library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    type TEXT,
    url TEXT,
    image_url TEXT,
    author TEXT,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABELA DE SUBMISSÕES DE QUIZ
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    module_id UUID,
    score INTEGER,
    total INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DESATIVAR RLS PARA TODAS AS TABELAS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_trails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions DISABLE ROW LEVEL SECURITY;
