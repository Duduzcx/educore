-- SCRIPT SQL INDUSTRIAL PARA SUPABASE
-- Execute este script no SQL Editor do Supabase para preparar o banco de dados.

-- 1. Tabela de Progresso do Usuário (Vigilante de Vídeo)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trail_id UUID NOT NULL,
    content_id UUID NOT NULL,
    percentage INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, content_id)
);

-- 2. Tabela de Mensagens do Chat (Direct e Aurora)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    message TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Habilitar RLS (Segurança) mas permitir acesso total para demo
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total User Progress" ON public.user_progress FOR ALL USING (true);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Chat" ON public.chat_messages FOR ALL USING (true);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_participants ON public.chat_messages(sender_id, receiver_id);
