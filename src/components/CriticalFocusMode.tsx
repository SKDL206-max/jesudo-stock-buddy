import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, XCircle, Eye, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/useStore";
import { cn } from "@/lib/utils";

const THRESHOLD = 3; // >= N alerts -> auto-activate

export function CriticalFocusMode() {
  const { products } = useStore();
  const [dismissed, setDismissed] = useState(false);

  const out = products.filter((p) => p.currentStock === 0);
  const low = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert);
  const total = out.length + low.length;
  const active = total >= THRESHOLD && !dismissed;

  // Re-arm when alert count grows
  useEffect(() => {
    if (total < THRESHOLD) setDismissed(false);
  }, [total]);

  if (!active) return null;

  const critical = [...out.map((p) => ({ p, kind: "out" as const })), ...low.map((p) => ({ p, kind: "low" as const }))];

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in">
      {/* Dim layer */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Radar pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <span className="absolute inset-0 rounded-full bg-destructive/20 animate-ping h-64 w-64 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative h-full flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border-2 border-destructive/40 animate-scale-in overflow-hidden">
          <div className="bg-destructive/10 border-b border-destructive/20 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center animate-heartbeat">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-destructive flex items-center gap-2">
                  Focus Critique activé
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                    {total} alertes
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">Action immédiate requise sur les produits ci-dessous</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDismissed(true)} title="Fermer">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[55vh] overflow-y-auto divide-y">
            {critical.map(({ p, kind }, i) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-5 py-3 animate-slide-in-right",
                  kind === "out" ? "bg-destructive/5" : "bg-warning/5"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {kind === "out" ? (
                    <XCircle className="h-5 w-5 text-destructive shrink-0 animate-pulse" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.category}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={cn("text-sm font-bold tabular-nums", kind === "out" ? "text-destructive" : "text-warning")}>
                    {p.currentStock} {p.unit}
                  </div>
                  <div className="text-[10px] text-muted-foreground">seuil {p.minStockAlert}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/40 px-5 py-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Le mode Focus se réactive si de nouvelles alertes apparaissent.</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDismissed(true)}>
                <Eye className="h-3.5 w-3.5 mr-1" /> Ignorer
              </Button>
              <Link to="/alertes" onClick={() => setDismissed(true)}>
                <Button size="sm">Voir les alertes</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
