-- Criar tabela de histórico de chamados se não existir
CREATE TABLE IF NOT EXISTS public.chamados_ti_historico (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chamado_id BIGINT NOT NULL REFERENCES public.chamados_ti(id_chamado) ON DELETE CASCADE,
  actor TEXT NOT NULL CHECK (actor IN ('usuario', 'ia', 'humano')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar campos que podem estar faltando na tabela chamados_ti
ALTER TABLE public.chamados_ti 
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'media',
ADD COLUMN IF NOT EXISTS loja_id BIGINT,
ADD COLUMN IF NOT EXISTS funcionario_id BIGINT,
ADD COLUMN IF NOT EXISTS assigned_func_ti_id BIGINT REFERENCES public.funcionarios_ti(id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chamados_ti_historico_chamado_id ON public.chamados_ti_historico(chamado_id);
CREATE INDEX IF NOT EXISTS idx_chamados_ti_historico_created_at ON public.chamados_ti_historico(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.chamados_ti_historico ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (públicas por enquanto)
DROP POLICY IF EXISTS "Allow read access to chamados_ti_historico" ON public.chamados_ti_historico;
CREATE POLICY "Allow read access to chamados_ti_historico" 
ON public.chamados_ti_historico FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to chamados_ti_historico" ON public.chamados_ti_historico;
CREATE POLICY "Allow insert access to chamados_ti_historico" 
ON public.chamados_ti_historico FOR INSERT WITH CHECK (true);