import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, ArrowRight, Zap, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-primary rounded-2xl shadow-hover">
              <Headphones className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6 bg-gradient-primary bg-clip-text text-transparent">
            V12 TI Dashboard
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema interno de gerenciamento de chamados de suporte técnico.
            Gerencie, acompanhe e resolva solicitações de forma eficiente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-primary hover:shadow-hover transition-all text-lg px-8">
              <Link to="/chamados-ti">
                Acessar Painel de Chamados
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-card border shadow-card hover:shadow-hover transition-all">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Atendimento Ágil</CardTitle>
              <CardDescription>
                Fila organizada por ordem de chegada para atendimento prioritário
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border shadow-card hover:shadow-hover transition-all">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Controle Completo</CardTitle>
              <CardDescription>
                Histórico detalhado com filtros avançados e busca inteligente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border shadow-card hover:shadow-hover transition-all">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Gestão de Equipe</CardTitle>
              <CardDescription>
                Acompanhe o desempenho e distribua chamados entre técnicos
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Index;
