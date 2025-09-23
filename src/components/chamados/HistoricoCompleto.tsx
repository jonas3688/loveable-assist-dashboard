import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Search, Filter, Calendar, Building, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DetalhesChamado } from "./DetalhesChamado";
import type { Tables } from "@/integrations/supabase/types";

type ChamadoTI = Tables<"chamados_ti">;

const statusOptions = [
  { value: "todos", label: "Todos os Status" },
  { value: "aberto", label: "Aberto" },
  { value: "em_atendimento", label: "Em Atendimento" },
  { value: "resolvido_pela_ia", label: "Resolvido pela IA" },
  { value: "resolvido", label: "Resolvido" },
  { value: "fechado", label: "Fechado" },
];

export const HistoricoCompleto = () => {
  const [chamadoSelecionado, setChamadoSelecionado] = useState<ChamadoTI | null>(null);
  const [filtros, setFiltros] = useState({
    busca: "",
    status: "todos",
    loja: "todas",
    dataInicio: "",
    dataFim: "",
  });

  const { data: chamados, isLoading, error } = useQuery({
    queryKey: ["chamados-historico", filtros],
    queryFn: async () => {
      let query = supabase
        .from("chamados_ti")
        .select("*")
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filtros.busca) {
        query = query.or(`id_chamado.eq.${filtros.busca},nome_funcionario.ilike.%${filtros.busca}%,descricao_problema.ilike.%${filtros.busca}%`);
      }

      if (filtros.status !== "todos") {
        query = query.eq("status", filtros.status);
      }

      if (filtros.loja !== "todas") {
        query = query.eq("loja", filtros.loja);
      }

      if (filtros.dataInicio) {
        query = query.gte("created_at", filtros.dataInicio);
      }

      if (filtros.dataFim) {
        query = query.lte("created_at", filtros.dataFim + "T23:59:59");
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ChamadoTI[];
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  // Query para obter lojas únicas
  const { data: lojas } = useQuery({
    queryKey: ["lojas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chamados_ti")
        .select("loja")
        .not("loja", "is", null);

      if (error) throw error;
      
      const lojasUnicas = [...new Set(data.map(item => item.loja))].filter(Boolean);
      return lojasUnicas as string[];
    },
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar histórico: {String(error)}</p>
      </div>
    );
  }

  return (
    <>
      {/* Filtros */}
      <Card className="bg-gradient-card border shadow-card mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por ID, funcionário ou descrição..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status */}
            <Select
              value={filtros.status}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Loja */}
            <Select
              value={filtros.loja}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, loja: value }))}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <SelectValue placeholder="Todas as lojas" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as lojas</SelectItem>
                {lojas?.map((loja) => (
                  <SelectItem key={loja} value={loja}>
                    {loja}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Data */}
            <div className="flex gap-2">
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="flex-1"
              />
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <div className="rounded-lg border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-24">Nº Chamado</TableHead>
              <TableHead className="w-32">Data Abertura</TableHead>
              <TableHead>Funcionário</TableHead>
              <TableHead className="w-32">Loja</TableHead>
              <TableHead className="w-40">Departamento</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead>Descrição (Início)</TableHead>
              <TableHead className="w-24">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chamados?.map((chamado) => (
              <TableRow 
                key={chamado.id_chamado} 
                className="hover:bg-muted/25 transition-colors cursor-pointer"
                onClick={() => setChamadoSelecionado(chamado)}
              >
                <TableCell className="font-semibold">
                  #{chamado.id_chamado}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {chamado.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(chamado.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    {chamado.nome_funcionario || "Não informado"}
                  </div>
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
                <TableCell>
                  <Badge variant={getStatusVariant(chamado.status)}>
                    {getStatusLabel(chamado.status)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm text-muted-foreground truncate">
                    {chamado.descricao_problema
                      ? chamado.descricao_problema.substring(0, 80) + "..."
                      : "Sem descrição"}
                  </p>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChamadoSelecionado(chamado);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) || []}
          </TableBody>
        </Table>

        {(!chamados || chamados.length === 0) && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum chamado encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros para encontrar chamados.
            </p>
          </div>
        )}
      </div>

      {chamadoSelecionado && (
        <DetalhesChamado
          chamado={chamadoSelecionado}
          isOpen={!!chamadoSelecionado}
          onClose={() => setChamadoSelecionado(null)}
        />
      )}
    </>
  );
};