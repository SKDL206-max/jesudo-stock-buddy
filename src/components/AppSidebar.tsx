import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  ScrollText, AlertTriangle, Printer, Settings, CalendarRange,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
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
  const visible = items;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <div className={cn("px-4 py-5 border-b border-sidebar-border", collapsed && "px-2")}>
          {collapsed ? (
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-foreground">
              J
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-foreground">
                J
              </div>
              <div>
                <div className="text-sidebar-foreground font-bold leading-tight">JESUDO</div>
                <div className="text-xs text-sidebar-foreground/70">Espace Administrateur</div>
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-[10px] tracking-wider">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((it) => {
                const active = pathname === it.url;
                return (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild className="data-[active=true]:bg-sidebar-accent" isActive={active}>
                      <NavLink to={it.url} end className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                        active && "bg-sidebar-accent text-sidebar-foreground font-semibold border-l-2 border-accent"
                      )}>
                        <it.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{it.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
