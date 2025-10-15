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
  UserCog
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

  const atualizarChamadoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("chamados")
        .update({
          status: novoStatus,
          solucao_aplicada: solucaoAplicada,
        })
        .eq("id", chamado.id);

      if (error) throw error;

      // Adicionar ao histórico
      await supabase
        .from('chamados_ti_historico')
        .insert({
          chamado_id: chamado.id,
          actor: perfil?.nome_completo || 'Sistema',
          message: `Status alterado para: ${getStatusLabel(novoStatus)}${solucaoAplicada ? '. Solução: ' + solucaoAplicada : ''}`,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila-atendimento'] });
      queryClient.invalidateQueries({ queryKey: ['meus-chamados-tecnico'] });
      queryClient.invalidateQueries({ queryKey: ['historico-completo'] });
      queryClient.invalidateQueries({ queryKey: ['historico-chamado', chamado.id] });
      onChamadoAtualizado?.();
      toast({
        title: "Chamado atualizado",
        description: `Chamado #${chamado.id} foi atualizado com sucesso.`,
      });
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao atualizar chamado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o chamado.",
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-card">
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

          <div className="space-y-6">
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
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge variant={getStatusVariant(chamado.status)} className="gap-1">
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

            {/* Ações e Resolução (apenas para técnicos em chamados em atendimento) */}
            {podeEditar && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Resolução do Chamado
                  </CardTitle>
                  <CardDescription>
                    Descreva a solução e altere o status do chamado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="solucao">Solução Aplicada</Label>
                    <Textarea
                      id="solucao"
                      placeholder="Descreva a solução aplicada..."
                      value={solucaoAplicada}
                      onChange={(e) => setSolucaoAplicada(e.target.value)}
                      className="min-h-[100px] mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Alterar Status</Label>
                    <Select value={novoStatus} onValueChange={setNovoStatus}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                        <SelectItem value="resolvido">Resolvido</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => atualizarChamadoMutation.mutate()}
                      disabled={atualizarChamadoMutation.isPending}
                      className="flex-1"
                    >
                      {atualizarChamadoMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setTransferirDialogOpen(true)}
                    >
                      <UserCog className="w-4 h-4 mr-2" />
                      Transferir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Histórico de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historico && historico.length > 0 ? (
                  <div className="space-y-3">
                    {historico.map((item: any) => (
                      <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.message}</p>
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
    </>
  );
};
