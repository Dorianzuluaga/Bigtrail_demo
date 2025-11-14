import { API_BASE_URL } from "./config";

const API_URL = API_BASE_URL;
export const BRAND_ID = "aedfeb8c-8a54-4b99-96b3-ac388a8156ac";

export const campaignApi = {
  // ================= USUARIO =================
  async getMe() {
    const res = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });
    if (!res.ok) throw new Error("Error obteniendo usuario");
    return res.json();
  },

  // ================= MARCAS =================
  async getBrands() {
    const res = await fetch(`${API_URL}/brands`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });
    if (!res.ok) throw new Error("Error obteniendo marcas");
    return res.json();
  },

  // ================= CAMPAÑAS =================
  async getCampaigns(filters?: {
    brandId?: string;
    type?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();

    params.append("brandId", filters?.brandId || BRAND_ID);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);

    const query = params.toString();
    const url = query
      ? `${API_URL}/campaigns?${query}`
      : `${API_URL}/campaigns`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Error obteniendo campañas");
    return res.json();
  },

  async getCampaignById(
    campaignId: string,
    includeZones: "active" | "all" | "none" = "active"
  ) {
    const res = await fetch(
      `${API_URL}/campaigns/${campaignId}?include_zones=${includeZones}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error("Error obteniendo campaña por ID");
    return res.json();
  },

  async createCampaign(campaignData: any) {
    // ⚡ usamos directamente BRAND_ID fijo
    const res = await fetch(`${API_URL}/campaigns?brandId=${BRAND_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 🚫 sin Authorization
      },
      body: JSON.stringify(campaignData),
    });
    if (!res.ok) throw new Error("Error creando campaña");
    return res.json();
  },

  async updateCampaign(campaignId: string, updatedData: any) {
    const res = await fetch(`${API_URL}/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // 🚫 sin Authorization
      },
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) throw new Error("Error actualizando campaña");
    const data = await res.json();
    return data.updatedCampaign;
  },

  async deleteCampaign(campaignId: string) {
    const res = await fetch(`${API_URL}/campaigns/${campaignId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // 🚫 sin Authorization
      },
    });
    if (!res.ok) throw new Error("Error eliminando campaña");
    return res.json();
  },
};
