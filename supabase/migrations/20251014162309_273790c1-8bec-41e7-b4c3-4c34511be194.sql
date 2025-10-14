-- Card 1: Migração para Supabase Auth
-- Adicionar trigger para criar perfil automaticamente quando usuário se cadastra

-- Modificar tabela usuarios para usar auth.users
ALTER TABLE public.usuarios 
  DROP CONSTRAINT IF EXISTS usuarios_auth_user_id_fkey,
  ADD CONSTRAINT usuarios_auth_user_id_fkey 
    FOREIGN KEY (auth_user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Criar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (
    auth_user_id,
    nome_completo,
    email,
    tipo_usuario,
    departamento
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'usuario'),
    COALESCE(NEW.raw_user_meta_data->>'departamento', '')
  );
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Habilitar RLS na tabela usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.usuarios
  FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Políticas para chamados
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios chamados"
  ON public.chamados
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.id_usuario = chamados.usuario_id
      AND usuarios.auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.id_usuario = chamados.tecnico_id
      AND usuarios.auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'tecnico'
    )
  );

CREATE POLICY "Usuários podem criar chamados"
  ON public.chamados
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.id_usuario = chamados.usuario_id
      AND usuarios.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Técnicos podem atualizar chamados"
  ON public.chamados
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'tecnico'
    )
  );

-- Políticas para mensagens_chat
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver mensagens de seus chamados"
  ON public.mensagens_chat
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chamados c
      JOIN public.usuarios u ON (u.id_usuario = c.usuario_id OR u.id_usuario = c.tecnico_id)
      WHERE c.id = mensagens_chat.chamado_id
      AND u.auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.tipo_usuario = 'tecnico'
    )
  );

CREATE POLICY "Usuários podem inserir mensagens em seus chamados"
  ON public.mensagens_chat
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chamados c
      JOIN public.usuarios u ON (u.id_usuario = c.usuario_id OR u.id_usuario = c.tecnico_id)
      WHERE c.id = mensagens_chat.chamado_id
      AND u.auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id_usuario = mensagens_chat.remetente_id
      AND u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'tecnico'
    )
  );