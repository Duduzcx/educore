-- 1. Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher')),
  institution TEXT,
  course TEXT,
  interests TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT false,
  last_access TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Lives
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  teacher_id UUID REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Mensagens da Live
CREATE TABLE IF NOT EXISTS public.live_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id UUID REFERENCES public.lives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Habilitar Realtime para Chat
ALTER PUBLICATION supabase_realtime ADD TABLE live_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE lives;

-- 5. Segurança (RLS) - Permissões Básicas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis visíveis para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Lives visíveis para todos" ON public.lives FOR SELECT USING (true);
CREATE POLICY "Mentores gerenciam lives" ON public.lives ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE profile_type = 'teacher'));
CREATE POLICY "Mensagens visíveis para todos" ON public.live_messages FOR SELECT USING (true);
CREATE POLICY "Usuários postam mensagens" ON public.live_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');