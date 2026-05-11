import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { CriticalFocusMode } from "./CriticalFocusMode";

export function AppLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background safe-x">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-[1600px] w-full mx-auto safe-bottom">
            <Outlet />
          </main>
        </div>
        <CriticalFocusMode />
      </div>
    </SidebarProvider>
  );
}
