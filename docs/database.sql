
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS COMPROMISSO
-- Rode este script no SQL Editor do Supabase para habilitar todas as funções.

-- 1. Tabela de Perfis (Aluno e Mentor)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher')),
  institution TEXT,
  course TEXT,
  interests TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Trilhas de Estudo
CREATE TABLE IF NOT EXISTS public.trails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  teacher_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Aulas ao Vivo
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.profiles(id),
  youtube_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Mensagens do Chat da Live
CREATE TABLE IF NOT EXISTS public.live_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id UUID REFERENCES public.lives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Perfis visíveis por todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Lives visíveis por todos" ON public.lives FOR SELECT USING (true);
CREATE POLICY "Mentores gerenciam lives" ON public.lives FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND profile_type = 'teacher')
);
CREATE POLICY "Mensagens visíveis por todos" ON public.live_messages FOR SELECT USING (true);
CREATE POLICY "Qualquer um envia mensagem" ON public.live_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Habilitar Realtime para o Chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lives;
