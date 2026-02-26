
-- ==========================================================
-- COMPROMISSO | SMART EDUCATION - BANCO DE DADOS CONSOLIDADO
-- Versão: 3.0.0 (Industrial)
-- ==========================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    profile_type TEXT DEFAULT 'student' CHECK (profile_type IN ('student', 'etec', 'uni', 'teacher', 'admin')),
    institution TEXT,
    course TEXT,
    is_financial_aid_eligible BOOLEAN DEFAULT false,
    avatar_url TEXT,
    name_changes_count INTEGER DEFAULT 0,
    interests TEXT,
    last_access TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TABELA DE TRILHAS (Trails)
CREATE TABLE IF NOT EXISTS public.trails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    teacher_id UUID REFERENCES public.profiles(id),
    teacher_name TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'published', 'inactive')),
    image_url TEXT,
    target_audience TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA DE MÓDULOS (Modules)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA DE CONTEÚDOS (Learning Contents)
CREATE TABLE IF NOT EXISTS public.learning_contents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('video', 'pdf', 'quiz', 'text', 'file')),
    url TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. TABELA DE PROGRESSO (User Progress)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
    percentage INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, trail_id)
);

-- 7. TABELA DE COMUNICADOS (Announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. TABELA DE TURMAS (Classes/Cohorts)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    coordinator_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. TABELA DE LOGS (Activity Logs)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. SIMULADOS (Subjects, Questions & Attempts)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- [{ "key": "A", "text": "..." }]
    correct_answer TEXT NOT NULL,
    year INTEGER,
    teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.simulation_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    subject_id UUID REFERENCES public.subjects(id),
    score INTEGER,
    total_questions INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. BIBLIOTECA (Library Resources)
CREATE TABLE IF NOT EXISTS public.library_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    type TEXT,
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- FUNÇÕES RPC (Lógica de Servidor)
-- ==========================================================

-- Função para contagem de questões por matéria
CREATE OR REPLACE FUNCTION get_subjects_with_question_count()
RETURNS TABLE (id UUID, name TEXT, question_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, COUNT(q.id) as question_count
    FROM public.subjects s
    LEFT JOIN public.questions q ON q.subject_id = s.id
    GROUP BY s.id, s.name;
END;
$$ LANGUAGE plpgsql;

-- Função para busca aleatória de questões
CREATE OR REPLACE FUNCTION get_random_questions_for_subject(p_subject_id UUID, p_limit INT)
RETURNS TABLE (id UUID, question_text TEXT, options JSONB, correct_answer TEXT, year INTEGER, subjects JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.question_text, q.options::JSONB, q.correct_answer, q.year, row_to_json(s.*)::JSONB
    FROM public.questions q
    JOIN public.subjects s ON q.subject_id = s.id
    WHERE q.subject_id = p_subject_id
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- GATILHOS (Triggers)
-- ==========================================================

-- Gatilho para criar perfil automático ao cadastrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, profile_type)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- SEGURANÇA (RLS - Modo Apresentação)
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Demo" ON public.profiles FOR ALL USING (true);

-- Repetir para todas as outras tabelas se necessário...
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(t) || ' ENABLE ROW LEVEL SECURITY;';
        EXECUTE 'DROP POLICY IF EXISTS "Policy Demo" ON public.' || quote_ident(t) || ';';
        EXECUTE 'CREATE POLICY "Policy Demo" ON public.' || quote_ident(t) || ' FOR ALL USING (true);';
    END LOOP;
END $$;

-- ==========================================================
-- DADOS DE EXEMPLO (Seeds)
-- ==========================================================
INSERT INTO public.subjects (name) VALUES ('Redação'), ('Matemática'), ('Biologia') ON CONFLICT DO NOTHING;

INSERT INTO public.announcements (title, message, priority) 
VALUES ('Bem-vindos à Jornada 2024!', 'Explore as novas trilhas master e use o simulador de isenção social.', 'medium');
