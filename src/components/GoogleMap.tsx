import React, { useCallback, useEffect, useRef, useState } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Users, Eye, EyeOff, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { toast } from "@/hooks/use-toast";
import { svg_rider } from "../lib/svgAssets";
import {
  getCampaign,
  createZone,
  updateZone,
  deleteZone,
  type ZoneResponse,
} from "../services/zonesApi";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

// Tipos para los markers
interface MarkerData {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description: string;
  type: "airdrop" | "campaign" | "rider" | "event" | "location";
  icon?: string;
  active: boolean;
  token_address?: string;
  radius?: number;
  amount?: string;
  start_time?: string;
  end_time?: string;
  metadata?: {
    reward?: string;
    budget?: number;
    participants?: number;
    startDate?: string;
    endDate?: string;
  };
}

// Tipo para riders en tiempo real
interface RiderData {
  id: string;
  position: { lat: number; lng: number };
  name: string;
  status: "active" | "inactive";
  lastUpdate: string;
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  width?: string;
  markers?: MarkerData[];
  onMarkerAdd?: (marker: MarkerData) => void;
  onMarkerEdit?: (marker: MarkerData) => void;
  onMarkerDelete?: (markerId: string) => void;
  showRealTimeRiders?: boolean;
  riderSearchRadius?: number;
  enableMarkerCreation?: boolean;
  mapStyle?: string;
  className?: string;
  brandId: string; // NUEVO
  campaignId: string; // NUEVO
}

// Iconos personalizados para diferentes tipos de markers
const getMarkerIcon = (
  type: MarkerData["type"],
  active: boolean,
  isNewMarker: boolean = false
) => {
  // Nuevos markers (creados por el usuario) son rojos, existentes (del endpoint) son verdes
  const color = isNewMarker ? "#ef4444" : "#10b981"; // red vs green
  const inactiveColor = "#6b7280";

  const iconUrl = active
    ? {
        airdrop:
          "data:image/svg+xml;base64," +
          btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
          ),
        campaign:
          "data:image/svg+xml;base64," +
          btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
          ),
        event:
          "data:image/svg+xml;base64," +
          btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
          ),
        location:
          "data:image/svg+xml;base64," +
          btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
          ),
        rider: "data:image/svg+xml;base64," + btoa(svg_rider),
      }
    : {
        airdrop:
          "data:image/svg+xml;base64," +
          btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${inactiveColor}" width="24" height="24"><path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.31.2 2.69.2 4 0 5.16-1 9-5.45 9-11V7L12 2z"/></svg>`
          ),
        campaign:
          "data:image/svg+xml;base64," +
          btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${inactiveColor}" width="24" height="24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
          ),
        event:
          "data:image/svg+xml;base64=" +
          btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${inactiveColor}" width="24" height="24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`
          ),
        location:
          "data:image/svg+xml;base64=" +
          btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${inactiveColor}" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
          ),
        rider: "data:image/svg+xml;base64," + btoa(svg_rider),
      };

  return {
    url: iconUrl[type],
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  };
};

    // Componente del mapa interno
const MapComponent = React.forwardRef<
  HTMLDivElement,
  {
    center: { lat: number; lng: number };
    zoom: number;
    markers: MarkerData[];
    onMarkerAdd?: (marker: MarkerData) => void;
    onMarkerEdit?: (marker: MarkerData) => void;
    onMarkerDelete?: (markerId: string) => void;
    showRealTimeRiders: boolean;
    riderSearchRadius: number;
    enableMarkerCreation: boolean;
    mapStyle?: string;
    brandId: string; // NUEVO
    campaignId: string; // NUEVO
  }
