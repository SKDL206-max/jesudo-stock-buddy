import { Product, StockMovement, CompanySettings } from "@/types";
import { buildInitialProducts } from "@/data/initialProducts";

const PK = "jesudo_products";
const MK = "jesudo_movements";
const SK = "jesudo_settings";

const DEFAULT_SETTINGS: CompanySettings = {
  name: "ETS JESUDO & FILS",
  address: "Boulevard de Comé sur la voie d'Akodéha, boutique N° 503",
  phone: "97 66 86 47 / 64 75 03 97 / 97 01 58 66",
  city: "Comé, Bénin",
  defaultMinStock: 5,
};

export function getProducts(): Product[] {
  const raw = localStorage.getItem(PK);
  if (!raw) {
    const seed = buildInitialProducts();
    localStorage.setItem(PK, JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveProducts(p: Product[]) {
  localStorage.setItem(PK, JSON.stringify(p));
  window.dispatchEvent(new Event("jesudo:data"));
}

export function getMovements(): StockMovement[] {
  const raw = localStorage.getItem(MK);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveMovements(m: StockMovement[]) {
  localStorage.setItem(MK, JSON.stringify(m));
  window.dispatchEvent(new Event("jesudo:data"));
}

export function getSettings(): CompanySettings {
  const raw = localStorage.getItem(SK);
  if (!raw) return DEFAULT_SETTINGS;
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }; } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(s: CompanySettings) {
  localStorage.setItem(SK, JSON.stringify(s));
  window.dispatchEvent(new Event("jesudo:data"));
}

export function clearAll() {
  localStorage.removeItem(PK);
  localStorage.removeItem(MK);
  localStorage.removeItem(SK);
  window.dispatchEvent(new Event("jesudo:data"));
}

export function resetAllStocks() {
  const products = getProducts().map((p) => ({ ...p, currentStock: 0, updatedAt: new Date().toISOString() }));
  saveProducts(products);
}
