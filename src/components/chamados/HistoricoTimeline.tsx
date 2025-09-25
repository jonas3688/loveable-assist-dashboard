import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bot, Headphones, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoricoTimelineProps {
  chamadoId: number;
}

type HistoricoItem = {
  id: number;
  chamado_id: number;
  actor: "usuario" | "ia" | "humano";
  message: string;
  created_at: string;
};

const getActorIcon = (actor: string) => {
  switch (actor) {
    case "usuario":
      return <User className="w-4 h-4" />;
    case "ia":
      return <Bot className="w-4 h-4" />;
    case "humano":
      return <Headphones className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getActorLabel = (actor: string) => {
  switch (actor) {
    case "usuario":
      return "Usuário";
    case "ia":
      return "IA";
    case "humano":
      return "Técnico";
    default:
      return actor;
  }
};

const getActorVariant = (actor: string) => {
  switch (actor) {
    case "usuario":
      return "outline" as const;
    case "ia":
      return "secondary" as const;
    case "humano":
      return "default" as const;
    default:
      return "outline" as const;
  }
};

export const HistoricoTimeline = ({ chamadoId }: HistoricoTimelineProps) => {
  const { data: historico, isLoading } = useQuery({
    queryKey: ["chamado-historico", chamadoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chamados_ti_historico")
        .select("*")
        .eq("chamado_id", chamadoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HistoricoItem[];
    },
    enabled: !!chamadoId,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!historico || historico.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum histórico disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground mb-3">Timeline de Atividades</h4>
      <div className="space-y-3">
        {historico.map((item, index) => (
          <Card key={item.id} className="relative">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Badge variant={getActorVariant(item.actor)} className="gap-1">
                    {getActorIcon(item.actor)}
                    {getActorLabel(item.actor)}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            {index < historico.length - 1 && (
              <div className="absolute left-6 top-16 w-px h-6 bg-border" />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};