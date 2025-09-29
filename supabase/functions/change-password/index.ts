import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChangePasswordRequest {
  funcionario_id: number;
  nova_senha: string;
}

Deno.serve(async (req) => {
  console.log('Change password function called')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { funcionario_id, nova_senha }: ChangePasswordRequest = await req.json()

    console.log('Changing password for funcionario:', funcionario_id)

    if (!funcionario_id || !nova_senha) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'ID do funcionário e nova senha são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate password length
    if (nova_senha.length < 6) {
      console.error('Password too short')
      return new Response(
        JSON.stringify({ error: 'A senha deve ter pelo menos 6 caracteres' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Hash the new password using the database function
    console.log('Hashing new password')
    const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password', {
      password: nova_senha
    })

    if (hashError) {
      console.error('Error hashing password:', hashError)
      return new Response(
        JSON.stringify({ error: 'Erro ao processar nova senha' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update the password in the database
    console.log('Updating password in database')
    const { error: updateError } = await supabase
      .from('funcionarios_ti')
      .update({ senha_hash: hashedPassword })
      .eq('id', funcionario_id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar senha no banco de dados' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Password changed successfully for funcionario:', funcionario_id)
    
    return new Response(
      JSON.stringify({ success: true, message: 'Senha alterada com sucesso' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error in change-password function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})