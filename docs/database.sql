-- SCRIPT SQL PARA O SUPABASE (RODAR NO SQL EDITOR)
-- CRIAÇÃO DA TABELA DE PERFIS E POLÍTICAS DE ACESSO

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile_type TEXT CHECK (profile_type IN ('etec', 'uni', 'teacher')),
  institution TEXT,
  course TEXT,
  interests TEXT,
  is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
-- 1. Qualquer um pode ler perfis (necessário para o chat/mentoria)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- 2. Usuários podem inserir seu próprio perfil
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- NOTA: No Auth > Providers > Email do Supabase, desmarque "Confirm email" para facilitar testes iniciais.