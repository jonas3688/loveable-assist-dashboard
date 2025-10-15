import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Building, 
  Calendar, 
  Mail,
  AlertCircle, 
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  UserCog,
  Ban
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { ChatComponent } from './ChatComponent';

interface ChamadoVisualizacaoProps {
  chamado: any;
  isOpen: boolean;
  onClose: () => void;
  onChamadoAtualizado?: () => void;
}

export const ChamadoVisualizacao = ({ 
  chamado, 
  isOpen, 
  onClose, 
  onChamadoAtualizado 
}: ChamadoVisualizacaoProps) => {
  const [solucaoAplicada, setSolucaoAplicada] = useState(chamado.solucao_aplicada || "");
  const [novoStatus, setNovoStatus] = useState(chamado.status);
  const [transferirDialogOpen, setTransferirDialogOpen] = useState(false);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<number | null>(null);
  const [finalizarDialogOpen, setFinalizarDialogOpen] = useState(false);
  const [tipoFinalizacao, setTipoFinalizacao] = useState<'concluido' | 'cancelado' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { perfil } = useNewAuth();

  // Query para buscar técnicos disponíveis
  const { data: tecnicos } = useQuery({
    queryKey: ['tecnicos-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id_usuario, nome_completo')
        .eq('tipo_usuario', 'tecnico');
      
      if (error) throw error;
      return data;
    },
  });

  // Query para buscar histórico
  const { data: historico } = useQuery({
    queryKey: ['historico-chamado', chamado.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chamados_ti_historico')
        .select('*')
        .eq('chamado_id', chamado.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const finalizarChamadoMutation = useMutation({
    mutationFn: async (tipo: 'concluido' | 'cancelado') => {
      const statusFinal = tipo === 'concluido' ? 'resolvido' : 'fechado';
      
      const { error } = await supabase
        .from("chamados")
        .update({
          status: statusFinal,
          solucao_aplicada: tipo === 'concluido' ? solucaoAplicada : 'Chamado cancelado',
        })
        .eq("id", chamado.id);

      if (error) throw error;

      // Adicionar ao histórico
      await supabase
        .from('chamados_ti_historico')
        .insert({
          chamado_id: chamado.id,
          actor: perfil?.nome_completo || 'Sistema',
          message: tipo === 'concluido' 
            ? `Chamado concluído. Solução: ${solucaoAplicada}`
            : 'Chamado cancelado',
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila-atendimento'] });
      queryClient.invalidateQueries({ queryKey: ['meus-chamados-tecnico'] });
      queryClient.invalidateQueries({ queryKey: ['historico-completo'] });
      queryClient.invalidateQueries({ queryKey: ['historico-chamado', chamado.id] });
      onChamadoAtualizado?.();
      toast({
        title: "Chamado finalizado",
        description: tipoFinalizacao === 'concluido' 
          ? `Chamado #${chamado.id} foi concluído com sucesso.`
          : `Chamado #${chamado.id} foi cancelado.`,
      });
      setFinalizarDialogOpen(false);
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao finalizar chamado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o chamado.",
        variant: "destructive",
      });
    },
  });

  const transferirChamadoMutation = useMutation({
    mutationFn: async () => {
      if (!tecnicoSelecionado) return;

      const { error } = await supabase
        .from("chamados")
        .update({
          tecnico_id: tecnicoSelecionado,
        })
        .eq("id", chamado.id);

      if (error) throw error;

      // Buscar nome do novo técnico
      const { data: novoTecnico } = await supabase
        .from('usuarios')
        .select('nome_completo')
        .eq('id_usuario', tecnicoSelecionado)
        .single();

      // Adicionar ao histórico
      await supabase
        .from('chamados_ti_historico')
        .insert({
          chamado_id: chamado.id,
          actor: perfil?.nome_completo || 'Sistema',
          message: `Chamado transferido para: ${novoTecnico?.nome_completo || 'Técnico'}`,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila-atendimento'] });
      queryClient.invalidateQueries({ queryKey: ['meus-chamados-tecnico'] });
      queryClient.invalidateQueries({ queryKey: ['historico-completo'] });
      queryClient.invalidateQueries({ queryKey: ['historico-chamado', chamado.id] });
      onChamadoAtualizado?.();
      toast({
        title: "Chamado transferido",
        description: "Chamado transferido com sucesso.",
      });
      setTransferirDialogOpen(false);
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao transferir chamado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível transferir o chamado.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aberto":
        return <AlertCircle className="w-4 h-4" />;
      case "em_atendimento":
        return <Clock className="w-4 h-4" />;
      case "resolvido":
        return <CheckCircle className="w-4 h-4" />;
      case "fechado":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aberto":
        return "Aberto";
      case "em_atendimento":
        return "Em Atendimento";
      case "resolvido":
        return "Resolvido";
      case "fechado":
        return "Fechado";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "aberto":
        return "default" as const;
      case "em_atendimento":
        return "secondary" as const;
      case "resolvido":
        return "default" as const;
      case "fechado":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const podeEditar = chamado.status === "em_atendimento";
  const usuario = Array.isArray(chamado.usuarios) ? chamado.usuarios[0] : chamado.usuarios;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-gradient-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getStatusIcon(chamado.status)}
              </div>
              Chamado #{chamado.id}
            </DialogTitle>
            <DialogDescription>
              {chamado.titulo || 'Detalhes do chamado'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Coluna Principal (2/3) - Chat e Ações */}
            <div className="col-span-2 space-y-4">
              {/* Informações do Solicitante */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações do Solicitante
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Nome</Label>
                    <p className="font-medium">{usuario?.nome_completo || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{usuario?.email || "Não informado"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Departamento</Label>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{usuario?.departamento || "Não informado"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-3 block">Status</Label>
                    <Badge variant={getStatusVariant(chamado.status)} className="gap-2">
                      {getStatusIcon(chamado.status)}
                      {getStatusLabel(chamado.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Data de Abertura</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {format(new Date(chamado.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Component */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChatComponent chamadoId={chamado.id} />
                </CardContent>
              </Card>

              {/* Solução e Ações (apenas para técnicos em chamados em atendimento) */}
              {podeEditar && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Resolução do Chamado
                    </CardTitle>
                    <CardDescription>
                      Descreva a solução aplicada ao problema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="solucao">Solução Aplicada</Label>
                      <Textarea
                        id="solucao"
                        placeholder="Descreva detalhadamente a solução aplicada..."
                        value={solucaoAplicada}
                        onChange={(e) => setSolucaoAplicada(e.target.value)}
                        className="min-h-[120px] mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setTransferirDialogOpen(true)}
                        className="flex-1"
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        Transferir Chamado
                      </Button>
                      <Button
                        onClick={() => setFinalizarDialogOpen(true)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalizar Chamado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Coluna Lateral (1/3) - Histórico */}
            <div className="col-span-1">
              <Card className="sticky top-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Histórico de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[calc(90vh-280px)] overflow-y-auto">
                  {historico && historico.length > 0 ? (
                    <div className="space-y-3">
                      {historico.map((item: any) => (
                        <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium break-words">{item.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.actor} • {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma atividade registrada
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Transferência */}
      <Dialog open={transferirDialogOpen} onOpenChange={setTransferirDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir Chamado</DialogTitle>
            <DialogDescription>
              Selecione o técnico para o qual deseja transferir este chamado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Técnico</Label>
              <Select 
                value={tecnicoSelecionado?.toString()} 
                onValueChange={(value) => setTecnicoSelecionado(Number(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos?.map((tecnico) => (
                    <SelectItem key={tecnico.id_usuario} value={tecnico.id_usuario.toString()}>
                      {tecnico.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferirDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => transferirChamadoMutation.mutate()}
              disabled={!tecnicoSelecionado || transferirChamadoMutation.isPending}
            >
              {transferirChamadoMutation.isPending ? 'Transferindo...' : 'Transferir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Finalização */}
      <AlertDialog open={finalizarDialogOpen} onOpenChange={setFinalizarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Como deseja finalizar este chamado?</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha uma das opções abaixo para finalizar o atendimento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="default"
              onClick={() => {
                setTipoFinalizacao('concluido');
                finalizarChamadoMutation.mutate('concluido');
              }}
              disabled={!solucaoAplicada.trim() || finalizarChamadoMutation.isPending}
              className="w-full justify-start h-auto py-4"
            >
              <CheckCircle className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Chamado Concluído</div>
                <div className="text-xs opacity-90">Problema resolvido com sucesso</div>
              </div>
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setTipoFinalizacao('cancelado');
                finalizarChamadoMutation.mutate('cancelado');
              }}
              disabled={finalizarChamadoMutation.isPending}
              className="w-full justify-start h-auto py-4"
            >
              <Ban className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Chamado Cancelado</div>
                <div className="text-xs opacity-90">Cancelar este atendimento</div>
              </div>
            </Button>
            {!solucaoAplicada.trim() && (
              <p className="text-xs text-destructive text-center">
                * É necessário preencher a solução para concluir o chamado
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={finalizarChamadoMutation.isPending}>
              Voltar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
