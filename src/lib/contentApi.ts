// src/lib/contentApi.ts
import { API_BASE_URL } from "./config";

const API_URL = API_BASE_URL;

/**
 * API para la sección de Creador de Contenido.
 * Sigue la misma estructura que campaignApi, pero adaptada a los endpoints /content.
 */
export const contentApi = {
  // ==================== CONTENIDOS ====================

  // 1️⃣ Obtener todos los contenidos del creador autenticado
  async getContents() {
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

  // 2️⃣ Obtener detalle de un contenido por ID
  async getContentById(contentId: string) {
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

  // 3️⃣ Crear nuevo contenido
  async createContent(contentData: {
    title: string;
    type: string;
    description: string;
    mediaUrl: string;
  }) {
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

  // 4️⃣ Actualizar contenido existente
  async updateContent(contentId: string, updatedData: any) {
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

  // 5️⃣ Eliminar contenido
  async deleteContent(contentId: string) {
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
