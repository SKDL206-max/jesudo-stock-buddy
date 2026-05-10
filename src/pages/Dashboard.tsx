import { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { KpiCard } from "@/components/KpiCard";
import { Card } from "@/components/ui/card";
import { Package, Wallet, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { formatFCFA } from "@/lib/format";
import { CATEGORIES } from "@/types";
import { Link } from "react-router-dom";
import { format, startOfWeek } from "date-fns";
import { ActivityFeed } from "@/components/ActivityFeed";
import { StockHeatmap } from "@/components/StockHeatmap";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid,
  LineChart, Line,
} from "recharts";

const PIE_COLORS = [
  "hsl(217 61% 35%)", "hsl(38 92% 50%)", "hsl(142 71% 36%)", "hsl(0 73% 51%)",
  "hsl(262 60% 50%)", "hsl(190 80% 40%)", "hsl(32 95% 44%)", "hsl(280 65% 55%)",
  "hsl(160 60% 40%)", "hsl(15 80% 55%)",
];

export default function Dashboard() {
  const { products, movements, weeklyReports } = useStore();

  const currentWeekStartIso = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().slice(0, 10);
  const currentWeekReport = weeklyReports.find((r) => r.weekStart === currentWeekStartIso && r.status === "validé");

  const last8Weeks = useMemo(() => {
    return [...weeklyReports]
      .filter((r) => r.status === "validé")
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .slice(-8)
      .map((r) => ({
        name: `S${r.weekLabel.match(/Semaine (\d+)/)?.[1] || ""}`,
        ca: r.totalRevenue,
        full: r.weekLabel,
      }));
  }, [weeklyReports]);

  const totalRefs = products.length;
  const totalValue = products.reduce((s, p) => s + p.currentStock * p.unitPrice, 0);
  const lowStock = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert).length;
  const outOfStock = products.filter((p) => p.currentStock === 0).length;

  const top10 = useMemo(() => {
    return [...products]
      .map((p) => ({ name: p.name.length > 22 ? p.name.slice(0, 22) + "…" : p.name, value: p.currentStock * p.unitPrice }))
      .filter((p) => p.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [products]);

  const byCategory = useMemo(() => {
    return CATEGORIES.map((c) => ({
      name: c,
      value: products.filter((p) => p.category === c).reduce((s, p) => s + p.currentStock, 0),
    })).filter((d) => d.value > 0);
  }, [products]);

  const recent = movements.slice(0, 10);

  return (
    <div className="space-y-6">
      {(lowStock + outOfStock) > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning flex items-center justify-between">
          <span>⚠️ {lowStock + outOfStock} produit(s) nécessitent votre attention (rupture ou stock faible)</span>
          <Link to="/alertes" className="text-primary font-semibold hover:underline">Voir les alertes →</Link>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de votre stock</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Références" value={totalRefs} icon={Package} variant="primary" />
        <KpiCard title="Valeur totale du stock" value={formatFCFA(totalValue)} icon={Wallet} variant="success" />
        <KpiCard title="Alertes stock faible" value={lowStock} icon={AlertTriangle} variant="warning" alert={lowStock > 0} />
        <KpiCard title="Ruptures de stock" value={outOfStock} icon={XCircle} variant="destructive" alert={outOfStock > 0} />
        <KpiCard title="CA cette semaine" value={currentWeekReport ? formatFCFA(currentWeekReport.totalRevenue) : "—"} icon={TrendingUp} variant="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4">Top 10 — Valeur de stock</h3>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatFCFA(v)} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4">Répartition par catégorie</h3>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={(e: { name: string }) => e.name.split(" ")[0]}>
                  {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-foreground mb-4">📅 Évolution des ventes hebdomadaires</h3>
        {last8Weeks.length < 2 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <TrendingUp className="h-10 w-10 opacity-40" />
            <p className="text-sm">Enregistrez votre premier bilan hebdomadaire pour voir l'évolution</p>
            <Link to="/bilan-semaine" className="text-primary text-sm font-semibold hover:underline">Aller au Bilan Hebdomadaire →</Link>
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last8Weeks} margin={{ left: 10, right: 20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatFCFA(v)} labelFormatter={(_, p) => p?.[0]?.payload?.full || ""} />
                <Line type="monotone" dataKey="ca" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-foreground mb-4">Mouvements récents</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Aucun mouvement enregistré</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Produit</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-right py-2 px-3">Quantité</th>
                  <th className="text-right py-2 px-3">Montant</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-2 px-3 text-muted-foreground tabular-nums">{format(new Date(m.createdAt), "dd/MM HH:mm")}</td>
                    <td className="py-2 px-3 font-medium">{m.productName}</td>
                    <td className="py-2 px-3"><MovementBadge type={m.type} /></td>
                    <td className="py-2 px-3 text-right tabular-nums">{m.quantity}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium">{formatFCFA(m.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
