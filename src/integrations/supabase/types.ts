export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agendamentos_visitas: {
        Row: {
          codigo_loja: string | null
          created_at: string | null
          data_visita: string | null
          hora_visita: string | null
          id: number
          id_cliente: number | null
          interesses_cliente: string | null
          status_venda: string | null
          veiculo: string | null
          vendedor_responsavel: string | null
        }
        Insert: {
          codigo_loja?: string | null
          created_at?: string | null
          data_visita?: string | null
          hora_visita?: string | null
          id?: never
          id_cliente?: number | null
          interesses_cliente?: string | null
          status_venda?: string | null
          veiculo?: string | null
          vendedor_responsavel?: string | null
        }
        Update: {
          codigo_loja?: string | null
          created_at?: string | null
          data_visita?: string | null
          hora_visita?: string | null
          id?: never
          id_cliente?: number | null
          interesses_cliente?: string | null
          status_venda?: string | null
          veiculo?: string | null
          vendedor_responsavel?: string | null
        }
        Relationships: []
      }
      campanhas_engajamento: {
        Row: {
          conteudo_mensagem: string
          created_at: string | null
          data_envio_agendado: string | null
          data_evento: string | null
          id: number
          link_opcional: string | null
          publico_alvo: string | null
          status: string
          tipo_campanha: string
          titulo_campanha: string
          updated_at: string | null
        }
        Insert: {
          conteudo_mensagem: string
          created_at?: string | null
          data_envio_agendado?: string | null
          data_evento?: string | null
          id?: number
          link_opcional?: string | null
          publico_alvo?: string | null
          status?: string
          tipo_campanha: string
          titulo_campanha: string
          updated_at?: string | null
        }
        Update: {
          conteudo_mensagem?: string
          created_at?: string | null
          data_envio_agendado?: string | null
          data_evento?: string | null
          id?: number
          link_opcional?: string | null
          publico_alvo?: string | null
          status?: string
          tipo_campanha?: string
          titulo_campanha?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      carros_estoque: {
        Row: {
          ano_fabricacao: number
          ano_modelo: number
          carroceria: Database["public"]["Enums"]["tipo_carroceria"] | null
          codigo_loja: string | null
          combustivel: Database["public"]["Enums"]["tipo_combustivel"] | null
          cor: string | null
          created_at: string | null
          data_entrada: string | null
          data_venda: string | null
          descricao_publica: string | null
          fotos: Json | null
          id: string
          marca: string
          modelo: string
          motorizacao: string | null
          numero_portas: number | null
          observacoes_internas: string | null
          opcionais: Json | null
          placa: string | null
          potencia_cv: number | null
          preco_compra: number | null
          preco_venda: number | null
          quilometragem: number | null
          renavam: string | null
          status: Database["public"]["Enums"]["status_carro"] | null
          transmissao: Database["public"]["Enums"]["tipo_transmissao"] | null
          unico_dono: boolean | null
          updated_at: string | null
          versao: string | null
          vin: string | null
        }
        Insert: {
          ano_fabricacao: number
          ano_modelo: number
          carroceria?: Database["public"]["Enums"]["tipo_carroceria"] | null
          codigo_loja?: string | null
          combustivel?: Database["public"]["Enums"]["tipo_combustivel"] | null
          cor?: string | null
          created_at?: string | null
          data_entrada?: string | null
          data_venda?: string | null
          descricao_publica?: string | null
          fotos?: Json | null
          id?: string
          marca: string
          modelo: string
          motorizacao?: string | null
          numero_portas?: number | null
          observacoes_internas?: string | null
          opcionais?: Json | null
          placa?: string | null
          potencia_cv?: number | null
          preco_compra?: number | null
          preco_venda?: number | null
          quilometragem?: number | null
          renavam?: string | null
          status?: Database["public"]["Enums"]["status_carro"] | null
          transmissao?: Database["public"]["Enums"]["tipo_transmissao"] | null
          unico_dono?: boolean | null
          updated_at?: string | null
          versao?: string | null
          vin?: string | null
        }
        Update: {
          ano_fabricacao?: number
          ano_modelo?: number
          carroceria?: Database["public"]["Enums"]["tipo_carroceria"] | null
          codigo_loja?: string | null
          combustivel?: Database["public"]["Enums"]["tipo_combustivel"] | null
          cor?: string | null
          created_at?: string | null
          data_entrada?: string | null
          data_venda?: string | null
          descricao_publica?: string | null
          fotos?: Json | null
          id?: string
          marca?: string
          modelo?: string
          motorizacao?: string | null
          numero_portas?: number | null
          observacoes_internas?: string | null
          opcionais?: Json | null
          placa?: string | null
          potencia_cv?: number | null
          preco_compra?: number | null
          preco_venda?: number | null
          quilometragem?: number | null
          renavam?: string | null
          status?: Database["public"]["Enums"]["status_carro"] | null
          transmissao?: Database["public"]["Enums"]["tipo_transmissao"] | null
          unico_dono?: boolean | null
          updated_at?: string | null
          versao?: string | null
          vin?: string | null
        }
        Relationships: []
      }
      chamados_ti: {
        Row: {
          created_at: string | null
          departamento: string | null
          descricao_problema: string | null
          email: string | null
          id_chamado: number
          loja: string | null
          nome_funcionario: string | null
          session_id: string
          solucao_aplicada: string | null
          status: string
          tecnico_responsavel: string | null
          telefone_contato: string | null
          tentativas_ia: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          departamento?: string | null
          descricao_problema?: string | null
          email?: string | null
          id_chamado?: never
          loja?: string | null
          nome_funcionario?: string | null
          session_id: string
          solucao_aplicada?: string | null
          status?: string
          tecnico_responsavel?: string | null
          telefone_contato?: string | null
          tentativas_ia?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          departamento?: string | null
          descricao_problema?: string | null
          email?: string | null
          id_chamado?: never
          loja?: string | null
          nome_funcionario?: string | null
          session_id?: string
          solucao_aplicada?: string | null
          status?: string
          tecnico_responsavel?: string | null
          telefone_contato?: string | null
          tentativas_ia?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cpf: string | null
          data_nascimento: string | null
          data_ultima_compra: string | null
          email: string | null
          id_cliente: number
          interesses: string | null
          ja_comprou_carro: boolean | null
          nome_completo: string | null
          primeiro_contato_em: string | null
          status_cadastro: string | null
          telefone: string
        }
        Insert: {
          cpf?: string | null
          data_nascimento?: string | null
          data_ultima_compra?: string | null
          email?: string | null
          id_cliente?: never
          interesses?: string | null
          ja_comprou_carro?: boolean | null
          nome_completo?: string | null
          primeiro_contato_em?: string | null
          status_cadastro?: string | null
          telefone: string
        }
        Update: {
          cpf?: string | null
          data_nascimento?: string | null
          data_ultima_compra?: string | null
          email?: string | null
          id_cliente?: never
          interesses?: string | null
          ja_comprou_carro?: boolean | null
          nome_completo?: string | null
          primeiro_contato_em?: string | null
          status_cadastro?: string | null
          telefone?: string
        }
        Relationships: []
      }
      clientes_compradores: {
        Row: {
          acompanhamento_pos_venda: Json | null
          ano_modelo: number | null
          carro_comprado: string
          chassi: string | null
          cor: string | null
          cpf: string | null
          data_entrega: string | null
          data_nascimento: string | null
          data_ultima_compra: string
          email: string | null
          id_cliente: number
          id_cliente_comprador: number
          inscrito_pos_venda: boolean | null
          interesses: string | null
          ja_comprou_carro: boolean | null
          nome_completo: string | null
          placa: string | null
          primeiro_contato_em: string | null
          status_cadastro: string | null
          telefone: string
          valor_compra: number | null
          vendedor_responsavel: string | null
        }
        Insert: {
          acompanhamento_pos_venda?: Json | null
          ano_modelo?: number | null
          carro_comprado: string
          chassi?: string | null
          cor?: string | null
          cpf?: string | null
          data_entrega?: string | null
          data_nascimento?: string | null
          data_ultima_compra: string
          email?: string | null
          id_cliente: number
          id_cliente_comprador?: never
          inscrito_pos_venda?: boolean | null
          interesses?: string | null
          ja_comprou_carro?: boolean | null
          nome_completo?: string | null
          placa?: string | null
          primeiro_contato_em?: string | null
          status_cadastro?: string | null
          telefone: string
          valor_compra?: number | null
          vendedor_responsavel?: string | null
        }
        Update: {
          acompanhamento_pos_venda?: Json | null
          ano_modelo?: number | null
          carro_comprado?: string
          chassi?: string | null
          cor?: string | null
          cpf?: string | null
          data_entrega?: string | null
          data_nascimento?: string | null
          data_ultima_compra?: string
          email?: string | null
          id_cliente?: number
          id_cliente_comprador?: never
          inscrito_pos_venda?: boolean | null
          interesses?: string | null
          ja_comprou_carro?: boolean | null
          nome_completo?: string | null
          placa?: string | null
          primeiro_contato_em?: string | null
          status_cadastro?: string | null
          telefone?: string
          valor_compra?: number | null
          vendedor_responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_compradores_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id_cliente"]
          },
        ]
      }
      documents: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_posvenda: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_ti: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      feedbacks_posvenda: {
        Row: {
          categoria: string | null
          created_at: string
          detalhes_completos: string
          id: number
          nome_cliente: string | null
          resumo_problema: string | null
          sentimento_cliente: string | null
          session_id: string | null
          status: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          detalhes_completos: string
          id?: number
          nome_cliente?: string | null
          resumo_problema?: string | null
          sentimento_cliente?: string | null
          session_id?: string | null
          status?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          detalhes_completos?: string
          id?: number
          nome_cliente?: string | null
          resumo_problema?: string | null
          sentimento_cliente?: string | null
          session_id?: string | null
          status?: string
        }
        Relationships: []
      }
      historico_chat: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      historico_ti: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      leads_engajamento: {
        Row: {
          created_at: string
          data_proximo_contato: string | null
          id: number
          nome_cliente: string | null
          notas_da_conversa: string | null
          session_id: string
          status_lead: string
          ultimo_contato_bot: string | null
          ultimo_contato_cliente: string | null
        }
        Insert: {
          created_at?: string
          data_proximo_contato?: string | null
          id?: number
          nome_cliente?: string | null
          notas_da_conversa?: string | null
          session_id: string
          status_lead?: string
          ultimo_contato_bot?: string | null
          ultimo_contato_cliente?: string | null
        }
        Update: {
          created_at?: string
          data_proximo_contato?: string | null
          id?: number
          nome_cliente?: string | null
          notas_da_conversa?: string | null
          session_id?: string
          status_lead?: string
          ultimo_contato_bot?: string | null
          ultimo_contato_cliente?: string | null
        }
        Relationships: []
      }
      respostas_cem_csi: {
        Row: {
          classificacao_nps: string | null
          created_at: string
          e_nota_10: boolean | null
          id: number
          id_arquivo_origem: string | null
          mensagem_enviada: string | null
          modelo_veiculo: string
          nome_cliente: string | null
          nota: number
          telefone_cliente: string | null
        }
        Insert: {
          classificacao_nps?: string | null
          created_at?: string
          e_nota_10?: boolean | null
          id?: number
          id_arquivo_origem?: string | null
          mensagem_enviada?: string | null
          modelo_veiculo: string
          nome_cliente?: string | null
          nota: number
          telefone_cliente?: string | null
        }
        Update: {
          classificacao_nps?: string | null
          created_at?: string
          e_nota_10?: boolean | null
          id?: number
          id_arquivo_origem?: string | null
          mensagem_enviada?: string | null
          modelo_veiculo?: string
          nome_cliente?: string | null
          nota?: number
          telefone_cliente?: string | null
        }
        Relationships: []
      }
      session_state: {
        Row: {
          active_agent: string | null
          last_updated_at: string | null
          sessionId: string
        }
        Insert: {
          active_agent?: string | null
          last_updated_at?: string | null
          sessionId: string
        }
        Update: {
          active_agent?: string | null
          last_updated_at?: string | null
          sessionId?: string
        }
        Relationships: []
      }
      vendedores: {
        Row: {
          codigo_loja: string
          email: string
          id_vendedor: number
          nome: string
          telefone: string
        }
        Insert: {
          codigo_loja: string
          email: string
          id_vendedor?: number
          nome: string
          telefone: string
        }
        Update: {
          codigo_loja?: string
          email?: string
          id_vendedor?: number
          nome?: string
          telefone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { filter: Json; match_count: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_posvenda: {
        Args: { filter: Json; match_count: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_ti: {
        Args:
          | { filter: Json; match_count: number; query_embedding: string }
          | {
              match_count: number
              match_threshold: number
              query_embedding: string
            }
          | { match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      status_carro:
        | "Disponível"
        | "Vendido"
        | "Em preparação"
        | "Manutenção"
        | "Reservado"
      tipo_carroceria:
        | "Sedan"
        | "Hatch"
        | "SUV"
        | "Picape"
        | "Coupé"
        | "Minivan"
        | "Van"
        | "Outro"
      tipo_combustivel:
        | "Flex"
        | "Gasolina"
        | "Etanol"
        | "Diesel"
        | "Híbrido"
        | "Elétrico"
      tipo_transmissao: "Manual" | "Automático" | "CVT" | "Automatizado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status_carro: [
        "Disponível",
        "Vendido",
        "Em preparação",
        "Manutenção",
        "Reservado",
      ],
      tipo_carroceria: [
        "Sedan",
        "Hatch",
        "SUV",
        "Picape",
        "Coupé",
        "Minivan",
        "Van",
        "Outro",
      ],
      tipo_combustivel: [
        "Flex",
        "Gasolina",
        "Etanol",
        "Diesel",
        "Híbrido",
        "Elétrico",
      ],
      tipo_transmissao: ["Manual", "Automático", "CVT", "Automatizado"],
    },
  },
} as const
