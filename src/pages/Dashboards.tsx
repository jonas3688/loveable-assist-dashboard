import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Building, BarChart3, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboards = () => {
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("30");
  const navigate = useNavigate();

  // Query para ranking de técnicos
  const { data: rankingTecnicos, isLoading: loadingTecnicos } = useQuery({
    queryKey: ["ranking-tecnicos", periodoFiltro],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - parseInt(periodoFiltro));
      
      const { data, error } = await supabase
        .from("chamados_ti")
        .select("tecnico_responsavel")
        .eq("status", "resolvido")
        .gte("created_at", dataLimite.toISOString())
        .not("tecnico_responsavel", "is", null)
        .neq("tecnico_responsavel", "");

      if (error) throw error;

      // Agrupar por técnico
      const grupos = data.reduce((acc: any, chamado: any) => {
        const tecnicoNome = chamado.tecnico_responsavel || "Não atribuído";
        acc[tecnicoNome] = (acc[tecnicoNome] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grupos)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a: any, b: any) => b.total - a.total);
    },
  });

  // Query para funcionários que mais abrem chamados
  const { data: rankingFuncionarios, isLoading: loadingFuncionarios } = useQuery({
    queryKey: ["ranking-funcionarios", periodoFiltro],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("nome, departamento, quantidade_chamados")
        .gt("quantidade_chamados", 0);

      if (error) throw error;

      return data
        .map((funcionario: any) => ({
          nome: funcionario.nome,
          departamento: funcionario.departamento || "Não informado",
          total: funcionario.quantidade_chamados
        }))
        .sort((a: any, b: any) => b.total - a.total);
    },
  });

  // Query para lojas que mais abrem chamados
  const { data: rankingLojas, isLoading: loadingLojas } = useQuery({
    queryKey: ["ranking-lojas", periodoFiltro],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - parseInt(periodoFiltro));
      
      const { data, error } = await supabase
        .from("chamados_ti")
        .select("loja")
        .gte("created_at", dataLimite.toISOString())
        .not("loja", "is", null)
        .neq("loja", "");

      if (error) throw error;

      // Agrupar por loja
      const grupos = data.reduce((acc: any, chamado: any) => {
        const lojaNome = chamado.loja || "Não informado";
        acc[lojaNome] = (acc[lojaNome] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grupos)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a: any, b: any) => b.total - a.total);
    },
  });

  const periodos = [
    { value: "7", label: "Últimos 7 dias" },
    { value: "30", label: "Últimos 30 dias" },
    { value: "90", label: "Últimos 90 dias" },
    { value: "365", label: "Último ano" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/chamados-ti")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Chamados TI
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboards TI</h1>
            <p className="text-muted-foreground">
              Análise de performance e estatísticas dos chamados de TI
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              {periodos.map((periodo) => (
                <SelectItem key={periodo.value} value={periodo.value}>
                  {periodo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="tecnicos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tecnicos" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ranking de Técnicos
          </TabsTrigger>
          <TabsTrigger value="funcionarios" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Solicitantes
          </TabsTrigger>
          <TabsTrigger value="lojas" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Volume por Loja
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tecnicos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Ranking de Atendimentos por Técnico
              </CardTitle>
              <CardDescription>
                Técnicos de TI que mais resolvem chamados (apenas chamados concluídos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTecnicos ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                    <div>Posição</div>
                    <div>Nome do Técnico</div>
                    <div>Chamados Resolvidos</div>
                  </div>
                  {rankingTecnicos?.map((tecnico: any, index: number) => (
                    <div key={tecnico.nome} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-border/50">
                      <div className="font-bold text-lg">#{index + 1}</div>
                      <div className="font-medium">{tecnico.nome}</div>
                      <div className="font-bold text-primary">{tecnico.total}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Funcionários que Mais Abrem Chamados
              </CardTitle>
              <CardDescription>
                Colaboradores que registram o maior número de chamados de TI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFuncionarios ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                    <div>Posição</div>
                    <div>Nome do Funcionário</div>
                    <div>Departamento</div>
                    <div>Total de Chamados</div>
                  </div>
                  {rankingFuncionarios?.map((funcionario: any, index: number) => (
                    <div key={funcionario.nome} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50">
                      <div className="font-bold text-lg">#{index + 1}</div>
                      <div className="font-medium">{funcionario.nome}</div>
                      <div>
                        <Badge variant="outline">
                          {funcionario.departamento}
                        </Badge>
                      </div>
                      <div className="font-bold text-primary">{funcionario.total}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lojas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Volume de Chamados por Loja
              </CardTitle>
              <CardDescription>
                Unidades/lojas com maior demanda de suporte de TI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLojas ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                    <div>Posição</div>
                    <div>Nome da Loja</div>
                    <div>Total de Chamados</div>
                  </div>
                  {rankingLojas?.map((loja: any, index: number) => (
                    <div key={loja.nome} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-border/50">
                      <div className="font-bold text-lg">#{index + 1}</div>
                      <div className="font-medium">{loja.nome}</div>
                      <div className="font-bold text-primary">{loja.total}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboards;