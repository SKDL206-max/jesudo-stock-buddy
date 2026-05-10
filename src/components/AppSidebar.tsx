import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  ScrollText, AlertTriangle, Printer, Settings, CalendarRange,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Gestion du stock", url: "/stock", icon: Package },
  { title: "Entrée de stock", url: "/entree", icon: ArrowDownToLine },
  { title: "Sortie de stock", url: "/sortie", icon: ArrowUpFromLine },
  { title: "Bilan Hebdomadaire", url: "/bilan-semaine", icon: CalendarRange },
  { title: "Historique", url: "/historique", icon: ScrollText },
  { title: "Alertes", url: "/alertes", icon: AlertTriangle },
  { title: "Rapports", url: "/rapports", icon: Printer },
  { title: "Paramètres", url: "/parametres", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState<{ top: number; height: number; opacity: number }>({ top: 0, height: 0, opacity: 0 });

  useEffect(() => {
    const el = itemRefs.current[pathname];
    const list = listRef.current;
    if (!el || !list) { setPill((p) => ({ ...p, opacity: 0 })); return; }
    const top = el.offsetTop;
    const height = el.offsetHeight;
    setPill({ top, height, opacity: 1 });
  }, [pathname, collapsed]);

  // Magnetic effect handler
  const onItemMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    el.style.transform = `translateX(${(x * 4).toFixed(2)}px)`;
  };
  const onItemLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translateX(0)";
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <div className={cn("px-4 py-5 border-b border-sidebar-border", collapsed && "px-2")}>
          {collapsed ? (
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-foreground">J</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-foreground">J</div>
              <div>
                <div className="text-sidebar-foreground font-bold leading-tight">JESUDO</div>
                <div className="text-xs text-sidebar-foreground/70">Espace Administrateur</div>
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-[10px] tracking-wider">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent className="relative">
            {/* Liquid pill indicator */}
            <div
              aria-hidden
              className="absolute left-2 right-2 rounded-lg bg-gradient-to-r from-sidebar-accent to-sidebar-accent/70 shadow-[0_4px_20px_-4px_hsl(var(--accent)/0.4)] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ top: pill.top, height: pill.height, opacity: pill.opacity }}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 rounded-r-full bg-accent" />
            </div>

            <SidebarMenu>
              <ul ref={listRef} className="space-y-0.5 list-none m-0 p-0">
                {items.map((it) => {
                  const active = pathname === it.url;
                  return (
                    <li key={it.url} className="list-none">
                      <NavLink
                        to={it.url}
                        end
                        ref={(el) => { itemRefs.current[it.url] = el; }}
                        onMouseMove={onItemMove}
                        onMouseLeave={onItemLeave}
                        className={cn(
                          "relative flex items-center gap-3 rounded-lg mx-2 px-3 py-2.5 text-sidebar-foreground/85 hover:text-sidebar-foreground transition-[color,transform] duration-200 will-change-transform",
                          active && "text-sidebar-foreground font-semibold"
                        )}
                      >
                        <it.icon className={cn("h-4 w-4 shrink-0 transition-transform duration-300", active && "scale-110 text-accent")} />
                        {!collapsed && <span className="text-sm">{it.title}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4 text-[10px] text-sidebar-foreground/50 border-t border-sidebar-border">
            <div>RC N° RBLOKOSSA/2018-A-291</div>
            <div>IFU: 0201810339537</div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
