import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Users, BarChart3, EuroIcon, Trash2 } from "lucide-react";
import { formatEuro } from "@/lib/formatEuro";
import { CampaignUnion, isAirdrop, isAdvertising } from "@/types/campaign";
import EditCampaignModal from "./Modals/EditCampaignModal";
import ViewCampaignModal from "./Modals/ViewCampaignModal";
import AssignMarkersButton from "./Modals/AssignMarkersModal";
import { API_BASE_URL, BRAND_ID } from "@/lib/config";
import { campaignApi } from "@/lib/campaignApi";

type Props = {
  campaign: CampaignUnion;
  onUpdate: (c: CampaignUnion) => void;
  onDelete: (id: string) => void;
  brandId: string;
};

export const CampaignCard: React.FC<Props> = ({
  campaign,
  onUpdate,
  onDelete,
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const label =
    campaign.type === "airdrop"
      ? "Airdrop"
      : campaign.type === "advertising"
      ? "Publicidad"
      : "Campaña";

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar ${campaign.name}?`)) return;

    try {
      setLoadingDelete(true);
      if (!BRAND_ID) throw new Error("No se encontró el ID de la marca");

      const res = await fetch(
        `${API_BASE_URL}/campaigns/${campaign.id}?brandId=${BRAND_ID}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Error eliminando campaña");

      console.log(`🗑 Campaña ${campaign.name} eliminada correctamente`);
      onDelete(campaign.id); // <-- actualiza la lista en el padre
    } catch (error: any) {
      console.error("🔥 Error eliminando campaña:", error);
      alert(`Error eliminando campaña: ${error.message}`);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-col  gap-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{campaign.name}</CardTitle>
            <CardDescription
              className={`${
                campaign.status === "active"
                  ? "text-green-600"
                  : campaign.status === "paused"
                  ? "text-orange-500"
                  : "text-red-600"
              }`}
            >
              Estado: {campaign.status}
            </CardDescription>
          </div>
          <div className="flex flex-row items-center gap-2 mt-2">
            <ViewCampaignModal campaignData={campaign} />

            <EditCampaignModal
              campaignData={campaign}
              isOpen={openEdit}
              onOpenChange={setOpenEdit}
              onUpdate={(updated) => {
                onUpdate(updated);
                setOpenEdit(false);
              }}
            />

            {campaign.type === "airdrop" && (
              <AssignMarkersButton
                campaignId={campaign.id}
                brandId={BRAND_ID}
              />
            )}

            {/* NUEVO: Botón eliminar */}
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="w-5 h-5 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm text-center">
          <div className="flex items-center gap-2">
            {isAirdrop(campaign) ? (
              <span>{campaign.reward} Tokens</span>
            ) : (
              <span>{formatEuro(campaign.budget || 0)} Presupuesto</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{campaign.participants} Participantes</span>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span>{campaign.conversion}% Conversión</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
