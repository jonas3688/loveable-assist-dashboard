import { Json } from "@/integrations/supabase/types";

export interface ChamadoTI {
  id_chamado: number;
  session_id: string;
  nome_funcionario: string | null;
  loja: string | null;
  email: string | null;
  telefone_contato: string | null;
  descricao_problema: string | null;
  departamento: string | null;
  status: string;
  tentativas_ia: number | null;
  tecnico_responsavel: string | null;
  created_at: string;
  updated_at: string;
  solucao_aplicada: string | null;
  anexos: Json; // Alterado para Json conforme o tipo do Supabase
  prioridade: string | null;
  loja_id: number | null;
  funcionario_id: number | null;
  assigned_func_ti_id: number | null;
}

export interface FuncionarioTI {
  id: number;
  nome: string;
  email: string;
  permissao: string;
  senha_hash: string;
}