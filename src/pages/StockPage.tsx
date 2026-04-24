import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { CATEGORIES, Product } from "@/types";
import { formatFCFA } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, ArrowDownToLine, ArrowUpFromLine, Download, Trash2 } from "lucide-react";
import { StockStatusBadge } from "@/components/StatusBadges";
import { ProductModal } from "@/components/ProductModal";
import { productsToCSV } from "@/lib/csv";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 25;

export default function StockPage() {
  const { products, settings, upsertProduct, deleteProduct } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (cat !== "ALL" && p.category !== cat) return false;
      if (status === "OK" && !(p.currentStock > p.minStockAlert)) return false;
      if (status === "LOW" && !(p.currentStock > 0 && p.currentStock <= p.minStockAlert)) return false;
      if (status === "OUT" && p.currentStock !== 0) return false;
      return true;
    });
  }, [products, search, cat, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (p: Product) => {
    upsertProduct(p);
    toast.success(editing ? "Produit modifié" : "Produit ajouté");
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gestion du stock</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} produit(s) affiché(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => productsToCSV(filtered)}>
            <Download className="h-4 w-4 mr-2" /> Exporter CSV
          </Button>
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nouveau produit
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher un produit..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes catégories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous statuts</SelectItem>
              <SelectItem value="OK">En stock</SelectItem>
              <SelectItem value="LOW">Stock faible</SelectItem>
              <SelectItem value="OUT">Rupture</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left py-3 px-3">#</th>
                <th className="text-left py-3 px-3">Produit</th>
                <th className="text-left py-3 px-3">Catégorie</th>
                <th className="text-right py-3 px-3">Prix unit.</th>
                <th className="text-right py-3 px-3">Stock</th>
                <th className="text-right py-3 px-3">Valeur</th>
                <th className="text-center py-3 px-3">Statut</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">Aucun produit trouvé</td></tr>
              )}
              {paged.map((p, i) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="py-2.5 px-3 text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="py-2.5 px-3 font-medium">{p.name}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs">{p.category}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatFCFA(p.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{p.currentStock}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatFCFA(p.currentStock * p.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-center"><StockStatusBadge product={p} /></td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setModalOpen(true); }} title="Modifier">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/entree?product=${p.id}`)} title="Entrée rapide">
                        <ArrowDownToLine className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/sortie?product=${p.id}`)} title="Sortie rapide" disabled={p.currentStock === 0}>
                        <ArrowUpFromLine className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setToDelete(p)} title="Supprimer">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
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

      <ProductModal open={modalOpen} onOpenChange={setModalOpen} product={editing} onSave={handleSave} defaultMinStock={settings.defaultMinStock} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>"{toDelete?.name}" sera définitivement supprimé.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (toDelete) { deleteProduct(toDelete.id); toast.success("Produit supprimé"); }
              setToDelete(null);
            }}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
