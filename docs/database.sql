
-- ==========================================================
-- COMPROMISSO | SMART EDUCATION
-- SCRIPT DE CONFIGURAÇÃO INDUSTRIAL (SUPABASE)
-- Versão: 3.0.0 (Resolução de Simulados e Storage)
-- ==========================================================

-- 1. TABELA DE PERFIS (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    profile_type TEXT DEFAULT 'student' CHECK (profile_type IN ('etec', 'uni', 'teacher', 'admin', 'student')),
    institution TEXT,
    course TEXT,
    interests TEXT,
    avatar_url TEXT,
    is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
    name_changes_count INTEGER DEFAULT 0,
    last_access TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. TABELA DE MATÉRIAS (Subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TABELA DE QUESTÕES (Questions)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id),
    teacher_id UUID REFERENCES public.profiles(id),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Formato: [{"key": "A", "text": "..."}, ...]
    correct_answer TEXT NOT NULL, -- Ex: 'A'
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA DE TRILHAS (Trails)
CREATE TABLE IF NOT EXISTS public.trails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    image_url TEXT,
    teacher_id UUID REFERENCES public.profiles(id),
    teacher_name TEXT,
    status TEXT DEFAULT 'draft',
    target_audience TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA DE MÓDULOS (Modules)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. TABELA DE CONTEÚDOS (Learning Contents)
CREATE TABLE IF NOT EXISTS public.learning_contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT,
    url TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. TABELA DE CHECKLIST DE DOCUMENTOS
CREATE TABLE IF NOT EXISTS public.student_checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, item_id)
);

-- 8. GATILHO DE PERFIL AUTOMÁTICO (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, profile_type)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. FUNÇÕES RPC PARA SIMULADOS (Fix 1)
CREATE OR REPLACE FUNCTION get_subjects_with_question_count()
RETURNS TABLE (id UUID, name TEXT, question_count BIGINT) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, COUNT(q.id) as question_count
    FROM public.subjects s
    LEFT JOIN public.questions q ON q.subject_id = s.id
    GROUP BY s.id, s.name ORDER BY s.name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION get_random_questions_for_subject(p_subject_id UUID, p_limit INT)
RETURNS TABLE (id UUID, question_text TEXT, options JSONB, correct_answer TEXT, year INTEGER, subjects JSONB) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.question_text, q.options::JSONB, q.correct_answer, q.year, row_to_json(s.*)::JSONB as subjects
    FROM public.questions q
    JOIN public.subjects s ON q.subject_id = s.id
    WHERE q.subject_id = p_subject_id
    ORDER BY RANDOM() LIMIT p_limit;
END;
$$;

-- 10. CONFIGURAÇÃO DE STORAGE (Fix 2)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Avatares Públicos" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatares Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Avatares Update" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 11. DADOS INICIAIS (Seeds)
INSERT INTO public.subjects (name) VALUES ('Matemática'), ('Linguagens'), ('Ciências da Natureza'), ('Ciências Humanas'), ('Redação'), ('Não Categorizado') ON CONFLICT DO NOTHING;

-- Exemplo de Trilha Funcional
INSERT INTO public.trails (title, category, description, status, teacher_name)
VALUES ('Redação Master: Rumo ao 1000', 'Linguagens', 'Domine a estrutura do texto dissertativo-argumentativo padrão ENEM.', 'active', 'Prof. Ana Lúcia')
ON CONFLICT DO NOTHING;
