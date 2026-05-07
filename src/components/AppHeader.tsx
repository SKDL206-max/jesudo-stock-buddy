import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStore } from "@/hooks/useStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";
import { clearRole } from "@/lib/role";

export function AppHeader() {
  const [now, setNow] = useState(new Date());
  const { products } = useStore();
  const role = useRole();
  const navigate = useNavigate();
  const logout = () => { clearRole(); navigate("/"); };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const alertsCount = products.filter(
    (p) => p.currentStock === 0 || p.currentStock <= p.minStockAlert
  ).length;

  return (
    <header className="app-header h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <div className="text-lg font-bold text-primary tracking-tight">ETS JESUDO</div>
          <div className="text-xs text-muted-foreground">Centre Informatique — Comé, Bénin</div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden sm:block text-right">
          <div className="text-sm font-semibold text-foreground capitalize">
            {format(now, "EEEE d MMMM yyyy", { locale: fr })}
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {format(now, "HH:mm:ss")}
          </div>
        </div>

        <Link to="/alertes" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-foreground" />
          {alertsCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {alertsCount}
            </Badge>
          )}
        </Link>

        {role && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs font-semibold text-foreground">
            <span className={`h-2 w-2 rounded-full ${role === "admin" ? "bg-primary" : "bg-accent"}`} />
            {role === "admin" ? "Administrateur" : "Employé"}
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={logout} title="Quitter">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Quitter</span>
        </Button>
      </div>
    </header>
  );
}
