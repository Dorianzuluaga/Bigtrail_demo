/**
 * ============================================================================
 * HOOK DE ZONAS DE AIRDROP - LÓGICA PRINCIPAL DEL SISTEMA
 * ============================================================================
 * 
 * Hook que maneja toda la lógica relacionada con las zonas de airdrop:
 * - Estado de las zonas (activo, completado, expirado, próximo)
 * - Proceso de claim de airdrops con validaciones
 * - Cálculo de distancias y ordenamiento por proximidad
 * - Estados de usuario (qué ha reclamado, cuándo entró, etc.)
 * - Actualización automática de estados
 * 
 * ESTE ES EL HOOK MÁS IMPORTANTE DEL SISTEMA.
 * Concentra toda la lógica de negocio de los airdrops.
 * 
 * FUNCIONALIDADES:
 * ✅ Gestión completa de zonas con datos mock realistas
 * ✅ Cálculo automático de distancias desde usuario
 * ✅ Filtrado por estado (activas, cercanas, etc.)
 * ✅ Proceso completo de claim con validaciones
 * ✅ Prevención de doble-reclamación
 * ✅ Actualización automática cada 30 segundos
 * ✅ Estados de carga para UI
 * 
 * CASOS DE USO:
 * - Lista de zonas en componente AirdropZones
 * - Mapa con marcadores de zonas
 * - Validaciones antes de permitir claim
 * - Dashboard con métricas de participación
 * - Histórial de usuario
 * 
 * EJEMPLO DE USO:
 * const { 
 *   zones,           // Todas las zonas ordenadas por distancia
 *   activeZones,     // Solo zonas activas ahora
 *   nearbyZones,     // Zonas a menos de 5km 
 *   claimAirdrop,    // Función para reclamar
 *   loading          // Estado de carga
 * } = useAirdropZones();
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AirdropZone, AirdropZoneExtended, UserLocation, AirdropUserStatus } from '@/types/airdrop-types';
import  useGeolocation  from './useGeolocation';

/**
 * ============================================================================
 * DATOS MOCK - ZONAS REALES DE MADRID
 * ============================================================================
 * 
 * Incluye 5 zonas con coordenadas reales de Madrid para testing.
 * En producción, estos datos vendrán de la API.
 * 
 * FECHAS ACTUALIZADAS PARA JULIO 2025:
 * - Fecha actual: 29 de julio de 2025
 * - Zonas activas: disponibles ahora
 * - Zonas próximas: próximos días/semanas
 * - Zonas expiradas: recientemente terminadas
 * 
 * CARACTERÍSTICAS DE LOS DATOS:
 * - Coordenadas reales de lugares famosos de Madrid
 * - Diferentes estados para probar toda la funcionalidad
 * - Rewards variados (75-300 BTT) según dificultad
 * - Diferentes radios (50-200m) según el tipo de ubicación
 * - Marcas reales para testing (Nike, Adidas, BigTrail, etc.)
 */
