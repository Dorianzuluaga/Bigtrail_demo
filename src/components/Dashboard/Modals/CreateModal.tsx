"use client";

import React, { useState, useEffect } from "react";
import {
  CampaignType,
  CampaignUnion,
  Campaign,
  Airdrop,
  Advertising,
} from "@/types/campaign";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { campaignApi } from "@/lib/campaignApi";
import { API_BASE_URL, BRAND_ID } from "@/lib/config";
import { appToast } from "@/components/ui/app-toast";

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  type: CampaignType; // <-- "campaign" | "airdrop" | "advertising"
  onCreate: (newItem: CampaignUnion) => void;
}

export default function CreateModal({
  open,
  onClose,
  type,
  onCreate,
}: CreateModalProps) {
  // comunes
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // campaign / advertising
  const [budgetText, setBudgetText] = useState("");
  const [adType, setAdType] = useState<Campaign["adType"]>();
  const [adTypeAdvertising, setAdTypeAdvertising] =
    useState<Advertising["adType"]>("banner");
  const [content, setContent] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  // airdrop
  const [reward, setReward] = useState("");

  //funcion para el label segun el tipo
  function typeLabel() {
    switch (type) {
      case "airdrop":
        return "airdrop";
      case "advertising":
        return "campaña publicitaria";
      case "campaign":
        return "campaña";
      default:
        return "campaña";
    }
  }
  function successTitle(type: string) {
    switch (type) {
      case "airdrop":
        return "Airdrop creado";
      case "advertising":
        return "Campaña publicitaria creada";
      case "campaign":
        return "Campaña creada";
      default:
        return "Campaña creada";
    }
  }

  useEffect(() => {
    // limpiar al abrir/cambiar tipo
    if (open) {
      setName("");
      setDescription("");
      setBudgetText("");
      setAdType(undefined);
      setAdTypeAdvertising("banner");
      setContent("");
      setCtaUrl("");
      setReward("");
    }
  }, [open, type]);

  const title =
    type === "campaign"
      ? "Crear Campaña"
      : type === "airdrop"
      ? "Crear Airdrop"
      : "Crear Publicidad";

  const handleSubmit = async () => {
    if (!name.trim())
      return appToast.error({
        title: `Error creando ${typeLabel()}`,
        description: "El nombre es obligatorio.",
      });

    try {
      if (!BRAND_ID)
        return appToast.error({
          title: `Error creando ${typeLabel()}`,
          description: "Falta BRAND_ID.",
        });

      let campaignData: any = {};
      if (type === "campaign" || type === "advertising") {
        const budget = Number(budgetText || 0);
        if (Number.isNaN(budget) || budget < 0)
          return appToast.error({
            title: `Error creando ${typeLabel()}`,
            description: "El presupuesto debe ser un número válido.",
          });

        campaignData = {
          type,
          name,
          description: description || "",
          budget,
          adType: type === "campaign" ? adType : adTypeAdvertising || "",
          content: content || "",
          ctaUrl: ctaUrl || "",
        };
      } else if (type === "airdrop") {
        if (!reward.trim())
          return appToast.error({
            title: `Error creando ${typeLabel()}`,
            description: "La recompensa es obligatoria.",
          });

        campaignData = {
          type: "airdrop",
          name,
          description: description || "",
          reward,
        };
      }

      // brandId como query param
      const res = await fetch(`${API_BASE_URL}/campaigns?brandId=${BRAND_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      const resJson = await res.json();

      if (!res.ok)
        throw new Error(
          `Error creando ${typeLabel()}: ${JSON.stringify(resJson)}`
        );

      appToast.success({
        title: successTitle(type),
        description: `La ${typeLabel()} se creó correctamente.`,
      });
      onCreate(resJson);
      onClose();
    } catch (error: any) {
      appToast.error({
        title: `Error creando ${typeLabel()}`,
        description: error.message || "Inténtalo de nuevo",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Completa los campos para crear{" "}
            {type === "campaign"
              ? "la campaña"
              : type === "airdrop"
              ? "el airdrop"
              : "la publicidad"}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* comunes */}
          <div>
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Descripción</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* específicos */}
          {type === "campaign" && (
            <>
              <div>
                <Label>Presupuesto (€/día)</Label>
                <Input
                  type="number"
                  value={budgetText}
                  onChange={(e) => setBudgetText(e.target.value)}
                />
              </div>

              <div>
                <Label>Tipo de anuncio</Label>
                <Select
                  value={adType ?? ""}
                  onValueChange={(v) => setAdType(v as Campaign["adType"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="native">Contenido nativo</SelectItem>
                    <SelectItem value="sponsored">Post patrocinado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Contenido</Label>
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div>
                <Label>URL destino</Label>
                <Input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                />
              </div>
            </>
          )}

          {type === "airdrop" && (
            <div>
              <Label>Recompensa</Label>
              <Input
                placeholder="p.ej.: 50 TOKENS"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
            </div>
          )}

          {type === "advertising" && (
            <>
              <div>
                <Label>Presupuesto (€/día)</Label>
                <Input
                  type="number"
                  value={budgetText}
                  onChange={(e) => setBudgetText(e.target.value)}
                />
              </div>

              <div>
                <Label>Formato</Label>
                <Select
                  value={adTypeAdvertising}
                  onValueChange={(v) =>
                    setAdTypeAdvertising(v as Advertising["adType"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="native">Contenido nativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Contenido</Label>
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div>
                <Label>URL destino</Label>
                <Input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Crear</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
