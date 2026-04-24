import { useEffect, useState, useCallback } from "react";
import { Product, StockMovement, CompanySettings } from "@/types";
import {
  getProducts, saveProducts, getMovements, saveMovements,
  getSettings, saveSettings,
} from "@/lib/storage";
import { uid } from "@/lib/format";

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(() => getSettings());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setProducts(getProducts());
    setMovements(getMovements());
    setSettings(getSettings());
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
    if (idx >= 0) {
      const delta = m.type === "ENTREE" ? m.quantity : -m.quantity;
      products[idx] = {
        ...products[idx],
        currentStock: Math.max(0, products[idx].currentStock + delta),
        unitPrice: m.type === "ENTREE" && m.unitPrice > 0 ? m.unitPrice : products[idx].unitPrice,
        updatedAt: new Date().toISOString(),
      };
      saveProducts(products);
    }
  };

  const updateSettings = (s: CompanySettings) => {
    saveSettings(s);
    setSettings(s);
  };

  return {
    products, movements, settings, loading,
    upsertProduct, deleteProduct, addMovement, updateSettings, reload,
  };
}
