-- SCRIPT SQL PARA EDUCORE INDUSTRIAL
-- RODE ESTE CODIGO NO SQL EDITOR DO SUPABASE PARA ATUALIZAR O BANCO

-- 1. Garante que a tabela lives tem os campos obrigatorios
ALTER TABLE public.lives 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS teacher_name TEXT,
ADD COLUMN IF NOT EXISTS youtube_id TEXT DEFAULT 'rfscVS0vtbw';

-- 2. Garante que learning_contents suporta Quizzes JSON
ALTER TABLE public.learning_contents 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Garante que profiles tem controle social
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_financial_aid_eligible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_financial_simulation TIMESTAMP WITH TIME ZONE;

-- 4. Tabela de Chat (Necessaria para a Mentoria)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id),
    receiver_id TEXT, -- Pode ser UUID ou "aurora-ai"
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_read BOOLEAN DEFAULT FALSE,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT
);

-- 5. Habilitar Realtime para Chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
