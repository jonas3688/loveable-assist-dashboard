// Card 2: Interface do funcionário ("Meus Chamados")
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChatComponent } from '@/components/chamados/ChatComponent';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MeusChamados() {
  const { perfil } = useNewAuth();
  const queryClient = useQueryClient();
  const [activeChamadoId, setActiveChamadoId] = useState<number | null>(null);

  // Query para buscar chamados do usuário
  const { data: chamados, isLoading } = useQuery({
    queryKey: ['meus-chamados', perfil?.id_usuario],
    queryFn: async () => {
      if (!perfil?.id_usuario) return [];
      
      const { data, error } = await supabase
        .from('chamados')
        .select('*')
        .eq('usuario_id', perfil.id_usuario)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!perfil?.id_usuario,
  });

  // Realtime subscription para novos chamados e atualizações
  useEffect(() => {
    if (!perfil?.id_usuario) return;

    const channel = supabase
      .channel('meus-chamados-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chamados',
          filter: `usuario_id=eq.${perfil.id_usuario}`,
        },
        (payload) => {
          console.log('Chamado atualizado via Realtime:', payload);
          queryClient.invalidateQueries({ queryKey: ['meus-chamados', perfil.id_usuario] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [perfil?.id_usuario, queryClient]);

  const handleNovoChamado = () => {
    setActiveChamadoId(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'aberto': 'bg-yellow-500',
      'em_atendimento': 'bg-blue-500',
      'resolvido': 'bg-green-500',
      'fechado': 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <main className="min-h-screen bg-gradient-subtle">
      <PageHeader title="Meus Chamados" />
      
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Lista de Chamados */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Chamados</CardTitle>
                  <Button onClick={handleNovoChamado} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo
                  </Button>
                </div>
                <CardDescription>
                  Seus chamados de suporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </div>
                ) : chamados && chamados.length > 0 ? (
                  <div className="space-y-2">
                    {chamados.map((chamado) => (
                      <div
                        key={chamado.id}
                        onClick={() => setActiveChamadoId(chamado.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          activeChamadoId === chamado.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-background hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {chamado.titulo || `Chamado #${chamado.id}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(chamado.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </div>
                          </div>
                          <Badge className={getStatusColor(chamado.status)} variant="default">
                            {chamado.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum chamado ainda.
                    <br />
                    Clique em "Novo" para criar.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Chat */}
          <div className="lg:col-span-2">
            <ChatComponent 
              chamadoId={activeChamadoId} 
              onChamadoCreated={setActiveChamadoId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
