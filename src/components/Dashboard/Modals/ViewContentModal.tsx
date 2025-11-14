// src/components/Dashboard/Modals/ModalViewContent.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ContentItem } from "@/types/content";

interface Props {
  open: boolean;
  onClose: () => void;
  content: ContentItem | null;
}

const ModalViewContent: React.FC<Props> = ({ open, onClose, content }) => {
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
        </DialogHeader>

        <Card className="mb-4">
          {content.mediaUrl && (
            <div className="w-full h-64 bg-black/5 flex items-center justify-center overflow-hidden">
              {content.type === "video" ? (
                <video
                  src={content.mediaUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={content.mediaUrl}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
          <CardContent>
            <div className="mb-2 text-sm text-muted-foreground">
              Tipo: {content.type}
            </div>
            <div className="mb-2 text-sm text-muted-foreground">
              Fecha:{" "}
              {content.date ? new Date(content.date).toLocaleString() : "-"}
            </div>
            <div className="mb-3 text-base">{content.description}</div>
            {content.type === "article" && (
              <div className="prose max-w-none">{content.content}</div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalViewContent;
