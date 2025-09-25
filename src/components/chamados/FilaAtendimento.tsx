import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Clock, MapPin, Building, Paperclip, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DetalhesChamado } from "./DetalhesChamado";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type ChamadoTI = Tables<"chamados_ti">;

const AnexosViewer = ({ anexos }: { anexos: any }) => {
  if (!anexos || (Array.isArray(anexos) && anexos.length === 0)) {
    return <span className="text-muted-foreground text-xs">Sem anexos</span>;
  }

  const anexosList = Array.isArray(anexos) ? anexos : [anexos];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  const images = anexosList.filter((anexo: any) => {
    if (typeof anexo === 'string') {
      return imageExtensions.some(ext => anexo.toLowerCase().includes(ext));
    }
    if (anexo?.url) {
      return imageExtensions.some(ext => anexo.url.toLowerCase().includes(ext));
    }
    return false;
  });

  if (images.length === 0) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground text-xs">
        <Paperclip className="w-3 h-3" />
        {anexosList.length} anexo(s)
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-muted-foreground text-xs">
        <ImageIcon className="w-3 h-3" />
        {images.length} imagem(ns)
      </div>
      <div className="flex gap-1">
        {images.slice(0, 3).map((anexo: any, index: number) => {
          const imageUrl = typeof anexo === 'string' ? anexo : anexo?.url || anexo;
          const { data: { publicUrl } } = supabase.storage
            .from('anexos-chamados-ti')
            .getPublicUrl(imageUrl);
          
          return (
            <img
              key={index}
              src={publicUrl}
              alt={`Anexo ${index + 1}`}
              className="w-8 h-8 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(publicUrl, '_blank')}
            />
          );
        })}
        {images.length > 3 && (
          <div className="w-8 h-8 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
            +{images.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};

export const FilaAtendimento = () => {
  const [chamadoSelecionado, setChamadoSelecionado] = useState<ChamadoTI | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chamados, isLoading, error } = useQuery({
    queryKey: ["chamados-fila"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chamados_ti")
        .select("*")
        .eq("status", "aberto")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChamadoTI[];
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const assumirChamadoMutation = useMutation({
    mutationFn: async (chamado: ChamadoTI) => {
      const { error } = await supabase
        .from("chamados_ti")
        .update({
          status: "em_atendimento",
          tecnico_responsavel: "Técnico Logado", // TODO: Implementar autenticação
          updated_at: new Date().toISOString(),
        })
        .eq("id_chamado", chamado.id_chamado);

      if (error) throw error;
      return chamado;
    },
    onSuccess: (chamado) => {
      queryClient.invalidateQueries({ queryKey: ["chamados-fila"] });
      queryClient.invalidateQueries({ queryKey: ["chamados-historico"] });
      setChamadoSelecionado({ ...chamado, status: "em_atendimento", tecnico_responsavel: "Técnico Logado" });
      toast({
        title: "Chamado assumido",
        description: `Chamado #${chamado.id_chamado} foi assumido com sucesso.`,
      });
    },
    onError: (error) => {
      console.error("Erro ao assumir chamado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível assumir o chamado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleAssumirChamado = (chamado: ChamadoTI) => {
    assumirChamadoMutation.mutate(chamado);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar chamados: {String(error)}</p>
      </div>
    );
  }

  if (!chamados || chamados.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum chamado na fila
        </h3>
        <p className="text-muted-foreground">
          Todos os chamados estão sendo atendidos ou foram resolvidos.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-24">Nº Chamado</TableHead>
              <TableHead className="w-32">Data Abertura</TableHead>
              <TableHead>Funcionário</TableHead>
              <TableHead className="w-32">Loja</TableHead>
              <TableHead className="w-40">Departamento</TableHead>
              <TableHead>Descrição (Início)</TableHead>
              <TableHead className="w-48">Anexos</TableHead>
              <TableHead className="w-40">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chamados.map((chamado) => (
              <TableRow key={chamado.id_chamado} className="hover:bg-muted/25 transition-colors">
                <TableCell className="font-semibold">
                  #{chamado.id_chamado}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {chamado.created_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(chamado.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {chamado.nome_funcionario || "Não informado"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-muted-foreground" />
                    {chamado.loja || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {chamado.departamento || "Geral"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm text-muted-foreground truncate">
                    {chamado.descricao_problema
                      ? chamado.descricao_problema.substring(0, 100) + "..."
                      : "Sem descrição"}
                  </p>
                </TableCell>
                <TableCell>
                  <AnexosViewer anexos={(chamado as any).anexos} />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleAssumirChamado(chamado)}
                    disabled={assumirChamadoMutation.isPending}
                    className="bg-gradient-primary hover:shadow-hover transition-all"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver / Assumir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {chamadoSelecionado && (
        <DetalhesChamado
          chamado={chamadoSelecionado}
          isOpen={!!chamadoSelecionado}
          onClose={() => setChamadoSelecionado(null)}
          onChamadoAtualizado={() => {
            queryClient.invalidateQueries({ queryKey: ["chamados-fila"] });
            queryClient.invalidateQueries({ queryKey: ["chamados-historico"] });
          }}
        />
      )}
    </>
  );
};