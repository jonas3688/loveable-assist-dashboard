import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Building, 
  Calendar, 
  Phone, 
  Mail, 
  AlertCircle, 
  Clock,
  CheckCircle,
  XCircle,
  Play,
  UserCog,
  Paperclip,
  Image as ImageIcon,
  Settings,
  UserCheck,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { HistoricoTimeline } from "./HistoricoTimeline";
import type { Tables } from "@/integrations/supabase/types";

type ChamadoTI = Tables<"chamados_ti">;
type FuncionarioTI = Tables<"funcionarios_ti">;

interface ChamadoVisualizacaoProps {
  chamado: ChamadoTI;
  isOpen: boolean;
  onClose: () => void;
  onChamadoAtualizado?: () => void;
}

const AnexosSection = ({ chamadoId }: { chamadoId: number }) => {
  const { data: anexos, isLoading } = useQuery({
    queryKey: ["anexos-chamado", chamadoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chamados_ti_anexos")
        .select("*")
        .eq("id_chamado", chamadoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
        <p className="text-sm">Carregando anexos...</p>
      </div>
    );
  }

  if (!anexos || anexos.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum anexo encontrado</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {anexos.map((anexo) => {
          const publicUrl = `https://goarzjbrfizsldgdtdvm.supabase.co/storage/v1/object/public/${anexo.file_path}`;
          const isImage = anexo.tipo === 'imagem';
          const isAudio = anexo.tipo === 'audio';
          const isDocument = anexo.tipo === 'documento';
          
          if (isImage) {
            return (
              <div key={anexo.id_anexo} className="relative group cursor-pointer">
                <img
                  src={publicUrl}
                  alt={`Anexo ${anexo.id_anexo}`}
                  className="w-full h-32 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => window.open(publicUrl, '_blank')}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          }
          
          if (isAudio) {
            return (
              <div
                key={anexo.id_anexo}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-blue-50 border-blue-200"
                onClick={() => window.open(publicUrl, '_blank')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium truncate text-blue-700">
                    Ouvir Áudio
                  </span>
                </div>
              </div>
            );
          }
          
          if (isDocument) {
            return (
              <div
                key={anexo.id_anexo}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-green-50 border-green-200"
                onClick={() => window.open(publicUrl, '_blank')}
              >
                <div className="flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium truncate text-green-700">
                    Baixar Documento
                  </span>
                </div>
              </div>
            );
          }
          
          // Fallback para outros tipos
          return (
            <div
              key={anexo.id_anexo}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => window.open(publicUrl, '_blank')}
            >
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium truncate">
                  Anexo {anexo.id_anexo}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ChamadoVisualizacao = ({ 
  chamado: chamadoOriginal, 
  isOpen, 
  onClose, 
  onChamadoAtualizado 
}: ChamadoVisualizacaoProps) => {
  const [chamado, setChamado] = useState(chamadoOriginal);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<string>("");
  const [statusSelecionado, setStatusSelecionado] = useState<string>("");
  const [statusConfirmado, setStatusConfirmado] = useState<boolean>(false);
  const [solucaoAplicada, setSolucaoAplicada] = useState(chamado.solucao_aplicada || "");
  
  // Atualizar o estado local quando o chamado original mudar
  useEffect(() => {
    setChamado(chamadoOriginal);
    setSolucaoAplicada(chamadoOriginal.solucao_aplicada || "");
    setStatusSelecionado("");
    setStatusConfirmado(false);
  }, [chamadoOriginal]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obter técnicos disponíveis
  const { data: tecnicos } = useQuery({
    queryKey: ["funcionarios-ti"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios_ti")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as FuncionarioTI[];
    },
  });

  // Query para obter dados do técnico responsável atual
  const { data: tecnicoResponsavel } = useQuery({
    queryKey: ["tecnico-responsavel", chamado.assigned_func_ti_id],
    queryFn: async () => {
      if (!chamado.assigned_func_ti_id) return null;
      
      const { data, error } = await supabase
        .from("funcionarios_ti")
        .select("*")
        .eq("id", chamado.assigned_func_ti_id)
        .single();

      if (error) throw error;
      return data as FuncionarioTI;
    },
    enabled: !!chamado.assigned_func_ti_id,
  });

  const iniciarAtendimentoMutation = useMutation({
    mutationFn: async () => {
      // Usar o técnico já atribuído ao chamado
      const tecnicoId = chamado.assigned_func_ti_id || 1; // Fallback para ID 1 se não tiver técnico atribuído
      const tecnico = tecnicos?.find(t => t.id === tecnicoId);
      
      // Registrar no histórico
      await supabase
        .from("chamados_ti_historico")
        .insert({
          chamado_id: chamado.id_chamado,
          actor: tecnico?.nome || "Sistema",
          message: "Atendimento iniciado"
        });

      // Atualizar status do chamado (mantém o técnico já atribuído)
      const { error } = await supabase
        .from("chamados_ti")
        .update({
          status: "em_atendimento",
          tecnico_responsavel: tecnico?.nome,
          updated_at: new Date().toISOString(),
        })
        .eq("id_chamado", chamado.id_chamado);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chamados-fila"] });
      queryClient.invalidateQueries({ queryKey: ["chamados-historico"] });
      queryClient.invalidateQueries({ queryKey: ["chamado-historico", chamado.id_chamado] });
      onChamadoAtualizado?.();
      toast({
        title: "Atendimento iniciado",
        description: `Chamado #${chamado.id_chamado} foi assumido para atendimento.`,
      });
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao iniciar atendimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o atendimento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const atribuirTecnicoMutation = useMutation({
    mutationFn: async (tecnicoId: number) => {
      // Registrar no histórico
      const tecnico = tecnicos?.find(t => t.id === tecnicoId);
      await supabase
        .from("chamados_ti_historico")
        .insert({
          chamado_id: chamado.id_chamado,
          actor: "humano",
          message: `Chamado atribuído para ${tecnico?.nome || 'técnico'}`
        });

      // Atualizar chamado
      const { error } = await supabase
        .from("chamados_ti")
        .update({
          assigned_func_ti_id: tecnicoId,
          tecnico_responsavel: tecnico?.nome,
          updated_at: new Date().toISOString(),
        })
        .eq("id_chamado", chamado.id_chamado);

      if (error) throw error;
    },
    onSuccess: (_, tecnicoId) => {
      // Atualizar o estado local do chamado
      setChamado(prev => ({
        ...prev,
        assigned_func_ti_id: tecnicoId
      }));
      
      // Invalidar todas as queries relacionadas ao chamado
      queryClient.invalidateQueries({ queryKey: ["chamados-fila"] });
      queryClient.invalidateQueries({ queryKey: ["chamados-historico"] });
      queryClient.invalidateQueries({ queryKey: ["tecnico-responsavel"] });
      queryClient.invalidateQueries({ queryKey: ["chamado-historico", chamado.id_chamado] });
      
      // Forçar re-render do componente para atualizar o estado
      onChamadoAtualizado?.();
      
      toast({
        title: "Técnico atribuído",
        description: `Chamado #${chamado.id_chamado} foi atribuído com sucesso.`,
      });
      setTecnicoSelecionado("");
    },
    onError: (error) => {
      console.error("Erro ao atribuir técnico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o técnico. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ novoStatus, solucao }: { novoStatus: string, solucao?: string }) => {
      const updateData: any = { 
        status: novoStatus,
        updated_at: new Date().toISOString()
      };
      if (solucao) updateData.solucao_aplicada = solucao;

      // Se está resolvendo o chamado e não tem técnico responsável, usar o técnico atribuído
      if (novoStatus === "resolvido" && !chamado.tecnico_responsavel && chamado.assigned_func_ti_id) {
        const tecnico = tecnicos?.find(t => t.id === chamado.assigned_func_ti_id);
        if (tecnico) {
          updateData.tecnico_responsavel = tecnico.nome;
        }
      }

      // Atualizar chamado
      const { error } = await supabase
        .from("chamados_ti")
        .update(updateData)
        .eq("id_chamado", chamado.id_chamado);

      if (error) throw error;

      // Registrar no histórico
      await supabase
        .from("chamados_ti_historico")
        .insert({
          chamado_id: chamado.id_chamado,
          actor: "humano",
          message: `Status alterado para: ${getStatusLabel(novoStatus)}${solucao ? ` - Solução: ${solucao}` : ""}`
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chamados-fila"] });
      queryClient.invalidateQueries({ queryKey: ["chamados-historico"] });
      queryClient.invalidateQueries({ queryKey: ["chamado-historico", chamado.id_chamado] });
      onChamadoAtualizado?.();
      toast({
        title: "Status atualizado",
        description: `Chamado #${chamado.id_chamado} foi atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const transferirTecnicoMutation = useMutation({
    mutationFn: async (tecnicoId: number) => {
      const tecnico = tecnicos?.find(t => t.id === tecnicoId);
      
      // Atualizar chamado
      const { error } = await supabase
        .from("chamados_ti")
        .update({
          assigned_func_ti_id: tecnicoId,
          tecnico_responsavel: tecnico?.nome,
          updated_at: new Date().toISOString(),
        })
        .eq("id_chamado", chamado.id_chamado);

      if (error) throw error;

      // Registrar no histórico
      await supabase
        .from("chamados_ti_historico")
        .insert({
          chamado_id: chamado.id_chamado,
          actor: "humano",
          message: `Chamado transferido para: ${tecnico?.nome || 'técnico'}`
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chamados-fila"] });
      queryClient.invalidateQueries({ queryKey: ["chamados-historico"] });
      queryClient.invalidateQueries({ queryKey: ["tecnico-responsavel", chamado.assigned_func_ti_id] });
      queryClient.invalidateQueries({ queryKey: ["chamado-historico", chamado.id_chamado] });
      onChamadoAtualizado?.();
      toast({
        title: "Técnico transferido",
        description: `Chamado #${chamado.id_chamado} foi transferido com sucesso.`,
      });
      setTecnicoSelecionado("");
    },
    onError: (error) => {
      console.error("Erro ao transferir técnico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível transferir o técnico. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const statusOptions = [
    { value: "aberto", label: "Aberto" },
    { value: "em_atendimento", label: "Em Atendimento" },
    { value: "resolvido", label: "Resolvido" },
    { value: "fechado", label: "Fechado" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aberto":
        return <AlertCircle className="w-4 h-4" />;
      case "em_atendimento":
        return <Clock className="w-4 h-4" />;
      case "resolvido":
      case "resolvido_pela_ia":
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
      case "resolvido_pela_ia":
        return "Resolvido pela IA";
      case "fechado":
        return "Fechado";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "aberto":
        return "aberto" as const;
      case "em_atendimento":
        return "em_atendimento" as const;
      case "resolvido":
      case "resolvido_pela_ia":
        return "resolvido" as const;
      case "fechado":
        return "fechado" as const;
      default:
        return "outline" as const;
    }
  };

  const getPrioridadeVariant = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "destructive" as const;
      case "media":
        return "default" as const;
      case "baixa":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-card border shadow-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-primary rounded-lg">
              {getStatusIcon(chamado.status)}
            </div>
            <div className="flex items-center gap-3">
              <span>Chamado #{chamado.id_chamado}</span>
              <Badge variant={getStatusVariant(chamado.status)} className="gap-1">
                {getStatusIcon(chamado.status)}
                {getStatusLabel(chamado.status)}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Visualização completa do chamado de suporte técnico
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Informações do Chamado */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Funcionário</Label>
                    <p className="text-foreground">{chamado.nome_funcionario || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Departamento</Label>
                    <p className="text-foreground">{chamado.departamento || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Loja</Label>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{chamado.loja || "Não informada"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{chamado.email || "Não informado"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{chamado.telefone_contato || "Não informado"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data de Abertura</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {chamado.created_at 
                          ? format(new Date(chamado.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : "Não informada"}
                      </span>
                    </div>
                  </div>
                </div>

                {tecnicoResponsavel && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Técnico Responsável</Label>
                      <p className="text-foreground font-medium">{tecnicoResponsavel.nome}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Descrição do Problema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Descrição do Problema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {chamado.descricao_problema || "Nenhuma descrição fornecida."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Anexos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Anexos do Chamado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnexosSection chamadoId={chamado.id_chamado} />
              </CardContent>
            </Card>

            {/* Solução Aplicada - Apenas para chamados em atendimento ou se já houver solução */}
            {(chamado.status === "em_atendimento" || chamado.solucao_aplicada) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Solução Aplicada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Descreva como o problema foi resolvido..."
                    value={solucaoAplicada}
                    onChange={(e) => setSolucaoAplicada(e.target.value)}
                    className="min-h-[100px]"
                    disabled={chamado.status === "resolvido" || chamado.status === "fechado" || chamado.status === "resolvido_pela_ia"}
                    readOnly={chamado.status === "resolvido" || chamado.status === "fechado" || chamado.status === "resolvido_pela_ia"}
                  />
                </CardContent>
              </Card>
            )}

            {/* Ações do Chamado - Apenas para chamados em atendimento */}
            {chamado.status === "em_atendimento" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações do Chamado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Atualizar Status */}
                    <div>
                      <Label className="text-sm font-medium">Atualizar Status</Label>
                      <div className="flex gap-2">
                        <Select
                          value={statusSelecionado}
                          onValueChange={(value) => {
                            setStatusSelecionado(value);
                            setStatusConfirmado(false);
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              <SelectValue placeholder={
                                statusConfirmado && statusSelecionado ? 
                                getStatusLabel(statusSelecionado) : 
                                "Selecionar novo status"
                              } />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions
                              .filter(opt => opt.value !== chamado.status && opt.value !== "aberto")
                              .map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!statusSelecionado) return;
                            
                            if ((statusSelecionado === "resolvido" || statusSelecionado === "fechado") && !solucaoAplicada.trim()) {
                              toast({
                                title: "Solução obrigatória",
                                description: "Para marcar como resolvido ou fechado, você deve informar a solução aplicada.",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            setStatusConfirmado(true);
                            toast({
                              title: "Status confirmado",
                              description: `Status ${getStatusLabel(statusSelecionado)} foi confirmado. Agora você pode encerrar o chamado.`,
                            });
                          }}
                          disabled={!statusSelecionado || statusConfirmado}
                        >
                          {statusConfirmado ? "Confirmado" : "Confirmar"}
                        </Button>
                      </div>
                    </div>

                    {/* Transferir Técnico */}
                    <div>
                      <Label className="text-sm font-medium">Transferir Atendimento</Label>
                      <div className="flex gap-2">
                        <Select
                          value={tecnicoSelecionado}
                          onValueChange={setTecnicoSelecionado}
                        >
                          <SelectTrigger className="flex-1">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4" />
                              <SelectValue placeholder="Selecionar técnico" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {tecnicos?.filter(tecnico => tecnico.id !== chamado.assigned_func_ti_id).map((tecnico) => (
                              <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                                {tecnico.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (tecnicoSelecionado && parseInt(tecnicoSelecionado) !== chamado.assigned_func_ti_id) {
                              transferirTecnicoMutation.mutate(parseInt(tecnicoSelecionado));
                            }
                          }}
                          disabled={!tecnicoSelecionado || transferirTecnicoMutation.isPending || (tecnicoSelecionado && parseInt(tecnicoSelecionado) === chamado.assigned_func_ti_id)}
                        >
                          {transferirTecnicoMutation.isPending ? "Transferindo..." : "Confirmar"}
                        </Button>
                        {tecnicoSelecionado && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTecnicoSelecionado("")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Limpar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Encerrar Chamado */}
                    <div className="pt-4 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            className="w-full bg-gradient-primary hover:shadow-hover transition-all"
                            disabled={!statusConfirmado || !solucaoAplicada.trim() || (statusSelecionado !== "resolvido" && statusSelecionado !== "fechado")}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            {!statusConfirmado ? "Confirme um status primeiro" : 
                             (statusSelecionado !== "resolvido" && statusSelecionado !== "fechado") ? "Status deve ser Resolvido ou Fechado" :
                             `Encerrar como ${getStatusLabel(statusSelecionado)}`}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Encerrar Chamado</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja encerrar este chamado como "{getStatusLabel(statusSelecionado)}"?
                              {statusSelecionado === "fechado" && " Esta ação indica que o problema não foi resolvido."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                atualizarStatusMutation.mutate({ 
                                  novoStatus: statusSelecionado, 
                                  solucao: solucaoAplicada 
                                });
                                onClose();
                              }}
                            >
                              Encerrar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões de Ação para Chamados Abertos */}
            {chamado.status === "aberto" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Iniciar Atendimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Seção de atribuição de técnico - só aparece se não há técnico atribuído */}
                  {!chamado.assigned_func_ti_id && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Primeiro, selecione e atribua um técnico:
                      </Label>
                      <div className="flex gap-2">
                        <Select value={tecnicoSelecionado} onValueChange={setTecnicoSelecionado}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Selecionar técnico" />
                          </SelectTrigger>
                          <SelectContent>
                            {tecnicos?.map((tecnico) => (
                              <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                                {tecnico.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          onClick={() => atribuirTecnicoMutation.mutate(parseInt(tecnicoSelecionado))}
                          disabled={!tecnicoSelecionado || atribuirTecnicoMutation.isPending}
                        >
                          <UserCog className="w-4 h-4 mr-2" />
                          Atribuir
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Técnico já atribuído - mostrar informação */}
                  {chamado.assigned_func_ti_id && tecnicoResponsavel && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Técnico Atribuído:</Label>
                      <p className="text-foreground font-medium">{tecnicoResponsavel.nome}</p>
                    </div>
                  )}

                  {/* Botão de iniciar atendimento - sempre visível */}
                  <div className="pt-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-primary hover:shadow-hover transition-all"
                          disabled={!chamado.assigned_func_ti_id}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {!chamado.assigned_func_ti_id ? "Atribua um técnico primeiro" : "Iniciar Atendimento"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Iniciar atendimento agora?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você assumirá o atendimento deste chamado e ele será marcado como "Em Atendimento".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => iniciarAtendimentoMutation.mutate()}
                            disabled={iniciarAtendimentoMutation.isPending}
                          >
                            {iniciarAtendimentoMutation.isPending ? "Iniciando..." : "Sim, iniciar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral - Timeline */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline de Atividades</CardTitle>
                <CardDescription>
                  Histórico de interações e atualizações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoricoTimeline chamadoId={chamado.id_chamado} />
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};