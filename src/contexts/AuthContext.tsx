import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface FuncionarioTI {
  id: number;
  nome: string;
  email: string;
  permissao: 'admin' | 'padrao';
}

interface AuthContextType {
  funcionario: FuncionarioTI | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
  needsPasswordChange: boolean;
  setNeedsPasswordChange: (needs: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [funcionario, setFuncionario] = useState<FuncionarioTI | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  const isAdmin = funcionario?.permissao === 'admin';

  useEffect(() => {
    // Verificar se há um funcionário logado no localStorage
    const funcionarioLogado = localStorage.getItem('funcionario_ti');
    if (funcionarioLogado) {
      setFuncionario(JSON.parse(funcionarioLogado));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Primeiro, buscar dados do funcionário
      const { data: funcionarioData, error: funcionarioError } = await supabase
        .from('funcionarios_ti')
        .select('id, nome, email, permissao')
        .eq('email', email)
        .single();

      if (funcionarioError || !funcionarioData) {
        return { success: false, error: 'Funcionário não encontrado' };
      }

      // Buscar o hash da senha
      const { data: senhaData, error: senhaError } = await supabase
        .from('funcionarios_ti')
        .select('senha_hash')
        .eq('email', email)
        .single();

      if (senhaError || !senhaData?.senha_hash) {
        return { success: false, error: 'Erro ao verificar credenciais' };
      }

      // Verificar senha usando a função do banco com o hash correto
      const { data: senhaCorreta, error: verifyError } = await supabase.rpc('verify_password', {
        password: senha,
        hash: senhaData.senha_hash
      });

      if (verifyError) {
        console.error('Erro na verificação:', verifyError);
        return { success: false, error: 'Erro ao verificar credenciais' };
      }

      if (!senhaCorreta) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Verificar se a senha é a padrão (123) para forçar mudança
      const { data: isPadraoSenha } = await supabase.rpc('verify_password', {
        password: '123',
        hash: senhaData.senha_hash
      });

      if (isPadraoSenha) {
        setNeedsPasswordChange(true);
      }

      setFuncionario(funcionarioData);
      localStorage.setItem('funcionario_ti', JSON.stringify(funcionarioData));
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const logout = () => {
    setFuncionario(null);
    setNeedsPasswordChange(false);
    localStorage.removeItem('funcionario_ti');
  };

  return (
    <AuthContext.Provider value={{ 
      funcionario, 
      login, 
      logout, 
      isAdmin, 
      loading, 
      needsPasswordChange, 
      setNeedsPasswordChange 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}