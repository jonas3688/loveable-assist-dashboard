import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, ArrowRight, UserPlus, BarChart3, ArrowLeft, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Index = () => {
  const { funcionario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">V12 TI Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo, {funcionario?.nome}!</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                {funcionario?.nome}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-primary rounded-2xl shadow-hover">
              <Headphones className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Sistema de Gerenciamento
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema interno de gerenciamento de chamados de suporte técnico.
            Gerencie, acompanhe e resolva solicitações de forma eficiente.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card border shadow-card hover:shadow-hover transition-all">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Chamados de TI</CardTitle>
              <CardDescription>
                Gerencie solicitações e suporte técnico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/chamados-ti">
                  Acessar Chamados
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border shadow-card hover:shadow-hover transition-all">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Dashboards</CardTitle>
              <CardDescription>
                Visualize métricas e indicadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/dashboards">
                  Ver Dashboards
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="bg-gradient-card border shadow-card hover:shadow-hover transition-all">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Cadastro de Funcionários</CardTitle>
                <CardDescription>
                  Gerencie funcionários de TI e permissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/cadastro-funcionarios">
                    Gerenciar Funcionários
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
};

export default Index;