>(
  (
    {
      center,
      zoom,
      markers,
      onMarkerAdd,
      onMarkerEdit,
      onMarkerDelete,
      showRealTimeRiders,
      riderSearchRadius,
      enableMarkerCreation,
      mapStyle,
      brandId,
      campaignId,
    },
    ref
  ) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();
    // Remover el estado de mapMarkers ya que ahora usamos la referencia estable
    const [riderMarkers, setRiderMarkers] = useState<google.maps.Marker[]>([]);
    const [riders, setRiders] = useState<RiderData[]>([]);
    const [isCreatingMarker, setIsCreatingMarker] = useState(false);

    // Simular datos de riders en tiempo real
    const generateMockRiders = useCallback(
      (mapCenter: { lat: number; lng: number }) => {
        const mockRiders: RiderData[] = [];
        const numRiders = Math.floor(Math.random() * 8) + 2;

        for (let i = 0; i < numRiders; i++) {
          const angle = Math.random() * 2 * Math.PI;
          const distance = (Math.random() * riderSearchRadius) / 111;

          mockRiders.push({
            id: `rider-${i}`,
            position: {
              lat: mapCenter.lat + distance * Math.cos(angle),
              lng: mapCenter.lng + distance * Math.sin(angle),
            },
            name: `Rider ${i + 1}`,
            status: Math.random() > 0.3 ? "active" : "inactive",
            lastUpdate: new Date().toISOString(),
          });
        }

        return mockRiders;
      },
      [riderSearchRadius]
    );

    // Inicializar mapa
    useEffect(() => {
      if (mapRef.current && !map) {
        const newMap = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: mapStyle ? JSON.parse(mapStyle) : undefined,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        // Evento para crear markers haciendo click con debouncing
        if (enableMarkerCreation) {
          newMap.addListener("click", async (e: google.maps.MapMouseEvent) => {
            if (e.latLng && onMarkerAdd && !isCreatingMarker) {
              console.log("Mapa clicado en:", e.latLng.toJSON());
              
              // Prevenir múltiples clicks rápidos
              setIsCreatingMarker(true);

              const newMarker: MarkerData = {
                id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                position: {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                },
                title: "Nuevo Marker",
                description: "Descripción del marker",
                type: "airdrop",
                active: true,
                token_address: "0xF34d162fcDbBFdFC150CEA9D21b6696728c7d8aB",
                radius: 1,
                amount: "0",
                start_time: new Date().toISOString(),
                end_time: new Date(
                  Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(),
              };

              // Intentar crear en API
              try {
                console.log("Creando zona en API:", newMarker);
                const createdZone = await createZone(brandId, campaignId, {
                  name: newMarker.title,
                  description: newMarker.description,
                  token_address: newMarker.token_address,
                  center: newMarker.position,
                  radius: newMarker.radius,
                  amount: newMarker.amount,
                  start_time: newMarker.start_time,
                  end_time: newMarker.end_time,
                  is_active: newMarker.active,
                });

                console.log("Zona creada exitosamente:", createdZone);
                const markerWithServerId = { ...newMarker, id: createdZone.id };
                onMarkerAdd(markerWithServerId);

                toast({
                  title: "Éxito",
                  description: "Marker creado correctamente",
                });
              } catch (error) {
                console.error("Error creando zona en API:", error);
                onMarkerAdd(newMarker);
                toast({
                  title: "Advertencia",
                  description: "Marker creado localmente, error en API",
                  variant: "destructive",
                });
              } finally {
                // Restablecer flag después de un pequeño delay
                setTimeout(() => setIsCreatingMarker(false), 1000);
              }
            }
          });
        }

        setMap(newMap);
      }
    }, [
      mapRef,
      map,
      center,
      zoom,
      mapStyle,
      enableMarkerCreation,
      onMarkerAdd,
    ]);

    // Referencia estable para los markers del mapa
    const markersMapRef = useRef<Map<string, google.maps.Marker>>(new Map());

    // Actualizar markers normales - completamente optimizado para evitar recreaciones
    useEffect(() => {
      if (!map) return;

      const currentMarkerIds = new Set(
        Array.from(markersMapRef.current.keys())
      );
      const newMarkerIds = new Set(markers.map((m) => m.id));

      // Eliminar markers que ya no existen
      for (const markerId of currentMarkerIds) {
        if (!newMarkerIds.has(markerId)) {
          const marker = markersMapRef.current.get(markerId);
          if (marker) {
            marker.setMap(null);
            markersMapRef.current.delete(markerId);
          }
        }
      }

      // Actualizar o crear markers individualmente
      markers.forEach((markerData) => {
        const existingMarker = markersMapRef.current.get(markerData.id);

        if (existingMarker) {
          // Actualizar marker existente solo si es necesario
          const currentPos = existingMarker.getPosition();
          if (
            !currentPos ||
            Math.abs(currentPos.lat() - markerData.position.lat) > 0.000001 ||
            Math.abs(currentPos.lng() - markerData.position.lng) > 0.000001
          ) {
            existingMarker.setPosition(markerData.position);
          }
          existingMarker.setTitle(markerData.title);
          return; // No recrear el marker
        }

        // Determinar si es un marker nuevo (creado por el usuario) o existente (del endpoint)
        const isNewMarker = markerData.id.startsWith("marker-");

        // Crear nuevo marker solo si no existe
        const marker = new google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title,
          icon: markerData.icon
            ? markerData.icon
            : getMarkerIcon(markerData.type, markerData.active, isNewMarker),
          zIndex: markerData.type === "rider" ? 1000 : 100,
          draggable: markerData.type !== "rider",
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div class="p-2">
            <h3 class="font-semibold text-lg mb-1">${markerData.title}</h3>
            <p class="text-sm text-gray-600 mb-2">${markerData.description}</p>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${
                markerData.type
              }</span>
              <span class="text-xs ${
                markerData.active
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              } px-2 py-1 rounded">
                ${markerData.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            ${
              markerData.metadata
                ? `
              <div class="text-xs text-gray-500">
                ${
                  markerData.metadata.reward
                    ? `<div>Recompensa: ${markerData.metadata.reward}</div>`
                    : ""
                }
                ${
                  markerData.metadata.participants
                    ? `<div>Participantes: ${markerData.metadata.participants}</div>`
                    : ""
                }
                ${
                  markerData.metadata.budget
                    ? `<div>Presupuesto: €${markerData.metadata.budget}</div>`
                    : ""
                }
              </div>
            `
                : ""
            }
          </div>
        `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        if (markerData.type !== "rider") {
          marker.addListener(
            "dragend",
            async (e: google.maps.MapMouseEvent) => {
              if (e.latLng && onMarkerEdit) {
                const updatedMarker = {
                  ...markerData,
                  position: {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  },
                };

                if (
                  markerData.id &&
                  markerData.token_address &&
                  markerData.radius &&
                  markerData.amount !== undefined
                ) {
                  try {
                    console.log(
                      "Actualizando posición del marker:",
                      markerData.id
                    );
                    await updateZone(brandId, campaignId, markerData.id, {
                      name: markerData.title,
                      description: markerData.description,
                      token_address: markerData.token_address,
                      center: updatedMarker.position,
                      radius: markerData.radius,
                      amount: markerData.amount,
                      start_time:
                        markerData.start_time || new Date().toISOString(),
                      end_time:
                        markerData.end_time ||
                        new Date(
                          Date.now() + 24 * 60 * 60 * 1000
                        ).toISOString(),
                      is_active: markerData.active,
                    });
                    console.log("Posición actualizada exitosamente");
                    toast({
                      title: "Éxito",
                      description: "Posición del marker actualizada",
                    });
                    // Actualizar solo la posición localmente sin triggerar re-render masivo
                    marker.setPosition(updatedMarker.position);
                  } catch (error) {
                    console.error("Error actualizando posición:", error);
                    toast({
                      title: "Error",
                      description:
                        error instanceof Error
                          ? error.message
                          : "Error al actualizar posición",
                      variant: "destructive",
                    });
                    return;
                  }
                }
              }
            }
          );
        }

        // Agregar al Map de referencia estable
        markersMapRef.current.set(markerData.id, marker);
      });
    }, [map, markers, onMarkerEdit]);

    // Actualizar riders en tiempo real
    useEffect(() => {
      if (!map || !showRealTimeRiders) return;

      const updateRiders = () => {
        const currentCenter = map.getCenter();
        if (currentCenter) {
          const newRiders = generateMockRiders({
            lat: currentCenter.lat(),
            lng: currentCenter.lng(),
          });
          setRiders(newRiders);
        }
      };

      updateRiders();
      const interval = setInterval(updateRiders, 10000);

      return () => clearInterval(interval);
    }, [map, showRealTimeRiders, generateMockRiders]);

    // Actualizar markers de riders
    useEffect(() => {
      if (!map) return;

      riderMarkers.forEach((marker) => marker.setMap(null));

      if (!showRealTimeRiders) {
        setRiderMarkers([]);
        return;
      }

      const newRiderMarkers = riders.map((rider) => {
        const marker = new google.maps.Marker({
          position: rider.position,
          map,
          title: rider.name,
          icon: getMarkerIcon("rider", rider.status === "active"),
          zIndex: 1000,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div class="p-2">
            <h3 class="font-semibold text-base mb-1">${rider.name}</h3>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs ${
                rider.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              } px-2 py-1 rounded">
                ${rider.status === "active" ? "En línea" : "Desconectado"}
              </span>
            </div>
            <div class="text-xs text-gray-500">
              Última actualización: ${new Date(
                rider.lastUpdate
              ).toLocaleTimeString()}
            </div>
          </div>
        `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        return marker;
      });

      setRiderMarkers(newRiderMarkers);
    }, [map, riders, showRealTimeRiders]);

    return <div ref={mapRef} className="w-full h-full" />;
  }
);

