-- Habilitar RLS nas tabelas principais
ALTER TABLE public.chamados_ti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios_ti ENABLE ROW LEVEL SECURITY;

-- Políticas para chamados_ti (públicas por enquanto)
DROP POLICY IF EXISTS "Allow all operations on chamados_ti" ON public.chamados_ti;
CREATE POLICY "Allow all operations on chamados_ti" 
ON public.chamados_ti FOR ALL USING (true) WITH CHECK (true);

-- Políticas para funcionarios_ti (públicas por enquanto)
DROP POLICY IF EXISTS "Allow all operations on funcionarios_ti" ON public.funcionarios_ti;
CREATE POLICY "Allow all operations on funcionarios_ti" 
ON public.funcionarios_ti FOR ALL USING (true) WITH CHECK (true);