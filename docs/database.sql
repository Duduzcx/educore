
-- SCRIPT DE SINCRONIZAÇÃO DO BANCO DE DADOS (RODAR NO SQL EDITOR DO SUPABASE)

-- 1. Atualizar a tabela de trilhas com colunas administrativas e de mídia
ALTER TABLE trails ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE trails ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE trails ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all';
ALTER TABLE trails ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE trails ADD COLUMN IF NOT EXISTS modules_count INTEGER DEFAULT 0;

-- 2. Garantir que a tabela de progresso do usuário existe
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
  percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, trail_id)
);

-- 3. Habilitar RLS (Row Level Security) se necessário
ALTER TABLE trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas básicas de acesso (Exemplo: Leitura pública para trilhas ativas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on active trails') THEN
        CREATE POLICY "Allow public read access on active trails" ON trails FOR SELECT USING (status = 'active' OR status = 'published');
    END IF;
END $$;
