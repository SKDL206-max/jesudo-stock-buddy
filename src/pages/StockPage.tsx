import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { CATEGORIES, Product } from "@/types";
import { formatFCFA } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, ArrowDownToLine, ArrowUpFromLine, Download, Trash2, SlidersHorizontal, X } from "lucide-react";
import { StockStatusBadge } from "@/components/StatusBadges";
import { ProductModal } from "@/components/ProductModal";
import { productsToCSV } from "@/lib/csv";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
  const [stockMin, setStockMin] = useState<string>("");
  const [stockMax, setStockMax] = useState<string>("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const min = stockMin === "" ? -Infinity : Number(stockMin);
    const max = stockMax === "" ? Infinity : Number(stockMax);
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (cat !== "ALL" && p.category !== cat) return false;
      if (status === "OK" && !(p.currentStock > p.minStockAlert)) return false;
      if (status === "LOW" && !(p.currentStock > 0 && p.currentStock <= p.minStockAlert)) return false;
      if (status === "OUT" && p.currentStock !== 0) return false;
      if (p.currentStock < min || p.currentStock > max) return false;
      return true;
    });
  }, [products, search, cat, status, stockMin, stockMax]);

  const activeFilterCount =
    (cat !== "ALL" ? 1 : 0) + (status !== "ALL" ? 1 : 0) + (stockMin !== "" ? 1 : 0) + (stockMax !== "" ? 1 : 0);

  const resetFilters = () => {
    setCat("ALL"); setStatus("ALL"); setStockMin(""); setStockMax(""); setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (p: Product) => {
    upsertProduct(p);
    toast.success(editing ? "Produit modifié" : "Produit ajouté");
    setEditing(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Gestion du stock</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{filtered.length} produit(s) affiché(s)</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => productsToCSV(filtered)}>
            <Download className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Exporter CSV</span><span className="sm:hidden">CSV</span>
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Nouveau produit</span><span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      <Card className="p-3 sm:p-4 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-11 sm:h-10"
              placeholder="Rechercher un produit..."
              inputMode="search"
              autoComplete="off"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground"
                aria-label="Effacer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant={filtersOpen || activeFilterCount > 0 ? "default" : "outline"}
            size="icon"
            className="h-11 w-11 sm:h-10 sm:w-10 relative md:hidden shrink-0"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-label="Filtres"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Quick status chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { v: "ALL", label: "Tous" },
            { v: "OK", label: "En stock" },
            { v: "LOW", label: "Faible" },
            { v: "OUT", label: "Rupture" },
          ].map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => { setStatus(s.v); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95",
                status === s.v
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground border-border hover:bg-muted"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Advanced filters: always visible on desktop, collapsible on mobile */}
        <div className={cn("grid gap-3 sm:grid-cols-3", !filtersOpen && "hidden md:grid")}>
          <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}>
            <SelectTrigger className="h-11 sm:h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes catégories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            placeholder="Stock min"
            className="h-11 sm:h-10 tabular-nums"
            value={stockMin}
            onChange={(e) => { setStockMin(e.target.value); setPage(1); }}
          />
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            placeholder="Stock max"
            className="h-11 sm:h-10 tabular-nums"
            value={stockMax}
            onChange={(e) => { setStockMax(e.target.value); setPage(1); }}
          />
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="text-xs text-muted-foreground">{activeFilterCount} filtre(s) actif(s)</span>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
              <X className="h-3 w-3 mr-1" /> Réinitialiser
            </Button>
          </div>
        )}
      </Card>

      {/* Mobile card view */}
      <div className="md:hidden space-y-2">
        {paged.length === 0 && (
          <Card className="py-12 text-center text-sm text-muted-foreground">Aucun produit trouvé</Card>
        )}
        {paged.map((p) => (
          <Card key={p.id} className="p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm leading-tight">{p.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.category}</div>
              </div>
              <StockStatusBadge product={p} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div><div className="text-muted-foreground text-[10px] uppercase">Prix</div><div className="font-semibold tabular-nums">{formatFCFA(p.unitPrice)}</div></div>
              <div><div className="text-muted-foreground text-[10px] uppercase">Stock</div><div className="font-semibold tabular-nums">{p.currentStock}</div></div>
              <div><div className="text-muted-foreground text-[10px] uppercase">Valeur</div><div className="font-semibold tabular-nums">{formatFCFA(p.currentStock * p.unitPrice)}</div></div>
            </div>
            <div className="flex gap-1 pt-2 border-t">
              <Button size="sm" variant="ghost" className="flex-1 h-9" onClick={() => { setEditing(p); setModalOpen(true); }}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="flex-1 h-9" onClick={() => navigate(`/entree?product=${p.id}`)}>
                <ArrowDownToLine className="h-4 w-4 text-success" />
              </Button>
              <Button size="sm" variant="ghost" className="flex-1 h-9" onClick={() => navigate(`/sortie?product=${p.id}`)} disabled={p.currentStock === 0}>
                <ArrowUpFromLine className="h-4 w-4 text-destructive" />
              </Button>
              <Button size="sm" variant="ghost" className="flex-1 h-9" onClick={() => setToDelete(p)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop table view */}
      <Card className="overflow-hidden hidden md:block">
        <div className="overflow-x-auto scrollbar-thin">
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

      {/* Mobile pagination */}
      {totalPages > 1 && (
        <div className="md:hidden flex items-center justify-between gap-2">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</Button>
          <span className="text-xs text-muted-foreground">Page {page} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Suivant</Button>
        </div>
      )}

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
