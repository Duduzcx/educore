
-- SCRIPT DE INICIALIZAÇÃO - COMPROMISSO SMART EDUCATION
-- Execute este script no SQL Editor do Supabase para configurar o banco de dados.

-- 1. Tabela de Perfis (Sincronizada com Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  profile_type text check (profile_type in ('etec', 'uni', 'teacher')),
  institution text,
  course text,
  interests text,
  last_access timestamp with time zone default now(),
  is_financial_aid_eligible boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. Tabela de Lives (Agendamento de Aulas)
create table if not exists public.lives (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  youtube_id text not null,
  teacher_id uuid references public.profiles(id),
  start_time timestamp with time zone not null,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  created_at timestamp with time zone default now()
);

-- 3. Tabela de Mensagens da Live (Chat Realtime)
create table if not exists public.live_messages (
  id uuid default gen_random_uuid() primary key,
  live_id uuid references public.lives(id) on delete cascade,
  user_id uuid references public.profiles(id),
  user_name text,
  content text not null,
  is_question boolean default false,
  is_answered boolean default false,
  created_at timestamp with time zone default now()
);

-- 4. Habilitar Realtime
alter publication supabase_realtime add table public.lives;
alter publication supabase_realtime add table public.live_messages;

-- 5. Configurar RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.lives enable row level security;
alter table public.live_messages enable row level security;

-- Políticas de Acesso
create policy "Perfis são visíveis para usuários autenticados" on public.profiles for select using (true);
create policy "Usuários podem editar seu próprio perfil" on public.profiles for update using (auth.uid() = id);

create policy "Lives são visíveis para todos" on public.lives for select using (true);
create policy "Mentores podem gerenciar lives" on public.lives for all using (
  exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'teacher')
);

create policy "Mensagens são visíveis para todos na live" on public.live_messages for select using (true);
create policy "Qualquer aluno autenticado pode enviar mensagens" on public.live_messages for insert with check (auth.role() = 'authenticated');
create policy "Mentores podem moderar mensagens" on public.live_messages for update using (
  exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'teacher')
);
