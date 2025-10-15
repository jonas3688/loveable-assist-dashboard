import { useNavigate } from 'react-router-dom';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  Plus, 
  Wrench, 
  Users, 
  BarChart3,
  LogOut
} from 'lucide-react';

export default function SelecaoFuncao() {
  const navigate = useNavigate();
  const { perfil, logout, isTecnico } = useNewAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Funções para usuários normais
  const funcoesUsuario = [
    {
      titulo: 'Meus Chamados',
      descricao: 'Visualize e acompanhe seus chamados',
      icone: ClipboardList,
      rota: '/chamados',
      cor: 'bg-blue-500',
    },
    {
      titulo: 'Novo Chamado',
      descricao: 'Abrir um novo chamado de suporte',
      icone: Plus,
      rota: '/chamados',
      cor: 'bg-green-500',
    },
  ];

  // Funções para técnicos
  const funcoesTecnico = [
    {
      titulo: 'Painel Técnico',
      descricao: 'Atender e gerenciar chamados',
      icone: Wrench,
      rota: '/painel-tecnico',
      cor: 'bg-purple-500',
    },
  ];

  // Funções adicionais para admin
  const funcoesAdmin = [
    {
      titulo: 'Gerenciar Funcionários',
      descricao: 'Cadastrar e gerenciar usuários',
      icone: Users,
      rota: '/cadastro-funcionarios',
      cor: 'bg-orange-500',
    },
    {
      titulo: 'Dashboards',
      descricao: 'Ver estatísticas e relatórios',
      icone: BarChart3,
      rota: '/dashboards',
      cor: 'bg-pink-500',
    },
  ];

  // Verifica se é admin pelo email ou outros critérios (adaptar conforme necessário)
  const isAdmin = perfil?.email?.includes('admin') || false;
  
  // Determinar quais funções mostrar
  let funcoes = [];
  if (isTecnico) {
    funcoes = [...funcoesTecnico];
    if (isAdmin) {
      funcoes = [...funcoes, ...funcoesAdmin];
    }
  } else {
    funcoes = [...funcoesUsuario];
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo, {perfil?.nome_completo}!</h1>
          <p className="text-muted-foreground">O que você gostaria de fazer?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funcoes.map((funcao) => {
            const Icon = funcao.icone;
            return (
              <Card 
                key={funcao.rota}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-card"
                onClick={() => navigate(funcao.rota)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${funcao.cor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{funcao.titulo}</CardTitle>
                  <CardDescription>{funcao.descricao}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Acessar</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
