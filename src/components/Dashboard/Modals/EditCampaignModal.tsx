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
import { campaignApi } from "@/lib/campaignApi";

interface EditCampaignModalProps {
  campaignData: CampaignUnion;
  onUpdate: (updatedCampaign: CampaignUnion) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const createInitialForm = (campaignData: CampaignUnion) => ({
  name: campaignData.name || "",
  description: campaignData.description || "",
  budget:
    "budget" in campaignData && campaignData.budget
      ? campaignData.budget.toString()
      : "",
  adType:
    "adType" in campaignData && campaignData.adType ? campaignData.adType : "",
  content:
    "content" in campaignData && campaignData.content
      ? campaignData.content
      : "",
  ctaUrl:
    "ctaUrl" in campaignData && campaignData.ctaUrl ? campaignData.ctaUrl : "",
  // --- campos para airdrop ---
  reward:
    "reward" in campaignData && campaignData.reward ? campaignData.reward : "",
  lat: "lat" in campaignData && campaignData.lat ? campaignData.lat : "",
  lng: "lng" in campaignData && campaignData.lng ? campaignData.lng : "",
});

export default function EditCampaignModal({
  campaignData,
  onUpdate,
  isOpen,
  onOpenChange,
}: EditCampaignModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [form, setForm] = useState(createInitialForm(campaignData));

  useEffect(() => {
    setForm(createInitialForm(campaignData));
  }, [campaignData]);

  // --- Lógica dinámica para textos ---
  const campaignLabel =
    campaignData.type === "campaign"
      ? "Campaña"
      : campaignData.type === "airdrop"
      ? "Airdrop"
      : "Publicidad";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, adType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.description) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    let updatedCampaign: any = {
      name: form.name,
      description: form.description,
      status: campaignData.status,
    };

    // --- Campaign o Advertising ---
    if (
      campaignData.type === "campaign" ||
      campaignData.type === "advertising"
    ) {
      if (!form.budget) {
        alert("Ingresa un presupuesto válido");
        return;
      }

      const budgetNumber = parseFloat(
        form.budget.replace(/[^\d,.-]/g, "").replace(",", ".")
      );
      if (isNaN(budgetNumber) || budgetNumber <= 0) {
        alert("Ingresa un presupuesto válido");
        return;
      }

      updatedCampaign.budget = budgetNumber;
      updatedCampaign.adType = form.adType;
      updatedCampaign.content = form.content;
      updatedCampaign.ctaUrl = form.ctaUrl;
    }

    // --- Airdrop ---
    if (campaignData.type === "airdrop") {
      if (!form.reward) {
        alert("Ingresa una cantidad de tokens válida");
        return;
      }

      updatedCampaign.reward = form.reward;

      // Opcionales
      if (form.lat) updatedCampaign.lat = form.lat;
      if (form.lng) updatedCampaign.lng = form.lng;
    }

    // --- Audience vacío para evitar errores ---
    updatedCampaign.audience = {};

    try {
      const updated = await campaignApi.updateCampaign(
        campaignData.id,
        updatedCampaign
      );
      onUpdate(updated);
      setForm(createInitialForm(updated)); // Actualiza el form con los datos más recientes
      setOpen(false);
    } catch (error: any) {
      console.error("Error actualizando campaña:", error);
      alert(
        "Error actualizando campaña: " +
          (error.message || "Revise los datos enviados")
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar {campaignLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl mx-auto rounded-lg p-6 bg-background shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center flex-1">
            Editar {campaignLabel}
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu {campaignLabel.toLowerCase()} y haz clic
            en "Actualizar {campaignLabel}" para guardar los cambios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <Card>
            <CardContent className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de {campaignLabel}</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="min-h-[100px]"
                />
              </div>

              {/* Presupuesto o Reward */}
              {(campaignData.type === "campaign" ||
                campaignData.type === "advertising") && (
                <div className="space-y-2">
                  <Label htmlFor="budget">Presupuesto (€)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {campaignData.type === "airdrop" && (
                <div className="space-y-2">
                  <Label htmlFor="reward">Cantidad de Tokens</Label>
                  <Input
                    id="reward"
                    name="reward"
                    type="number"
                    value={form.reward}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* Tipo de anuncio */}
              {"adType" in campaignData && (
                <div className="space-y-2">
                  <Label htmlFor="adType">Tipo de anuncio</Label>

                  {
                    // Aquí TypeScript ya entiende que campaignData es Campaign | Advertising
                    <Select
                      value={form.adType}
                      onValueChange={handleSelectChange}
                    >
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
                  }
                </div>
              )}

              {/* Contenido */}
              {"content" in campaignData && (
                <div className="space-y-2">
                  <Label htmlFor="content">Contenido del anuncio</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    className="min-h-[100px]"
                    required
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
                    value={form.ctaUrl}
                    onChange={handleChange}
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full transition transform hover:scale-105 hover:shadow-lg hover:bg-red-500/90"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Actualizar {campaignLabel}
              </Button>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}
