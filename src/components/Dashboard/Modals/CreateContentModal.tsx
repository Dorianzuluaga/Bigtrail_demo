// src/components/Dashboard/Modals/CreateContentModal.tsx
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CreateArticleModal from "./CreateArticleModal";
import { appToast } from "@/components/ui/app-toast";
import { error } from "console";
import { contentService } from "@/services/contentService";
import { ContentItem } from "@/types/content";
import { API_BASE_URL, BRAND_ID } from "@/lib/config";

const DEMO_MODE = !BRAND_ID || API_BASE_URL.includes("fake-api-demo.com");

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (newContent: any) => void;
  onOpenArticle: () => void; // 👈 añadimos esta prop
}
const memory = {
  contents: [] as any[],
};

const generateId = () => crypto.randomUUID();

const CreateContentModal: React.FC<CreateContentModalProps> = ({
  open,
  onClose,
  onCreate,
  onOpenArticle,
}) => {
  // Estados
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [type, setType] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ---- MANEJADORES ----
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setType("photo");
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setType("video");
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!title || (["photo", "video", "pdf"].includes(type) && !file)) {
      return appToast.error({
        title: "Error creando contenido",
        description: "El título y el archivo son obligatorios.",
      });
    }

    try {
      let mediaUrlToSend: string | undefined = previewUrl;

      if (file && type === "photo" && !DEMO_MODE) {
        const formData = new FormData();
        formData.append("file", file);

        const { mediaUrl } = await contentService.uploadMedia(formData);
        mediaUrlToSend = mediaUrl;

        appToast.success({
          title: "Miniatura subida",
          description: "La imagen se cargó correctamente.",
        });
      }

      // Construir payload
      const newContent = {
        id: DEMO_MODE ? generateId() : undefined,
        title,
        description,
        type,
        mediaUrl: mediaUrlToSend,
        status: "draft",
        brandId: BRAND_ID,
        createdAt: new Date().toISOString(),
      };

      let createdContent;

      if (DEMO_MODE) {
        memory.contents.push(newContent);
        createdContent = newContent;
      } else {
        createdContent = await contentService.createContent(newContent);
      }

      onCreate(createdContent);
      handleReset();
      onClose();

      appToast.success({
        title: "Contenido creado",
        description: "Se guardó correctamente.",
      });
    } catch (error: any) {
      appToast.error({
        title: "Error creando contenido",
        description: error.message || "No se pudo crear el contenido.",
      });
      console.error("❌ Error creando contenido:", error);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setType("");
  };

  return (
    <>
      {/* --- MODAL PRINCIPAL --- */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo contenido</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Si no hay archivo, mostrar opciones */}
            {!file ? (
              <>
                <div className="flex justify-between items-center border p-3 rounded-lg">
                  <p>Subir una foto</p>
                  <Button onClick={() => photoInputRef.current?.click()}>
                    Seleccionar
                  </Button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex justify-between items-center border p-3 rounded-lg">
                  <p>Subir un video</p>
                  <Button onClick={() => videoInputRef.current?.click()}>
                    Seleccionar
                  </Button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex justify-between items-center border p-3 rounded-lg">
                  <p>Publicar un artículo</p>
                  <Button
                    onClick={() => {
                      onClose();
                      setTimeout(() => onOpenArticle(), 200);
                    }}
                  >
                    Escribir
                  </Button>
                </div>
              </>
            ) : (
              // --- Vista previa y edición ---
              <div className="flex flex-col gap-3">
                <div className="w-full flex justify-center">
                  {type === "photo" ? (
                    <img
                      src={previewUrl!}
                      alt="Preview"
                      className="max-h-48 rounded-lg object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl!}
                      controls
                      className="max-h-48 rounded-lg"
                    />
                  )}
                </div>

                <Input
                  placeholder="Título del contenido"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Textarea
                  placeholder="Descripción o pie de foto/video"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="transition transform hover:scale-105 hover:shadow-lg hover:bg-red-500/90"
                    onClick={handleReset}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="transition transform hover:scale-105 hover:shadow-lg hover:bg-red-500/90"
                    onClick={handleSave}
                  >
                    Publicar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL SECUNDARIO: CREAR ARTÍCULO --- */}
      <CreateArticleModal
        open={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onCreate={(newArticle) => {
          onCreate(newArticle);
          setIsArticleModalOpen(false);
          onClose();
        }}
      />
    </>
  );
};

export default CreateContentModal;
