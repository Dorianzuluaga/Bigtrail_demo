const API_BASE_URL = 'https://bigtrailmagazine.es/api';
const BRAND_ID = 'aedfeb8c-8a54-4b99-96b3-ac388a8156ac';
const CAMPAIGN_ID = '558fb0f4-a253-4184-a131-74f007a0e894';

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

export const createZone = async (zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>): Promise<ZoneResponse> => {
  console.log('Creando zona:', zoneData);
  
  const response = await fetch(`${API_BASE_URL}/zones/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...zoneData,
      brand_id: BRAND_ID,
      campaign_id: CAMPAIGN_ID,
    }),
  });

  console.log('Respuesta POST:', response.status, response.statusText);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    console.error('Error POST:', errorData);
    throw new Error(errorData.detail?.[0]?.msg || 'Error creating zone');
  }

  const result = await response.json();
  console.log('Zona creada:', result);
  return result;
};

export const getZone = async (zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>): Promise<ZoneResponse> => {
  console.log('Get zona:', zoneData);
  
  const response = await fetch(`${API_BASE_URL}/zones/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...zoneData,
      brand_id: BRAND_ID,
      campaign_id: CAMPAIGN_ID,
    }),
  });

  console.log('Respuesta GET:', response.status, response.statusText);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    console.error('Error GET:', errorData);
    throw new Error(errorData.detail?.[0]?.msg || 'Error Reading zone');
  }

  const result = await response.json();
  console.log('Zona Reading:', result);
  return result;
};


export const updateZone = async (zoneId: string, zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>): Promise<ZoneResponse> => {
  console.log('Actualizando zona:', zoneId, zoneData);
  
  const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...zoneData,
      brand_id: BRAND_ID,
      campaign_id: CAMPAIGN_ID,
    }),
  });

  console.log('Respuesta PUT:', response.status, response.statusText);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    console.error('Error PUT:', errorData);
    throw new Error(errorData.detail?.[0]?.msg || 'Error updating zone');
  }

  const result = await response.json();
  console.log('Zona actualizada:', result);
  return result;
};

export const deleteZone = async (zoneId: string, zoneData: Omit<ZoneData, 'brand_id' | 'campaign_id'>): Promise<void> => {
  console.log('Eliminando zona:', zoneId);
  
  const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      ...zoneData,
      id: zoneId,
      brand_id: BRAND_ID,
      campaign_id: CAMPAIGN_ID,
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

export const getCampaign = async (campaignId: string): Promise<ZoneResponse> => {
  console.log('Get Campaign:', campaignId);

  const params = new URLSearchParams({
    include_zones: 'all',
    brand_id: String(BRAND_ID || ''),
    campaign_id: String(CAMPAIGN_ID || ''),
  });

  const url = `${API_BASE_URL}/campaigns/${encodeURIComponent(campaignId)}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' }, // nada de Content-Type en GET
    // credentials: 'include', // si necesitas cookies
  });

  console.log('Respuesta GET Campaign:', res.status, res.statusText);

  if (!res.ok) {
    let errorText = `HTTP ${res.status}`;
    try {
      const err: ApiError = await res.json();
      errorText = err.detail?.[0]?.msg || errorText;
      console.error('Error GET Campaign:', err);
    } catch (_) {}
    throw new Error(errorText);
  }

  const result = (await res.json()) as ZoneResponse;
  console.log('Campaign Reading:', result);
  return result;
};
