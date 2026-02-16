-- SCRIPT DE ATIVAÇÃO DO COMPROMISSO (ESTADO INDUSTRIAL)
-- Rodar este script no SQL Editor do Supabase para ativar todas as funcionalidades.

-- 1. TABELA DE PERFIS (ALUNOS E MENTORES)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  profile_type text check (profile_type in ('etec', 'uni', 'teacher')),
  institution text,
  course text,
  interests text,
  is_financial_aid_eligible boolean default false,
  last_access timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. TABELA DE LIVES
create table if not exists public.lives (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  youtube_id text not null,
  teacher_id uuid references public.profiles(id),
  teacher_name text,
  start_time timestamp with time zone not null,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. TABELA DE PROGRESSO DE VÍDEO
create table if not exists public.video_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  content_id text not null,
  percentage integer default 0,
  is_completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, content_id)
);

-- 4. POLÍTICAS DE SEGURANÇA (RLS)
alter table public.profiles enable row level security;
alter table public.lives enable row level security;
alter table public.video_progress enable row level security;

-- Permitir que qualquer um leia perfis (para chat/mentoria)
create policy "Perfis são visíveis para todos" on public.profiles for select using (true);

-- Permitir que o usuário edite o próprio perfil
create policy "Usuários podem editar o próprio perfil" on public.profiles for update using (auth.uid() = id);

-- Permitir inserção de perfil durante o cadastro
create policy "Permitir inserção de perfil no cadastro" on public.profiles for insert with check (true);

-- Lives visíveis para todos
create policy "Lives visíveis para todos" on public.lives for select using (true);

-- Apenas professores gerenciam lives
create policy "Professores gerenciam lives" on public.lives for all using (
  exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'teacher')
);

-- Progresso de vídeo é privado
create policy "Usuários gerenciam seu próprio progresso" on public.video_progress for all using (auth.uid() = user_id);
