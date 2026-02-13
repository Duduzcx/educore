-- SCRIPT DE INFRAESTRUTURA EDUCORE | ESTADO INDUSTRIAL
-- Execute este script no SQL Editor do seu Supabase.

-- 1. TABELA DE PROGRESSO (VIGILANTE DE VÍDEO)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.learning_contents(id) ON DELETE CASCADE,
    percentage INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, content_id)
);

-- 2. AJUSTES NA TABELA DE LIVES (AGENDAMENTO OBRIGATÓRIO)
-- Se a coluna start_time não existir ou for apenas data, vamos garantir que suporte timestamp.
ALTER TABLE public.lives 
ALTER COLUMN start_time TYPE TIMESTAMP WITH TIME ZONE;

-- 3. POLÍTICAS RLS (MODO DEMO - ACESSO TOTAL)
-- Nota: Em produção, estas regras devem ser mais restritivas.
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to progress" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.learning_trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to trails" ON public.learning_trails FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to modules" ON public.learning_modules FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.learning_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contents" ON public.learning_contents FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to lives" ON public.lives FOR ALL USING (true) WITH CHECK (true);
