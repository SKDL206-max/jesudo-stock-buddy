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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nom du produit *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label>Catégorie *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prix unitaire (FCFA)</Label>
              <Input type="number" min={0} value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: Math.max(0, +e.target.value || 0) })} />
            </div>
            <div>
              <Label>Stock actuel</Label>
              <Input type="number" min={0} value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: Math.max(0, +e.target.value || 0) })} />
            </div>
            <div>
              <Label>Seuil alerte</Label>
              <Input type="number" min={0} value={form.minStockAlert}
                onChange={(e) => setForm({ ...form, minStockAlert: Math.max(0, +e.target.value || 0) })} />
            </div>
            <div>
              <Label>Unité</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
