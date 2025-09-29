import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangeCurrentPasswordRequest {
  funcionario_id: number;
  senha_atual: string;
  nova_senha: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { funcionario_id, senha_atual, nova_senha }: ChangeCurrentPasswordRequest = await req.json();

    if (!funcionario_id || !senha_atual || !nova_senha) {
      return new Response(
        JSON.stringify({ error: 'Funcionário ID, senha atual e nova senha são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (nova_senha.length < 6) {
      return new Response(
        JSON.stringify({ error: 'A nova senha deve ter pelo menos 6 caracteres' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar o funcionário atual
    const { data: funcionario, error: fetchError } = await supabase
      .from('funcionarios_ti')
      .select('senha_hash')
      .eq('id', funcionario_id)
      .single();

    if (fetchError || !funcionario) {
      console.error('Erro ao buscar funcionário:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Funcionário não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se a senha atual está correta
    const { data: senhaValida, error: verifyError } = await supabase
      .rpc('verify_password', { 
        password: senha_atual, 
        hash: funcionario.senha_hash 
      });

    if (verifyError) {
      console.error('Erro ao verificar senha:', verifyError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar senha atual' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!senhaValida) {
      return new Response(
        JSON.stringify({ error: 'Senha atual incorreta' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Gerar hash da nova senha
    const { data: novaHashSenha, error: hashError } = await supabase
      .rpc('hash_password', { password: nova_senha });

    if (hashError || !novaHashSenha) {
      console.error('Erro ao gerar hash da nova senha:', hashError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar nova senha' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Atualizar senha no banco
    const { error: updateError } = await supabase
      .from('funcionarios_ti')
      .update({ senha_hash: novaHashSenha })
      .eq('id', funcionario_id);

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar senha' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Senha alterada com sucesso' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na edge function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});