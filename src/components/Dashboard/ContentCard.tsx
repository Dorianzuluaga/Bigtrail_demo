// src/components/Dashboard/ContentCard.tsx
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Share2, FileText } from "lucide-react";
import type { ContentItem } from "@/types/content";

interface Props {
  data: ContentItem;
  onView: (c: ContentItem) => void;
  onEdit: (c: ContentItem) => void;
  onShare?: (c: ContentItem) => void;
}

const ContentCard: React.FC<Props> = ({ data, onView, onEdit, onShare }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
              {data.mediaUrl ? (
                data.type === "photo" ? (
                  // Imagen
                  <img
                    src={data.mediaUrl}
                    alt={data.title}
                    className="w-full h-full object-cover"
                  />
                ) : data.type === "video" ? (
                  // Video con poster (puede ser placeholder) y controles
                  <video
                    src={data.mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    controls
                    poster="/video-placeholder.png" // opcional: miniatura genérica
                  />
                ) : data.type === "pdf" ? (
                  // PDF o archivos genéricos
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <FileText className="w-6 h-6 text-gray-500" />
                  </div>
                ) : (
                  // Otros tipos de archivo
                  <div className="text-sm">{data.type}</div>
                )
              ) : (
                <div className="text-xs text-muted-foreground px-2">
                  {data.type}
                </div>
              )}
            </div>

            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                {data.title}
                <Badge
                  variant={
                    data.status === "published" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {data.status ?? "draft"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {data.date
                  ? new Date(data.date).toLocaleDateString("es-ES")
                  : ""}
              </CardDescription>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onView(data)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(data)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onShare?.(data)}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground line-clamp-2">
          {data.description}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCard;
