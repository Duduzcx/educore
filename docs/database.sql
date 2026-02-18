
-- SCRIPT DE ATUALIZAÇÃO INDUSTRIAL COMPROMISSO
-- Rode este script no Editor SQL do Supabase para garantir que as lives funcionem corretamente.

-- 1. Garante que a tabela de lives possui a coluna status
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lives' AND column_name='status') THEN
        ALTER TABLE public.lives ADD COLUMN status text DEFAULT 'scheduled';
    END IF;
END $$;

-- 2. Tabela de mensagens da live (Realtime Chat)
CREATE TABLE IF NOT EXISTS public.live_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    live_id uuid REFERENCES public.lives(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    user_name text,
    content text,
    is_question boolean DEFAULT false,
    is_answered boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Habilita Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE lives;
ALTER PUBLICATION supabase_realtime ADD TABLE live_messages;

-- 4. Políticas de Segurança (Modo Aberto para Apresentação)
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total lives" ON public.lives FOR ALL USING (true);
CREATE POLICY "Acesso total mensagens" ON public.live_messages FOR ALL USING (true);
