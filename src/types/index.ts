export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  category: string;
  type: "ENTREE" | "SORTIE";
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  reason: string;
  clientOrSupplier: string;
  note: string;
  date: string;
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  city: string;
  defaultMinStock: number;
}

export const CATEGORIES = [
  "Cahiers & Carnets",
  "Stylos & Crayons",
  "Règles & Instruments de dessin",
  "Couvertures",
  "Ardoises & Chiffons",
  "Papiers & Documents",
  "Matériel Informatique",
  "Agrafes & Reliure",
  "Badges & Cachets",
  "Divers & Bureau",
] as const;

export const UNITS = ["pièce", "boîte", "paquet", "lot", "feuille"] as const;

export interface WeeklyReportLine {
  productId: string;
  productName: string;
  category: string;
  unitPrice: number;
  stockBefore: number;
  qtySold: number;
  revenue: number;
  stockAfter: number;
}

export interface WeeklyReport {
  id: string;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  createdAt: string;
  lines: WeeklyReportLine[];
  totalRevenue: number;
  totalItemsSold: number;
  status: "brouillon" | "validé";
}
