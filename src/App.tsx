import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NewAuthProvider } from "@/contexts/NewAuthContext";
import { NewProtectedRoute } from "@/components/layout/NewProtectedRoute";
import NewLogin from "./pages/NewLogin";
import MeusChamados from "./pages/MeusChamados";
import PainelTecnico from "./pages/PainelTecnico";
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
            <Route path="/login" element={<NewLogin />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NewAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
