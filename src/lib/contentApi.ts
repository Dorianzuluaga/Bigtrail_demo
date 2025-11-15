// src/lib/contentApi.ts
import { API_BASE_URL } from "./config";

const DEMO_MODE = API_BASE_URL.includes("fake-api-demo.com");
const API_URL = API_BASE_URL;

const memory = {
  contents: [] as any[],
};
const generateId = () => crypto.randomUUID();
/**
 * API para la sección de Creador de Contenido.
 * Sigue la misma estructura que campaignApi, pero adaptada a los endpoints /content.
 */
export const contentApi = {
  // ==================== CONTENIDOS ====================

  // Obtener todos los contenidos del creador autenticado
  async getContents() {
    if (DEMO_MODE) {
      return memory.contents;
    }

    const res = await fetch(`${API_URL}/content`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) throw new Error("Error obteniendo contenidos");
    return res.json();
  },

  // Obtener detalle de un contenido por ID
  async getContentById(contentId: string) {
    if (DEMO_MODE) {
      return memory.contents.find((c) => c.id === contentId);
    }
    const res = await fetch(`${API_URL}/content/${contentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) throw new Error("Error obteniendo detalle de contenido");
    return res.json();
  },

  // Crear nuevo contenido
  async createContent(contentData: {
    title: string;
    type: string;
    description: string;
    mediaUrl: string;
  }) {
    if (DEMO_MODE) {
      const newContent = {
        id: generateId(),
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        earnings: 0,
        createdAt: new Date().toISOString(),
        ...contentData,
      };

      memory.contents.push(newContent);
      return newContent;
    }
    const res = await fetch(`${API_URL}/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(contentData),
    });

    if (!res.ok) throw new Error("Error creando contenido");
    return res.json();
  },

  // Actualizar contenido existente
  async updateContent(contentId: string, updatedData: any) {
    if (DEMO_MODE) {
      const index = memory.contents.findIndex((c) => c.id === contentId);
      if (index === -1) throw new Error("No existe contenido para actualizar");

      memory.contents[index] = {
        ...memory.contents[index],
        ...updatedData,
      };

      return memory.contents[index];
    }
    const res = await fetch(`${API_URL}/content/${contentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) throw new Error("Error actualizando contenido");
    return res.json();
  },

  // Eliminar contenido
  async deleteContent(contentId: string) {
    if (DEMO_MODE) {
      memory.contents = memory.contents.filter((c) => c.id !== contentId);
      return { success: true };
    }
    const res = await fetch(`${API_URL}/content/${contentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) throw new Error("Error eliminando contenido");
    return res.json();
  },
};
