import { useNavigate } from "react-router-dom";
import { ShieldCheck, Users, Phone, MapPin, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { setRole } from "@/lib/role";
import heroImg from "@/assets/hero-jesudo.jpg";

export default function LandingPage() {
  const navigate = useNavigate();

  const enter = (r: "admin" | "employe") => {
    setRole(r);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-foreground">J</div>
          <div>
            <div className="font-bold text-primary leading-tight">ETS JESUDO &amp; FILS</div>
            <div className="text-[11px] text-muted-foreground">Informatique • Bureautique • Fournitures • Négoce</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Boutique ETS JESUDO & FILS — fournitures, informatique et bureautique à Comé"
            className="w-full h-full object-cover"
            width={1600}
            height={900}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-primary-foreground">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl">
            Plateforme de gestion — ETS JESUDO &amp; FILS
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-primary-foreground/90">
            Suivi du stock, bilans hebdomadaires de ventes et reporting pour
            l'informatique, la bureautique, les fournitures scolaires et l'alimentation générale.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur">Comé, Bénin</span>
            <span className="px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur">RC N° RBLOKOSSA/2018-A-291</span>
            <span className="px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur">IFU: 0201810339537</span>
          </div>
        </div>
      </section>

      {/* Spaces */}
      <section className="max-w-6xl mx-auto w-full px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Choisissez votre espace</h2>
          <p className="text-sm text-muted-foreground mt-2">Accédez à l'interface adaptée à votre rôle dans l'établissement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">Espace Administrateur</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Accès complet : gestion du stock, entrées/sorties, rapports, paramètres et tous les modules.
                </p>
                <ul className="mt-3 text-xs text-muted-foreground space-y-1">
                  <li>• Création et modification des produits</li>
                  <li>• Saisie des entrées et sorties de stock</li>
                  <li>• Rapports, impressions et paramètres</li>
                </ul>
                <Button className="mt-5 w-full" onClick={() => enter("admin")}>
                  Entrer comme Administrateur <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-accent">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">Espace Employé</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pour les membres de l'entreprise chargés du bilan hebdomadaire et du suivi quotidien.
                </p>
                <ul className="mt-3 text-xs text-muted-foreground space-y-1">
                  <li>• Saisie du bilan hebdomadaire de ventes</li>
                  <li>• Consultation du tableau de bord et alertes</li>
                  <li>• Lecture seule sur le stock (pas de modification)</li>
                </ul>
                <Button variant="secondary" className="mt-5 w-full" onClick={() => enter("employe")}>
                  Entrer comme Employé <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-sidebar text-sidebar-foreground">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-foreground">J</div>
              <div className="font-bold">ETS JESUDO &amp; FILS</div>
            </div>
            <p className="text-sidebar-foreground/80 leading-relaxed">
              Informatique, Bureautique, Formations, Achat et vente des fournitures
              scolaires et produits forestiers, Alimentation générale, Négoce et
              Prestations de services, Divers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-accent">Contact</h4>
            <ul className="space-y-2 text-sidebar-foreground/85">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>Boulevard de Comé, voie d'Akodéha — Boutique N° 503, Comé, Bénin</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>97 66 86 47 / 64 75 03 97 / 97 01 58 66</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-accent">Informations légales</h4>
            <ul className="space-y-2 text-sidebar-foreground/85">
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>R.C N° RBLOKOSSA/2018-A-291</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>IFU : 0201810339537</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-sidebar-border">
          <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-sidebar-foreground/60 flex flex-col md:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} ETS JESUDO &amp; FILS. Tous droits réservés.</span>
            <span>Plateforme de gestion interne</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
