import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NewAuthProvider } from "@/contexts/NewAuthContext";
import { NewProtectedRoute } from "@/components/layout/NewProtectedRoute";
import Index from "./pages/Index";
import NewLogin from "./pages/NewLogin";
import MeusChamados from "./pages/MeusChamados";
import PainelTecnico from "./pages/PainelTecnico";
import CadastroFuncionarios from "./pages/CadastroFuncionarios";
import Dashboards from "./pages/Dashboards";
import SelecaoFuncao from "./pages/SelecaoFuncao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NewAuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<NewLogin />} />
            <Route path="/selecao-funcao" element={
              <NewProtectedRoute>
                <SelecaoFuncao />
              </NewProtectedRoute>
            } />
            <Route path="/chamados" element={
              <NewProtectedRoute>
                <MeusChamados />
              </NewProtectedRoute>
            } />
            <Route path="/painel-tecnico" element={
              <NewProtectedRoute requireTecnico>
                <PainelTecnico />
              </NewProtectedRoute>
            } />
            <Route path="/cadastro-funcionarios" element={
              <NewProtectedRoute requireTecnico>
                <CadastroFuncionarios />
              </NewProtectedRoute>
            } />
            <Route path="/dashboards" element={
              <NewProtectedRoute requireTecnico>
                <Dashboards />
              </NewProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NewAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