MapComponent.displayName = "MapComponent";

// Modal para crear/editar markers
const MarkerModal: React.FC<{
  open: boolean;
  onClose: () => void;
  marker: MarkerData | null;
  onSave: (marker: MarkerData, isEditing: boolean) => void;
  brandId: string; // NUEVO
  campaignId: string; // NUEVO
}> = ({ open, onClose, marker, onSave, brandId, campaignId }) => {
  const [formData, setFormData] = useState<Partial<MarkerData>>({});
  const isEditing = marker !== null && marker.id !== "";

  useEffect(() => {
    if (marker) {
      setFormData(marker);
    } else {
      setFormData({
        title: "",
        description: "",
        type: "location",
        active: true,
        token_address: "0xF34d162fcDbBFdFC150CEA9D21b6696728c7d8aB",
        radius: 1,
        amount: "0",
      });
    }
  }, [marker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const markerToSave: MarkerData = {
      id: marker?.id || `marker-${Date.now()}`,
      position: marker?.position || { lat: 0, lng: 0 },
      title: formData.title,
      description: formData.description,
      type: (formData.type as MarkerData["type"]) || "location",
      active: formData.active ?? true,
      token_address:
        formData.token_address || "0xF34d162fcDbBFdFC150CEA9D21b6696728c7d8aB",
      radius: formData.radius || 1,
      amount: formData.amount || "0",
      start_time: formData.start_time || new Date().toISOString(),
      end_time:
        formData.end_time ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // Llamar a la API según sea creación o edición
    try {
      if (isEditing && marker?.id && !marker.id.startsWith("marker-")) {
        console.log("Editando marker en API:", markerToSave);
        await updateZone(brandId, campaignId, marker.id, {
          name: markerToSave.title,
          description: markerToSave.description,
          token_address:
            markerToSave.token_address ||
            "0xF34d162fcDbBFdFC150CEA9D21b6696728c7d8aB",
          center: markerToSave.position,
          radius: markerToSave.radius || 1,
          amount: markerToSave.amount || "0",
          start_time: markerToSave.start_time || new Date().toISOString(),
          end_time:
            markerToSave.end_time ||
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_active: markerToSave.active,
        });
        console.log("Marker editado exitosamente");
      } else if (!isEditing) {
        console.log("Creando nuevo marker en API:", markerToSave);
        const createdZone = await createZone(brandId, campaignId, {
          name: markerToSave.title,
          description: markerToSave.description,
          token_address:
            markerToSave.token_address ||
            "0xF34d162fcDbBFdFC150CEA9D21b6696728c7d8aB",
          center: markerToSave.position,
          radius: markerToSave.radius || 1,
          amount: markerToSave.amount || "0",
          start_time: markerToSave.start_time || new Date().toISOString(),
          end_time:
            markerToSave.end_time ||
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_active: markerToSave.active,
        });
        console.log("Marker creado exitosamente:", createdZone);
        markerToSave.id = createdZone.id;
      }

      toast({
        title: "Éxito",
        description: isEditing
          ? "Marker actualizado correctamente"
          : "Marker creado correctamente",
      });
    } catch (error) {
      console.error("Error en API:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error en la operación",
        variant: "destructive",
      });
    }

    onSave(markerToSave, isEditing);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Marker" : "Crear Marker"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles del marker"
              : "Completa los detalles para crear un nuevo marker"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as MarkerData["type"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="airdrop">Airdrop</SelectItem>
                <SelectItem value="campaign">Campaña</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
                <SelectItem value="location">Ubicación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="token_address">Dirección del Token</Label>
            <Input
              id="token_address"
              value={formData.token_address || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  token_address: e.target.value,
                }))
              }
              placeholder="0x..."
            />
          </div>

          <div>
            <Label htmlFor="amount">Cantidad</Label>
            <Input
              id="amount"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="radius">Radio (metros)</Label>
            <Input
              id="radius"
              type="number"
              value={formData.radius || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  radius: parseInt(e.target.value) || 1,
                }))
              }
              min="1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active ?? true}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, active: checked }))
              }
            />
            <Label htmlFor="active">Activo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? "Actualizar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal del GoogleMap
