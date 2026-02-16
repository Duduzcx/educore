
-- SCRIPT DE ESTRUTURA PARA O COMPROMISSO (SUPABASE)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Tabela de Perfis (Extensão do Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher')),
  institution TEXT,
  course TEXT,
  interests TEXT,
  last_access TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'student'
);

-- 2. Tabela de Lives/Transmissões
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES auth.users,
  teacher_name TEXT,
  youtube_id TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS (Segurança de Nível de Linha)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso (Modo Livre para Demo)
CREATE POLICY "Acesso Total Profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Acesso Total Lives" ON public.lives FOR ALL USING (true);

-- 5. Trigger para atualizar last_access (Opcional)
CREATE OR REPLACE FUNCTION public.handle_last_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_access = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
