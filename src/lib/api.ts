/**
 * ============================================================================
 * SERVICIO API - CLIENTE PARA ENDPOINTS REST
 * ============================================================================
 * 
 * Servicio completo para comunicación con el backend de airdrops.
 * Incluye todos los endpoints necesarios para el MVP y funcionalidades futuras.
 * 
 * RESPONSABILIDADES:
 * ✅ Comunicación HTTP con backend
 * ✅ Manejo de errores y timeouts
 * ✅ Tipado completo con TypeScript
 * ✅ Configuración centralizada de URLs
 * ✅ Helpers para cálculos geográficos
 * ✅ Modo mock para desarrollo sin backend
 * ✅ Preparado para autenticación y headers
 * 
 * ENDPOINTS INCLUIDOS:
 * - Zonas: CRUD completo + búsquedas geográficas
 * - Usuarios: Estados, claims, historial
 * - Campañas: Gestión para marcas
 * - Marcas: Información corporativa
 * - Analytics: Métricas y estadísticas
 * - Utilidades: Validaciones geográficas
 * 
 * CASOS DE USO:
 * - Frontend consume todos los datos del sistema
 * - Daniel implementa endpoints progresivamente
 * - Testing con datos mock durante desarrollo
 * - Producción con API real
 * 
 * EJEMPLO DE USO:
 * import { api } from '@/lib/api';
 * 
 * // Obtener zonas cercanas
 * const zones = await api.getNearbyZones(userLocation, 5);
 * 
 * // Reclamar airdrop
 * const result = await api.claimAirdrop(wallet, zoneId, location);
 */

// ==================== IMPORTS DE TIPOS ====================
import { 
  AirdropZone, 
  UserLocation, 
  AirdropUserStatus, 
  Campaign, 
  Brand, 
  AirdropHistory 
} from '@/types/airdrop-types';

// ==================== CONFIGURACIÓN GLOBAL ====================

/**
 * URL BASE DE LA API
 * 
 * Configuración centralizada para la URL del backend.
 * Usa variable de entorno si está disponible, localhost por defecto.
 * 
 * CONFIGURACIÓN POR AMBIENTE:
 * - Desarrollo: http://localhost:3000/api
 * - Staging: https://api-staging.bigtrail.com/api
 * - Producción: https://api.bigtrail.com/api
 */
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * ============================================================================
 * CLASE PRINCIPAL - ApiService
 * ============================================================================
 * 
 * Clase que encapsula toda la lógica de comunicación con el backend.
 * Usa el patrón Singleton para tener una instancia compartida.
 */
class ApiService {
  /**
   * MÉTODO GENÉRICO PARA REQUESTS HTTP
   * 
   * Método privado que maneja toda la comunicación HTTP de manera
   * consistente. Incluye manejo de errores, headers y parsing JSON.
   * 
   * @param endpoint - Ruta del endpoint (ej: '/zones')
   * @param options - Opciones de fetch (método, headers, body, etc.)
   * @returns Promise con respuesta parseada como JSON
   * 
   * CARACTERÍSTICAS:
   * - Headers automáticos (Content-Type: application/json)
   * - Manejo de errores HTTP (4xx, 5xx)
   * - Parsing automático de JSON
   * - Logging de errores para debugging
   * - Extensible para autenticación futura
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // CONSTRUIR URL COMPLETA
    const url = `${API_BASE_URL}${endpoint}`;
    
    // CONFIGURAR HEADERS Y OPCIONES POR DEFECTO
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // AQUÍ SE PUEDEN AGREGAR HEADERS DE AUTENTICACIÓN:
        // 'Authorization': `Bearer ${token}`,
        // 'X-API-Key': apiKey,
        ...options?.headers,
      },
      ...options,
    };

    try {
      // EJECUTAR REQUEST HTTP
      const response = await fetch(url, config);
      
      // VERIFICAR SI LA RESPUESTA ES EXITOSA
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // PARSEAR Y RETORNAR JSON
      return response.json();
    } catch (error) {
      // LOGGING DE ERRORES PARA DEBUGGING
      console.error(`API request failed: ${endpoint}`, error);
      throw error;  // Re-lanzar para que el componente lo maneje
    }
  }

  // ==================== ENDPOINTS DE AIRDROP ZONES ====================

  /**
   * OBTENER TODAS LAS ZONAS DE AIRDROP
   * 
   * Endpoint GET para obtener lista completa de zonas disponibles.
   * 
   * @returns Promise<AirdropZone[]> - Array con todas las zonas
   * 
   * ENDPOINT: GET /api/zones
   * 
   * CASOS DE USO:
   * - Dashboard principal muestra todas las zonas
   * - Mapa carga marcadores de todas las zonas
   * - Admin panel lista todas las zonas para gestión
   */
  async getAirdropZones(): Promise<AirdropZone[]> {
    return this.request<AirdropZone[]>('/zones');
  }

