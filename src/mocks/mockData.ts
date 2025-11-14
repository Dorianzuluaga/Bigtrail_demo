// mockData.ts
import { Campaign, Airdrop, Advertising } from "@/types/campaign";

// Mock: Campaña normal
export const mockCampaign: Campaign = {
  id: "1",
  type: "campaign",
  name: "Campaña de prueba",
  description: "Campaña de prueba enfocada en bikers",
  status: "active",
  participants: 120,
  conversion: 15,
  budget: 2000,
  adType: "banner",
  content: "Contenido de campaña",
  audience: {
    "mountain-bikers": true,
    "trail-runners": false,
    hikers: true,
    photographers: false,
  },
  ctaUrl: "https://example.com/campaign",
  createdAt: new Date("2025-08-20").toISOString(),
};

// Mock: Airdrop
export const mockAirdrop: Airdrop = {
  id: "2",
  type: "airdrop",
  name: "Urban Adventure Campaign",
  description: "Promo de tokens gratis",
  status: "active",
  participants: 324,
  conversion: 12.5,
  reward: "50 TOKENS",
  budget: 1500,
  createdAt: new Date("2025-08-20").toISOString(),
};

// Mock: Publicidad
export const mockAdvertising: Advertising = {
  id: "3",
  type: "advertising",
  name: "Trail Explorer Ads",
  description: "Campaña en banners",
  status: "paused",
  budget: 3000,
  participants: 156,
  conversion: 8.3,
  adType: "video",
  content: "Contenido del anuncio",
  ctaUrl: "https://example.com",
  createdAt: new Date("2025-08-20").toISOString(),
};
