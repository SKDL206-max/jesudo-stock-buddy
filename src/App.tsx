import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import StockPage from "./pages/StockPage";
import EntreePage from "./pages/EntreePage";
import SortiePage from "./pages/SortiePage";
import HistoriquePage from "./pages/HistoriquePage";
import AlertesPage from "./pages/AlertesPage";
import RapportsPage from "./pages/RapportsPage";
import ParametresPage from "./pages/ParametresPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/entree" element={<EntreePage />} />
            <Route path="/sortie" element={<SortiePage />} />
            <Route path="/historique" element={<HistoriquePage />} />
            <Route path="/alertes" element={<AlertesPage />} />
            <Route path="/rapports" element={<RapportsPage />} />
            <Route path="/parametres" element={<ParametresPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
