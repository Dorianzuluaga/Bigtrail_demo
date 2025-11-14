export type CampaignType = "campaign" | "airdrop" | "advertising";

export type CampaignStatus = "active" | "paused" | "finished";

// Campaña normal
export interface Campaign {
  id: string;
  type: "campaign";
  name: string;
  description?: string;
  status: CampaignStatus;
  participants: number;
  conversion: number;
  budget: number;
  adType?: "banner" | "video" | "native" | "sponsored";
  content?: string;
  audience?: {
    "mountain-bikers": boolean;
    "trail-runners": boolean;
    hikers: boolean;
    photographers: boolean;
  };
  ctaUrl?: string;
  createdAt: string; //opcoinal para pruebas
}

// Airdrop
export interface Airdrop {
  id: string;
  type: "airdrop";
  name: string;
  description?: string;
  budget: number;
  status: CampaignStatus;
  participants: number;
  conversion: number;
  reward: string;
  createdAt: string; //opcoinal para pruebas
}

// Publicidad
export interface Advertising {
  id: string;
  type: "advertising";
  name: string;
  description?: string;
  status: CampaignStatus;
  participants: number;
  conversion: number;
  budget: number;
  adType?: "banner" | "video" | "native" | "sponsored";
  content?: string;
  ctaUrl?: string;
  createdAt: string; //opcoinal para pruebas
}

export type CampaignUnion = Campaign | Airdrop | Advertising;

export const isAirdrop = (c: CampaignUnion): c is Airdrop =>
  c.type === "airdrop";
export const isAdvertising = (c: CampaignUnion): c is Advertising =>
  c.type === "advertising";
export const isCampaign = (c: CampaignUnion): c is Campaign =>
  c.type === "campaign";
