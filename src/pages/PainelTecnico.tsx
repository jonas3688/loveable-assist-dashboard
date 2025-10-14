// Card 3: Interface do técnico de TI (Painel Principal)
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { AlertCircle, Clock, CheckCircle, Archive } from 'lucide-react';
import { webhookService } from '@/services/webhookService';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PainelTecnico() {
  const { user } = useNewAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  // Query para fila de atendimento
  const { data: filaAtendimento, refetch: refetchFila } = useQuery({
    queryKey: ['fila-atendimento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          *,
          usuarios:usuario_id (
            nome_completo,
            email,
            departamento
          )
        `)
        .eq('status', 'aberto')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Query para meus chamados (técnico logado)
  const { data: meusChamados, refetch: refetchMeus } = useQuery({
    queryKey: ['meus-chamados-tecnico', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: perfilData } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_user_id', user.id)
        .single();

      if (!perfilData) return [];

      const { data, error } = await supabase
        .from('chamados')
        .select(`
          *,
          usuarios:usuario_id (
            nome_completo,
            email,
            departamento
          )
        `)
        .eq('tecnico_id', perfilData.id_usuario)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Query para histórico completo
  const { data: historico } = useQuery({
    queryKey: ['historico-completo', filtroStatus, busca],
    queryFn: async () => {
      let query = supabase
        .from('chamados')
        .select(`
          *,
          usuarios:usuario_id (
            nome_completo,
            email,
            departamento
          ),
          tecnico:tecnico_id (
            nome_completo
          )
        `)
        .order('created_at', { ascending: false });

      if (filtroStatus && filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filtrar por busca no frontend
      if (busca) {
        return data?.filter((c: any) =>
          c.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
          c.usuarios?.nome_completo?.toLowerCase().includes(busca.toLowerCase())
        );
      }

      return data;
    },
  });

  // Realtime subscriptions para todas as listas
  useEffect(() => {
    // Subscription para fila de atendimento
    const filaChannel = supabase
      .channel('painel-fila-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chamados',
          filter: 'status=eq.aberto',
        },
        (payload) => {
          console.log('Fila atualizada:', payload);
          queryClient.invalidateQueries({ queryKey: ['fila-atendimento'] });
        }
      )
      .subscribe();

    // Subscription para todos os chamados (histórico)
    const historicoChannel = supabase
      .channel('painel-historico-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chamados',
        },
        (payload) => {
          console.log('Histórico atualizado:', payload);
          queryClient.invalidateQueries({ queryKey: ['historico-completo', filtroStatus, busca] });
          queryClient.invalidateQueries({ queryKey: ['meus-chamados-tecnico', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(filaChannel);
      supabase.removeChannel(historicoChannel);
    };
  }, [queryClient, user?.id, filtroStatus, busca]);

  const handleAssumirChamado = async (chamadoId: number) => {
    if (!user?.id) return;

    try {
      await webhookService.assumirChamado({
        conversation_id: chamadoId,
        tecnico_id: user.id,
      });

      toast({
        title: 'Sucesso',
        description: 'Chamado assumido com sucesso!',
      });

      refetchFila();
      refetchMeus();
    } catch (error) {
      console.error('Erro ao assumir chamado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível assumir o chamado',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      aberto: { label: 'Aberto', className: 'bg-yellow-500' },
      em_atendimento: { label: 'Em Atendimento', className: 'bg-blue-500' },
      resolvido: { label: 'Resolvido', className: 'bg-green-500' },
      fechado: { label: 'Fechado', className: 'bg-gray-500' },
    };
    
    const config = variants[status] || { label: status, className: 'bg-gray-500' };
    
    return (
      <Badge className={config.className} variant="default">
        {config.label}
      </Badge>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-subtle">
      <PageHeader title="Painel Técnico" />

      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue="fila" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-card border shadow-card">
            <TabsTrigger value="fila" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Fila de Atendimento
            </TabsTrigger>
            <TabsTrigger value="meus" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Meus Chamados
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Histórico Completo
            </TabsTrigger>
          </TabsList>

          {/* Aba 1: Fila de Atendimento */}
          <TabsContent value="fila">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  Fila de Atendimento
                </CardTitle>
                <CardDescription>
                  Chamados aguardando atendimento, organizados por ordem de chegada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Criado há</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filaAtendimento && filaAtendimento.length > 0 ? (
                      filaAtendimento.map((chamado: any) => {
                        const usuario = Array.isArray(chamado.usuarios)
                          ? chamado.usuarios[0]
                          : chamado.usuarios;

                        return (
                          <TableRow key={chamado.id}>
                            <TableCell className="font-mono">#{chamado.id}</TableCell>
                            <TableCell>{chamado.titulo || 'Sem título'}</TableCell>
                            <TableCell>{usuario?.nome_completo || 'N/A'}</TableCell>
                            <TableCell>{usuario?.departamento || 'N/A'}</TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(chamado.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleAssumirChamado(chamado.id)}
                              >
                                Assumir
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhum chamado na fila
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba 2: Meus Chamados */}
          <TabsContent value="meus">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-info" />
                  Meus Chamados
                </CardTitle>
                <CardDescription>
                  Chamados que você está atendendo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado há</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meusChamados && meusChamados.length > 0 ? (
                      meusChamados.map((chamado: any) => {
                        const usuario = Array.isArray(chamado.usuarios)
                          ? chamado.usuarios[0]
                          : chamado.usuarios;

                        return (
                          <TableRow key={chamado.id}>
                            <TableCell className="font-mono">#{chamado.id}</TableCell>
                            <TableCell>{chamado.titulo || 'Sem título'}</TableCell>
                            <TableCell>{usuario?.nome_completo || 'N/A'}</TableCell>
                            <TableCell>{getStatusBadge(chamado.status)}</TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(chamado.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Você não está atendendo nenhum chamado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba 3: Histórico Completo */}
          <TabsContent value="historico">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="w-5 h-5 text-info" />
                      Histórico Completo
                    </CardTitle>
                    <CardDescription>
                      Todos os chamados do sistema com filtros
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-64"
                    />
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                        <SelectItem value="resolvido">Resolvido</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historico && historico.length > 0 ? (
                      historico.map((chamado: any) => {
                        const usuario = Array.isArray(chamado.usuarios)
                          ? chamado.usuarios[0]
                          : chamado.usuarios;
                        const tecnico = Array.isArray(chamado.tecnico)
                          ? chamado.tecnico[0]
                          : chamado.tecnico;

                        return (
                          <TableRow key={chamado.id}>
                            <TableCell className="font-mono">#{chamado.id}</TableCell>
                            <TableCell>{chamado.titulo || 'Sem título'}</TableCell>
                            <TableCell>{usuario?.nome_completo || 'N/A'}</TableCell>
                            <TableCell>{tecnico?.nome_completo || 'Não atribuído'}</TableCell>
                            <TableCell>{getStatusBadge(chamado.status)}</TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(chamado.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhum chamado encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
