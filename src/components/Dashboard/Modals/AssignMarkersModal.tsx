import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import GoogleMapComponent, { MarkerData } from "@/components/GoogleMap";
import bigtrailLogo from "@/assets/bigtrail-logo.png";
import { makeZonesApi, ZoneResponse } from "@/services/zonesApi";
import { getZone } from "../../../services/zonesApi";

interface AssignMarkersModalProps {
  campaignId: string;
  brandId: string;
}

const AssignMarkersModal: React.FC<AssignMarkersModalProps> = ({
  campaignId,
  brandId,
}) => {
  const [open, setOpen] = useState(false);
  const [localMarkers, setLocalMarkers] = useState<MarkerData[]>([]);
  const zonesApi = makeZonesApi(brandId, campaignId);

  // ---------------- Cargar zonas al abrir el modal ----------------
  useEffect(() => {
    if (!open) return;

    let isActive = true;

    const fetchZones = async () => {
      try {
        const zone: ZoneResponse = await zonesApi.getZone(brandId);
        const zones: ZoneResponse[] = [zone];

        if (!isActive) return;

        const markers: MarkerData[] = zones.map((zone) => ({
          id: zone.id,
          position: { lat: zone.center.lat, lng: zone.center.lng },
          title: zone.name || `Zona ${zone.id}`,
          description: zone.description || "",
          type: "airdrop",
          active: zone.is_active,
          token_address: zone.token_address,
          radius: zone.radius,
          amount: zone.amount,
          start_time: zone.start_time,
          end_time: zone.end_time,
        }));

        setLocalMarkers(markers);
        console.log("Markers iniciales cargados:", markers);
      } catch (err) {
        if (isActive) console.error("Error cargando zonas:", err);
      }
    };

    fetchZones();

    return () => {
      isActive = false;
    };
  }, [open]);

  // ---------------- Crear nuevo marker ----------------
  const handleAddMarker = async (marker: MarkerData) => {
    try {
      const created = await zonesApi.createZone({
        name: marker.title,
        description: marker.description,
        token_address: marker.token_address || "",
        center: { lat: marker.position.lat, lng: marker.position.lng },
        radius: marker.radius || 0,
        amount: marker.amount || "0",
        start_time: marker.start_time || new Date().toISOString(),
        end_time: marker.end_time || new Date().toISOString(),
        is_active: marker.active,
      });

      const newMarker = { ...marker, id: created.id };
      setLocalMarkers((prev) => [...prev, newMarker]);
      console.log("Marker creado en backend:", created.id);
    } catch (err) {
      console.error("Error creando marker:", err);
    }
  };

  // ---------------- Editar marker existente ----------------
  const handleEditMarker = async (marker: MarkerData) => {
    try {
      await zonesApi.updateZone(marker.id!, {
        name: marker.title,
        description: marker.description,
        token_address: marker.token_address || "",
        center: { lat: marker.position.lat, lng: marker.position.lng },
        radius: marker.radius || 0,
        amount: marker.amount || "0",
        start_time: marker.start_time || new Date().toISOString(),
        end_time: marker.end_time || new Date().toISOString(),
        is_active: marker.active,
      });

      setLocalMarkers((prev) =>
        prev.map((m) => (m.id === marker.id ? { ...m, ...marker } : m))
      );

      console.log("Marker actualizado en backend:", marker.id);
    } catch (err) {
      console.error("Error actualizando marker:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
          Asignar Coordenadas
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[90vw] max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Asigne Las Coordenadas Deseadas</DialogTitle>
        </DialogHeader>

        <div className="h-full w-full relative">
          <GoogleMapComponent
            markers={localMarkers}
            onMarkerAdd={handleAddMarker}
            onMarkerEdit={handleEditMarker}
            enableMarkerCreation={true}
            campaignId={campaignId}
            brandId={brandId}
          />
          <img
            src={bigtrailLogo}
            alt="BigTrail Logo"
            className="h-8 w-auto fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button>Cerrar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignMarkersModal;
