import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { CATEGORIES } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MovementBadge } from "@/components/StatusBadges";
import { formatFCFA } from "@/lib/format";
import { format } from "date-fns";
import { Download, RotateCcw } from "lucide-react";
import { movementsToCSV } from "@/lib/csv";

const PAGE_SIZE = 30;

export default function HistoriquePage() {
  const { movements } = useStore();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [cat, setCat] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return movements
      .filter((m) => {
        if (search && !m.productName.toLowerCase().includes(search.toLowerCase())) return false;
        if (type !== "ALL" && m.type !== type) return false;
        if (cat !== "ALL" && m.category !== cat) return false;
        if (from && m.date < from) return false;
        if (to && m.date > to) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [movements, search, type, cat, from, to]);

  const totalIn = filtered.filter((m) => m.type === "ENTREE").reduce((s, m) => s + m.quantity, 0);
  const totalOut = filtered.filter((m) => m.type === "SORTIE").reduce((s, m) => s + m.quantity, 0);
  const totalOutValue = filtered.filter((m) => m.type === "SORTIE").reduce((s, m) => s + m.totalAmount, 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => { setSearch(""); setType("ALL"); setCat("ALL"); setFrom(""); setTo(""); setPage(1); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold">Historique des mouvements</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} mouvement(s)</p>
        </div>
        <Button variant="outline" onClick={() => movementsToCSV(filtered)}>
          <Download className="h-4 w-4 mr-2" /> Exporter CSV
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Input className="md:col-span-2" placeholder="Rechercher produit..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous types</SelectItem>
              <SelectItem value="ENTREE">Entrées</SelectItem>
              <SelectItem value="SORTIE">Sorties</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes catégories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="h-3 w-3 mr-2" /> Réinitialiser filtres</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase">Mouvements</p><p className="text-xl font-bold">{filtered.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase">Total entrées</p><p className="text-xl font-bold text-success">{totalIn}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase">Total sorties</p><p className="text-xl font-bold text-destructive">{totalOut}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase">Valeur sorties</p><p className="text-xl font-bold">{formatFCFA(totalOutValue)}</p></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left py-3 px-3">Date & Heure</th>
                <th className="text-left py-3 px-3">Produit</th>
                <th className="text-left py-3 px-3">Catégorie</th>
                <th className="text-center py-3 px-3">Type</th>
                <th className="text-right py-3 px-3">Qté</th>
                <th className="text-left py-3 px-3">Motif</th>
                <th className="text-left py-3 px-3">Client/Fournisseur</th>
                <th className="text-right py-3 px-3">Montant</th>
                <th className="text-left py-3 px-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">Aucun mouvement</td></tr>
              )}
              {paged.map((m) => (
                <tr key={m.id} className="border-t hover:bg-muted/30">
                  <td className="py-2.5 px-3 text-muted-foreground tabular-nums text-xs">{format(new Date(m.createdAt), "dd/MM/yy HH:mm")}</td>
                  <td className="py-2.5 px-3 font-medium">{m.productName}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{m.category}</td>
                  <td className="py-2.5 px-3 text-center"><MovementBadge type={m.type} /></td>
                  <td className="py-2.5 px-3 text-right font-semibold tabular-nums">{m.quantity}</td>
                  <td className="py-2.5 px-3 text-xs">{m.reason}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{m.clientOrSupplier || "—"}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatFCFA(m.totalAmount)}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-[200px] truncate">{m.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t bg-muted/20">
            <span className="text-xs text-muted-foreground">Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</Button>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Suivant</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
