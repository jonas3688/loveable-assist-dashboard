import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ArrowLeft, User, LogOut, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNewAuth } from "@/contexts/NewAuthContext";
import { ChangeCurrentPasswordForm } from "@/components/auth/ChangeCurrentPasswordForm";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string;
}

export function PageHeader({ title, showBackButton = true, backTo = "/" }: PageHeaderProps) {
  const { perfil, logout } = useNewAuth();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(backTo)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              {perfil?.nome_completo}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
              <Lock className="mr-2 h-4 w-4" />
              Trocar Senha
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ChangeCurrentPasswordForm 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen} 
      />
    </header>
  );
}