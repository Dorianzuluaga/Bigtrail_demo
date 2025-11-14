// zonesApi.ts
const API_BASE_URL = 'https://bigtrailmagazine.es/api';

export interface ZoneData {
  name: string;
  description: string;
  token_address: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  amount: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  brand_id: string;
  campaign_id: string;
}

export interface ZoneResponse extends ZoneData {
  id: string;
}

export interface ApiError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

/**
 * Crea una zona
 */
export const createZone = async (
  brandId: string,
  campaignId: string,
  zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>
): Promise<ZoneResponse> => {
  console.log('Creando zona:', { brandId, campaignId, zoneData });

  const response = await fetch(`${API_BASE_URL}/zones/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...zoneData,
      brand_id: brandId,
      campaign_id: campaignId,
    }),
  });

  console.log('Respuesta POST:', response.status, response.statusText);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    console.error('Error POST:', errorData);
    throw new Error(errorData.detail?.[0]?.msg || 'Error creating zone');
  }

  const result: ZoneResponse = await response.json();
  console.log('Zona creada:', result);
  return result;
};

/**
 * Lee zonas (tu backend usa GET con body; si lo cambias a querystring,
 * avísame y te lo ajusto).
 */
export const getZone = async (
  brandId: string,
  campaignId: string,
  zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>
): Promise<ZoneResponse> => {
  console.log('Get zona:', { brandId, campaignId, zoneData });

  const response = await fetch(`${API_BASE_URL}/zones/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...zoneData,
      brand_id: brandId,
      campaign_id: campaignId,
    }),
  });

  console.log('Respuesta GET:', response.status, response.statusText);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    console.error('Error GET:', errorData);
    throw new Error(errorData.detail?.[0]?.msg || 'Error Reading zone');
  }

  const result: ZoneResponse = await response.json();
  console.log('Zona Reading:', result);
  return result;
};

/**
 * Actualiza una zona
 */
export const updateZone = async (
  brandId: string,
  campaignId: string,
  zoneId: string,
  zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>
): Promise<ZoneResponse> => {
  console.log('Actualizando zona:', { brandId, campaignId, zoneId, zoneData });

  const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...zoneData,
      brand_id: brandId,
      campaign_id: campaignId,
    }),
  });

  console.log('Respuesta PUT:', response.status, response.statusText);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    console.error('Error PUT:', errorData);
    throw new Error(errorData.detail?.[0]?.msg || 'Error updating zone');
  }

  const result: ZoneResponse = await response.json();
  console.log('Zona actualizada:', result);
  return result;
};

/**
 * Elimina una zona
 */
export const deleteZone = async (
  brandId: string,
  campaignId: string,
  zoneId: string,
  zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>
): Promise<void> => {
  console.log('Eliminando zona:', { brandId, campaignId, zoneId });

  const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...zoneData,
      id: zoneId,
      brand_id: brandId,
      campaign_id: campaignId,
    }),
  });

  console.log('Respuesta DELETE:', response.status, response.statusText);

  if (response.status === 204) {
    console.log('Zona eliminada exitosamente');
    return;
  }

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    console.error('Error DELETE:', errorData);
    throw new Error(errorData.detail?.[0]?.msg || 'Error deleting zone');
  }
};

/**
 * Lee una campaña. Puedes pasar brandId y campaignId para el filtro
 * (si no te hace falta diferenciar, envía el mismo campaignId dos veces).
 */
export const getCampaign = async (
  campaignIdPath: string,     // el que va en la ruta /campaigns/:id
  brandId: string,
  campaignIdQuery?: string     // si no lo pasas, uso campaignIdPath
): Promise<ZoneResponse> => {
  console.log('Get Campaign:', { campaignIdPath, brandId, campaignIdQuery });

  const params = new URLSearchParams({
    include_zones: 'all',
    brand_id: String(brandId || ''),
    campaign_id: String(campaignIdQuery ?? (campaignIdPath || '')),
  });

  const url = `${API_BASE_URL}/campaigns/${encodeURIComponent(campaignIdPath)}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  console.log('Respuesta GET Campaign:', res.status, res.statusText);

  if (!res.ok) {
    let errorText = `HTTP ${res.status}`;
    try {
      const err: ApiError = await res.json();
      errorText = err.detail?.[0]?.msg || errorText;
      console.error('Error GET Campaign:', err);
    } catch {}
    throw new Error(errorText);
  }

  const result = (await res.json()) as ZoneResponse;
  console.log('Campaign Reading:', result);
  return result;
};

/* -------------------------------------------------
   OPCIONAL: factory para fijar brand/campaign una vez
   y recibir funciones ya “currificadas”
-------------------------------------------------- */
export const makeZonesApi = (brandId: string, campaignId: string) => ({
  createZone: (zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>) =>
    createZone(brandId, campaignId, zoneData),

  getZone: (zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>) =>
    getZone(brandId, campaignId, zoneData),

  updateZone: (zoneId: string, zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>) =>
    updateZone(brandId, campaignId, zoneId, zoneData),

  deleteZone: (zoneId: string, zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>) =>
    deleteZone(brandId, campaignId, zoneId, zoneData),

  getCampaign: (campaignIdPath: string, campaignIdQuery?: string) =>
    getCampaign(campaignIdPath, brandId, campaignIdQuery ?? campaignId),
});
