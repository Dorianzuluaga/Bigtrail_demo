import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  MapPin, 
  History, 
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';

import Header from '@/components/Dashboard/Header';
import StatsCards from '@/components/Dashboard/StatsCards';
import Charts from '@/components/Dashboard/Charts';
import AirdropZones from '@/components/Dashboard/AirdropZones';
import InteractionHistory from '@/components/Dashboard/InteractionHistory';
import Map from '@/components/Map';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-6 space-y-6">
        {/* Stats Overview */}
        <StatsCards />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="zones" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Zonas</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Charts />
              </div>
              <div className="space-y-6">
                <Map />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="grid gap-6">
              <Map />
            </div>
          </TabsContent>

          <TabsContent value="zones" className="space-y-6">
            <AirdropZones />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Charts />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <InteractionHistory />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12 py-8">
        <div className="container mx-auto text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <span>© 2024 BigTrail Dashboard</span>
            <span>•</span>
            <span>Plataforma de Airdrop Analytics</span>
            <span>•</span>
            <span>Web3 Enabled</span>
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
            <a href="#" className="hover:text-primary transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;