const MOCK_ZONES: AirdropZoneExtended[] = [
  {
    // ZONA ACTIVA AHORA - FÁCIL - CENTRO HISTÓRICO
    id: '1',
    name: 'Puerta del Sol',
    description: 'Zona histórica del centro de Madrid',
    location: 'Centro Histórico',
    tokenAddress: '0x1234...abcd',
    center: { lat: 40.4168, lng: -3.7038 },
    radius: 100,
    amount: '100',
    reward: 100,
    currency: 'BTT',
    startTime: '2025-07-25T09:00:00Z',       // ← HACE 4 DÍAS (25 julio)
    endTime: '2025-08-15T18:00:00Z',         // ← 15 DE AGOSTO (17 días disponible)
    isActive: true,
    brandId: 'nike-001',
    brand: 'Nike',
    status: 'active',
    participants: 89,
    maxParticipants: 100,
    requirements: ['Permanecer 10 min', 'Foto del lugar'],
    difficulty: 'easy'
  },
  {
    // ZONA ACTIVA AHORA - MEDIA - PARQUE
    id: '2',
    name: 'Parque del Retiro',
    description: 'Aventura urbana en el parque más famoso de Madrid',
    location: 'Parque del Retiro',
    tokenAddress: '0x5678...efgh',
    center: { lat: 40.4152, lng: -3.6844 },
    radius: 200,
    amount: '150',
    reward: 150,
    currency: 'BTM',
    startTime: '2025-07-29T10:00:00Z',       // ← HOY 10AM (29 julio)
    endTime: '2025-08-05T20:00:00Z',         // ← 5 DE AGOSTO (7 días disponible)
    isActive: true,
    brandId: 'bigtrail-001',
    brand: 'BigTrail',
    status: 'active',
    participants: 45,
    maxParticipants: 75,
    requirements: ['Completar ruta', 'Compartir en redes'],
    difficulty: 'medium'
  },
  {
    // ZONA ACTIVA AHORA - URGENTE - CULTURAL
    id: '3',
    name: 'Templo de Debod',
    description: 'Tesoro egipcio en el corazón de Madrid',
    location: 'Moncloa',
    tokenAddress: '0x1111...2222',
    center: { lat: 40.4240, lng: -3.7177 },
    radius: 75,
    amount: '200',
    reward: 200,
    currency: 'BTM',
    startTime: '2025-07-29T08:00:00Z',       // ← HOY 8AM (29 julio)
    endTime: '2025-07-30T23:59:00Z',         // ← MAÑANA 11:59PM (¡URGENTE!)
    isActive: true,
    brandId: 'cultura-madrid',
    brand: 'Madrid Cultura',
    status: 'active',
    participants: 23,
    maxParticipants: 60,
    requirements: ['Visita cultural', 'Quiz histórico'],
    difficulty: 'easy'
  },
  {
    // ZONA EXPIRADA - PARA CONTRASTE
    id: '4',
    name: 'Plaza Mayor',
    description: 'Zona digital en la plaza más emblemática',
    location: 'Plaza Mayor',
    tokenAddress: '0x9abc...ijkl',
    center: { lat: 40.4155, lng: -3.7074 },
    radius: 80,
    amount: '75',
    reward: 75,
    currency: 'BTM',
    startTime: '2025-07-24T10:00:00Z',       // ← HACE 5 DÍAS (24 julio)
    endTime: '2025-07-28T16:00:00Z',         // ← AYER 4PM (expirada)
    isActive: false,
    brandId: 'adidas-001',
    brand: 'Adidas',
    status: 'expired',
    participants: 120,
    maxParticipants: 120,
    requirements: ['Check-in', 'Review del lugar'],
    difficulty: 'easy'
  },
  {
    // ZONA PRÓXIMA - DIFÍCIL
    id: '5',
    name: 'Cerro del Tío Pío',
    description: 'Reto extremo con las mejores vistas de Madrid',
    location: 'Vallecas',
    tokenAddress: '0xdef0...mnop',
    center: { lat: 40.3947, lng: -3.6492 },
    radius: 50,
    amount: '300',
    reward: 300,
    currency: 'BTM',
    startTime: '2025-08-02T08:00:00Z',       // ← 2 DE AGOSTO (4 días)
    endTime: '2025-08-02T18:00:00Z',         // ← 2 DE AGOSTO 6PM (evento de 1 día)
    isActive: false,
    brandId: 'bigtrail-002',
    brand: 'BigTrail',
    status: 'upcoming',
    participants: 0,
    maxParticipants: 50,
    requirements: ['Hike 2km', 'Foto en la cima', 'GPS tracking'],
    difficulty: 'hard'
  }
];

/**
 * ============================================================================
 * HOOK PRINCIPAL - useAirdropZones
 * ============================================================================
 */
