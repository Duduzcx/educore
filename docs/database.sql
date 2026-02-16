-- SCRIPT DE INICIALIZAÇÃO - COMPROMISSO SMART EDUCATION
-- Cole este script no SQL Editor do Supabase e clique em RUN.

-- 1. Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher')),
  institution TEXT,
  course TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  interests TEXT,
  last_access TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Lives
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES auth.users ON DELETE SET NULL,
  youtube_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Mensagens do Chat (Realtime)
CREATE TABLE IF NOT EXISTS public.live_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id UUID REFERENCES public.lives ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  user_name TEXT,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE lives;
ALTER PUBLICATION supabase_realtime ADD TABLE live_messages;

-- 5. Segurança (RLS - Row Level Security)
-- Permitir que qualquer usuário autenticado leia os perfis e mensagens
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis visíveis para todos autenticados" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Lives visíveis para todos autenticados" ON public.lives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mensagens visíveis para todos autenticados" ON public.live_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Qualquer autenticado pode enviar mensagens" ON public.live_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
