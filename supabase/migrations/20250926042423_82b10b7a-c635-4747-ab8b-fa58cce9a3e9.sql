-- Corrigir registros existentes na tabela chamados_ti
-- Atualizar tecnico_responsavel baseado no assigned_func_ti_id correto
UPDATE chamados_ti 
SET tecnico_responsavel = funcionarios_ti.nome
FROM funcionarios_ti 
WHERE chamados_ti.assigned_func_ti_id = funcionarios_ti.id 
  AND chamados_ti.assigned_func_ti_id IS NOT NULL
  AND (chamados_ti.tecnico_responsavel IS NULL 
       OR chamados_ti.tecnico_responsavel = 'Ana Paula');