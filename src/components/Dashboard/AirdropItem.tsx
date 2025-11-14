import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CampaignUnion } from "@/types/campaign";
import { isAirdrop } from "@/types/campaign";
import GoogleMap from "../GoogleMap";
import bigtrailLogo from "@/assets/bigtrail-logo.png";

interface AirdropItemProps {
  airdrop: CampaignUnion;
  onUpdate: (updatedAirdrop: CampaignUnion) => void;
}

export default function AirdropItem({ airdrop, onUpdate }: AirdropItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Inicializar lat/lng si ya existen
  useEffect(() => {
    if (isAirdrop(airdrop)) {
      // Usar center en lugar de lat/lng directas
      const center = (airdrop as any).center;
      if (center) {
        setLat(center.lat?.toString() || "");
        setLng(center.lng?.toString() || "");
      }
    }
  }, [airdrop]);

  if (!isAirdrop(airdrop)) return null;

  // Guardar cambios
  const handleSave = () => {
    // No modificar el tipo original, solo actualizar estado local
    onUpdate(airdrop);
    setIsModalOpen(false);
  };

  // Callbacks para el mapa
  const handleMarkerAdd = (marker: any) => {
    if (marker.type === "location") {
      setLat(marker.position.lat.toString());
      setLng(marker.position.lng.toString());
    }
  };

  const handleMarkerEdit = (marker: any) => {
    if (marker.type === "location") {
      setLat(marker.position.lat.toString());
      setLng(marker.position.lng.toString());
    }
  };

  return (
    <div className="flex items-center justify-between p-1 border-b">
      <span>{airdrop.name}</span>
      <Button
        size="sm"
        className="px-1.5 py-5 text-xs "
        onClick={() => setIsModalOpen(true)}
      >
        Asignar Coordenadas
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Asignar Coordenadas</DialogTitle>
          </DialogHeader>

          <div className="flex-1">
            <GoogleMap
              center={{
                lat: lat ? Number(lat) : 40.4168,
                lng: lng ? Number(lng) : -3.7038,
              }}
              zoom={6}
              height="100%"
              width="100%"
              markers={
                lat && lng
                  ? [
                      {
                        id: airdrop.id,
                        position: { lat: Number(lat), lng: Number(lng) },
                        title: airdrop.name,
                        description: "",
                        type: "location",
                        active: true,
                      },
                    ]
                  : []
              }
              enableMarkerCreation
              showRealTimeRiders={false}
              onMarkerAdd={handleMarkerAdd}
              onMarkerEdit={handleMarkerEdit}
              brandId="aedfeb8c-8a54-4b99-96b3-ac388a8156ac"
              campaignId="558fb0f4-a253-4184-a131-74f007a0e894"
            />
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={handleSave}>Guardar</Button>
          </div>
          <div>
            <img
              src={bigtrailLogo}
              alt="BigTrail Logo"
              className="h-8 w-auto fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
