// src/components/Dashboard/Modals/EditContentModal.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import type { ContentItem } from "@/types/content";
import { contentService } from "@/services/contentService";
import { appToast } from "@/components/ui/app-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  content: ContentItem | null;
  onUpdate: (updated: ContentItem) => void;
}

const ModalEditContent: React.FC<Props> = ({
  open,
  onClose,
  content,
  onUpdate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | undefined>(
    undefined
  ); // URL temporal para preview
  const [mediaFile, setMediaFile] = useState<File | null>(null); // Archivo seleccionado para subir
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(
    content?.mediaUrl
  );
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Inicializa campos cuando se abre el modal
  useEffect(() => {
    if (content) {
      setTitle(content.title || "");
      setDescription(content.description || "");
      setMediaUrl(content.mediaUrl);
      setFile(null);
      setMediaPreview(content.mediaUrl);
    } else {
      setTitle("");
      setDescription("");
      setMediaUrl(undefined);
      setFile(null);
      setMediaPreview(undefined);
    }
  }, [content]);

  // Limpieza de blob URLs
  useEffect(() => {
    return () => {
      if (mediaUrl?.startsWith("blob:")) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setMediaPreview(url); // para mostrar preview instantáneo
      setMediaFile(f); // para subir al backend al guardar
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const f = e.target.files?.[0];
  //   if (f) {
  //     const url = URL.createObjectURL(f);
  //     setMediaUrl(url);
  //     setFile(f); // guardamos el archivo para subirlo después
  //   }
  // };

  const handleSave = async () => {
    if (!content)
      return appToast.error({
        title: "Error actualizando contenido",
        description: "No se ha encontrado el contenido a actualizar.",
      });

    let updatedMediaUrl = mediaUrl;

    // 1. Subir archivo si hay uno nuevo
    if (mediaFile) {
      const formData = new FormData();
      formData.append("file", mediaFile);

      try {
        const { mediaUrl: uploadedUrl } = await contentService.uploadMedia(
          formData
        );
        updatedMediaUrl = uploadedUrl;
        appToast.success({
          title: "Archivo subido correctamente",
          description: "El archivo multimedia se ha actualizado.",
        });
      } catch (err) {
        return appToast.error({
          title: "Error subiendo archivo",
          description: err.message || "No se pudo subir el archivo multimedia.",
        });
      }
    }

    // 2. Construir objeto solo con los cambios
    const updatedData: Partial<ContentItem> = {
      title: title !== content.title ? title : undefined,
      description:
        description !== content.description ? description : undefined,
      mediaUrl:
        updatedMediaUrl !== content.mediaUrl ? updatedMediaUrl : undefined,
    };

    if (!Object.values(updatedData).some((v) => v !== undefined)) {
      return appToast.error({
        title: "Sin cambios",
        description: "No hay modificaciones para guardar.",
      });
    }

    // 3. Llamar a updateContent con el ID
    try {
      const updated = await contentService.updateContent(
        String(content.id),
        updatedData
      );

      appToast.success({
        title: "Contenido actualizado",
        description: "Los cambios se guardaron correctamente.",
      });

      onUpdate(updated); // actualiza lista inmediatamente
      onClose();
    } catch (err) {
      appToast.error({
        title: "Error actualizando contenido",
        description: err.message || "No se pudieron guardar los cambios.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl mx-auto rounded-lg p-6 bg-background shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center flex-1">
            Editar Contenido
          </DialogTitle>
          <DialogDescription className="text-center">
            Modifica los detalles de tu contenido y haz clic en “Actualizar
            Contenido” para guardar los cambios.
          </DialogDescription>
        </DialogHeader>

        <Card className="mt-4">
          <CardContent className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            {/* Reemplazar Media */}
            <div className="space-y-2">
              <Label>Reemplazar media (opcional)</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="transition transform hover:scale-105 hover:shadow-lg hover:bg-red-500/90"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir archivo
                </Button>
                {mediaUrl && (
                  <div className="ml-4 w-24 h-16 overflow-hidden rounded bg-muted">
                    {mediaPreview ? (
                      mediaPreview.endsWith(".mp4") ||
                      mediaPreview.endsWith(".mov") ? (
                        <video
                          src={mediaPreview}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={mediaPreview}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      )
                    ) : mediaUrl ? (
                      mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".mov") ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      )
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="transition transform hover:scale-105 hover:shadow-lg hover:bg-red-500/90"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="transition transform hover:scale-105 hover:shadow-lg hover:bg-red-500/90"
                onClick={handleSave}
              >
                Actualizar Contenido
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditContent;
