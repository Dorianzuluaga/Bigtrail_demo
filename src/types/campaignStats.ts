export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalParticipants: number;
  totalBudgetSpent: string;
  topBrands: { brandId: string; brandName: string; spent: string }[];
  recentActivities: any[];
}
