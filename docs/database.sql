-- SCRIPT SQL DE ESTADO INDUSTRIAL - EDUCORE
-- Execute este script no SQL Editor do Supabase para preparar o banco de dados.

-- 1. Tabela de Progresso de Vídeo (Regra de 80%)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trail_id UUID, -- Referência opcional para facilitar consultas
    content_id UUID, -- Referência ao learning_contents
    percentage INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, content_id)
);

-- 2. Tabela de Chat / Comunicação (Engine de Polo Único)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL, -- Pode ser user.id ou 'aurora-ai'
    receiver_id TEXT NOT NULL,
    message TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Índices de Performance para evitar lentidão (Scalable)
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON public.chat_messages(receiver_id);

-- 4. RLS (Políticas de Segurança - Ajustadas para Demo)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All for Presentation" ON public.user_progress FOR ALL USING (true);
CREATE POLICY "Allow All for Presentation" ON public.chat_messages FOR ALL USING (true);

-- 5. Atualização da tabela de Lives para incluir Horário
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lives' AND column_name='start_time') THEN
        ALTER TABLE public.lives ADD COLUMN start_time TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
