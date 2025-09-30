import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageModal } from "@/components/ui/image-modal";
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
  Save,
  Paperclip,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type ChamadoTI = Tables<"chamados_ti">;

interface DetalhesChamadoProps {
  chamado: ChamadoTI;
  isOpen: boolean;
  onClose: () => void;
  onChamadoAtualizado?: () => void;
}

const statusOptions = [
  { value: "resolvido", label: "Resolvido", icon: CheckCircle },
  { value: "fechado", label: "Fechado", icon: XCircle },
];

const AnexosSection = ({ chamadoId, onImageClick }: { 
  chamadoId: number;
  onImageClick: (imageUrl: string) => void;
}) => {
  const { data: anexos, isLoading } = useQuery({
    queryKey: ["anexos-chamado", chamadoId],
    queryFn: async () => {
      console.log("Consultando anexos para chamado:", chamadoId);
      const { data, error } = await supabase
        .from("chamados_ti_anexos")
        .select("*")
        .eq("id_chamado", chamadoId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar anexos:", error);
        throw error;
      }
      console.log("Anexos encontrados:", data);
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
                  onClick={() => onImageClick(publicUrl)}
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

export const DetalhesChamado = ({ 
  chamado, 
  isOpen, 
  onClose, 
  onChamadoAtualizado 
}: DetalhesChamadoProps) => {
  const [solucaoAplicada, setSolucaoAplicada] = useState(chamado.solucao_aplicada || "");
  const [novoStatus, setNovoStatus] = useState(chamado.status);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const atualizarChamadoMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["chamados-fila"] });
      queryClient.invalidateQueries({ queryKey: ["chamados-historico"] });
      onChamadoAtualizado?.();
      toast({
        title: "Chamado atualizado",
        description: `Chamado #${chamado.id_chamado} foi atualizado com sucesso.`,
      });
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao atualizar chamado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o chamado. Tente novamente.",
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

  const podeEditar = chamado.status === "em_atendimento";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-card border shadow-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-primary rounded-lg">
              {getStatusIcon(chamado.status)}
            </div>
            Chamado #{chamado.id_chamado}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do chamado de suporte técnico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                  <Label className="text-sm font-medium text-muted-foreground">Status Atual</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusVariant(chamado.status)} className="gap-1">
                      {getStatusIcon(chamado.status)}
                      {getStatusLabel(chamado.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {chamado.tecnico_responsavel && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Técnico Responsável</Label>
                    <p className="text-foreground">{chamado.tecnico_responsavel}</p>
                  </div>
                )}
              </div>
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

          {/* Solução (apenas se estiver em atendimento) */}
          {podeEditar && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Resolução do Chamado
                </CardTitle>
                <CardDescription>
                  Descreva a solução aplicada para resolver o problema reportado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="solucao">Descrição da Resolução *</Label>
                  <Textarea
                    id="solucao"
                    placeholder="Descreva detalhadamente como o problema foi resolvido..."
                    value={solucaoAplicada}
                    onChange={(e) => setSolucaoAplicada(e.target.value)}
                    className="min-h-[120px] mt-2"
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
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Anexos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Anexos do Chamado
              </CardTitle>
            </CardHeader>
              <CardContent>
                <AnexosSection 
                  chamadoId={chamado.id_chamado}
                  onImageClick={setSelectedImage}
                />
              </CardContent>
          </Card>

          {/* Solução Aplicada (read-only se não estiver em atendimento) */}
          {!podeEditar && chamado.solucao_aplicada && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Solução Aplicada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {chamado.solucao_aplicada}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {podeEditar && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => atualizarChamadoMutation.mutate()}
              disabled={atualizarChamadoMutation.isPending || !solucaoAplicada.trim()}
              className="bg-gradient-primary hover:shadow-hover transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              {atualizarChamadoMutation.isPending ? "Salvando..." : "Salvar e Encerrar"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage("")}
        imageUrl={selectedImage}
        imageAlt="Anexo do chamado em tamanho maior"
      />
    </Dialog>
  );
};