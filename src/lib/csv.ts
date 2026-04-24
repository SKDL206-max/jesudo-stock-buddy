import { Product, StockMovement } from "@/types";

function escape(s: string) {
  if (s == null) return "";
  const v = String(s);
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => escape(String(c))).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function productsToCSV(products: Product[]) {
  const rows: (string | number)[][] = [
    ["#", "Produit", "Catégorie", "Prix unitaire (FCFA)", "Stock actuel", "Valeur stock (FCFA)", "Seuil alerte", "Unité"],
  ];
  products.forEach((p, i) => {
    rows.push([i + 1, p.name, p.category, p.unitPrice, p.currentStock, p.unitPrice * p.currentStock, p.minStockAlert, p.unit]);
  });
  downloadCSV("stock_jesudo.csv", rows);
}

export function movementsToCSV(movs: StockMovement[]) {
  const rows: (string | number)[][] = [
    ["Date", "Produit", "Catégorie", "Type", "Quantité", "Prix unitaire", "Montant total", "Motif", "Client/Fournisseur", "Note"],
  ];
  movs.forEach((m) => {
    rows.push([m.date, m.productName, m.category, m.type, m.quantity, m.unitPrice, m.totalAmount, m.reason, m.clientOrSupplier, m.note]);
  });
  downloadCSV("mouvements_jesudo.csv", rows);
}
