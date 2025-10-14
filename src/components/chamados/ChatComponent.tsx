// Card 4: Componente central de chat reutilizável
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { webhookService } from '@/services/webhookService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatComponentProps {
  chamadoId: number | null;
  onChamadoCreated?: (id: number) => void;
}

export function ChatComponent({ chamadoId, onChamadoCreated }: ChatComponentProps) {
  const { perfil, user } = useNewAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query para buscar mensagens
  const { data: mensagens, isLoading } = useQuery({
    queryKey: ['mensagens-chat', chamadoId],
    queryFn: async () => {
      if (!chamadoId) return [];
      
      const { data, error } = await supabase
        .from('mensagens_chat')
        .select(`
          *,
          usuarios:remetente_id (
            nome_completo,
            tipo_usuario
          )
        `)
        .eq('chamado_id', chamadoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!chamadoId,
  });

  // Realtime subscription para novas mensagens
  useEffect(() => {
    if (!chamadoId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_chat',
          filter: `chamado_id=eq.${chamadoId}`,
        },
        () => {
          // Atualizar lista de mensagens
          queryClient.invalidateQueries({ queryKey: ['mensagens-chat', chamadoId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamadoId, queryClient]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleEnviarMensagem = async () => {
    if (!mensagem.trim() || !perfil || !user) return;

    setEnviando(true);

    try {
      const tipoRemetente = perfil.tipo_usuario === 'tecnico' ? 'tecnico' : 'usuario';
      
      const response = await webhookService.enviarMensagem({
        conversation_id: chamadoId || undefined,
        remetente_id: user.id,
        tipo_remetente: tipoRemetente,
        texto_mensagem: mensagem,
      });

      // Se é um novo chamado, o webhook retorna o novo_chamado_id
      if (!chamadoId && response.novo_chamado_id) {
        onChamadoCreated?.(response.novo_chamado_id);
      }

      setMensagem('');
      
      // Atualizar lista de mensagens
      queryClient.invalidateQueries({ queryKey: ['mensagens-chat', chamadoId] });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="bg-gradient-card border shadow-card h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {chamadoId ? `Chamado #${chamadoId}` : 'Novo Chamado'}
        </CardTitle>
        <CardDescription>
          {chamadoId ? 'Conversa com suporte técnico' : 'Descreva seu problema'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
        {/* Área de mensagens */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Carregando mensagens...
            </div>
          ) : mensagens && mensagens.length > 0 ? (
            mensagens.map((msg: any) => {
              // Mensagens do sistema ou técnico ficam à esquerda, do usuário à direita
              const isOwn = msg.tipo_remetente === 'usuario' && msg.remetente_id === perfil?.id_usuario;
              const usuario = Array.isArray(msg.usuarios) ? msg.usuarios[0] : msg.usuarios;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {msg.tipo_remetente === 'sistema' 
                        ? 'Sistema' 
                        : usuario?.nome_completo || 'Usuário'}
                      {usuario?.tipo_usuario === 'tecnico' && ' (Técnico)'}
                    </div>
                    <div className="text-sm">{msg.conteudo_mensagem}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {chamadoId
                ? 'Nenhuma mensagem ainda'
                : 'Digite uma mensagem para iniciar um chamado'}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensagem */}
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !enviando) {
                handleEnviarMensagem();
              }
            }}
            disabled={enviando}
          />
          <Button onClick={handleEnviarMensagem} disabled={enviando || !mensagem.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
