import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilaAtendimento } from "@/components/chamados/FilaAtendimento";
import { HistoricoCompleto } from "@/components/chamados/HistoricoCompleto";
import { History, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";

const ChamadosTI = () => {
  const navigate = useNavigate();
  
  return (
    <main className="min-h-screen bg-gradient-subtle">
      <PageHeader title="Chamados TI" />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-muted-foreground">
                Gerencie chamados de suporte técnico da V12
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboards")}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Ver Dashboards
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="fila" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg bg-card border shadow-card">
            <TabsTrigger 
              value="fila" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <AlertCircle className="w-4 h-4" />
              Fila de Atendimento
            </TabsTrigger>
            <TabsTrigger 
              value="historico"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <History className="w-4 h-4" />
              Histórico Completo
            </TabsTrigger>
            <TabsTrigger 
              value="dashboards"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              onClick={() => navigate("/dashboards")}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fila" className="space-y-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  Fila de Atendimento
                </CardTitle>
                <CardDescription>
                  Chamados aguardando atendimento humano, organizados por ordem de chegada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FilaAtendimento />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-info" />
                  Histórico Completo
                </CardTitle>
                <CardDescription>
                  Todos os chamados registrados no sistema com filtros avançados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoricoCompleto />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default ChamadosTI;