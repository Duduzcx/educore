
-- SQL DE SINCRONIZAÇÃO DO COMPROMISSO
-- Copie este conteúdo e rode no SQL Editor do seu projeto Supabase

-- 1. Extensão para busca semântica (opcional, para IA futura)
create extension if not exists vector;

-- 2. Tabela de Trilhas (trails) - Sincronização de colunas faltantes
alter table public.trails add column if not exists teacher_name text;
alter table public.trails add column if not exists image_url text;
alter table public.trails add column if not exists target_audience text default 'all';
alter table public.trails add column if not exists is_new boolean default true;
alter table public.trails add column if not exists status text default 'draft';

-- 3. Tabela de Vidas/Lives (lives) - Sincronização
alter table public.lives add column if not exists status text default 'scheduled';
alter table public.lives add column if not exists teacher_name text;

-- 4. Tabela de Progresso do Usuário (user_progress)
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  trail_id uuid references public.trails(id) on delete cascade,
  percentage integer default 0,
  last_accessed timestamp with time zone default now(),
  unique(user_id, trail_id)
);

-- 5. Habilitar Realtime
alter publication supabase_realtime add table public.lives;
alter publication supabase_realtime add table public.live_messages;

-- 6. Regras de Acesso (RLS) - Permitir tudo para demonstração
alter table public.trails enable row level security;
alter table public.lives enable row level security;
alter table public.user_progress enable row level security;

create policy "Permitir tudo para todos - Demo" on public.trails for all using (true);
create policy "Permitir tudo para todos - Demo" on public.lives for all using (true);
create policy "Permitir tudo para todos - Demo" on public.user_progress for all using (true);
