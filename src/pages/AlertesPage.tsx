import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/hooks/useStore";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatFCFA } from "@/lib/format";

export default function AlertesPage() {
  const { products, movements } = useStore();
  const ruptures = useMemo(() => products.filter((p) => p.currentStock === 0), [products]);
  const lows = useMemo(() => products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert), [products]);

  const lastEntry = (productId: string) =>
    movements.find((m) => m.productId === productId && m.type === "ENTREE")?.date || "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertes de stock</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-semibold text-destructive">{ruptures.length}</span> en rupture |{" "}
          <span className="font-semibold text-warning">{lows.length}</span> en stock faible
        </p>
      </div>

      <Tabs defaultValue="rupture" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rupture">Ruptures ({ruptures.length})</TabsTrigger>
          <TabsTrigger value="low">Stock faible ({lows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rupture">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left py-3 px-3">Produit</th>
                    <th className="text-left py-3 px-3">Catégorie</th>
                    <th className="text-right py-3 px-3">Dernier prix</th>
                    <th className="text-left py-3 px-3">Dernière entrée</th>
                    <th className="text-right py-3 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ruptures.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Aucune rupture 🎉</td></tr>}
                  {ruptures.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2.5 px-3 font-medium">{p.name}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{p.category}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{formatFCFA(p.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{lastEntry(p.id)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Link to={`/entree?product=${p.id}`}>
                          <Button size="sm" variant="default">Réapprovisionner</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="low">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left py-3 px-3">Produit</th>
                    <th className="text-left py-3 px-3">Catégorie</th>
                    <th className="text-right py-3 px-3">Stock actuel</th>
                    <th className="text-right py-3 px-3">Seuil alerte</th>
                    <th className="text-right py-3 px-3">Prix unit.</th>
                    <th className="text-right py-3 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lows.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Aucun stock faible</td></tr>}
                  {lows.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2.5 px-3 font-medium">{p.name}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{p.category}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-warning tabular-nums">{p.currentStock}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{p.minStockAlert}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{formatFCFA(p.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Link to={`/entree?product=${p.id}`}>
                          <Button size="sm" variant="outline">Réapprovisionner</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
