
-- SCRIPT DE INICIALIZAÇÃO COMPROMISSO
-- RODE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA QUE O SISTEMA FUNCIONE

-- 1. Criar tabela de perfis (Aluno e Mentor)
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

-- 2. Habilitar RLS (Segurança de Nível de Linha)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de Acesso
CREATE POLICY "Qualquer um pode ler perfis" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Inserção pública para cadastro" ON public.profiles FOR INSERT WITH CHECK (true);

-- 4. Tabela de Lives
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES auth.users,
  youtube_id TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de lives" ON public.lives FOR SELECT USING (true);
CREATE POLICY "Apenas mentores criam lives" ON public.lives FOR ALL USING (auth.uid() = teacher_id);

-- 5. Tabela de Chat de Lives (Realtime)
CREATE TABLE IF NOT EXISTS public.live_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id UUID REFERENCES public.lives ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  user_name TEXT,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mensagens de live visíveis para todos" ON public.live_messages FOR SELECT USING (true);
CREATE POLICY "Qualquer autenticado envia mensagem" ON public.live_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Habilitar Realtime nas mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lives;
