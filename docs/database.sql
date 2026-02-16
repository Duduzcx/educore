-- SCRIPT DE INICIALIZAÇÃO INDUSTRIAL - COMPROMISSO SMART EDUCATION
-- Cole este script no SQL Editor do seu Supabase e clique em RUN.

-- 1. TABELA DE PERFIS (Sincronizada com o Auth do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher', 'student')),
  institution TEXT,
  course TEXT,
  interests TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE LIVES (Agendamento de aulas)
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.profiles(id),
  youtube_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE MENSAGENS (Chat em tempo real)
CREATE TABLE IF NOT EXISTS public.live_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id UUID REFERENCES public.lives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HABILITAR REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE lives;
ALTER PUBLICATION supabase_realtime ADD TABLE live_messages;

-- 5. POLÍTICAS DE SEGURANÇA (RLS) - MODO DEMO ACESSO TOTAL
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Público Perfis" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Acesso Público Lives" ON public.lives FOR ALL USING (true);
CREATE POLICY "Acesso Público Mensagens" ON public.live_messages FOR ALL USING (true);