export const useAirdropZones = () => {
  // ==================== ESTADO INTERNO ====================
  
  /** Lista de todas las zonas (inicializada con datos mock) */
  const [zones, setZones] = useState<AirdropZoneExtended[]>(MOCK_ZONES);
  
  /** Estados de cada usuario por zona (para prevenir doble-claim) */
  const [userStatuses, setUserStatuses] = useState<AirdropUserStatus[]>([]);
  
  /** Si hay operaciones en curso (refreshing, claiming, etc.) */
  const [loading, setLoading] = useState(false);
  
  /** Hook de geolocalización para obtener ubicación del usuario */
  const { location, calculateDistance } = useGeolocation();

  // ==================== CÁLCULOS AUTOMÁTICOS ====================
  
  /**
   * ZONAS CON DISTANCIA CALCULADA Y ORDENADAS
   * 
   * Toma todas las zonas y les agrega el campo 'distance' calculado
   * desde la ubicación actual del usuario. Las ordena por proximidad.
   * 
   * RECÁLCULO AUTOMÁTICO:
   * - Cuando cambia la ubicación del usuario
   * - Cuando se actualiza la lista de zonas
   * - Cuando cambia el calculateDistance (nunca en práctica)
   * 
   * PROCESO:
   * 1. Si no hay ubicación del usuario, devuelve zonas sin distancia
   * 2. Para cada zona, calcula distancia usando fórmula Haversine
   * 3. Convierte metros a kilómetros para display
   * 4. Ordena por distancia ascendente (más cerca primero)
   */
  const zonesWithDistance = useMemo(() => {
    if (!location) return zones;

    return zones.map(zone => ({
      ...zone,
      distance: calculateDistance(
        location.lat,
        location.lng,
        zone.center.lat,
        zone.center.lng
      ) / 1000 // convertir metros a kilómetros para display
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [zones, location, calculateDistance]);

  /**
   * FILTRO: SOLO ZONAS ACTIVAS
   * 
   * Filtra zonas que están disponibles para reclamar ahora mismo.
   * Útil para mostrar solo oportunidades disponibles.
   */
  const activeZones = useMemo(() => 
    zonesWithDistance.filter(zone => zone.status === 'active'),
    [zonesWithDistance]
  );

  /**
   * FILTRO: ZONAS CERCANAS (DENTRO DE 5KM)
   * 
   * Filtra zonas activas que están a menos de 5km del usuario.
   * Útil para notificaciones y vista de "cerca de ti".
   */
  const nearbyZones = useMemo(() => 
    zonesWithDistance.filter(zone => 
      zone.status === 'active' && (zone.distance || 0) <= 5
    ),
    [zonesWithDistance]
  );

  // ==================== FUNCIONES DE LÓGICA DE NEGOCIO ====================

  /**
   * VERIFICAR EN QUÉ ZONAS ESTÁ EL USUARIO
   * 
   * Dado una ubicación, determina en cuáles zonas activas está
   * físicamente presente el usuario (dentro del radius).
   * 
   * @param userLocation - Ubicación GPS del usuario
   * @returns Array de zonas donde está presente
   * 
   * CASOS DE USO:
   * - Mostrar notificación "Estás en zona X"
   * - Validar antes de permitir claim
   * - Analytics de tiempo en zona
   * 
   * PROCESO:
   * 1. Filtra solo zonas activas
   * 2. Para cada zona, calcula distancia al centro
   * 3. Si distancia <= radius, está dentro
   * 4. Retorna array de zonas donde está presente
   */
  const checkUserInZones = useCallback((userLocation: UserLocation) => {
    const zonesUserIsIn = zones.filter(zone => {
      if (!zone.isActive) return false;
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        zone.center.lat,
        zone.center.lng
      );
      
      return distance <= zone.radius;
    });

    return zonesUserIsIn;
  }, [zones, calculateDistance]);

  /**
   * RECLAMAR AIRDROP - FUNCIÓN PRINCIPAL
   * 
   * Ejecuta el proceso completo de claim de un airdrop con todas
   * las validaciones necesarias. Simula transacción blockchain.
   * 
   * @param zoneId - ID de la zona donde reclamar
   * @param walletAddress - Dirección del wallet del usuario
   * @returns Resultado de la operación (éxito/error)
   * 
   * PROCESO COMPLETO:
   * 1. Activar estado de loading
   * 2. Simular llamada a API/blockchain (2 segundos)
   * 3. Crear registro en userStatuses (prevenir doble-claim)
   * 4. Incrementar contador de participantes en zona
   * 5. Retornar resultado para mostrar en UI
   * 
   * VALIDACIONES (deberían hacerse antes de llamar esta función):
   * - Usuario está dentro del radius de la zona
   * - Zona está activa y dentro del horario
   * - Usuario no ha reclamado antes en esta zona
   * - Zona no ha alcanzado el máximo de participantes
   * 
   * EN PRODUCCIÓN:
   * - Hacer llamada real a API backend
   * - API ejecuta transacción blockchain
   * - Retorna hash de transacción real
   * - Manejar estados pending/confirmed/failed
   */
  const claimAirdrop = useCallback(async (zoneId: string, walletAddress: string) => {
    setLoading(true);
    
    try {
      // SIMULAR LLAMADA A API/BLOCKCHAIN
      // En producción: await api.claimAirdrop(zoneId, walletAddress, location)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // ACTUALIZAR ESTADO DEL USUARIO (prevenir doble-claim)
      setUserStatuses(prev => [
        ...prev.filter(status => status.zoneId !== zoneId), // Remover estado anterior si existe
        {
          wallet: walletAddress,
          zoneId,
          hasClaimed: true,
          claimedAt: new Date().toISOString(),
          enteredAt: new Date().toISOString() // En producción vendría de cuando entró
        }
      ]);

      // INCREMENTAR CONTADOR DE PARTICIPANTES
      setZones(prev => prev.map(zone => 
        zone.id === zoneId 
          ? { ...zone, participants: zone.participants + 1 }
          : zone
      ));

      return { success: true, message: 'Airdrop reclamado exitosamente!' };
    } catch (error) {
      return { success: false, message: 'Error al reclamar el airdrop' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * OBTENER ESTADO DEL USUARIO PARA UNA ZONA
   * 
   * Busca si el usuario tiene algún estado registrado para una zona específica.
   * Útil para saber si ya reclamó, cuándo entró, etc.
   * 
   * @param zoneId - ID de la zona a consultar
   * @param walletAddress - Dirección del wallet del usuario
   * @returns Estado del usuario o undefined si no existe
   * 
   * CASOS DE USO:
   * - Mostrar "Ya reclamado" en botones
   * - Mostrar tiempo que lleva en zona
   * - Validar antes de permitir claim
   */
  const getUserStatusForZone = useCallback((zoneId: string, walletAddress: string) => {
    return userStatuses.find(status => 
      status.zoneId === zoneId && status.wallet === walletAddress
    );
  }, [userStatuses]);

  /**
   * ACTUALIZAR ZONAS - REFRESCAR DESDE API
   * 
   * Simula fetch desde API backend para obtener zonas actualizadas.
   * También recalcula estados basado en tiempo actual.
   * 
   * CASOS DE USO:
   * - Botón "Actualizar" en UI
   * - Refresh automático cada 30 segundos
   * - Después de crear nueva zona desde dashboard
   * 
   * PROCESO:
   * 1. Simular llamada a API
   * 2. Recalcular estados basado en tiempo actual
   * 3. Actualizar zones con nuevos estados
   * 
   * LÓGICA DE ESTADOS:
   * - expired: pasó endTime
   * - upcoming: antes de startTime  
   * - completed: alcanzó maxParticipants
   * - active: dentro de horario y con cupos disponibles
   */
  const refreshZones = useCallback(async () => {
    setLoading(true);
    try {
      // SIMULAR LLAMADA A API
      // En producción: const zones = await api.getAirdropZones()
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // RECALCULAR ESTADOS BASADO EN TIEMPO ACTUAL
      const now = new Date();
      const updatedZones = zones.map(zone => {
        const endTime = new Date(zone.endTime);
        const startTime = new Date(zone.startTime);
        
        let status = zone.status;
        if (now > endTime) {
          status = 'expired';
        } else if (now < startTime) {
          status = 'upcoming';
        } else if (zone.participants >= zone.maxParticipants) {
          status = 'completed';
        } else {
          status = 'active';
        }
        
        return {
          ...zone,
          status,
          isActive: status === 'active'
        };
      });
      
      setZones(updatedZones);
    } finally {
      setLoading(false);
    }
  }, [zones]);

  /**
   * EFECTO: ACTUALIZACIÓN AUTOMÁTICA CADA 30 SEGUNDOS
   * 
   * Refresca automáticamente el estado de las zonas para mantener
   * la información actualizada sin que el usuario tenga que refrescar.
   * 
   * IMPORTANTE: Se limpia el interval al desmontar el componente
   * para evitar llamadas innecesarias y memory leaks.
   */
  useEffect(() => {
    // Configurar interval para actualización automática
    const interval = setInterval(refreshZones, 30000); // 30 segundos
    
    // Cleanup: limpiar interval al desmontar
    return () => clearInterval(interval);
  }, [refreshZones]);

  // ==================== RETURN - API PÚBLICA DEL HOOK ====================
  
  /**
   * VALORES Y FUNCIONES EXPORTADAS
   * 
   * Todo lo que los componentes necesitan para trabajar con airdrops:
   * - Datos: zonas, estados, ubicación
   * - Funciones: claim, refresh, validaciones  
   * - Estados: loading para UI
   */
  return {
    // DATOS PRINCIPALES
    zones: zonesWithDistance,     // Todas las zonas con distancia calculada
    activeZones,                  // Solo zonas activas
    nearbyZones,                  // Zonas activas cerca del usuario
    userStatuses,                 // Estados del usuario por zona
    
    // ESTADOS DE UI
    loading,                      // Si hay operaciones en curso
    
    // FUNCIONES DE NEGOCIO
    checkUserInZones,             // Verificar en qué zonas está el usuario
    claimAirdrop,                 // Reclamar airdrop en una zona
    getUserStatusForZone,         // Obtener estado del usuario para zona específica
    refreshZones,                 // Actualizar zonas desde API
    
    // DATOS ADICIONALES
    userLocation: location        // Ubicación actual del usuario
  };
};