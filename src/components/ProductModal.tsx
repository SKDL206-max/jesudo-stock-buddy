import { useEffect, useState } from "react";
import { Product, CATEGORIES, UNITS } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uid } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: Product | null;
  onSave: (p: Product) => void;
  defaultMinStock?: number;
}

const empty = (defaultMin = 5): Product => ({
  id: "",
  name: "",
  category: CATEGORIES[0],
  unitPrice: 0,
  currentStock: 0,
  minStockAlert: defaultMin,
  unit: "pièce",
  createdAt: "",
  updatedAt: "",
});

export function ProductModal({ open, onOpenChange, product, onSave, defaultMinStock = 5 }: Props) {
  const [form, setForm] = useState<Product>(empty(defaultMinStock));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(product ?? empty(defaultMinStock));
    setErrors({});
  }, [product, open, defaultMinStock]);

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nom requis";
    if (!form.category) e.category = "Catégorie requise";
    if (form.unitPrice < 0) e.unitPrice = "Prix invalide";
    if (form.currentStock < 0) e.currentStock = "Stock invalide";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSave({ ...form, id: form.id || uid() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-lg p-0 gap-0 overflow-hidden
          max-sm:!w-screen max-sm:!h-[100dvh] max-sm:!max-w-none max-sm:!max-h-none
          max-sm:!rounded-none max-sm:!border-0 max-sm:!translate-x-0 max-sm:!translate-y-0
          max-sm:!top-0 max-sm:!left-0 max-sm:flex max-sm:flex-col
        "
      >
        <DialogHeader className="px-5 py-4 border-b safe-top">
          <DialogTitle className="text-base sm:text-lg">{product ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Nom du produit *</Label>
            <Input
              id="prod-name"
              autoComplete="off"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? "border-destructive h-12 sm:h-10" : "h-12 sm:h-10"}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Catégorie *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="h-12 sm:h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">Prix unitaire (FCFA)</Label>
              <Input
                id="prod-price"
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                min={0}
                step="any"
                className="h-12 sm:h-10 tabular-nums text-right"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: Math.max(0, +e.target.value || 0) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-stock">Stock actuel</Label>
              <Input
                id="prod-stock"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                className="h-12 sm:h-10 tabular-nums text-right"
                value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: Math.max(0, +e.target.value || 0) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-min">Seuil alerte</Label>
              <Input
                id="prod-min"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                className="h-12 sm:h-10 tabular-nums text-right"
                value={form.minStockAlert}
                onChange={(e) => setForm({ ...form, minStockAlert: Math.max(0, +e.target.value || 0) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unité</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger className="h-12 sm:h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 py-4 border-t bg-muted/20 safe-bottom flex-row gap-2 sm:gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none h-12 sm:h-10" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="flex-1 sm:flex-none h-12 sm:h-10" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
