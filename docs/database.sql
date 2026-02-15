-- SCRIPT SQL PARA O CURSO COMPROMISSO
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de Perfis (Extensão do Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher', 'admin')) DEFAULT 'etec',
  institution TEXT,
  course TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Transmissões ao Vivo
CREATE TABLE IF NOT EXISTS public.lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  teacher_id UUID REFERENCES auth.users,
  teacher_name TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Progresso de Vídeo (Vigilante Compromisso)
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  trail_id TEXT NOT NULL,
  percentage FLOAT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- 4. Habilitar RLS (Segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso Total para Modo Demo (Simplificado)
CREATE POLICY "Acesso Total Perfis" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Acesso Total Lives" ON public.lives FOR ALL USING (true);
CREATE POLICY "Acesso Total Progresso" ON public.video_progress FOR ALL USING (true);

-- 6. Trigger para criar perfil automático ao cadastrar novo usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, profile_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
