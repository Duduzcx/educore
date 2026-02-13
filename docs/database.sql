-- SCRIPT SQL INDUSTRIAL EDUCORE
-- Execute este script no SQL Editor do Supabase para habilitar todas as funções.

-- 1. TABELA DE PROCESSO (Vigilante de Vídeo 80%)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_id UUID NOT NULL,
  content_id UUID NOT NULL,
  percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index para performance de busca de progresso
CREATE INDEX IF NOT EXISTS idx_user_progress_lookup ON user_progress(user_id, trail_id);

-- 2. AJUSTE TABELA DE LIVES (Agendamento Industrial)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lives' AND column_name='start_time') THEN
    ALTER TABLE lives ADD COLUMN start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
  END IF;
END $$;

-- 3. POLÍTICAS DE ACESSO (RLS) - MODO APRESENTAÇÃO
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Demo" ON user_progress FOR ALL USING (true);

-- 4. GARANTIR TABELA DE CHAT
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Chat" ON chat_messages FOR ALL USING (true);