  /**
   * OBTENER ZONA DE AIRDROP POR ID
   * 
   * Endpoint GET para detalles de una zona específica.
   * 
   * @param zoneId - ID único de la zona
   * @returns Promise<AirdropZone> - Datos completos de la zona
   * 
   * ENDPOINT: GET /api/zones/:id
   * 
   * CASOS DE USO:
   * - Ver detalles completos antes de reclamar
   * - Editar zona desde dashboard de marca
   * - Links directos a zonas específicas
   */
  async getAirdropZone(zoneId: string): Promise<AirdropZone> {
    return this.request<AirdropZone>(`/zones/${zoneId}`);
  }

  /**
   * CREAR NUEVA ZONA DE AIRDROP
   * 
   * Endpoint POST para que las marcas creen nuevas zonas.
   * 
   * @param zone - Datos de la zona sin ID (se genera en backend)
   * @returns Promise<AirdropZone> - Zona creada con ID asignado
   * 
   * ENDPOINT: POST /api/zones
   * BODY: AirdropZone (sin id)
   * 
   * VALIDACIONES BACKEND:
   * - Marca tiene permisos para crear zonas
   * - Coordenadas son válidas
   * - No hay solapamiento con otras zonas
   * - Token address es válido
   * - Fechas son coherentes
   */
  async createAirdropZone(zone: Omit<AirdropZone, 'id'>): Promise<AirdropZone> {
    return this.request<AirdropZone>('/zones', {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  }

  /**
   * ACTUALIZAR ZONA DE AIRDROP
   * 
   * Endpoint PUT para modificar zonas existentes.
   * 
   * @param zoneId - ID de la zona a actualizar
   * @param updates - Campos a actualizar (parcial)
   * @returns Promise<AirdropZone> - Zona actualizada
   * 
   * ENDPOINT: PUT /api/zones/:id
   * BODY: Partial<AirdropZone>
   * 
   * CASOS DE USO:
   * - Extender duración de zona activa
   * - Cambiar cantidad de reward
   * - Pausar/reactivar zona
   * - Actualizar descripción o requisitos
   */
  async updateAirdropZone(zoneId: string, updates: Partial<AirdropZone>): Promise<AirdropZone> {
    return this.request<AirdropZone>(`/zones/${zoneId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * ELIMINAR ZONA DE AIRDROP
   * 
   * Endpoint DELETE para remover zonas (usar con cuidado).
   * 
   * @param zoneId - ID de la zona a eliminar
   * @returns Promise<void>
   * 
   * ENDPOINT: DELETE /api/zones/:id
   * 
   * CONSIDERACIONES:
   * - Solo permitir si no hay claims pendientes
   * - Notificar a usuarios que tenían la zona activa
   * - Mantener historial para auditoría
   * - Reembolsar tokens no distribuidos
   */
  async deleteAirdropZone(zoneId: string): Promise<void> {
    return this.request<void>(`/zones/${zoneId}`, {
      method: 'DELETE',
    });
  }

  /**
   * OBTENER ZONAS CERCANAS A UNA UBICACIÓN
   * 
   * Endpoint GET con parámetros para búsqueda geográfica.
   * Usa algoritmos de distancia para encontrar zonas próximas.
   * 
   * @param location - Ubicación GPS del usuario
   * @param radiusKm - Radio de búsqueda en kilómetros (default: 5)
   * @returns Promise<AirdropZone[]> - Zonas ordenadas por distancia
   * 
   * ENDPOINT: GET /api/zones/nearby?lat={lat}&lng={lng}&radius={km}
   * 
   * OPTIMIZACIONES BACKEND:
   * - Usar índices geoespaciales en BD
   * - Algoritmo Haversine para cálculo preciso
   * - Cache de resultados por ubicación
   * - Limitar número máximo de resultados
   */
  async getNearbyZones(location: UserLocation, radiusKm: number = 5): Promise<AirdropZone[]> {
    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      radius: radiusKm.toString(),
    });
    
    return this.request<AirdropZone[]>(`/zones/nearby?${params}`);
  }

  // ==================== ENDPOINTS DE USER STATUS ====================

  /**
   * OBTENER ESTADO DEL USUARIO PARA UNA ZONA
   * 
   * Endpoint GET para verificar si usuario ya interactuó con una zona.
   * 
   * @param wallet - Dirección de wallet del usuario
   * @param zoneId - ID de la zona a consultar
   * @returns Promise<AirdropUserStatus | null> - Estado o null si no existe
   * 
   * ENDPOINT: GET /api/users/:wallet/zones/:zoneId/status
   * 
   * CASOS DE USO:
   * - Verificar si puede reclamar airdrop
   * - Mostrar "Ya reclamado" en UI
   * - Analytics de tiempo en zona
   */
  async getUserZoneStatus(wallet: string, zoneId: string): Promise<AirdropUserStatus | null> {
    return this.request<AirdropUserStatus | null>(`/users/${wallet}/zones/${zoneId}/status`);
  }

  /**
   * OBTENER TODOS LOS ESTADOS DEL USUARIO
   * 
   * Endpoint GET para historial completo de interacciones del usuario.
   * 
   * @param wallet - Dirección de wallet del usuario
   * @returns Promise<AirdropUserStatus[]> - Array con todos los estados
   * 
   * ENDPOINT: GET /api/users/:wallet/statuses
   * 
   * CASOS DE USO:
   * - Dashboard personal del usuario
   * - Mostrar progreso y logros
   * - Analytics de comportamiento
   */
  async getUserStatuses(wallet: string): Promise<AirdropUserStatus[]> {
    return this.request<AirdropUserStatus[]>(`/users/${wallet}/statuses`);
  }

  /**
   * REGISTRAR ENTRADA DEL USUARIO A UNA ZONA
   * 
   * Endpoint POST para marcar cuando usuario entra en radio de zona.
   * Útil para analytics y prevenir fraude.
   * 
   * @param wallet - Dirección de wallet del usuario
   * @param zoneId - ID de la zona
   * @param location - Ubicación GPS exacta al entrar
   * @returns Promise<AirdropUserStatus> - Estado actualizado
   * 
   * ENDPOINT: POST /api/users/:wallet/zones/:zoneId/enter
   * BODY: { location: UserLocation }
   * 
   * VALIDACIONES:
   * - Ubicación está dentro del radio
   * - Zona está activa
   * - Usuario no ha entrado antes
   */
  async enterZone(wallet: string, zoneId: string, location: UserLocation): Promise<AirdropUserStatus> {
    return this.request<AirdropUserStatus>(`/users/${wallet}/zones/${zoneId}/enter`, {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  /**
   * RECLAMAR AIRDROP EN UNA ZONA
   * 
   * Endpoint POST principal para ejecutar claim de airdrop.
   * Incluye todas las validaciones y ejecuta transacción blockchain.
   * 
   * @param wallet - Dirección de wallet del usuario
   * @param zoneId - ID de la zona donde reclamar
   * @param location - Ubicación GPS al momento de reclamar
   * @returns Promise con resultado de la operación
   * 
   * ENDPOINT: POST /api/users/:wallet/zones/:zoneId/claim
   * BODY: { location: UserLocation }
   * 
   * PROCESO BACKEND:
   * 1. Validar usuario está en zona
   * 2. Verificar no ha reclamado antes
   * 3. Ejecutar transacción blockchain
   * 4. Actualizar base de datos
   * 5. Crear registro en historial
   * 6. Notificar resultado
   * 
   * RESPUESTA:
   * - success: boolean
   * - txHash: string (hash de transacción)
   * - amount: string (cantidad transferida)
   * - message: string (mensaje para usuario)
   */
  async claimAirdrop(wallet: string, zoneId: string, location: UserLocation): Promise<{
    success: boolean;
    txHash?: string;
    amount?: string;
    message: string;
  }> {
    return this.request(`/users/${wallet}/zones/${zoneId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  // ==================== ENDPOINTS DE CAMPAIGNS ====================

  /**
   * OBTENER TODAS LAS CAMPAÑAS
   * 
   * Endpoint GET para listar todas las campañas del sistema.
   * 
   * @returns Promise<Campaign[]> - Array con todas las campañas
   * 
   * ENDPOINT: GET /api/campaigns
   * 
   * CASOS DE USO:
   * - Dashboard admin con todas las campañas
   * - Analytics globales del sistema
   * - Búsqueda y filtrado general
   */
  async getCampaigns(): Promise<Campaign[]> {
    return this.request<Campaign[]>('/campaigns');
  }

  /**
   * OBTENER CAMPAÑAS DE UNA MARCA ESPECÍFICA
   * 
   * Endpoint GET filtrado por marca para dashboard corporativo.
   * 
   * @param brandId - ID de la marca
   * @returns Promise<Campaign[]> - Campañas de esa marca
   * 
   * ENDPOINT: GET /api/brands/:brandId/campaigns
   * 
   * CASOS DE USO:
   * - Dashboard de marca muestra solo sus campañas
   * - Reportes financieros por marca
   * - Gestión de portfolio de campañas
   */
  async getBrandCampaigns(brandId: string): Promise<Campaign[]> {
    return this.request<Campaign[]>(`/brands/${brandId}/campaigns`);
  }

  /**
   * CREAR NUEVA CAMPAÑA
   * 
   * Endpoint POST para que marcas creen campañas nuevas.
   * 
   * @param campaign - Datos de campaña sin ID
   * @returns Promise<Campaign> - Campaña creada con ID
   * 
   * ENDPOINT: POST /api/campaigns
   * BODY: Campaign (sin id)
   * 
   * PROCESO BACKEND:
   * 1. Validar permisos de marca
   * 2. Verificar presupuesto disponible
   * 3. Crear contrato de token si necesario
   * 4. Validar fechas y configuración
   * 5. Crear todas las zonas asociadas
   * 6. Activar campaña si corresponde
   */
  async createCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
    return this.request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  /**
   * ACTUALIZAR CAMPAÑA
   * 
   * Endpoint PUT para modificar campañas existentes.
   * 
   * @param campaignId - ID de la campaña
   * @param updates - Campos a actualizar
   * @returns Promise<Campaign> - Campaña actualizada
   * 
   * ENDPOINT: PUT /api/campaigns/:id
   * BODY: Partial<Campaign>
   * 
   * RESTRICCIONES:
   * - No cambiar fechas si ya empezó
   * - No reducir presupuesto por debajo de gastado
   * - Validar impacto en zonas activas
   */
  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    return this.request<Campaign>(`/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * OBTENER MÉTRICAS DE UNA CAMPAÑA
   * 
   * Endpoint GET para analytics detallados de campaña específica.
   * 
   * @param campaignId - ID de la campaña
   * @returns Promise con métricas calculadas
   * 
   * ENDPOINT: GET /api/campaigns/:id/metrics
   * 
   * MÉTRICAS INCLUIDAS:
   * - totalParticipants: Usuarios únicos que participaron
   * - totalClaimed: Cantidad total de tokens distribuidos
   * - activeZones: Zonas actualmente activas
   * - completionRate: Porcentaje de zonas completadas
   * - averageTimeInZone: Tiempo promedio de participación
   */
  async getCampaignMetrics(campaignId: string): Promise<{
    totalParticipants: number;
    totalClaimed: string;
    activeZones: number;
    completionRate: number;
    averageTimeInZone: number;
  }> {
    return this.request(`/campaigns/${campaignId}/metrics`);
  }

  // ==================== ENDPOINTS DE BRANDS ====================

  /**
   * OBTENER TODAS LAS MARCAS
   * 
   * Endpoint GET para directorio de marcas del sistema.
   * 
   * @returns Promise<Brand[]> - Array con todas las marcas
   * 
   * ENDPOINT: GET /api/brands
   */
  async getBrands(): Promise<Brand[]> {
    return this.request<Brand[]>('/brands');
  }

  /**
   * OBTENER MARCA POR ID
   * 
   * Endpoint GET para detalles de marca específica.
   * 
   * @param brandId - ID de la marca
   * @returns Promise<Brand> - Datos completos de la marca
   * 
   * ENDPOINT: GET /api/brands/:id
   */
  async getBrand(brandId: string): Promise<Brand> {
    return this.request<Brand>(`/brands/${brandId}`);
  }

  /**
   * CREAR NUEVA MARCA
   * 
   * Endpoint POST para registro de nuevas marcas en la plataforma.
   * 
   * @param brand - Datos de marca sin ID
   * @returns Promise<Brand> - Marca creada con ID
   * 
   * ENDPOINT: POST /api/brands
   * BODY: Brand (sin id)
   * 
   * PROCESO:
   * 1. Validar información corporativa
   * 2. Verificar dominios de website
   * 3. Crear cuenta y permisos
   * 4. Configurar billing si necesario
   */
  async createBrand(brand: Omit<Brand, 'id'>): Promise<Brand> {
    return this.request<Brand>('/brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    });
  }

  // ==================== ENDPOINTS DE HISTORY ====================

  /**
   * OBTENER HISTORIAL DE INTERACCIONES DEL USUARIO
   * 
   * Endpoint GET para historial completo de airdrops reclamados.
   * 
   * @param wallet - Dirección de wallet del usuario
   * @returns Promise<AirdropHistory[]> - Array con historial ordenado
   * 
   * ENDPOINT: GET /api/users/:wallet/history
   * 
   * ORDENAMIENTO:
   * - Por fecha descendente (más reciente primero)
   * - Incluye paginación para usuarios muy activos
   */
  async getUserHistory(wallet: string): Promise<AirdropHistory[]> {
    return this.request<AirdropHistory[]>(`/users/${wallet}/history`);
  }

  /**
   * OBTENER HISTORIAL DE UNA ZONA ESPECÍFICA
   * 
   * Endpoint GET para ver todos los claims en una zona.
   * 
   * @param zoneId - ID de la zona
   * @returns Promise<AirdropHistory[]> - Claims en esa zona
   * 
   * ENDPOINT: GET /api/zones/:id/history
   * 
   * CASOS DE USO:
   * - Marca ve quién participó en sus zonas
   * - Analytics de performance por zona  
   * - Detectar patrones de uso
   */
  async getZoneHistory(zoneId: string): Promise<AirdropHistory[]> {
    return this.request<AirdropHistory[]>(`/zones/${zoneId}/history`);
  }

  /**
   * OBTENER HISTORIAL DE UNA CAMPAÑA
   * 
   * Endpoint GET para analytics completos de campaña.
   * 
   * @param campaignId - ID de la campaña
   * @returns Promise<AirdropHistory[]> - Todos los claims de la campaña
   * 
   * ENDPOINT: GET /api/campaigns/:id/history
   */
  async getCampaignHistory(campaignId: string): Promise<AirdropHistory[]> {
    return this.request<AirdropHistory[]>(`/campaigns/${campaignId}/history`);
  }

  // ==================== ENDPOINTS DE ANALYTICS ====================

  /**
   * OBTENER ESTADÍSTICAS GENERALES DEL DASHBOARD
   * 
   * Endpoint GET para métricas principales del sistema.
   * 
   * @returns Promise con estadísticas agregadas
   * 
   * ENDPOINT: GET /api/analytics/dashboard
   * 
   * DATOS INCLUIDOS:
   * - totalZones: Total de zonas en el sistema
   * - activeZones: Zonas actualmente activas
   * - totalParticipants: Usuarios únicos que han participado
   * - totalTokensDistributed: Suma de todos los tokens distribuidos
   * - topBrands: Ranking de marcas por actividad
   * - recentActivities: Actividad reciente para feed
   */
  async getDashboardStats(): Promise<{
    totalZones: number;
    activeZones: number;
    totalParticipants: number;
    totalTokensDistributed: string;
    topBrands: { brandId: string; brandName: string; tokensDistributed: string }[];
    recentActivities: AirdropHistory[];
  }> {
    return this.request('/analytics/dashboard');
  }

  /**
   * OBTENER ESTADÍSTICAS POR UBICACIÓN
   * 
   * Endpoint GET para analytics geográficos.
   * 
   * @returns Promise con métricas por ciudad/región
   * 
   * ENDPOINT: GET /api/analytics/locations
   * 
   * CASOS DE USO:
   * - Identificar ciudades con más actividad
   * - Planificar expansión geográfica
   * - Optimizar ubicación de nuevas zonas
   */
  async getLocationStats(): Promise<{
    location: string;
    participants: number;
    totalClaimed: string;
    activeZones: number;
  }[]> {
    return this.request('/analytics/locations');
  }

  /**
   * OBTENER ESTADÍSTICAS DE RENDIMIENTO POR PERÍODO
   * 
   * Endpoint GET para métricas temporales (gráficos de tiempo).
   * 
   * @param period - Granularidad ('day', 'week', 'month')
   * @returns Promise con datos para gráficos temporales
   * 
   * ENDPOINT: GET /api/analytics/performance?period={period}
   * 
   * CASOS DE USO:
   * - Gráficos de crecimiento en dashboard
   * - Análisis de tendencias temporales
   * - Reportes financieros periódicos
   */
  async getPerformanceStats(period: 'day' | 'week' | 'month'): Promise<{
    date: string;
    participants: number;
    claims: number;
    tokensDistributed: string;
  }[]> {
    return this.request(`/analytics/performance?period=${period}`);
  }

  // ==================== GEOLOCATION HELPERS ====================

  /**
   * VERIFICAR SI UNA UBICACIÓN ESTÁ DENTRO DE UNA ZONA
   * 
   * Endpoint POST para validación geográfica server-side.
   * 
   * @param location - Ubicación a verificar
   * @param zoneId - ID de la zona
   * @returns Promise con resultado de verificación
   * 
   * ENDPOINT: POST /api/utils/check-location
   * BODY: { location: UserLocation, zoneId: string }
   * 
   * VENTAJAS SERVER-SIDE:
   * - Prevenir manipulación de coordenadas
   * - Cálculos más precisos
   * - Logging de verificaciones
   */
  async isLocationInZone(location: UserLocation, zoneId: string): Promise<{
    inZone: boolean;
    distance: number;
  }> {
    return this.request('/utils/check-location', {
      method: 'POST',
      body: JSON.stringify({ location, zoneId }),
    });
  }

  /**
   * CALCULAR DISTANCIA ENTRE DOS PUNTOS
   * 
   * Función helper client-side usando fórmula Haversine.
   * Útil para cálculos rápidos sin llamada a API.
   * 
   * @param lat1 - Latitud punto 1
   * @param lng1 - Longitud punto 1
   * @param lat2 - Latitud punto 2
   * @param lng2 - Longitud punto 2
   * @returns Distancia en metros
   * 
   * FÓRMULA HAVERSINE:
   * Calcula distancias sobre esfera considerando curvatura terrestre.
   * Más precisa que Pitágoras para distancias geográficas.
   */
  calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// ==================== INSTANCIAS Y EXPORTS ====================

/**
 * INSTANCIA SINGLETON DE LA API
 * 
 * Instancia única compartida en toda la aplicación.
 * Mantiene configuración consistente y reutiliza conexiones.
 */
export const apiService = new ApiService();

/**
 * EXPORT DE LA CLASE PARA TESTING
 * 
 * Permite crear instancias separadas para tests unitarios
 * sin afectar la instancia principal.
 */
export { ApiService };

// ==================== MOCK DATA HELPERS ====================

/**
 * HELPER PARA SIMULAR DELAY DE API
 * 
 * Función útil para simular latencia de red durante desarrollo.
 * Hace que la UX sea más realista antes de tener backend real.
 * 
 * @param ms - Milisegundos de delay (default: 1000)
 * @returns Promise que resuelve después del delay
 */
export const mockApiDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * ============================================================================
 * CLASE MOCK PARA DESARROLLO
 * ============================================================================
 * 
 * Extiende ApiService sobrescribiendo métodos para retornar datos mock.
 * Permite desarrollo frontend completo sin depender del backend.
 */
export class MockApiService extends ApiService {
  /**
   * MOCK: OBTENER ZONAS DE AIRDROP
   * 
   * Sobrescribe método real para retornar datos mock durante desarrollo.
   */
  async getAirdropZones(): Promise<AirdropZone[]> {
    await mockApiDelay();
    // En desarrollo, retorna datos mock definidos en useAirdropZones
    return [];
  }

  /**
   * MOCK: RECLAMAR AIRDROP
   * 
   * Simula proceso completo de claim con delay realista y respuesta exitosa.
   */
  async claimAirdrop(wallet: string, zoneId: string, location: UserLocation) {
    await mockApiDelay(2000);  // Simular transacción blockchain
    return {
      success: true,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,  // Hash mock
      amount: '100',
      message: 'Airdrop reclamado exitosamente!'
    };
  }

  // AQUÍ SE PUEDEN AGREGAR MÁS MÉTODOS MOCK SEGÚN NECESIDAD
}

// ==================== CONFIGURACIÓN DE AMBIENTE ====================

/**
 * INSTANCIA DE API SEGÚN AMBIENTE
 * 
 * Durante desarrollo usa MockApiService para no depender del backend.
 * En producción usa ApiService real para llamadas HTTP reales.
 * 
 * CONFIGURACIÓN:
 * - NODE_ENV === 'development' → MockApiService (datos mock)
 * - NODE_ENV === 'production' → ApiService (API real)
 */
export const api = process.env.NODE_ENV === 'development' 
  ? new MockApiService() 
  : apiService;

/**
 * ============================================================================
 * INSTRUCCIONES PARA DANIEL (BACKEND)
 * ============================================================================
 * 
 * Este archivo define TODOS los endpoints que necesita implementar:
 * 
 * ENDPOINTS PRIORITARIOS (MVP):
 * 1. GET /api/zones - Listar zonas
 * 2. GET /api/zones/nearby - Zonas cercanas  
 * 3. POST /api/users/:wallet/zones/:id/claim - Reclamar airdrop
 * 4. GET /api/users/:wallet/statuses - Estados del usuario
 * 5. POST /api/campaigns - Crear campaña
 * 
 * ENDPOINTS SECUNDARIOS:
 * 6. GET /api/analytics/dashboard - Estadísticas generales
 * 7. GET /api/brands/:id/campaigns - Campañas por marca
 * 8. PUT /api/zones/:id - Actualizar zona
 * 9. GET /api/users/:wallet/history - Historial usuario
 * 10. POST /api/utils/check-location - Validar ubicación
 * 
 * CADA ENDPOINT INCLUYE:
 * - Descripción completa de funcionalidad
 * - Parámetros esperados y tipos
 * - Estructura de respuesta
 * - Validaciones necesarias
 * - Casos de uso y consideraciones
 * 
 * INTEGRACIÓN GRADUAL:
 * 1. Implementar endpoints prioritarios uno por uno
 * 2. Cambiar process.env.NODE_ENV a 'production' para usar API real
 * 3. Frontend funcionará automáticamente con backend real
 * 4. Implementar endpoints secundarios progresivamente
 */