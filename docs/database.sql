
-- ==========================================================
-- COMPROMISSO | SMART EDUCATION - BANCO DE DADOS (SUPABASE)
-- Versão: 2.5.0 (Full Premium + Demo Seeds)
-- ==========================================================

-- 1. ESTRUTURA DE TABELAS
-- ==========================================================

-- Perfis de Usuário
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

-- Trilhas de Estudo
CREATE TABLE IF NOT EXISTS public.trails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    image_url TEXT,
    teacher_id UUID REFERENCES public.profiles(id),
    teacher_name TEXT,
    status TEXT DEFAULT 'draft', -- draft, review, published, active
    target_audience TEXT DEFAULT 'all',
    average_rating NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Módulos da Trilha
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Conteúdos de Aprendizagem
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

-- Progresso do Aluno
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
    percentage INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, trail_id)
);

-- Biblioteca Digital
CREATE TABLE IF NOT EXISTS public.library_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    type TEXT, -- PDF, Video, E-book, Artigo
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Mensagens Diretas
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Checklist de Documentos
CREATE TABLE IF NOT EXISTS public.student_checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, item_id)
);

-- Lives / Transmissões
CREATE TABLE IF NOT EXISTS public.lives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    meet_link TEXT,
    teacher_id UUID REFERENCES public.profiles(id),
    teacher_name TEXT,
    status TEXT DEFAULT 'scheduled', -- live, scheduled, finished
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. POLÍTICAS DE ACESSO (RLS - MODO DEMO)
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Total Demo" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Acesso Total Demo" ON public.trails FOR ALL USING (true);
CREATE POLICY "Acesso Total Demo" ON public.modules FOR ALL USING (true);
CREATE POLICY "Acesso Total Demo" ON public.learning_contents FOR ALL USING (true);
CREATE POLICY "Acesso Total Demo" ON public.user_progress FOR ALL USING (true);
CREATE POLICY "Acesso Total Demo" ON public.library_resources FOR ALL USING (true);
CREATE POLICY "Acesso Total Demo" ON public.direct_messages FOR ALL USING (true);
CREATE POLICY "Acesso Total Demo" ON public.student_checklists FOR ALL USING (true);
CREATE POLICY "Acesso Total Demo" ON public.lives FOR ALL USING (true);

-- 3. DADOS DE DEMONSTRAÇÃO (SEEDS)
-- ==========================================================

-- Limpa dados antigos para evitar duplicidade no seed
TRUNCATE public.library_resources CASCADE;
TRUNCATE public.trails CASCADE;

-- Inserindo Materiais na Biblioteca
INSERT INTO public.library_resources (title, description, category, type, url, image_url)
VALUES 
('Guia de Isenção 2024', 'Manual completo sobre como solicitar isenção no ENEM e SiSU.', 'Documentação', 'PDF', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/manuais/manual-do-participante-enem-2023', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800'),
('Checklist de Documentos', 'Lista técnica para não esquecer nada no dia da matrícula.', 'Carreira', 'PDF', 'https://placehold.co/600x400', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800');

-- Inserindo Trilha de Redação (100% Funcional)
WITH new_trail AS (
    INSERT INTO public.trails (title, category, description, image_url, teacher_name, status, target_audience)
    VALUES ('Redação Master: Rumo ao 1000', 'Linguagens', 'Domine a estrutura do texto dissertativo-argumentativo padrão ENEM com técnicas reais.', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800', 'Prof. Ana Lúcia', 'published', 'all')
    RETURNING id
),
new_module AS (
    INSERT INTO public.modules (trail_id, title, order_index)
    SELECT id, 'Fundamentos e Estrutura', 0 FROM new_trail
    RETURNING id
)
INSERT INTO public.learning_contents (module_id, title, type, url, description, order_index)
SELECT id, 'Introdução ao Texto Nota 1000', 'video', 'https://www.youtube.com/watch?v=6X8De_m5ls0', 'Aprenda os 5 pilares da competência do ENEM.', 0 FROM new_module
UNION ALL
SELECT id, 'Guia de Conectivos (PDF)', 'pdf', 'https://www.ufsm.br/app/uploads/sites/416/2020/05/Guia-de-Conectivos.pdf', 'Tabela completa para melhorar sua coesão textual.', 1 FROM new_module;

-- Inserindo Trilha de Matemática
WITH new_trail_mat AS (
    INSERT INTO public.trails (title, category, description, image_url, teacher_name, status, target_audience)
    VALUES ('Matemática: A Base de Tudo', 'Matemática', 'Do zero à aprovação em exatas. Focado em lógica e cálculo rápido.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800', 'Prof. Ricardo Exatas', 'published', 'all')
    RETURNING id
),
new_module_mat AS (
    INSERT INTO public.modules (trail_id, title, order_index)
    SELECT id, 'Aritmética e Proporção', 0 FROM new_trail_mat
    RETURNING id
)
INSERT INTO public.learning_contents (module_id, title, type, url, description, order_index)
SELECT id, 'Regra de Três sem Segredos', 'video', 'https://www.youtube.com/watch?v=NIn_8vokjtQ', 'Domine proporcionalidade em 15 minutos.', 0 FROM new_module_mat;

-- NOTA IMPORTANTE:
-- Para os perfis de LOGIN (gestor@, mentor@, aluno@), você deve criá-los na aba 'Authentication' 
-- do Supabase com a senha '123456789' para que o sistema consiga autenticar.
-- Após criar no Auth, o sistema criará o registro na tabela Profiles automaticamente se os Triggers estiverem ativos,
-- ou você pode usar o botão "Gerar Trilhas Demo" no painel de Gestor para forçar a sincronização de dados.
