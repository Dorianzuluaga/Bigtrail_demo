import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  TrendingUp,
  FileText,
  Camera,
  Video,
  Trash2,
} from "lucide-react";
import Header from "@/components/Dashboard/Header";
import ContentCard from "@/components/Dashboard/ContentCard";
import ViewContentModal from "@/components/Dashboard/Modals/ViewContentModal";
import EditContentModal from "@/components/Dashboard/Modals/EditContentModal";
import CreateContentModal from "@/components/Dashboard/Modals/CreateContentModal";
import { ContentItem } from "@/types/content";
import CreateArticleModal from "@/components/Dashboard/Modals/CreateArticleModal";
import { API_BASE_URL, BRAND_ID } from "@/lib/config";
import { useContent } from "../hooks/useContent";
import { contentService } from "@/services/contentService";
import { appToast } from "@/components/ui/app-toast";

const CreatorDashboard = () => {
  const { contents, setContents } = useContent();
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-6 h-6 text-primary" />;
      case "photo":
        return <Camera className="w-6 h-6 text-secondary" />;
      case "article":
        return <FileText className="w-6 h-6 text-accent" />;
      default:
        return <FileText className="w-6 h-6 text-muted-foreground" />;
    }
  };
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleView = (c: ContentItem) => {
    setSelectedContent(c);
    setIsViewModalOpen(true);
  };

  const handleEdit = (c: ContentItem) => {
    setSelectedContent(c);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (updatedContent: ContentItem) => {
    try {
      // 1️⃣ Construimos el payload asegurando que no se pierdan valores
      const payload: Partial<ContentItem> = {
        title: updatedContent.title,
        description: updatedContent.description,
        mediaUrl: updatedContent.mediaUrl,
      };
      if (!updatedContent.id) {
        return appToast.error({
          title: "Error actualizando contenido",
          description: "Falta el ID del contenido a actualizar.",
        });
      }

      // 2️⃣ Llamamos al backend
      const updatedFromBackend = await contentService.updateContent(
        String(updatedContent.id),
        payload
      );

      // 3️⃣ Mezclamos el objeto actualizado con el anterior (en vez de reemplazarlo)
      setContents((prev) =>
        prev.map((c) =>
          c.id === updatedFromBackend.id
            ? { ...c, ...updatedFromBackend } // 👈 conserva los campos no modificados
            : c
        )
      );
      appToast.success({
        title: "contenido Actulizado",
        description: "los cambios se guardaron correctamente.",
      });
    } catch (error: any) {
      appToast.error({
        title: "Error actualizando contenido",
        description:
          error.message ||
          "No se pudieron guardar los cambios. Inténtalo de nuevo",
      });
    }
  };

  const handleCreate = async (newContent: Omit<ContentItem, "id" | "date">) => {
    try {
      const created = await contentService.createContent(newContent);

      //  Normalizamos el contenido para que no falten campos esperados en el render
      const normalized = {
        ...created,
        views: created?.views ?? 0,
        date: created?.date ?? new Date().toISOString(),
      };

      setContents((prev) => {
        // Si ya existe el ID en el estado, no agregar
        if (prev.find((c) => c.id === normalized.id)) return prev;
        return [normalized, ...prev];
      });

      setIsCreateModalOpen(false);
      setIsArticleModalOpen(false);
      appToast.success({
        title: "contenido Creado",
        description: "Se creó correctamente",
      });

      console.log("✅ Contenido creado:", normalized);
    } catch (error: any) {
      appToast.error({
        title: "Error creando contenido",
        description: error.message || "Inténtalo de nuevo",
      });
      console.error("🔥 Error creando contenido:", error);
      alert(`Error al crear contenido: ${error.message}`);
    }
  };

  const handleDelete = async (content: ContentItem) => {
    const confirmed = confirm(`¿Estás seguro de eliminar "${content.title}"?`);
    if (!confirmed)
      return appToast.error({
        title: "Eliminación cancelada",
        description: "El contenido no fue eliminado.",
      });
    try {
      await contentService.deleteContent(String(content.id));
      setContents((prev) => prev.filter((item) => item.id !== content.id));
      appToast.success({
        title: "Contenido eliminado",
        description: `"${content.title}"se eliminó correctamente.`,
      });
    } catch (error) {
      appToast.error({
        title: "Error eliminando contenido",
        description:
          error?.message ||
          "No se pudo eliminar el contenido. Inténtalo de nuevo",
      });
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header userType="Creador de Contenido" />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Creator Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Contenidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">47</div>
                <p className="text-xs text-muted-foreground">+3 esta semana</p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Visualizaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">124.5K</div>
                <p className="text-xs text-muted-foreground">
                  +8.2K esta semana
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Seguidores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">3,247</div>
                <p className="text-xs text-muted-foreground">+89 esta semana</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ganancias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  €1,847
                </div>
                <p className="text-xs text-muted-foreground">
                  +€234 esta semana
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Mi Contenido</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mi Contenido</h2>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Nuevo contenido
                </Button>{" "}
              </div>

              <div className="grid gap-4">
                {contents.map((content) => (
                  <Card
                    key={content.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {content.mediaUrl ? (
                              content.type === "video" ? (
                                <video
                                  key={content.mediaUrl}
                                  src={content.mediaUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                              ) : (
                                <img
                                  key={content.mediaUrl}
                                  src={content.mediaUrl}
                                  alt={content.title || "Contenido"}
                                  className="w-full h-full object-cover"
                                />
                              )
                            ) : (
                              <FileText className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>

                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {content.title || "Sin título"}
                              <Badge
                                variant={getStatusColor(content.status) as any}
                              >
                                {content.status || "draft"}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {content.date
                                ? new Date(content.date).toLocaleDateString(
                                    "es-ES"
                                  )
                                : "Sin fecha"}
                            </CardDescription>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(content)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(content)}
                          >
                            Editar
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(content)}
                          >
                            <Trash2 className="w-5 h-5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{(content.views || 0).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-muted-foreground" />
                          <span
                            className={
                              (content.likes || 0) > 0
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {(content.likes || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {(content.comments || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span>€{content.earnings || 0}</span>
                        </div>

                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              content.mediaUrl || ""
                            )
                          }
                          title="Copiar enlace"
                        >
                          <Share2 className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ViewContentModal
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                content={selectedContent}
              />
              <EditContentModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                content={selectedContent}
                onUpdate={handleUpdate}
              />
            </TabsContent>
            {/* analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento del Contenido</CardTitle>
                  <CardDescription>
                    Análisis detallado de tu contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Top Contenidos</h4>
                      {contents
                        .filter((c) => c.status === "published")
                        .sort((a, b) => b.views - a.views)
                        .slice(0, 3)
                        .map((content, index) => (
                          <div
                            key={content.id}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {content.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {content.views.toLocaleString()} visualizaciones
                              </p>
                            </div>
                            <Badge variant="outline">{content.type}</Badge>
                          </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Métricas de Engagement</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Rate de interacción</span>
                          <span className="font-semibold text-primary">
                            8.4%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tiempo promedio</span>
                          <span className="font-semibold text-secondary">
                            3:42 min
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Shares por contenido</span>
                          <span className="font-semibold text-accent">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Crecimiento semanal</span>
                          <span className="font-semibold text-emerald-600">
                            +12.5%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Audiencia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Mountain Bikers</span>
                        <span className="text-sm font-semibold">42%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Trail Runners</span>
                        <span className="text-sm font-semibold">28%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Senderistas</span>
                        <span className="text-sm font-semibold">18%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Fotógrafos</span>
                        <span className="text-sm font-semibold">12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ingresos por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Videos patrocinados</span>
                        <span className="text-sm font-semibold">€1,240</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Fotografías</span>
                        <span className="text-sm font-semibold">€387</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Artículos</span>
                        <span className="text-sm font-semibold">€220</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-emerald-600">
                          €1,847
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <CreateContentModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
        onOpenArticle={() => setIsArticleModalOpen(true)}
      />
      <CreateArticleModal
        open={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default CreatorDashboard;
