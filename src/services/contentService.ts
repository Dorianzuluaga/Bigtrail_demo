import { appToast } from "@/components/ui/app-toast";
import { API_BASE_URL, BRAND_ID } from "@/lib/config";
import { ContentItem } from "@/types/content";

const API_URL = `${API_BASE_URL}/content`;

export const contentService = {
  // Obtener todos los contenidos
  async getAllContents(): Promise<ContentItem[]> {
    const res = await fetch(`${API_URL}?brandId=${BRAND_ID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      appToast.error({
        title: "Error obteniendo contenidos",
        description: `Status ${res.status}`,
      });
      throw new Error(`Error al obtener los contenidos (status ${res.status})`);
    }

    return res.json();
  },

  // Crear contenido
  async createContent(
    newContent: Omit<ContentItem, "id" | "date">
  ): Promise<ContentItem> {
    const res = await fetch(`${API_URL}?brandId=${BRAND_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContent),
    });

    if (!res.ok) {
      appToast.error({
        title: "Error creando contenido",
        description: `Status ${res.status}`,
      });
      throw new Error(`Error al crear contenido (status ${res.status})`);
    }

    return res.json();
  },

  // Actualizar contenido
  async updateContent(
    contentID: string,
    updatedata: Partial<ContentItem>
  ): Promise<ContentItem> {
    const res = await fetch(`${API_URL}/${contentID}?brandId=${BRAND_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedata),
    });

    if (!res.ok) {
      appToast.error({
        title: "Error actualizando contenido",
        description: `Status ${res.status}`,
      });
      throw new Error(`Error al actualizar contenido (status ${res.status})`);
    }
    return res.json();
  },

  // Eliminar contenido
  async deleteContent(contentID: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/${contentID}?brandId=${BRAND_ID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      appToast.error({
        title: "Error eliminando contenido",
        description: `Status ${res.status}`,
      });
      throw new Error(`Error al eliminar contenido (status ${res.status})`);
    }

    return true;
  },

  // Obtener contenido por ID
  async getContentById(contentID: string): Promise<ContentItem> {
    const res = await fetch(`${API_URL}/${contentID}?brandId=${BRAND_ID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      appToast.error({
        title: "Error obteniendo contenido",
        description: `Status ${res.status}`,
      });
      throw new Error(`Error al obtener contenido (status ${res.status})`);
    }

    return res.json();
  },
  // Subir media (archivo)
  async uploadMedia(formData: FormData): Promise<{ mediaUrl: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/uploads?brandId=${BRAND_ID}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        appToast.error({
          title: "Error subiendo archivo",
          description: `Status ${res.status}`,
        });
        throw new Error(`Error al subir archivo (status ${res.status})`);
      }

      const data = await res.json();

      // Validación extra: asegurar que venga mediaUrl en la respuesta
      if (!data.mediaUrl) {
        appToast.error({
          title: "Error en respuesta del servidor",
          description: "No se recibió mediaUrl en la respuesta.",
        });
        throw new Error("Respuesta inválida del servidor: falta mediaUrl");
      }

      return data;
    } catch (err) {
      appToast.error({
        title: "Error de conexión",
        description: "No se pudo subir el archivo. Inténtalo de nuevo.",
      });
      throw err;
    }
  },
};
