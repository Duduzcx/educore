
-- SCRIPT DE MIGRAÇÃO INDUSTRIAL - COMPROMISSO
-- Execute este script no SQL Editor do Supabase para ativar todas as funcionalidades.

-- 1. TABELAS BASE
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Dúvidas',
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  content TEXT NOT NULL
);

-- 2. HABILITAR SEGURANÇA (RLS)
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACESSO (RLS)
-- Direct Messages
DROP POLICY IF EXISTS "Ver mensagens" ON direct_messages;
CREATE POLICY "Ver mensagens" ON direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Enviar mensagens" ON direct_messages;
CREATE POLICY "Enviar mensagens" ON direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Forums
DROP POLICY IF EXISTS "Ver fóruns" ON forums;
CREATE POLICY "Ver fóruns" ON forums FOR SELECT USING (true);
DROP POLICY IF EXISTS "Criar fóruns" ON forums;
CREATE POLICY "Criar fóruns" ON forums FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Forum Posts
DROP POLICY IF EXISTS "Ver posts" ON forum_posts;
CREATE POLICY "Ver posts" ON forum_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Criar posts" ON forum_posts;
CREATE POLICY "Criar posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 4. HABILITAR REALTIME (IMPORTANTE PARA CHAT AO VIVO)
-- Nota: Estas linhas garantem que o banco emita eventos de mudança para o frontend.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE forums;
