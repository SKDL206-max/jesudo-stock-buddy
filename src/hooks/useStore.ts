import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Product, StockMovement, CompanySettings, WeeklyReport } from "@/types";
import {
  getProducts, saveProducts, getMovements, saveMovements,
  getSettings, saveSettings, getWeeklyReports, saveWeeklyReports,
} from "@/lib/storage";
import { uid } from "@/lib/format";
import { formatFCFA } from "@/lib/format";
import { getRole } from "@/lib/role";

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(() => getSettings());
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setProducts(getProducts());
    setMovements(getMovements());
    setSettings(getSettings());
    setWeeklyReports(getWeeklyReports());
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const h = () => reload();
    window.addEventListener("jesudo:data", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("jesudo:data", h);
      window.removeEventListener("storage", h);
    };
  }, [reload]);

  const upsertProduct = (p: Product) => {
    const list = getProducts();
    const idx = list.findIndex((x) => x.id === p.id);
    const now = new Date().toISOString();
    if (idx >= 0) list[idx] = { ...p, updatedAt: now };
    else list.push({ ...p, id: p.id || uid(), createdAt: now, updatedAt: now });
    saveProducts(list);
  };

  const deleteProduct = (id: string) => {
    saveProducts(getProducts().filter((p) => p.id !== id));
  };

  const addMovement = (m: Omit<StockMovement, "id" | "createdAt">) => {
    const list = getMovements();
    list.unshift({ ...m, id: uid(), createdAt: new Date().toISOString() });
    saveMovements(list);
    // Update product stock
    const products = getProducts();
    const idx = products.findIndex((p) => p.id === m.productId);
    let stockBefore = 0;
    let stockAfter = 0;
    if (idx >= 0) {
      stockBefore = products[idx].currentStock;
      const delta = m.type === "ENTREE" ? m.quantity : -m.quantity;
      stockAfter = Math.max(0, stockBefore + delta);
      products[idx] = {
        ...products[idx],
        currentStock: stockAfter,
        unitPrice: m.type === "ENTREE" && m.unitPrice > 0 ? m.unitPrice : products[idx].unitPrice,
        updatedAt: new Date().toISOString(),
      };
      saveProducts(products);
    }

    // Smart Toast — animated, contextual
    const isIn = m.type === "ENTREE";
    const role = getRole();
    const userLabel = role === "admin" ? "Administrateur" : "Système";
    const sign = isIn ? "+" : "−";
    toast[isIn ? "success" : "info"](
      `${sign}${m.quantity} · ${m.productName}`,
      {
        description: `${stockBefore} → ${stockAfter} ${products[idx]?.unit || ""} · ${formatFCFA(m.totalAmount)} · par ${userLabel}`,
        duration: 4000,
      }
    );
    if (stockAfter === 0 && idx >= 0) {
      toast.error(`Rupture: ${m.productName}`, {
        description: "Stock épuisé — réapprovisionnement requis",
        duration: 6000,
      });
    } else if (idx >= 0 && stockAfter > 0 && stockAfter <= products[idx].minStockAlert) {
      toast.warning(`Stock faible: ${m.productName}`, {
        description: `${stockAfter} restant(s) · seuil ${products[idx].minStockAlert}`,
        duration: 5000,
      });
    }
  };

  const updateSettings = (s: CompanySettings) => {
    saveSettings(s);
    setSettings(s);
  };

  const saveWeeklyReport = (report: WeeklyReport) => {
    const list = getWeeklyReports();
    const idx = list.findIndex((r) => r.id === report.id);
    if (idx >= 0) list[idx] = report;
    else list.unshift(report);
    saveWeeklyReports(list);

    // Apply stock deductions and create SORTIE movements
    if (report.status === "validé") {
      const prods = getProducts();
      const movs = getMovements();
      const now = new Date().toISOString();
      report.lines.forEach((line) => {
        if (line.qtySold <= 0) return;
        const pIdx = prods.findIndex((p) => p.id === line.productId);
        if (pIdx >= 0) {
          prods[pIdx] = {
            ...prods[pIdx],
            currentStock: Math.max(0, prods[pIdx].currentStock - line.qtySold),
            updatedAt: now,
          };
        }
        movs.unshift({
          id: uid(),
          productId: line.productId,
          productName: line.productName,
          category: line.category,
          type: "SORTIE",
          quantity: line.qtySold,
          unitPrice: line.unitPrice,
          totalAmount: line.revenue,
          reason: `Bilan semaine ${report.weekLabel}`,
          clientOrSupplier: "",
          note: "",
          date: report.weekEnd,
          createdAt: now,
        });
      });
      saveProducts(prods);
      saveMovements(movs);
    }
  };

  const deleteWeeklyReport = (id: string) => {
    saveWeeklyReports(getWeeklyReports().filter((r) => r.id !== id));
  };

  return {
    products, movements, settings, weeklyReports, loading,
    upsertProduct, deleteProduct, addMovement, updateSettings,
    saveWeeklyReport, deleteWeeklyReport, reload,
  };
}
