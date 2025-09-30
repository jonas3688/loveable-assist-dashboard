import { Calendar, Clock, User, Badge, Paperclip, Phone, Mail, Building, AlertCircle, CheckCircle, XCircle, ImageIcon, Trash2, UserCheck, Timer, Users, MapPin, AlertTriangle, FileText, MessageSquare, History } from "lucide-react";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HistoricoTimeline } from "./HistoricoTimeline";
import { ImageModal } from "@/components/ui/image-modal";
import { useState } from "react";

interface ChamadoTI {
  id_chamado: number;
  session_id: string;
  nome_funcionario: string | null;
  loja: string | null;
  email: string | null;
  telefone_contato: string | null;
  descricao_problema: string | null;
  departamento: string | null;
  status: string;
  tentativas_ia: number | null;
  tecnico_responsavel: string | null;
  created_at: string;
  updated_at: string;
  solucao_aplicada: string | null;
  anexos: any[];
  prioridade: string | null;
  loja_id: number | null;
  funcionario_id: number | null;
  assigned_func_ti_id: number | null;
}

interface FuncionarioTI {
  id: number;
  nome: string;
  email: string;
  permissao: string;
  senha_hash: string;
}

interface ChamadoVisualizacaoProps {
  chamado: ChamadoTI;
  isOpen: boolean;
  onClose: () => void;
  onChamadoAtualizado?: () => void;
}

const statusOptions = [
  { value: "em_atendimento", label: "Em Atendimento", icon: Timer },
  { value: "resolvido", label: "Resolvido", icon: CheckCircle },
  { value: "fechado", label: "Fechado", icon: XCircle },
];

const AnexosSection = ({ chamadoId }: { chamadoId: number }) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  
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
    <>
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
                    onClick={() => setSelectedImage({ url: publicUrl, alt: `Anexo ${anexo.id_anexo}` })}
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
            
            return null;
          })}
        </div>
      </div>
      
      <ImageModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ""}
        alt={selectedImage?.alt || ""}
      />
    </>
  );
};

