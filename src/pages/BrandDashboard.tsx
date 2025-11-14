import { useState, useMemo, useEffect } from "react";
import { EuroIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Dashboard/Header";
import CampaignTabs from "@/components/Dashboard/CampaignTabs";
import { formatEuro } from "@/lib/formatEuro";
import type { CampaignUnion } from "@/types/campaign";
import EditCampaignModal from "@/components/Dashboard/Modals/EditCampaignModal";
import { API_BASE_URL, BRAND_ID } from "@/lib/config";
import { campaignApi } from "@/lib/campaignApi";

const today = new Date();
const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

const BrandDashboard = () => {
  const [campaigns, setCampaigns] = useState<CampaignUnion[]>([]);

  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignUnion | null>(null);

  // ---------------- FETCH REAL DE CAMPAÑAS ----------------
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const data = await campaignApi.getCampaigns({ brandId: BRAND_ID });
        setCampaigns(data);
      } catch (error) {
        console.error("Error cargando campañas:", error);
      }
    }

    fetchCampaigns();
  }, []);

  // ---------------- ACTUALIZACIÓN DE CAMPAÑA ----------------
  const handleUpdateCampaign = (updated: CampaignUnion) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  // ---------------- PRESUPUESTO ----------------
  const totalBudget = useMemo(
    () =>
      campaigns.reduce((sum, c) => {
        if ("budget" in c && typeof c.budget === "number")
          return sum + c.budget;
        return sum;
      }, 0),
    [campaigns]
  );

  const totalSpent = useMemo(
    () =>
      campaigns
        .filter((c) => "budget" in c && c.status === "active")
        .reduce((sum, c) => sum + (c.budget || 0), 0),
    [campaigns]
  );

  // ---------------- FILTRADO DE CAMPAÑAS ----------------
  const totalCampaigns = useMemo(() => campaigns.length, [campaigns]);

  const campaignsThisWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    return campaigns.filter((c) => new Date(c.createdAt) >= oneWeekAgo).length;
  }, [campaigns]);

  const campaignsLastWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);

    return campaigns.filter((c) => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= twoWeeksAgo && createdAt < oneWeekAgo;
    }).length;
  }, [campaigns]);

  const campaignsLastMonth = useMemo(
    () =>
      campaigns.filter((c) => {
        const created = new Date(c.createdAt);
        return created >= startOfLastMonth && created <= endOfLastMonth;
      }),
    [campaigns]
  );

  // ---------------- PARTICIPANTES ----------------
  const totalParticipants = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.participants, 0),
    [campaigns]
  );

  const participantsToday = useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    return campaigns.reduce((acc, c) => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= todayMidnight ? acc + c.participants : acc;
    }, 0);
  }, [campaigns]);

  // ---------------- CONVERSIÓN ----------------
  const averageConversion = useMemo(() => {
    if (!campaigns.length) return 0;
    const sum = campaigns.reduce((acc, c) => acc + c.conversion, 0);
    return +(sum / campaigns.length).toFixed(1);
  }, [campaigns]);

  const avgConversionLastMonth = useMemo(() => {
    if (!campaignsLastMonth.length) return 0;
    const sum = campaignsLastMonth.reduce((acc, c) => acc + c.conversion, 0);
    return sum / campaignsLastMonth.length;
  }, [campaignsLastMonth]);

  const conversionVariation = avgConversionLastMonth
    ? ((averageConversion - avgConversionLastMonth) / avgConversionLastMonth) *
      100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header userType="Marca/Anunciante" />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Campañas Activas */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  Campañas Activas: {totalCampaigns}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground">
                  Esta Semana: {campaignsThisWeek}
                </p>
                <p className="text-xs text-foreground mt-1">
                  Hace 1 Semana: {campaignsLastWeek}
                </p>
                <p className="text-xs text-foreground mt-1">
                  Hace 1 Mes: {campaignsLastMonth.length}
                </p>
              </CardContent>
            </Card>

            {/* Presupuesto Total */}
            <Card className="border-secondary/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  Presupuesto Total Dispuesto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  <EuroIcon className="inline h-4 w-5 mr-1 mb-1" />
                  {formatEuro(totalBudget)}
                </div>
                <p className="text-xs text-foreground mt-1">
                  <EuroIcon className="inline h-4 w-5 mr-1 mb-1" />
                  {formatEuro(totalSpent)} Gastado en Campañas
                </p>
              </CardContent>
            </Card>

            {/* Participantes */}
            <Card className="border-accent/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  Total Participantes: {totalParticipants}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-accent">+{participantsToday} Hoy</p>
              </CardContent>
            </Card>

            {/* Conversión */}
            <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {averageConversion}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {conversionVariation >= 0 ? "+ " : ""}
                  {conversionVariation.toFixed(1)}% vs Mes Anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs con 3 secciones */}
          <CampaignTabs
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            onUpdate={handleUpdateCampaign}
            onViewDetails={(c) => console.log("Ver detalles", c)}
          />
        </div>

        {/* Modal de edición */}
        {selectedCampaign && (
          <EditCampaignModal
            campaignData={selectedCampaign}
            onUpdate={handleUpdateCampaign}
            isOpen={!!selectedCampaign}
            onOpenChange={(open) => !open && setSelectedCampaign(null)}
          />
        )}
      </main>
    </div>
  );
};

export default BrandDashboard;
