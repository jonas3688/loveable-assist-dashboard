// Card 1: Novo contexto de autenticação usando Supabase Auth
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

interface UsuarioPerfil {
  id_usuario: number;
  auth_user_id: string;
  nome_completo: string;
  email: string;
  tipo_usuario: 'usuario' | 'tecnico';
  departamento: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  perfil: UsuarioPerfil | null;
  loading: boolean;
  isTecnico: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const NewAuthContext = createContext<AuthContextType | undefined>(undefined);

export function NewAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);

  const isTecnico = perfil?.tipo_usuario === 'tecnico';

  // Carregar perfil do usuário
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) throw error;
      setPerfil(data as UsuarioPerfil);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setPerfil(null);
    }
  };

  // Configurar listener de autenticação
  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Carregar perfil em um setTimeout para evitar bloqueio
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setPerfil(null);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setPerfil(null);
  };

  return (
    <NewAuthContext.Provider value={{ 
      user,
      session,
      perfil,
      loading,
      isTecnico,
      login,
      logout
    }}>
      {children}
    </NewAuthContext.Provider>
  );
}

export function useNewAuth() {
  const context = useContext(NewAuthContext);
  if (context === undefined) {
    throw new Error('useNewAuth must be used within a NewAuthProvider');
  }
  return context;
}
