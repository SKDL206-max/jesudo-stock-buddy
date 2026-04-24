import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Save, Eye, Printer, Trash2, Search } from "lucide-react";
import { format, startOfWeek, endOfWeek, getISOWeek, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatFCFA, uid } from "@/lib/format";
import { CATEGORIES, WeeklyReport, WeeklyReportLine, Product } from "@/types";
import { toast } from "sonner";

function buildWeekLabel(start: Date, end: Date) {
  const wk = getISOWeek(start);
  return `Semaine ${wk} — ${format(start, "dd MMM", { locale: fr })} au ${format(end, "dd MMM yyyy", { locale: fr })}`;
}

export default function BilanSemainePage() {
  const { products, settings, weeklyReports, saveWeeklyReport, deleteWeeklyReport } = useStore();
  const [tab, setTab] = useState("nouveau");
  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }));
  const [weekEnd, setWeekEnd] = useState<Date>(endOfWeek(today, { weekStartsOn: 1 }));
  const [started, setStarted] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("ALL");
  const [onlySold, setOnlySold] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [detailReport, setDetailReport] = useState<WeeklyReport | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const weekLabel = buildWeekLabel(weekStart, weekEnd);

  const eligibleProducts = useMemo(
    () => products.filter((p) => p.currentStock > 0).sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    eligibleProducts.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [eligibleProducts]);

  const lines: WeeklyReportLine[] = useMemo(
    () => eligibleProducts.map((p) => {
      const q = quantities[p.id] || 0;
      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        unitPrice: p.unitPrice,
        stockBefore: p.currentStock,
        qtySold: q,
        revenue: q * p.unitPrice,
        stockAfter: p.currentStock - q,
      };
    }),
    [eligibleProducts, quantities],
  );

  const totals = useMemo(() => {
    const sold = lines.filter((l) => l.qtySold > 0);
    return {
      refs: sold.length,
      qty: sold.reduce((s, l) => s + l.qtySold, 0),
      revenue: sold.reduce((s, l) => s + l.revenue, 0),
      hasOverflow: lines.some((l) => l.qtySold > l.stockBefore),
    };
  }, [lines]);

  const matchSearch = (p: Product) => {
    if (catFilter !== "ALL" && p.category !== catFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (onlySold && (quantities[p.id] || 0) === 0) return false;
    return true;
  };

  const startBilan = () => {
    const exists = weeklyReports.find(
      (r) => r.weekStart === weekStart.toISOString().slice(0, 10) && r.status === "validé",
    );
    if (exists) {
      setDuplicateOpen(true);
      return;
    }
    setQuantities({});
    setStarted(true);
  };

  const handleSave = () => {
    if (totals.hasOverflow) {
      toast.error("Quantités invalides", { description: "Certaines quantités dépassent le stock." });
      return;
    }
    if (totals.refs === 0) {
      toast.error("Aucune vente saisie");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    const report: WeeklyReport = {
      id: uid(),
      weekLabel,
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      lines: lines.filter((l) => l.qtySold > 0),
      totalRevenue: totals.revenue,
      totalItemsSold: totals.qty,
      status: "validé",
    };
    saveWeeklyReport(report);
    toast.success("Bilan enregistré", { description: `Stock mis à jour pour ${totals.refs} produits` });
    setConfirmOpen(false);
    setStarted(false);
    setQuantities({});
    setHighlightId(report.id);
    setTab("historique");
    setTimeout(() => setHighlightId(null), 3000);
  };

  const setQty = (id: string, val: number, max: number) => {
    const v = Math.max(0, Math.min(max, Number.isFinite(val) ? val : 0));
    setQuantities((q) => ({ ...q, [id]: v }));
  };

  // History stats
  const historyStats = useMemo(() => {
    const validated = weeklyReports.filter((r) => r.status === "validé");
    const cum = validated.reduce((s, r) => s + r.totalRevenue, 0);
    const best = validated.reduce<WeeklyReport | null>((b, r) => (!b || r.totalRevenue > b.totalRevenue ? r : b), null);
    const currentStartIso = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().slice(0, 10);
    const current = validated.find((r) => r.weekStart === currentStartIso);
    return { count: validated.length, cum, best, current };
  }, [weeklyReports]);

  const printReport = (report: WeeklyReport) => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const byCat = new Map<string, WeeklyReportLine[]>();
    report.lines.forEach((l) => {
      if (!byCat.has(l.category)) byCat.set(l.category, []);
      byCat.get(l.category)!.push(l);
    });
    const html = `
<!doctype html><html><head><meta charset="utf-8"><title>${report.weekLabel}</title>
<style>
  body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 24px; color: #111; }
  h1, h2, h3 { margin: 0; }
  .header { border-bottom: 2px solid #1B3F72; padding-bottom: 12px; margin-bottom: 16px; }
  .header .name { color: #1B3F72; font-weight: 800; font-size: 18px; }
  .header .sub { color: #555; font-size: 12px; }
  .title { margin-top: 14px; font-size: 16px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f1f5f9; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .cat { background: #1B3F72; color: white; font-weight: 700; }
  .subtotal td { background: #f8fafc; font-weight: 600; }
  .total td { background: #1B3F72; color: white; font-weight: 700; }
  .sign { margin-top: 32px; display: flex; justify-content: space-between; font-size: 12px; }
</style></head><body>
<div class="header">
  <div class="name">ETS JESUDO — Centre Informatique</div>
  <div class="sub">${settings.address} — Tél: ${settings.phone}</div>
  <div class="title">BILAN HEBDOMADAIRE — ${report.weekLabel}</div>
  <div class="sub">Édité le: ${format(new Date(), "dd/MM/yyyy HH:mm")}</div>
</div>
<table>
<thead><tr><th>Produit</th><th class="num">Stock avant</th><th class="num">Qté vendue</th><th class="num">Prix unitaire</th><th class="num">CA</th><th class="num">Stock après</th></tr></thead>
<tbody>
${Array.from(byCat.entries()).map(([cat, ls]) => {
  const subQ = ls.reduce((s, l) => s + l.qtySold, 0);
  const subR = ls.reduce((s, l) => s + l.revenue, 0);
  return `
    <tr class="cat"><td colspan="6">${cat}</td></tr>
    ${ls.map((l) => `<tr><td>${l.productName}</td><td class="num">${l.stockBefore}</td><td class="num">${l.qtySold}</td><td class="num">${formatFCFA(l.unitPrice)}</td><td class="num">${formatFCFA(l.revenue)}</td><td class="num">${l.stockAfter}</td></tr>`).join("")}
    <tr class="subtotal"><td>Sous-total ${cat}</td><td></td><td class="num">${subQ}</td><td></td><td class="num">${formatFCFA(subR)}</td><td></td></tr>
  `;
}).join("")}
<tr class="total"><td>TOTAL GÉNÉRAL</td><td></td><td class="num">${report.totalItemsSold}</td><td></td><td class="num">${formatFCFA(report.totalRevenue)}</td><td></td></tr>
</tbody></table>
<div class="sign"><div>Responsable: _____________________</div><div>Cachet:</div></div>
<script>window.onload = () => { window.print(); };</script>
</body></html>`;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bilan Hebdomadaire de Ventes</h1>
        <p className="text-sm text-muted-foreground mt-1">Saisissez les ventes de la semaine et mettez à jour votre stock</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="nouveau">Nouveau Bilan</TabsTrigger>
          <TabsTrigger value="historique">Historique des bilans ({weeklyReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="nouveau" className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Semaine du (lundi)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(weekStart, "dd MMM yyyy", { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={weekStart}
                      onSelect={(d) => {
                        if (d) {
                          const s = startOfWeek(d, { weekStartsOn: 1 });
                          setWeekStart(s);
                          setWeekEnd(endOfWeek(s, { weekStartsOn: 1 }));
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">au (dimanche)</label>
                <div className="mt-1 px-3 py-2 rounded-md border bg-muted text-sm">
                  {format(weekEnd, "dd MMM yyyy", { locale: fr })}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Libellé</label>
                <div className="mt-1 px-3 py-2 rounded-md border bg-muted text-sm font-medium text-primary">
                  {weekLabel}
                </div>
              </div>
              {!started && (
                <Button onClick={startBilan}>Commencer le bilan</Button>
              )}
              {started && (
                <Button variant="outline" onClick={() => setStarted(false)}>Annuler</Button>
              )}
            </div>
          </Card>

          {started && (
            <>
              <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher un produit…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={catFilter} onValueChange={setCatFilter}>
                    <SelectTrigger className="w-full md:w-[260px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toutes catégories</SelectItem>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={onlySold} onCheckedChange={(v) => setOnlySold(!!v)} />
                    Uniquement les articles vendus
                  </label>
                </div>
              </Card>

              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto pb-32">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-xs uppercase text-muted-foreground border-b sticky top-0">
                      <tr>
                        <th className="text-left py-2 px-3">Produit</th>
                        <th className="text-right py-2 px-3">Prix unitaire</th>
                        <th className="text-right py-2 px-3">Stock actuel</th>
                        <th className="text-right py-2 px-3 w-32">Qté vendue</th>
                        <th className="text-right py-2 px-3">CA semaine</th>
                        <th className="text-right py-2 px-3">Stock restant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map(([cat, list]) => {
                        const visible = list.filter(matchSearch);
                        if (visible.length === 0) return null;
                        return (
                          <>
                            <tr key={`cat-${cat}`}>
                              <td colSpan={6} className="bg-primary/10 text-primary font-semibold px-3 py-2 text-xs uppercase tracking-wide">
                                {cat} ({visible.length})
                              </td>
                            </tr>
                            {visible.map((p) => {
                              const q = quantities[p.id] || 0;
                              const after = p.currentStock - q;
                              const overflow = q > p.currentStock;
                              const afterColor = after === 0
                                ? "text-destructive"
                                : after <= p.minStockAlert
                                ? "text-warning"
                                : "text-success";
                              return (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                                  <td className="py-2 px-3">
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-xs text-muted-foreground">{p.category}</div>
                                  </td>
                                  <td className="py-2 px-3 text-right tabular-nums">{formatFCFA(p.unitPrice)}</td>
                                  <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{p.currentStock}</td>
                                  <td className="py-2 px-3">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={p.currentStock}
                                      value={q || ""}
                                      onChange={(e) => setQty(p.id, parseInt(e.target.value || "0"), p.currentStock)}
                                      className={cn("h-8 text-right tabular-nums", overflow && "border-destructive ring-2 ring-destructive/30")}
                                      title={overflow ? `Max: ${p.currentStock}` : undefined}
                                      placeholder="0"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-right tabular-nums font-medium">{formatFCFA(q * p.unitPrice)}</td>
                                  <td className={cn("py-2 px-3 text-right tabular-nums font-semibold", afterColor)}>
                                    {after}
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 shadow-lg">
                <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6 text-sm">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Articles vendus</div>
                      <div className="font-bold text-base">{totals.refs} réf.</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Total vendu</div>
                      <div className="font-bold text-base">{totals.qty} unités</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">CA total</div>
                      <div className="font-bold text-base text-success">{formatFCFA(totals.revenue)}</div>
                    </div>
                  </div>
                  <Button size="lg" onClick={handleSave} disabled={totals.refs === 0 || totals.hasOverflow}>
                    <Save className="mr-2 h-4 w-4" /> Enregistrer le bilan
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="historique" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Bilans enregistrés</div>
              <div className="text-2xl font-bold mt-1">{historyStats.count}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">CA cumulé</div>
              <div className="text-2xl font-bold mt-1 text-success">{formatFCFA(historyStats.cum)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Meilleure semaine</div>
              <div className="text-sm font-semibold mt-1">{historyStats.best?.weekLabel || "—"}</div>
              <div className="text-xs text-muted-foreground">{historyStats.best ? formatFCFA(historyStats.best.totalRevenue) : ""}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Semaine en cours</div>
              <div className="text-2xl font-bold mt-1">{historyStats.current ? formatFCFA(historyStats.current.totalRevenue) : "—"}</div>
            </Card>
          </div>

          {weeklyReports.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              Aucun bilan enregistré pour le moment.
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weeklyReports.map((r) => {
                const top3 = [...r.lines].sort((a, b) => b.qtySold - a.qtySold).slice(0, 3);
                return (
                  <Card key={r.id} className={cn("p-5 space-y-3", highlightId === r.id && "ring-2 ring-accent")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground">{r.weekLabel}</div>
                        <div className="text-xs text-muted-foreground">Créé le {format(parseISO(r.createdAt), "dd/MM/yyyy HH:mm")}</div>
                      </div>
                      <Badge variant={r.status === "validé" ? "default" : "secondary"}>{r.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div><div className="text-xs text-muted-foreground">Références</div><div className="font-semibold">{r.lines.length}</div></div>
                      <div><div className="text-xs text-muted-foreground">Unités</div><div className="font-semibold">{r.totalItemsSold}</div></div>
                      <div><div className="text-xs text-muted-foreground">CA</div><div className="font-semibold text-success">{formatFCFA(r.totalRevenue)}</div></div>
                    </div>
                    {top3.length > 0 && (
                      <div className="text-xs space-y-1 border-t pt-2">
                        <div className="font-medium text-muted-foreground uppercase tracking-wide">Top 3</div>
                        {top3.map((l) => (
                          <div key={l.productId} className="flex justify-between">
                            <span className="truncate">{l.productName}</span>
                            <span className="tabular-nums font-medium">{l.qtySold}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => setDetailReport(r)}><Eye className="h-4 w-4 mr-1" />Détail</Button>
                      <Button size="sm" variant="outline" onClick={() => printReport(r)}><Printer className="h-4 w-4 mr-1" />Imprimer</Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm save */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le bilan</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <div>Bilan de la <strong>{weekLabel}</strong></div>
                <ul className="list-disc list-inside">
                  <li>{totals.refs} références vendues</li>
                  <li>{totals.qty} unités écoulées</li>
                  <li>CA total: <strong>{formatFCFA(totals.revenue)}</strong></li>
                </ul>
                <div>Cette action va mettre à jour le stock de {totals.refs} produits.</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate week warning */}
      <AlertDialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bilan déjà existant</AlertDialogTitle>
            <AlertDialogDescription>
              Un bilan validé existe déjà pour cette semaine. Voulez-vous tout de même créer un nouveau bilan ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setDuplicateOpen(false); setQuantities({}); setStarted(true); }}>Continuer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce bilan ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le bilan sera supprimé de l'historique. Le stock ne sera pas restauré. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => { if (deleteId) { deleteWeeklyReport(deleteId); toast.success("Bilan supprimé"); setDeleteId(null); } }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail dialog */}
      <Dialog open={!!detailReport} onOpenChange={(o) => !o && setDetailReport(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailReport?.weekLabel}</DialogTitle>
            <DialogDescription>
              {detailReport?.lines.length} références — {detailReport?.totalItemsSold} unités — CA {detailReport ? formatFCFA(detailReport.totalRevenue) : ""}
            </DialogDescription>
          </DialogHeader>
          {detailReport && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Produit</th>
                    <th className="text-left py-2 px-2">Catégorie</th>
                    <th className="text-right py-2 px-2">Stock avant</th>
                    <th className="text-right py-2 px-2">Qté vendue</th>
                    <th className="text-right py-2 px-2">Prix unit.</th>
                    <th className="text-right py-2 px-2">CA</th>
                    <th className="text-right py-2 px-2">Stock après</th>
                  </tr>
                </thead>
                <tbody>
                  {detailReport.lines.map((l) => (
                    <tr key={l.productId} className="border-b last:border-0">
                      <td className="py-2 px-2 font-medium">{l.productName}</td>
                      <td className="py-2 px-2 text-muted-foreground text-xs">{l.category}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{l.stockBefore}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{l.qtySold}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{formatFCFA(l.unitPrice)}</td>
                      <td className="py-2 px-2 text-right tabular-nums font-medium">{formatFCFA(l.revenue)}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{l.stockAfter}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold bg-muted/40">
                    <td colSpan={3} className="py-2 px-2">TOTAL</td>
                    <td className="py-2 px-2 text-right tabular-nums">{detailReport.totalItemsSold}</td>
                    <td></td>
                    <td className="py-2 px-2 text-right tabular-nums text-success">{formatFCFA(detailReport.totalRevenue)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => detailReport && printReport(detailReport)}><Printer className="h-4 w-4 mr-2" />Imprimer</Button>
            <Button onClick={() => setDetailReport(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
