import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import BrandDashboard from "./pages/BrandDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import UserSelection from "./pages/UserSelection";
import NotFound from "./pages/NotFound";
import MapExample from "./pages/MapExample";
import PhotoCardExample from "./components/PhotoCardExample";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/select-user" element={<UserSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brand-dashboard" element={<BrandDashboard />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/map-example" element={<MapExample />} />
          <Route path="/photo-example" element={<PhotoCardExample />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
