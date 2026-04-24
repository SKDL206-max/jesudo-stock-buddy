import { Product } from "@/types";
import { cn } from "@/lib/utils";

export function StockStatusBadge({ product }: { product: Product }) {
  if (product.currentStock === 0) {
    return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive")}>Rupture</span>;
  }
  if (product.currentStock <= product.minStockAlert) {
    return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/15 text-warning")}>Stock faible</span>;
  }
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success")}>En stock</span>;
}

export function MovementBadge({ type }: { type: "ENTREE" | "SORTIE" }) {
  return type === "ENTREE" ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success">ENTRÉE</span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">SORTIE</span>
  );
}
