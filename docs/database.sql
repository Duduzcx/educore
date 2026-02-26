
-- 1. LIMPEZA TOTAL (Opcional - Use para resetar o banco)
-- TRUNCATE public.student_checklists, public.user_progress, public.learning_contents, public.modules, public.trails, public.library_resources, public.lives, public.direct_messages, public.profiles CASCADE;

-- 2. TABELAS (Caso ainda não existam)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher', 'admin', 'student')),
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

CREATE TABLE IF NOT EXISTS public.trails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    image_url TEXT,
    teacher_id UUID REFERENCES public.profiles(id),
    teacher_name TEXT,
    status TEXT DEFAULT 'published', 
    target_audience TEXT DEFAULT 'all',
    average_rating NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.learning_contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT, -- video, quiz, pdf, text, file
    url TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.library_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    type TEXT, 
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. SEED: TRILHAS E CONTEÚDOS (Exemplos Reais)

-- Trilha 1: Redação Master
INSERT INTO public.trails (id, title, category, description, image_url, teacher_name, status)
VALUES ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Redação Master: Rumo ao 1000', 'Linguagens', 'Domine a estrutura do texto dissertativo-argumentativo padrão ENEM com técnicas de argumentação e repertório sociocultural.', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800', 'Prof. Ana Lúcia', 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id, trail_id, title, order_index)
VALUES ('m1-redacao', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Fundamentos da Escrita', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_contents (module_id, title, type, url, description, order_index)
VALUES 
('m1-redacao', 'Introdução à Redação ENEM', 'video', 'https://www.youtube.com/watch?v=6X8De_m5ls0', 'Aprenda como começar sua redação do zero seguindo as 5 competências.', 0),
('m1-redacao', 'Guia de Conectivos (PDF)', 'pdf', 'https://www.ufsm.br/app/uploads/sites/416/2020/05/Guia-de-Conectivos.pdf', 'Tabela completa de conectivos para usar no seu texto.', 1)
ON CONFLICT (id) DO NOTHING;

-- Trilha 2: Matemática do Zero
INSERT INTO public.trails (id, title, category, description, image_url, teacher_name, status)
VALUES ('b2c3d4e5-f6g7-4a5b-8c9d-0e1f2a3b4c5e', 'Matemática: O Terror das Exatas', 'Matemática', 'Aprenda matemática básica, razão, proporção e funções de forma prática e aplicada aos vestibulares.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800', 'Prof. Marcos Silva', 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id, trail_id, title, order_index)
VALUES ('m1-mat', 'b2c3d4e5-f6g7-4a5b-8c9d-0e1f2a3b4c5e', 'Aritmética e Razão', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_contents (module_id, title, type, url, description, order_index)
VALUES 
('m1-mat', 'Regra de Três Simples e Composta', 'video', 'https://www.youtube.com/watch?v=nP_7nzsyXYY', 'Domine o assunto que mais cai no ENEM e na FATEC.', 0),
('m1-mat', 'Lista de Exercícios Resolvidos', 'pdf', 'https://www.pucrs.br/edipucrs/online/matematica/lista1.pdf', 'Pratique com questões reais de anos anteriores.', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED: BIBLIOTECA
INSERT INTO public.library_resources (title, description, category, type, url, image_url)
VALUES 
('Manual do Candidato 2024', 'Tudo o que você precisa saber sobre prazos e documentos.', 'Geral', 'PDF', 'https://www.vunesp.com.br', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=400'),
('Aulão de Revisão SiSU', 'Vídeo completo sobre como usar sua nota para entrar na faculdade.', 'Carreira', 'Video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400')
ON CONFLICT DO NOTHING;
