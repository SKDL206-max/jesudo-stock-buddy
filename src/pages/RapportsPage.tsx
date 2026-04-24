import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { CATEGORIES, Product } from "@/types";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFCFA } from "@/lib/format";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, Printer } from "lucide-react";
import { downloadCSV, productsToCSV } from "@/lib/csv";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export default function RapportsPage() {
  const { products, movements, settings, upsertProduct } = useStore();
  const [day, setDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [edits, setEdits] = useState<Record<string, number>>({});

  const grouped = useMemo(() => {
    return CATEGORIES.map((c) => ({
      cat: c,
      items: products.filter((p) => p.category === c),
    }));
  }, [products]);

  const grandTotal = products.reduce((s, p) => s + p.currentStock * p.unitPrice, 0);

  const dayMovs = movements.filter((m) => m.date === day);
  const dayIn = dayMovs.filter((m) => m.type === "ENTREE");
  const dayOut = dayMovs.filter((m) => m.type === "SORTIE");

  const byCat = useMemo(() => {
    const total = products.reduce((s, p) => s + p.currentStock * p.unitPrice, 0) || 1;
    return CATEGORIES.map((c) => {
      const items = products.filter((p) => p.category === c);
      const stock = items.reduce((s, p) => s + p.currentStock, 0);
      const value = items.reduce((s, p) => s + p.currentStock * p.unitPrice, 0);
      return { name: c, refs: items.length, stock, value, pct: ((value / total) * 100).toFixed(1) };
    });
  }, [products]);

  const noPrice = products.filter((p) => p.unitPrice === 0);

  const exportFiche = () => {
    const rows: (string | number)[][] = [["Catégorie", "Produit", "Prix unitaire", "Stock", "Valeur"]];
    grouped.forEach((g) => g.items.forEach((p) => rows.push([g.cat, p.name, p.unitPrice, p.currentStock, p.unitPrice * p.currentStock])));
    downloadCSV("fiche_stock.csv", rows);
  };

  const savePrices = () => {
    Object.entries(edits).forEach(([id, price]) => {
      const p = products.find((x) => x.id === id);
      if (p && price > 0) upsertProduct({ ...p, unitPrice: price });
    });
    setEdits({});
    toast.success("Prix mis à jour");
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-2xl font-bold">Rapports</h1>
        <p className="text-sm text-muted-foreground mt-1">Génération et impression de rapports</p>
      </div>

      <Tabs defaultValue="fiche" className="space-y-4">
        <TabsList className="no-print">
          <TabsTrigger value="fiche">Fiche de stock</TabsTrigger>
          <TabsTrigger value="day">Rapport journalier</TabsTrigger>
          <TabsTrigger value="cat">Par catégorie</TabsTrigger>
          <TabsTrigger value="noprice">Produits sans prix</TabsTrigger>
        </TabsList>

        <TabsContent value="fiche">
          <div className="flex justify-end gap-2 mb-3 no-print">
            <Button variant="outline" onClick={exportFiche}><Download className="h-4 w-4 mr-2" />CSV</Button>
            <Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" />Imprimer</Button>
          </div>
          <Card className="p-6 print-area">
            <div className="text-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-primary">{settings.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">{settings.address}</p>
              <p className="text-xs text-muted-foreground">Tél: {settings.phone} — {settings.city}</p>
              <p className="text-xs font-semibold mt-2">Relevé du: {format(new Date(), "d MMMM yyyy", { locale: fr })}</p>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase border-b">
                <tr>
                  <th className="text-left py-2 px-2">Produit</th>
                  <th className="text-right py-2 px-2">Prix unit.</th>
                  <th className="text-right py-2 px-2">Stock</th>
                  <th className="text-right py-2 px-2">Valeur</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((g) => {
                  if (g.items.length === 0) return null;
                  const subtotal = g.items.reduce((s, p) => s + p.currentStock * p.unitPrice, 0);
                  return (
                    <>
                      <tr key={g.cat + "_h"} className="bg-primary/5">
                        <td colSpan={4} className="py-2 px-2 font-bold text-primary text-sm">{g.cat}</td>
                      </tr>
                      {g.items.map((p) => (
                        <tr key={p.id} className="border-b">
                          <td className="py-1.5 px-2">{p.name}</td>
                          <td className="py-1.5 px-2 text-right tabular-nums">{formatFCFA(p.unitPrice)}</td>
                          <td className="py-1.5 px-2 text-right tabular-nums">{p.currentStock}</td>
                          <td className="py-1.5 px-2 text-right tabular-nums">{formatFCFA(p.currentStock * p.unitPrice)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-muted/40">
                        <td colSpan={3} className="py-1.5 px-2 text-right">Sous-total {g.cat}</td>
                        <td className="py-1.5 px-2 text-right tabular-nums">{formatFCFA(subtotal)}</td>
                      </tr>
                    </>
                  );
                })}
                <tr className="font-bold bg-primary text-primary-foreground">
                  <td colSpan={3} className="py-3 px-2 text-right text-base">VALEUR TOTALE DU STOCK</td>
                  <td className="py-3 px-2 text-right tabular-nums text-base">{formatFCFA(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="day">
          <Card className="p-5 space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="w-[200px]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="p-4 bg-success/5 border-success/30">
                <p className="text-xs uppercase text-muted-foreground">Entrées du jour</p>
                <p className="text-2xl font-bold text-success">{dayIn.length}</p>
                <p className="text-xs text-muted-foreground">Valeur: {formatFCFA(dayIn.reduce((s, m) => s + m.totalAmount, 0))}</p>
              </Card>
              <Card className="p-4 bg-destructive/5 border-destructive/30">
                <p className="text-xs uppercase text-muted-foreground">Sorties du jour</p>
                <p className="text-2xl font-bold text-destructive">{dayOut.length}</p>
                <p className="text-xs text-muted-foreground">Valeur: {formatFCFA(dayOut.reduce((s, m) => s + m.totalAmount, 0))}</p>
              </Card>
              <Card className="p-4 bg-accent/10 border-accent/30">
                <p className="text-xs uppercase text-muted-foreground">CA estimé (ventes)</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatFCFA(dayOut.filter((m) => m.reason === "Vente").reduce((s, m) => s + m.totalAmount, 0))}
                </p>
              </Card>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-2">Produit</th>
                    <th className="text-center py-2 px-2">Type</th>
                    <th className="text-right py-2 px-2">Qté</th>
                    <th className="text-right py-2 px-2">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {dayMovs.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Aucun mouvement</td></tr>}
                  {dayMovs.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="py-2 px-2 font-medium">{m.productName}</td>
                      <td className="py-2 px-2 text-center text-xs">{m.type}</td>
                      <td className="py-2 px-2 text-right">{m.quantity}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{formatFCFA(m.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cat">
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Stock par catégorie</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCat}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="w-full text-sm mt-4">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left py-2 px-2">Catégorie</th>
                  <th className="text-right py-2 px-2">Nb réf.</th>
                  <th className="text-right py-2 px-2">Stock total</th>
                  <th className="text-right py-2 px-2">Valeur</th>
                  <th className="text-right py-2 px-2">% valeur</th>
                </tr>
              </thead>
              <tbody>
                {byCat.map((r) => (
                  <tr key={r.name} className="border-t">
                    <td className="py-2 px-2 font-medium">{r.name}</td>
                    <td className="py-2 px-2 text-right">{r.refs}</td>
                    <td className="py-2 px-2 text-right">{r.stock}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatFCFA(r.value)}</td>
                    <td className="py-2 px-2 text-right">{r.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="noprice">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{noPrice.length} produit(s) sans prix</h3>
              <Button onClick={savePrices} disabled={Object.keys(edits).length === 0}>Sauvegarder les prix</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-2">Produit</th>
                    <th className="text-left py-2 px-2">Catégorie</th>
                    <th className="text-right py-2 px-2">Stock</th>
                    <th className="text-right py-2 px-2">Nouveau prix (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  {noPrice.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Tous les produits ont un prix 🎉</td></tr>}
                  {noPrice.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2 px-2 font-medium">{p.name}</td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">{p.category}</td>
                      <td className="py-2 px-2 text-right">{p.currentStock}</td>
                      <td className="py-2 px-2 text-right">
                        <Input type="number" min={0} className="w-32 ml-auto text-right" value={edits[p.id] ?? ""}
                          onChange={(e) => setEdits({ ...edits, [p.id]: Math.max(0, +e.target.value || 0) })} />
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
