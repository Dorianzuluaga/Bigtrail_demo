import { useState, useCallback } from 'react';
import { Campaign, Brand, AirdropZone } from '@/types/airdrop-types';

// Tipos específicos para el dashboard de marcas
export interface CreateAirdropCampaignData {
  name: string;
  description: string;
  budget: number;
  rewardType: 'tokens' | 'nft' | 'discount' | 'product';
  rewardAmount: number;
  currency: string;
  zones: {
    name: string;
    location: string;
    center: { lat: number; lng: number };
    radius: number;
  }[];
  startDate: string;
  endDate: string;
  maxParticipants: number;
  requirements: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CreateAdvertisingCampaignData {
  name: string;
  type: 'banner' | 'video' | 'native' | 'sponsored';
  content: string;
  dailyBudget: number;
  targetAudience: string[];
  destinationUrl: string;
  startDate: string;
  endDate: string;
}

// Mock data para una marca
const MOCK_BRAND: Brand = {
  id: 'brand-001',
  name: 'BigTrail Adventures',
  logoUrl: '/bigtrail-logo.png',
  description: 'Marca líder en aventuras urbanas y deportes extremos',
  website: 'https://bigtrail.com'
};

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-001',
    brandId: 'brand-001',
    name: 'Urban Adventure Spring 2024',
    tokenAddress: '0x1234...abcd',
    totalTokens: '10000',
    startDate: '2024-07-29T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    zones: []
  },
  {
    id: 'camp-002',
    brandId: 'brand-001',
    name: 'Trail Explorer Challenge',
    tokenAddress: '0x5678...efgh',
    totalTokens: '5000',
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2024-08-15T23:59:59Z',
    zones: []
  }
];

export const useBrandDashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [brand] = useState<Brand>(MOCK_BRAND);
  const [loading, setLoading] = useState(false);

  // Estadísticas calculadas
  const stats = {
    activeCampaigns: campaigns.filter(c => {
      const now = new Date();
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      return now >= start && now <= end;
    }).length,
    totalBudget: 45000, // Mock data
    spentBudget: 8500,
    totalParticipants: 1247,
    todayParticipants: 156,
    conversionRate: 15.8,
    monthlyGrowth: 2.3
  };

  // Crear campaña de airdrop
  const createAirdropCampaign = useCallback(async (data: CreateAirdropCampaignData) => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear zonas de airdrop
      const zones: AirdropZone[] = data.zones.map((zone, index) => ({
        id: `zone-${Date.now()}-${index}`,
        name: zone.name,
        description: `Zona de airdrop en ${zone.location}`,
        tokenAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        center: zone.center,
        radius: zone.radius,
        amount: data.rewardAmount.toString(),
        startTime: data.startDate,
        endTime: data.endDate,
        isActive: true,
        brandId: brand.id
      }));

      // Crear campaña
      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        brandId: brand.id,
        name: data.name,
        tokenAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        totalTokens: (data.rewardAmount * data.maxParticipants).toString(),
        zones: zones,
        startDate: data.startDate,
        endDate: data.endDate
      };

      setCampaigns(prev => [...prev, newCampaign]);
      
      return { success: true, campaign: newCampaign };
    } catch (error) {
      return { success: false, error: 'Error al crear la campaña' };
    } finally {
      setLoading(false);
    }
  }, [brand.id]);

  // Crear campaña publicitaria
  const createAdvertisingCampaign = useCallback(async (data: CreateAdvertisingCampaignData) => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En este caso, una campaña publicitaria no tiene zones sino que es diferente
      // Por simplicidad, la agregamos a las campañas existentes con zones vacías
      const newCampaign: Campaign = {
        id: `ad-camp-${Date.now()}`,
        brandId: brand.id,
        name: data.name,
        tokenAddress: '', // Las campañas publicitarias no usan tokens
        totalTokens: '0',
        zones: [],
        startDate: data.startDate,
        endDate: data.endDate
      };

      setCampaigns(prev => [...prev, newCampaign]);
      
      return { success: true, campaign: newCampaign };
    } catch (error) {
      return { success: false, error: 'Error al crear la campaña publicitaria' };
    } finally {
      setLoading(false);
    }
  }, [brand.id]);

  // Obtener detalles de una campaña
  const getCampaignDetails = useCallback((campaignId: string) => {
    return campaigns.find(c => c.id === campaignId);
  }, [campaigns]);

  // Pausar/reanudar campaña
  const toggleCampaignStatus = useCallback(async (campaignId: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Aquí implementarías la lógica para pausar/reanudar
      // Por ahora solo simulamos que funciona
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al cambiar el estado de la campaña' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener métricas de una campaña
  const getCampaignMetrics = useCallback((campaignId: string) => {
    // Mock data - en producción vendría de la API
    return {
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 500) + 50,
      participants: Math.floor(Math.random() * 200) + 20,
      conversions: Math.floor(Math.random() * 50) + 5,
      spent: Math.floor(Math.random() * 1000) + 100,
      ctr: (Math.random() * 5 + 1).toFixed(2), // Click Through Rate
      cpc: (Math.random() * 2 + 0.5).toFixed(2), // Cost Per Click
      roi: (Math.random() * 300 + 50).toFixed(1) // Return on Investment
    };
  }, []);

  return {
    brand,
    campaigns,
    stats,
    loading,
    createAirdropCampaign,
    createAdvertisingCampaign,
    getCampaignDetails,
    toggleCampaignStatus,
    getCampaignMetrics
  };
};