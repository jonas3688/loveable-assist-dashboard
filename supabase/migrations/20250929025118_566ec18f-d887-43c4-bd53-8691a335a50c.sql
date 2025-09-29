-- Criar enum para permissões
CREATE TYPE permissao_funcionario AS ENUM ('admin', 'padrao');

-- Adicionar colunas na tabela funcionarios_ti (sem UNIQUE inicialmente)
ALTER TABLE funcionarios_ti 
ADD COLUMN email TEXT,
ADD COLUMN permissao permissao_funcionario NOT NULL DEFAULT 'padrao',
ADD COLUMN senha_hash TEXT;

-- Criar função para hash de senha (usando crypt do pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para criar hash de senha
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Função para verificar senha
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql;

-- Atualizar registros existentes com dados de exemplo
UPDATE funcionarios_ti SET 
  email = 'ana.paula@empresa.com',
  permissao = 'admin',
  senha_hash = hash_password('123')
WHERE nome = 'Ana Paula';

UPDATE funcionarios_ti SET 
  email = 'carlos.silva@empresa.com', 
  permissao = 'padrao',
  senha_hash = hash_password('123')
WHERE nome = 'Carlos Silva';

UPDATE funcionarios_ti SET 
  email = 'maria.santos@empresa.com',
  permissao = 'padrao', 
  senha_hash = hash_password('123')
WHERE nome = 'Maria Santos';

-- Para funcionários sem email definido, criar emails genéricos
UPDATE funcionarios_ti SET 
  email = LOWER(REPLACE(nome, ' ', '.')) || '@empresa.com',
  permissao = COALESCE(permissao, 'padrao'),
  senha_hash = hash_password('123')
WHERE email IS NULL;

-- Agora adicionar as constraints necessárias
ALTER TABLE funcionarios_ti 
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN senha_hash SET NOT NULL;

-- Adicionar constraint unique no email
ALTER TABLE funcionarios_ti ADD CONSTRAINT funcionarios_ti_email_unique UNIQUE (email);