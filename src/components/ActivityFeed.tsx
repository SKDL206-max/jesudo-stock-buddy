import { useStore } from "@/hooks/useStore";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Activity } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const { movements } = useStore();
  const list = movements.slice(0, limit);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Activity Feed
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          temps réel
        </span>
      </div>

      {list.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Aucune activité enregistrée</div>
      ) : (
        <ol className="relative border-l-2 border-border ml-3 space-y-4">
          {list.map((m, i) => {
            const isIn = m.type === "ENTREE";
            return (
              <li
                key={m.id}
                className="pl-5 relative animate-slide-in-right"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span
                  className={cn(
                    "absolute -left-[13px] top-0 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-card shadow-sm",
                    isIn ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
                  )}
                >
                  {isIn ? (
                    <ArrowDown className="h-3 w-3 animate-bounce" style={{ animationDuration: "1.5s", animationIterationCount: 2 }} />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                </span>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {m.productName}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
                      <span className={cn("font-semibold", isIn ? "text-success" : "text-destructive")}>
                        {isIn ? "+" : "−"}{m.quantity} {""}
                      </span>
                      <span>{m.category}</span>
                      {m.clientOrSupplier && <span>• {m.clientOrSupplier}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium tabular-nums">{formatFCFA(m.totalAmount)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {format(new Date(m.createdAt), "dd MMM HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