export const ChamadoVisualizacao = ({ chamado, isOpen, onClose, onChamadoAtualizado }: ChamadoVisualizacaoProps) => {
  const [solucaoAplicada, setSolucaoAplicada] = useState(chamado.solucao_aplicada || "");
  const [novoStatus, setNovoStatus] = useState("");
  const [novaObservacao, setNovaObservacao] = useState("");
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");
  const queryClient = useQueryClient();

  const { data: funcionarios } = useQuery({
    queryKey: ["funcionarios-ti"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios_ti")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as FuncionarioTI[];
    },
  });

  const assumirChamadoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("chamados_ti")
        .update({
          status: "em_atendimento",
          updated_at: new Date().toISOString(),
        })
        .eq("id_chamado", chamado.id_chamado);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Chamado assumido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["chamados-ti"] });
      onChamadoAtualizado?.();
    },
    onError: (error) => {
      console.error("Erro ao assumir chamado:", error);
      toast.error("Erro ao assumir chamado. Tente novamente.");
    },
  });

  const encerrarChamadoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("chamados_ti")
        .update({
          status: novoStatus,
          solucao_aplicada: solucaoAplicada,
          updated_at: new Date().toISOString(),
        })
        .eq("id_chamado", chamado.id_chamado);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Chamado atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["chamados-ti"] });
      onChamadoAtualizado?.();
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao atualizar chamado:", error);
      toast.error("Erro ao atualizar chamado. Tente novamente.");
    },
  });

  const adicionarObservacaoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("chamados_ti_historico")
        .insert({
          chamado_id: chamado.id_chamado,
          actor: "Técnico TI",
          message: novaObservacao,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Observação adicionada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["historico-chamado", chamado.id_chamado] });
      setNovaObservacao("");
    },
    onError: (error) => {
      console.error("Erro ao adicionar observação:", error);
      toast.error("Erro ao adicionar observação. Tente novamente.");
    },
  });

  const transferirTecnicoMutation = useMutation({
    mutationFn: async (funcionarioId: number) => {
      const funcionario = funcionarios?.find(f => f.id === funcionarioId);
      
      const { error } = await supabase
        .from("chamados_ti")
        .update({
          assigned_func_ti_id: funcionarioId,
          tecnico_responsavel: funcionario?.nome,
          updated_at: new Date().toISOString(),
        })
        .eq("id_chamado", chamado.id_chamado);

      if (error) throw error;

      // Adicionar entrada no histórico
      const { error: historicoError } = await supabase
        .from("chamados_ti_historico")
        .insert({
          chamado_id: chamado.id_chamado,
          actor: "Sistema",
          message: `Chamado transferido para ${funcionario?.nome}`,
        });

      if (historicoError) throw historicoError;
    },
    onSuccess: () => {
      toast.success("Chamado transferido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["chamados-ti"] });
      onChamadoAtualizado?.();
      setTecnicoSelecionado("");
    },
    onError: (error) => {
      console.error("Erro ao transferir chamado:", error);
      toast.error("Erro ao transferir chamado. Tente novamente.");
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aberto":
        return <AlertTriangle className="w-4 h-4" />;
      case "atendimento_ia":
        return <Timer className="w-4 h-4" />;
      case "em_atendimento":
        return <Timer className="w-4 h-4" />;
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
      case "atendimento_ia":
        return "Atendimento IA";
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
        return "destructive";
      case "atendimento_ia":
        return "secondary";
      case "em_atendimento":
        return "default";
      case "resolvido":
        return "default";
      case "fechado":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPrioridadeVariant = (prioridade: string | null) => {
    switch (prioridade) {
      case "alta":
        return "destructive";
      case "media":
        return "default";
      case "baixa":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPrioridadeLabel = (prioridade: string | null) => {
    switch (prioridade) {
      case "alta":
        return "Alta";
      case "media":
        return "Média";
      case "baixa":
        return "Baixa";
      default:
        return "Não definida";
    }
  };

  const tecnicos = funcionarios?.filter(f => f.permissao === 'admin') || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <FileText className="w-6 h-6 text-primary" />
              Chamado #{chamado.id_chamado}
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Visualização completa e gestão do chamado técnico
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Status e Prioridade */}
          <div className="flex gap-3">
            <UIBadge variant={getStatusVariant(chamado.status)} className="flex items-center gap-1">
              {getStatusIcon(chamado.status)}
              {getStatusLabel(chamado.status)}
            </UIBadge>
            <UIBadge variant={getPrioridadeVariant(chamado.prioridade)} className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Prioridade: {getPrioridadeLabel(chamado.prioridade)}
            </UIBadge>
          </div>

          {/* Informações do Solicitante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{chamado.nome_funcionario || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{chamado.loja || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{chamado.email || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{chamado.telefone_contato || "Não informado"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descrição do Problema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
                Descrição do Problema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {chamado.descricao_problema || "Nenhuma descrição fornecida."}
              </p>
            </CardContent>
          </Card>

          {/* Informações do Atendimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Criado em: {new Date(chamado.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Atualizado em: {new Date(chamado.updated_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {chamado.tecnico_responsavel && (
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Técnico responsável: <span className="font-medium">{chamado.tecnico_responsavel}</span>
                  </span>
                </div>
              )}

              {/* Transferir chamado */}
              {chamado.status === "aberto" || chamado.status === "em_atendimento" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transferir para outro técnico:</label>
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
              ) : null}
            </CardContent>
          </Card>

          {/* Anexos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paperclip className="w-5 h-5 text-primary" />
                Anexos do Chamado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnexosSection chamadoId={chamado.id_chamado} />
            </CardContent>
          </Card>

          {/* Atualização do Chamado - apenas para chamados em atendimento */}
          {chamado.status === "em_atendimento" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Finalizar Atendimento
                </CardTitle>
                <CardDescription>
                  Adicione a solução aplicada e atualize o status do chamado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Solução Aplicada:</label>
                  <Textarea
                    value={solucaoAplicada}
                    onChange={(e) => setSolucaoAplicada(e.target.value)}
                    placeholder="Descreva a solução aplicada..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Novo Status:</label>
                  <Select value={novoStatus} onValueChange={setNovoStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o novo status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => encerrarChamadoMutation.mutate()}
                  disabled={!solucaoAplicada.trim() || !novoStatus || encerrarChamadoMutation.isPending}
                  className="w-full"
                >
                  {encerrarChamadoMutation.isPending ? "Atualizando..." : "Salvar e Finalizar"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Solução Aplicada - apenas para visualização em chamados resolvidos/fechados */}
          {(chamado.status === "resolvido" || chamado.status === "fechado") && chamado.solucao_aplicada && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Solução Aplicada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {chamado.solucao_aplicada}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Adicionar Observação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
                Adicionar Observação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                placeholder="Adicione uma observação ao chamado..."
                className="min-h-[80px]"
              />
              <Button
                onClick={() => adicionarObservacaoMutation.mutate()}
                disabled={!novaObservacao.trim() || adicionarObservacaoMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {adicionarObservacaoMutation.isPending ? "Adicionando..." : "Adicionar Observação"}
              </Button>
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-primary" />
                Histórico do Chamado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HistoricoTimeline chamadoId={chamado.id_chamado} />
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4">
          <div className="flex gap-2 w-full">
            {chamado.status === "aberto" && (
              <Button
                onClick={() => assumirChamadoMutation.mutate()}
                disabled={assumirChamadoMutation.isPending}
                className="flex-1"
              >
                {assumirChamadoMutation.isPending ? "Assumindo..." : "Assumir Chamado"}
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};