const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 39.4699, lng: -0.3763 },
  zoom = 10,
  height = "500px",
  width = "100%",
  markers: initialMarkers = [],
  onMarkerAdd,
  onMarkerEdit,
  onMarkerDelete,
  showRealTimeRiders = false,
  riderSearchRadius = 5,
  enableMarkerCreation = false,
  mapStyle,
  className,
  brandId, // NUEVO
  campaignId, // NUEVO
}) => {
  const [currentMarkers, setCurrentMarkers] = useState<MarkerData[]>([]);
  const [map, setMap] = useState<google.maps.Map>();
  const [editingMarker, setEditingMarker] = useState<MarkerData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showRidersToggle, setShowRidersToggle] = useState(showRealTimeRiders);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Load zones from campaign on component mount
  useEffect(() => {
    const loadCampaignZones = async () => {
      try {
        console.log("Cargando zonas de la campaña...");
        const campaignData = await getCampaign(campaignId, brandId);
        console.log("Campaña obtenida:", campaignData);

        // Check if campaignData has zones array
        if (
          campaignData &&
          (campaignData as any).zones &&
          Array.isArray((campaignData as any).zones)
        ) {
          const zoneMarkers: MarkerData[] = (campaignData as any).zones.map(
            (zone: any) => ({
              id: zone.id,
              position: { lat: zone.center.lat, lng: zone.center.lng },
              title: zone.name,
              description: zone.description,
              type: "airdrop" as const,
              active: zone.is_active,
              token_address: zone.token_address,
              radius: zone.radius,
              amount: zone.amount,
              start_time: zone.start_time,
              end_time: zone.end_time,
            })
          );

          console.log("Zones convertidas a markers:", zoneMarkers);
          // Combine campaign zones with any initial markers
          setCurrentMarkers([...initialMarkers, ...zoneMarkers]);
        } else {
          // If no zones from campaign, just use initial markers
          setCurrentMarkers(initialMarkers);
        }
      } catch (error) {
        console.error("Error cargando zonas de la campaña:", error);
        // On error, still show initial markers
        setCurrentMarkers(initialMarkers);
      }
    };

    loadCampaignZones();
  }, [initialMarkers]);

  // Actualizar toggle de riders cuando cambie la prop
  useEffect(() => {
    setShowRidersToggle(showRealTimeRiders);
  }, [showRealTimeRiders]);

  const handleMarkerAdd = (marker: MarkerData) => {
    console.log("Agregando marker:", marker);
    const updatedMarkers = [...currentMarkers, marker];
    setCurrentMarkers(updatedMarkers);
    onMarkerAdd?.(marker);
  };

  const handleMarkerEdit = (marker: MarkerData) => {
    const updatedMarkers = currentMarkers.map((m) =>
      m.id === marker.id ? marker : m
    );
    setCurrentMarkers(updatedMarkers);
    onMarkerEdit?.(marker);
  };

  const handleMarkerSave = (marker: MarkerData, isEditing: boolean) => {
    if (isEditing) {
      handleMarkerEdit(marker);
    } else {
      handleMarkerAdd(marker);
    }
  };
  // Modificado por Dorian - compatible con deletZone - se eliminaron los objetos extras que no son necesarios
  const handleMarkerDelete = async (markerId: string) => {
    const markerToDelete = currentMarkers.find((m) => m.id === markerId);

    if (!markerToDelete) return;

    try {
      console.log("Eliminando marker con ID:", markerId);
      // Llamada correcta con solo los 3 argumentos que espera deleteZone
      await deleteZone(brandId, campaignId, markerId);

      console.log("Marker eliminado exitosamente");
      toast({
        title: "Éxito",
        description: "Marker eliminado correctamente",
      });
    } catch (error) {
      console.error("Error eliminando marker:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al eliminar el marker",
        variant: "destructive",
      });
      return;
    }

    // Actualizamos el estado eliminando el marker localmente
    const updatedMarkers = currentMarkers.filter((m) => m.id !== markerId);
    setCurrentMarkers(updatedMarkers);

    // Disparamos callback si existe
    onMarkerDelete?.(markerId);
  };

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Controles del mapa */}
      <div className="absolute top-16 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-2 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <Badge variant="secondary">{currentMarkers.length} markers</Badge>
        </div>

        {showRealTimeRiders !== undefined && (
          <div className="flex items-center gap-2">
            <Switch
              checked={showRidersToggle}
              onCheckedChange={setShowRidersToggle}
            />
            <div className="flex items-center gap-1">
              {showRidersToggle ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              <span className="text-xs">Riders</span>
            </div>
          </div>
        )}

        {enableMarkerCreation && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const mapCenter = map?.getCenter();
              const newMarker: MarkerData = {
                id: `marker-${Date.now()}`,
                position: mapCenter
                  ? {
                      lat: mapCenter.lat(),
                      lng: mapCenter.lng(),
                    }
                  : center,
                title: "",
                description: "",
                type: "location",
                active: true,
                token_address: "0xF34d162fcDbBFdFC150CEA9D21b6696728c7d8aB",
                radius: 1,
                amount: "0",
                start_time: new Date().toISOString(),
                end_time: new Date(
                  Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(),
              };
              setEditingMarker(newMarker);
              setModalOpen(true);
            }}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar
          </Button>
        )}
      </div>

      {/* Lista acordeón de markers */}
      {currentMarkers.length > 0 && (
        <div className="absolute top-16 right-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg max-w-xs">
          <Collapsible open={isAccordionOpen} onOpenChange={setIsAccordionOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <span className="text-xs font-medium">
                  Markers ({currentMarkers.length})
                </span>
                <Plus
                  className={`h-3 w-3 transition-transform ${
                    isAccordionOpen ? "rotate-45" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 max-h-64 overflow-y-auto space-y-1">
              {currentMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="flex items-center gap-2 text-xs bg-background/50 p-2 rounded"
                >
                  <Badge
                    variant={marker.active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {marker.type}
                  </Badge>
                  <span className="flex-1 truncate">{marker.title}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setEditingMarker(marker);
                        setModalOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMarkerDelete(marker.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <Wrapper
        apiKey={"AIzaSyBsRFAZiAMXSQ3pS509GLioSwC3TGvD6zE"}
        render={(status) => {
          switch (status) {
            case Status.LOADING:
              return (
                <div className="flex items-center justify-center h-full">
                  Cargando mapa...
                </div>
              );
            case Status.FAILURE:
              return (
                <div className="flex items-center justify-center h-full text-red-500">
                  Error al cargar Google Maps
                </div>
              );
            case Status.SUCCESS:
              return (
                <MapComponent
                  center={center}
                  zoom={zoom}
                  markers={currentMarkers}
                  onMarkerAdd={handleMarkerAdd}
                  onMarkerEdit={handleMarkerEdit}
                  onMarkerDelete={handleMarkerDelete}
                  showRealTimeRiders={showRidersToggle}
                  riderSearchRadius={riderSearchRadius}
                  enableMarkerCreation={enableMarkerCreation}
                  mapStyle={mapStyle}
                  brandId={brandId} // NUEVO
                  campaignId={campaignId} // NUEVO
                />
              );
          }
        }}
      />

      <MarkerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        marker={editingMarker}
        onSave={handleMarkerSave}
        brandId={brandId}
        campaignId={campaignId}
      />
    </div>
  );
};

export { GoogleMap as default, type MarkerData, type RiderData };
