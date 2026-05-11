import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, ScrollText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/useStore";

const tabs = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Bord" },
  { to: "/stock", icon: Package, label: "Stock" },
  { to: "/entree", icon: ArrowDownToLine, label: "Entrée" },
  { to: "/sortie", icon: ArrowUpFromLine, label: "Sortie" },
  { to: "/historique", icon: ScrollText, label: "Histo." },
  { to: "/alertes", icon: AlertTriangle, label: "Alertes" },
];

export function MobileBottomTabs() {
  const { pathname } = useLocation();
  const { products } = useStore();
  const alertsCount = products.filter((p) => p.currentStock === 0 || p.currentStock <= p.minStockAlert).length;

  // Hide on landing
  if (pathname === "/") return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-[0_-4px_20px_-4px_hsl(var(--primary)/0.15)] safe-bottom"
    >
      <ul className="grid grid-cols-6 list-none m-0 p-0">
        {tabs.map((t) => {
          const active = pathname === t.to;
          const showBadge = t.to === "/alertes" && alertsCount > 0;
          return (
            <li key={t.to} className="list-none">
              <NavLink
                to={t.to}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors active:scale-95",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full bg-primary" />
                )}
                <div className="relative">
                  <t.icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                      {alertsCount}
                    </span>
                  )}
                </div>
                <span className="leading-none">{t.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
