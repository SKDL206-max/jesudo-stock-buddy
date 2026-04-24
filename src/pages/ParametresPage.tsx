import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getProducts, getMovements, saveProducts, saveMovements, clearAll, resetAllStocks } from "@/lib/storage";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Upload, RefreshCw, Trash2 } from "lucide-react";

export default function ParametresPage() {
  const { settings, updateSettings, products, upsertProduct } = useStore();
  const [form, setForm] = useState(settings);
  const [globalMin, setGlobalMin] = useState(settings.defaultMinStock);

  const saveCompany = () => {
    updateSettings({ ...form, defaultMinStock: globalMin });
    toast.success("Paramètres enregistrés");
  };

  const applyMinToAll = () => {
    products.forEach((p) => upsertProduct({ ...p, minStockAlert: globalMin }));
    toast.success(`Seuil ${globalMin} appliqué à tous les produits`);
  };

  const exportJSON = () => {
    const data = { products: getProducts(), movements: getMovements(), settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `jesudo_backup_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Données exportées");
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.products) saveProducts(data.products);
        if (data.movements) saveMovements(data.movements);
        toast.success("Données importées");
      } catch {
        toast.error("Fichier JSON invalide");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Informations de l'établissement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Adresse</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>Ville</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
        </div>
        <div className="flex justify-end"><Button onClick={saveCompany}>Enregistrer</Button></div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Seuil d'alerte global</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Seuil minimum par défaut</Label>
            <Input type="number" min={0} value={globalMin} onChange={(e) => setGlobalMin(Math.max(0, +e.target.value || 0))} className="w-[160px]" />
          </div>
          <Button variant="outline" onClick={applyMinToAll}>Appliquer à tous les produits</Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Gestion des données</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" onClick={exportJSON}><Download className="h-4 w-4 mr-2" />Exporter (JSON)</Button>
          <label className="cursor-pointer">
            <input type="file" accept="application/json" className="hidden" onChange={importJSON} />
            <Button variant="outline" className="w-full" asChild><span><Upload className="h-4 w-4 mr-2" />Importer (JSON)</span></Button>
          </label>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-warning border-warning/40"><RefreshCw className="h-4 w-4 mr-2" />Réinitialiser le stock</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réinitialiser tous les stocks à zéro ?</AlertDialogTitle>
                <AlertDialogDescription>Les produits seront conservés mais leurs stocks seront mis à 0.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => { resetAllStocks(); toast.success("Stocks réinitialisés"); }}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Effacer toutes les données</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible. Toutes les données (produits, mouvements, paramètres) seront supprimées.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => { clearAll(); toast.success("Toutes les données ont été effacées"); setTimeout(() => location.reload(), 800); }}>Tout effacer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
