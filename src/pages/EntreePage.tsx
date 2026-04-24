import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "@/hooks/useStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatFCFA } from "@/lib/format";
import { MovementBadge } from "@/components/StatusBadges";

const REASONS_IN = ["Achat", "Retour client", "Don", "Correction inventaire"];

export default function EntreePage() {
  const { products, movements, addMovement } = useStore();
  const [params] = useSearchParams();
  const presetId = params.get("product");

  const [productId, setProductId] = useState(presetId || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [supplier, setSupplier] = useState("");
  const [reason, setReason] = useState("Achat");
  const [note, setNote] = useState("");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  useEffect(() => {
    if (product) setUnitPrice(product.unitPrice);
  }, [product]);

  useEffect(() => { if (presetId) setProductId(presetId); }, [presetId]);

  const recent = movements.filter((m) => m.type === "ENTREE").slice(0, 10);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!productId) e.product = "Sélectionnez un produit";
    if (!quantity || quantity < 1) e.quantity = "Quantité minimum: 1";
    if (!date) e.date = "Date requise";
    setErrors(e);
    if (Object.keys(e).length || !product) return;

    addMovement({
      productId: product.id,
      productName: product.name,
      category: product.category,
      type: "ENTREE",
      quantity,
      unitPrice,
      totalAmount: quantity * unitPrice,
      reason,
      clientOrSupplier: supplier,
      note,
      date,
    });
    toast.success("✅ Entrée enregistrée — Stock mis à jour");
    setQuantity(1); setSupplier(""); setNote(""); setProductId(""); setUnitPrice(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Entrée de stock</h1>
        <p className="text-sm text-muted-foreground mt-1">Réapprovisionnement</p>
      </div>

      <Card className="p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Produit *</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", errors.product && "border-destructive")}>
                  {product ? `${product.name} (stock: ${product.currentStock})` : "Sélectionner un produit..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 pointer-events-auto" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher..." />
                  <CommandList>
                    <CommandEmpty>Aucun produit</CommandEmpty>
                    <CommandGroup>
                      {products.map((p) => (
                        <CommandItem key={p.id} value={p.name} onSelect={() => { setProductId(p.id); setOpen(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", productId === p.id ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1">{p.name}</span>
                          <span className="text-xs text-muted-foreground">stock: {p.currentStock}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.product && <p className="text-xs text-destructive mt-1">{errors.product}</p>}
          </div>

          <div>
            <Label>Quantité à ajouter *</Label>
            <Input type="number" min={1} value={quantity}
              className={errors.quantity ? "border-destructive" : ""}
              onChange={(e) => setQuantity(Math.max(1, +e.target.value || 1))} />
          </div>
          <div>
            <Label>Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Fournisseur / Source</Label>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Nom du fournisseur" />
          </div>
          <div>
            <Label>Motif</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASONS_IN.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Prix unitaire d'achat (FCFA)</Label>
            <Input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(Math.max(0, +e.target.value || 0))} />
            <p className="text-xs text-muted-foreground mt-1">Total: <span className="font-semibold">{formatFCFA(quantity * unitPrice)}</span></p>
          </div>
          <div className="md:col-span-2">
            <Label>Note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={submit} className="bg-success hover:bg-success/90 text-success-foreground">Enregistrer l'entrée</Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Dernières entrées</h3>
        {recent.length === 0 ? <p className="text-sm text-muted-foreground py-6 text-center">Aucune entrée</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Produit</th>
                  <th className="text-right py-2 px-2">Qté</th>
                  <th className="text-left py-2 px-2">Fournisseur</th>
                  <th className="text-right py-2 px-2">Montant</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2 px-2">{m.date}</td>
                    <td className="py-2 px-2 font-medium">{m.productName}</td>
                    <td className="py-2 px-2 text-right">{m.quantity}</td>
                    <td className="py-2 px-2 text-muted-foreground">{m.clientOrSupplier || "—"}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatFCFA(m.totalAmount)}</td>
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
