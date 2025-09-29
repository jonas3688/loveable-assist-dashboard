import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Users } from 'lucide-react';

interface FuncionarioTI {
  id: number;
  nome: string;
  email: string;
  permissao: 'admin' | 'padrao';
}

export default function CadastroFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<FuncionarioTI[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<FuncionarioTI | null>(null);
  
  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [permissao, setPermissao] = useState<'admin' | 'padrao'>('padrao');
  
  const { toast } = useToast();

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const { data, error } = await supabase
        .from('funcionarios_ti')
        .select('id, nome, email, permissao')
        .order('nome');

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de funcionários",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingFuncionario) {
        // Atualizar funcionário existente
        const { error } = await supabase
          .from('funcionarios_ti')
          .update({ nome, email, permissao })
          .eq('id', editingFuncionario.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Funcionário atualizado com sucesso"
        });
      } else {
        // Criar novo funcionário - usar função para hash da senha
        const { data: hashedPassword } = await supabase.rpc('hash_password', { password: '123' });
        
        const { error } = await supabase
          .from('funcionarios_ti')
          .insert({
            nome,
            email,
            permissao,
            senha_hash: hashedPassword || ''
          });

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Funcionário criado com sucesso. Senha padrão: 123"
        });
      }

      // Resetar form
      setNome('');
      setEmail('');
      setPermissao('padrao');
      setEditingFuncionario(null);
      setDialogOpen(false);
      
      // Recarregar lista
      carregarFuncionarios();
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar funcionário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const editarFuncionario = (funcionario: FuncionarioTI) => {
    setEditingFuncionario(funcionario);
    setNome(funcionario.nome);
    setEmail(funcionario.email);
    setPermissao(funcionario.permissao);
    setDialogOpen(true);
  };

  const novoFuncionario = () => {
    setEditingFuncionario(null);
    setNome('');
    setEmail('');
    setPermissao('padrao');
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Cadastro de Funcionários
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie funcionários de TI e suas permissões
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={novoFuncionario}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="permissao">Permissão</Label>
                <Select value={permissao} onValueChange={(value: 'admin' | 'padrao') => setPermissao(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padrao">Padrão</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionários Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os funcionários de TI com suas respectivas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarios.map((funcionario) => (
                <TableRow key={funcionario.id}>
                  <TableCell className="font-medium">{funcionario.nome}</TableCell>
                  <TableCell>{funcionario.email}</TableCell>
                  <TableCell>
                    <Badge variant={funcionario.permissao === 'admin' ? 'default' : 'secondary'}>
                      {funcionario.permissao === 'admin' ? 'Administrador' : 'Padrão'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editarFuncionario(funcionario)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {funcionarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhum funcionário cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}