import { useEffect, useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Status = "out" | "low" | "ok";

function statusOf(stock: number, min: number): Status {
  if (stock === 0) return "out";
  if (stock <= min) return "low";
  return "ok";
}

const COLORS: Record<Status, string> = {
  out: "bg-destructive text-destructive-foreground",
  low: "bg-warning text-warning-foreground",
  ok: "bg-success text-success-foreground",
};

export function StockHeatmap() {
  const { products } = useStore();
  const prevRef = useRef<Record<string, number>>({});
  const [pulse, setPulse] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    const updated: Record<string, number> = {};
    products.forEach((p) => {
      const prev = prevRef.current[p.id];
      if (prev !== undefined && prev !== p.currentStock) {
        updated[p.id] = Date.now();
      }
      next[p.id] = p.currentStock;
    });
    prevRef.current = next;
    if (Object.keys(updated).length) {
      setPulse((s) => ({ ...s, ...updated }));
      const t = setTimeout(() => {
        setPulse((s) => {
          const n = { ...s };
          Object.keys(updated).forEach((k) => delete n[k]);
          return n;
        });
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [products]);

  const counts = products.reduce(
    (acc, p) => {
      acc[statusOf(p.currentStock, p.minStockAlert)]++;
      return acc;
    },
    { out: 0, low: 0, ok: 0 } as Record<Status, number>
  );

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Flame className="h-4 w-4 text-accent" /> Heatmap du stock
        </h3>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success" />Optimal {counts.ok}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-warning" />Faible {counts.low}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-destructive" />Rupture {counts.out}</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Aucun produit</div>
      ) : (
        <div className="grid grid-cols-12 sm:grid-cols-16 md:grid-cols-20 lg:grid-cols-24 gap-1.5">
          {products.map((p) => {
            const s = statusOf(p.currentStock, p.minStockAlert);
            const pulsing = pulse[p.id];
            return (
              <Tooltip key={p.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-sm transition-all duration-500 hover:scale-125 hover:z-10 cursor-pointer relative",
                      COLORS[s],
                      s === "out" && "animate-heartbeat",
                      pulsing && "ring-2 ring-accent ring-offset-1 ring-offset-card scale-110"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-muted-foreground">
                    Stock: {p.currentStock} {p.unit} · Seuil: {p.minStockAlert}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}
    </Card>
  );
}
