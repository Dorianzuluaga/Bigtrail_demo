// src/components/Dashboard/Modals/CreateArticleModal.tsx
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateArticleModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void; // Puede ser ContentItem o FormData para futuro backend
}

const CreateArticleModal: React.FC<CreateArticleModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---- MANEJADOR DE ARCHIVO ----
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected)); // Genera URL local para previsualización
  };

  // ---- GUARDAR ARTÍCULO ----
  const handleSave = () => {
    if (!title.trim()) {
      alert("Agrega un título antes de publicar.");
      return;
    }

    // Preparado para futuro backend: FormData
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", "article");
    if (file) formData.append("file", file);

    // Temporal: enviar objeto para renderizar en frontend ahora
    const newContent = {
      id: Date.now(),
      title,
      description,
      type: "article",
      mediaUrl: previewUrl,
      status: "draft",
      views: 0,
      likes: 0,
      comments: 0,
      earnings: 0,
      date: new Date().toISOString(),
    };

    // Elegir qué enviar: FormData para backend, newContent para frontend
    onCreate(newContent);

    handleReset();
    onClose();
  };

  // ---- REINICIAR ESTADO ----
  const handleReset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Fondo translúcido y desenfoque */}
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Nuevo artículo</DialogTitle>
          <DialogDescription className="sr-only">
            Completa la información para crear un nuevo artículo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Campo Título */}
          <Input
            placeholder="Título del artículo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Campo Descripción */}
          <Textarea
            placeholder="Escribe tu artículo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Botón subir archivo */}
          <Button
            variant="outline"
            size="sm"
            className="transition transform hover:scale-105 hover:shadow-lg hover:bg-red-500/90"
            onClick={() => fileRef.current?.click()}
          >
            Subir imagen, video o PDF
          </Button>
          <input
            type="file"
            ref={fileRef}
            accept="image/*,video/*,.pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Previsualización del archivo */}
          {previewUrl && (
            <div className="w-full flex justify-center mt-2">
              {file?.type.startsWith("video") ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-48 rounded-lg"
                />
              ) : file?.type === "application/pdf" ? (
                <div className="flex flex-col items-center w-full">
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    width="100%"
                    height="300px"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Vista previa del PDF
                  </p>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="max-h-48 rounded-lg object-cover"
                />
              )}
            </div>
          )}

          {/* Botón Publicar */}
          <Button onClick={handleSave}>Publicar artículo</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateArticleModal;
