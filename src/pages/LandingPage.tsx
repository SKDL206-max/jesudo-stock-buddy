import { useNavigate } from "react-router-dom";
import { ShieldCheck, Users, Phone, MapPin, FileText, ArrowRight, Lock, BarChart3, ClipboardList, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-warning flex items-center justify-center font-extrabold text-white shadow-lg shadow-accent/20">
            J
          </div>
          <div>
            <div className="font-bold text-primary leading-tight tracking-tight">ETS JESUDO &amp; FILS</div>
            <div className="text-[11px] text-muted-foreground font-medium">Informatique • Bureautique • Fournitures • Négoce</div>
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/75 to-primary/50" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-primary-foreground animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium mb-4 animate-scale-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Plateforme opérationnelle — Comé, Bénin
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl">
            Plateforme de gestion — ETS JESUDO &amp; FILS
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-primary-foreground/90 leading-relaxed">
            Suivi du stock, bilans hebdomadaires de ventes et reporting pour
            l'informatique, la bureautique, les fournitures scolaires et l'alimentation générale.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 font-medium">Comé, Bénin</span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 font-medium">RC N° RBLOKOSSA/2018-A-291</span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 font-medium">IFU: 0201810339537</span>
          </div>
        </div>
      </section>

      {/* Decorative background behind cards */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background pointer-events-none" />

        {/* Spaces */}
        <section className="relative max-w-6xl mx-auto w-full px-4 py-14 md:py-20">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">Choisissez votre espace</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-lg mx-auto">
              Accédez à l'interface adaptée à votre rôle dans l'établissement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Admin Card */}
            <div className="group relative rounded-2xl border bg-card p-1 shadow-sm transition-all duration-500 hover:shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.25)] hover:-translate-y-1 hover:border-primary/40 animate-fade-in">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative rounded-xl bg-card p-6 md:p-8 overflow-hidden">
                {/* Glow orb */}
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />

                <div className="flex items-start gap-5 relative">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                        Espace Administrateur
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/10">
                        Accès total
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Gestion complète du stock, entrées/sorties, rapports, paramètres et tous les modules.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Lock, label: "Stock & produits" },
                    { icon: BarChart3, label: "Rapports & CA" },
                    { icon: Settings, label: "Paramètres" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-foreground/80 group-hover:bg-primary/5 transition-colors duration-300">
                      <f.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f.label}
                    </div>
                  ))}
                </div>

                <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    Création et modification des produits
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    Saisie des entrées et sorties de stock
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    Rapports, impressions et bilans
                  </li>
                </ul>

                <Button
                  className="mt-6 w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  onClick={() => enter("admin")}
                >
                  Entrer comme Administrateur
                  <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>
            </div>

            {/* Employé Card */}
            <div className="group relative rounded-2xl border bg-card p-1 shadow-sm transition-all duration-500 hover:shadow-[0_20px_50px_-12px_hsl(var(--accent)/0.25)] hover:-translate-y-1 hover:border-accent/40 animate-fade-in [animation-delay:150ms]">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/20 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative rounded-xl bg-card p-6 md:p-8 overflow-hidden">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl group-hover:bg-accent/20 transition-colors duration-500" />

                <div className="flex items-start gap-5 relative">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-warning text-white flex items-center justify-center shrink-0 shadow-lg shadow-accent/25 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Users className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-xl text-foreground group-hover:text-accent transition-colors duration-300">
                        Espace Employé
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent border border-accent/10">
                        Accès limité
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Pour les membres chargés du bilan hebdomadaire et du suivi quotidien.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: ClipboardList, label: "Bilan hebdo" },
                    { icon: Eye, label: "Vue stocks" },
                    { icon: AlertTriangle, label: "Alertes" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-foreground/80 group-hover:bg-accent/5 transition-colors duration-300">
                      <f.icon className="h-3.5 w-3.5 text-accent shrink-0" />
                      {f.label}
                    </div>
                  ))}
                </div>

                <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    Saisie du bilan hebdomadaire de ventes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    Consultation du tableau de bord et alertes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    Lecture seule sur le stock (pas de modification)
                  </li>
                </ul>

                <Button
                  variant="secondary"
                  className="mt-6 w-full h-12 text-base font-semibold border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-accent hover:text-accent"
                  onClick={() => enter("employe")}
                >
                  Entrer comme Employé
                  <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-warning flex items-center justify-center font-extrabold text-white shadow-lg shadow-accent/20">
                J
              </div>
              <div className="font-bold text-base">ETS JESUDO &amp; FILS</div>
            </div>
            <p className="text-sidebar-foreground/80 leading-relaxed text-sm">
              Informatique, Bureautique, Formations, Achat et vente des fournitures
              scolaires et produits forestiers, Alimentation générale, Négoce et
              Prestations de services, Divers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-accent">Contact</h4>
            <ul className="space-y-2.5 text-sidebar-foreground/85">
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
            <ul className="space-y-2.5 text-sidebar-foreground/85">
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
        <div className="border-t border-sidebar-border relative">
          <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-sidebar-foreground/60 flex flex-col md:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} ETS JESUDO &amp; FILS. Tous droits réservés.</span>
            <span>Plateforme de gestion interne</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

