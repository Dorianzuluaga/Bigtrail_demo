import { API_BASE_URL, BRAND_ID as CONFIG_BRAND_ID } from "./config";

const DEMO_MODE = API_BASE_URL.includes("fake-api-demo.com");
//
// export const BRAND_ID = "aedfeb8c-8a54-4b99-96b3-ac388a8156ac";

const memory = {
  campaigns: [] as any[],
  brands: [
    {
      id: CONFIG_BRAND_ID,
      name: "BigTrail Magazine Demo",
    },
  ],
  me: {
    id: "user-demo-001",
    name: "Demo User",
    role: "admin",
  },
};

const generateId = () => crypto.randomUUID();
const API_URL = API_BASE_URL;

export const campaignApi = {
  // ================= USUARIO =================
  async getMe() {
    if (DEMO_MODE) return memory.me;

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
    if (DEMO_MODE) return memory.brands;
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
    if (DEMO_MODE) {
      return memory.campaigns.filter(
        (c) =>
          (!filters?.brandId || c.brandId === filters.brandId) &&
          (!filters?.type || c.type === filters.type) &&
          (!filters?.status || c.status === filters.status)
      );
    }

    const params = new URLSearchParams();
    params.append("brandId", filters?.brandId || CONFIG_BRAND_ID);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);

    const query = params.toString();
    const url = query
      ? `${API_URL}/campaigns?${query}`
      : `${API_URL}/campaigns`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Error obteniendo campañas");
    return res.json();
  },

  async getCampaignById(
    campaignId: string,
    includeZones: "active" | "all" | "none" = "active"
  ) {
    if (DEMO_MODE) {
      return memory.campaigns.find((c) => c.id === campaignId);
    }
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
    if (DEMO_MODE) {
      const newCampaign = {
        id: generateId(),
        brandId: CONFIG_BRAND_ID,
        status: "active",
        zones: [],
        type: campaignData.type || "campaign",
        ...campaignData,
        createdAt: new Date().toISOString(),
      };

      memory.campaigns.push(newCampaign);
      return newCampaign;
    }

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
    if (DEMO_MODE) {
      const index = memory.campaigns.findIndex((c) => c.id === campaignId);
      if (index === -1) throw new Error("No existe campaña para actualizar");

      memory.campaigns[index] = { ...memory.campaigns[index], ...updatedData };
      return memory.campaigns[index];
    }

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
    if (DEMO_MODE) {
      memory.campaigns = memory.campaigns.filter((c) => c.id !== campaignId);
      return { success: true };
    }
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
