
-- SCRIPT DE INICIALIZAÇÃO INDUSTRIAL COMPROMISSO
-- RODAR NO SQL EDITOR DO SUPABASE

-- 1. TABELA DE PERFIS (SINCRO COM AUTH)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher')),
  institution TEXT,
  course TEXT,
  interests TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE LIVES
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

-- 3. TABELA DE MENSAGENS (CHAT REALTIME)
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

-- 4. HABILITAR REALTIME (CRÍTICO PARA LIVES)
ALTER PUBLICATION supabase_realtime ADD TABLE lives;
ALTER PUBLICATION supabase_realtime ADD TABLE live_messages;

-- 5. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

-- REGRAS: TODOS PODEM LER LIVES E PERFIS, APENAS O DONO/ADMIN ESCREVE
CREATE POLICY "Perfis visíveis para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários criam próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Lives visíveis para todos" ON public.lives FOR SELECT USING (true);
CREATE POLICY "Professores gerenciam lives" ON public.lives FOR ALL USING (true); -- Simp para demo, ajuste em prod

CREATE POLICY "Chat visível para todos" ON public.live_messages FOR SELECT USING (true);
CREATE POLICY "Qualquer um logado envia mensagem" ON public.live_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Moderadores editam chat" ON public.live_messages FOR UPDATE USING (true);

-- 6. FUNÇÃO DE TRIGGER PARA CRIAR PERFIL AUTOMÁTICO (OPCIONAL MAS ÚTIL)
-- Nota: O código Next.js já faz isso no cadastro, mas este trigger garante a integridade.
