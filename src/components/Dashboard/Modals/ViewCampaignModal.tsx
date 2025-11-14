import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3 } from "lucide-react";
import { CampaignUnion } from "@/types/campaign";

interface ViewCampaignModalProps {
  campaignData: CampaignUnion;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ViewCampaignModal({
  campaignData,
  isOpen,
  onOpenChange,
}: ViewCampaignModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [form, setForm] = useState({
    name: campaignData.name || "",
    description: campaignData.description || "",
    budget:
      "budget" in campaignData && campaignData.budget
        ? campaignData.budget.toString()
        : "",
    adType:
      "adType" in campaignData && campaignData.adType
        ? campaignData.adType
        : "",
    content:
      "content" in campaignData && campaignData.content
        ? campaignData.content
        : "",
    ctaUrl:
      "ctaUrl" in campaignData && campaignData.ctaUrl
        ? campaignData.ctaUrl
        : "",
  });

  useEffect(() => {
    setForm({
      name: campaignData.name || "",
      description: campaignData.description || "",
      budget:
        "budget" in campaignData && campaignData.budget
          ? campaignData.budget.toString()
          : "",
      adType:
        "adType" in campaignData && campaignData.adType
          ? campaignData.adType
          : "",
      content:
        "content" in campaignData && campaignData.content
          ? campaignData.content
          : "",
      ctaUrl:
        "ctaUrl" in campaignData && campaignData.ctaUrl
          ? campaignData.ctaUrl
          : "",
    });
  }, [campaignData]);

  const campaignLabel =
    campaignData.type === "campaign"
      ? "Campaña"
      : campaignData.type === "airdrop"
      ? "Airdrop"
      : "Publicidad";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Ver detalles
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl mx-auto rounded-lg p-6 bg-background shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center flex-1">
            Detalles de {campaignLabel}
          </DialogTitle>
          <DialogDescription className="text-center">
            Aquí puedes consultar toda la información de tu{" "}
            {campaignLabel.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <Card className="mt-4">
          <CardContent className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de {campaignLabel}</Label>
              <Input id="name" name="name" value={form.name ?? ""} disabled />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description ?? ""}
                disabled
                className="min-h-[100px]"
              />
            </div>

            {/* Presupuesto */}
            {"budget" in campaignData && (
              <div className="space-y-2">
                <Label htmlFor="budget">Presupuesto (€)</Label>
                <Input
                  id="budget"
                  name="budget"
                  value={form.budget ?? ""}
                  disabled
                />
              </div>
            )}

            {/* Tipo de anuncio */}
            {"adType" in campaignData && (
              <div className="space-y-2">
                <Label htmlFor="adType">Tipo de anuncio</Label>
                <Select value={form.adType ?? ""} disabled>
                  <SelectTrigger id="adType">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="native">Contenido nativo</SelectItem>
                    {campaignData.type === "advertising" && (
                      <SelectItem value="sponsored">
                        Post patrocinado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contenido */}
            {"content" in campaignData && (
              <div className="space-y-2">
                <Label htmlFor="content">Contenido del anuncio</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={form.content ?? ""}
                  disabled
                  className="min-h-[100px]"
                />
              </div>
            )}

            {/* URL de destino */}
            {"ctaUrl" in campaignData && (
              <div className="space-y-2">
                <Label htmlFor="ctaUrl">URL de destino</Label>
                <Input
                  id="ctaUrl"
                  name="ctaUrl"
                  value={form.ctaUrl ?? ""}
                  disabled
                />
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
