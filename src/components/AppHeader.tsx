import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStore } from "@/hooks/useStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clearRole } from "@/lib/role";

export function AppHeader() {
  const [now, setNow] = useState(new Date());
  const { products } = useStore();
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
    <header className="app-header h-14 sm:h-16 border-b bg-card/95 backdrop-blur flex items-center justify-between gap-2 px-3 sm:px-4 md:px-6 sticky top-0 z-30 safe-top">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="shrink-0" />
        <div className="min-w-0">
          <div className="text-base sm:text-lg font-bold text-primary tracking-tight truncate">ETS JESUDO</div>
          <div className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground truncate">Centre Informatique — Comé, Bénin</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-5 shrink-0">
        <div className="hidden lg:block text-right">
          <div className="text-sm font-semibold text-foreground capitalize">
            {format(now, "EEEE d MMMM yyyy", { locale: fr })}
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {format(now, "HH:mm:ss")}
          </div>
        </div>

        <Link to="/alertes" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors active:scale-95">
          <Bell className="h-5 w-5 text-foreground" />
          {alertsCount > 0 && (
            <Badge className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {alertsCount}
            </Badge>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Administrateur
        </div>

        <Button variant="ghost" size="sm" onClick={logout} title="Quitter" className="px-2 sm:px-3">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-1">Quitter</span>
        </Button>
      </div>
    </header>
  );
}
