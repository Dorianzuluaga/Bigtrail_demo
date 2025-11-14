import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CreateModal from "./Modals/CreateModal";
import { CampaignCard } from "./CampaignCard";

import type {
  CampaignUnion,
  Campaign,
  Airdrop,
  Advertising,
} from "@/types/campaign";
import { BRAND_ID } from "@/lib/config";
import { campaignApi } from "@/lib/campaignApi";

interface CampaignTabsProps {
  campaigns: CampaignUnion[];
  setCampaigns: React.Dispatch<React.SetStateAction<CampaignUnion[]>>;
  onViewDetails: (c: CampaignUnion) => void;
  onUpdate: (updated: CampaignUnion) => void;
}

const CampaignTabs: React.FC<CampaignTabsProps> = ({
  campaigns,
  setCampaigns,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "campaigns" | "airdrops" | "advertising"
  >("campaigns");

  const createType =
    activeTab === "campaigns"
      ? "campaign"
      : activeTab === "airdrops"
      ? "airdrop"
      : "advertising";

  // Mapear activeTab a activeSection esperado por CampaignCard
  const mapTabToSection = (tab: typeof activeTab) => {
    if (tab === "campaigns") return "campaign";
    if (tab === "airdrops") return "airdrop";
    if (tab === "advertising") return "advertising";
  };

  // ===================== FETCH CAMPAIGNS =====================
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await campaignApi.getCampaigns({ brandId: BRAND_ID });
        setCampaigns(data);
      } catch (error) {
        console.error("Error cargando campañas:", error);
      }
    };

    fetchCampaigns();
  }, [setCampaigns]);

  // ===================== FILTRADO POR TIPO =====================
  const listCampaigns = useMemo(
    () => campaigns.filter((c): c is Campaign => c.type === "campaign"),
    [campaigns]
  );
  const listAirdrops = useMemo(
    () => campaigns.filter((c): c is Airdrop => c.type === "airdrop"),
    [campaigns]
  );
  const listAdvertising = useMemo(
    () => campaigns.filter((c): c is Advertising => c.type === "advertising"),
    [campaigns]
  );

  // ===================== HANDLER PARA CREACIÓN =====================
  const handleCreate = (item: CampaignUnion) => {
    setCampaigns((prev) => [item, ...prev]);
  };

  // ===================== HANDLER PARA ELIMINACIÓN =====================
  const handleDelete = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 w-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger
            value="campaigns"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
             ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
             disabled:pointer-events-none disabled:opacity-50
             data-[state=active]:bg-green-500
             data-[state=active]:text-white
             data-[state=active]:shadow-lg"
          >
            Campañas
          </TabsTrigger>
          <TabsTrigger
            value="airdrops"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
             ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
             disabled:pointer-events-none disabled:opacity-50
             data-[state=active]:bg-green-500
             data-[state=active]:text-white
             data-[state=active]:shadow-lg"
          >
            Airdrops
          </TabsTrigger>
          <TabsTrigger
            value="advertising"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
             ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
             disabled:pointer-events-none disabled:opacity-50
             data-[state=active]:bg-green-500
             data-[state=active]:text-white
             data-[state=active]:shadow-lg"
          >
            Publicidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <h2 className="text-xl font-bold mb-4">Mis Campañas</h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 w-full">
            <div className="space-y-4">
              {listCampaigns.length ? (
                listCampaigns.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    brandId={BRAND_ID}
                    onUpdate={onUpdate}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">No hay campañas</p>
              )}
            </div>

            <div className="flex md:justify-end">
              <Button onClick={() => setOpen(true)}>Nueva Campaña</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="airdrops">
          <h2 className="text-xl font-bold mb-4">Mis Airdrops</h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 w-full">
            <div className="space-y-4">
              {listAirdrops.length ? (
                listAirdrops.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    brandId={BRAND_ID}
                    onUpdate={(updated) =>
                      setCampaigns((prev) =>
                        prev.map((x) => (x.id === updated.id ? updated : x))
                      )
                    }
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">No hay airdrops</p>
              )}
            </div>

            <div className="flex md:justify-end">
              <Button onClick={() => setOpen(true)}>Nuevo Airdrop</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advertising">
          <h2 className="text-xl font-bold mb-4">Mis Publicidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 w-full">
            <div className="space-y-4">
              {listAdvertising.length ? (
                listAdvertising.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    brandId={BRAND_ID}
                    onUpdate={(updated) =>
                      setCampaigns((prev) =>
                        prev.map((x) => (x.id === updated.id ? updated : x))
                      )
                    }
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">No hay publicidades</p>
              )}
            </div>

            <div className="flex md:justify-end">
              <Button onClick={() => setOpen(true)}>Nueva Publicidad</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CreateModal
        open={open}
        onClose={() => setOpen(false)}
        type={createType}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default CampaignTabs;
