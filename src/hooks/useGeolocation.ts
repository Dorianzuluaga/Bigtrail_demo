/**
 * ============================================================================
 * HOOK DE GEOLOCALIZACIÓN
 * ============================================================================
 * 
 * Hook personalizado para manejar la ubicación GPS del usuario de manera
 * robusta y optimizada. Incluye manejo de errores, cálculos de distancia
 * y validación de zonas.
 * 
 * FUNCIONALIDADES:
 * - Obtener ubicación GPS del navegador
 * - Manejar errores de permisos y timeout
 * - Calcular distancias entre puntos usando fórmula Haversine
 * - Verificar si usuario está dentro de una zona
 * - Estados de carga y error para UI
 * 
 * CASOS DE USO:
 * - Verificar que usuario esté en zona antes de permitir claim
 * - Mostrar zonas ordenadas por distancia
 * - Validar ubicación para prevenir fraud
 * - Mostrar ubicación del usuario en mapa
 * 
 * EJEMPLO DE USO:
 * const { location, error,loading, updateLocation, isUserInZone } = useGeolocation();
 * 
 * // Verificar si usuario puede reclamar en zona
 * if (location && isUserInZone(location, zone.center, zone.radius)) {
 *   // Permitir claim
 * }
 */

import { useState, useEffect, useCallback } from 'react';
import { UserLocation } from '@/types/airdrop-types';

/**
 * ESTADO INTERNO DEL HOOK
 * 
 * Contiene toda la información relacionada con la geolocalización:
 * - location: Ubicación actual del usuario (null si no disponible)
 * - error: Mensaje de error si falló la geolocalización
 * - loading: Si está en proceso de obtener ubicación
 */
interface GeolocationState {
  /** Ubicación actual del usuario (null si no se ha obtenido o falló) */
  location: UserLocation | null;
  
  /** Mensaje de error legible para mostrar al usuario */
  error: string | null;
  
  /** Si está actualmente obteniendo la ubicación */
  loading: boolean;
}

/**
 * HOOK PRINCIPAL DE GEOLOCALIZACIÓN
 * 
 * Maneja todo lo relacionado con la ubicación del usuario de manera
 * automática y proporciona funciones auxiliares para cálculos.
 */
 const useGeolocation = () => {
  // Estado interno del hook
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
  });

  /**
   * FUNCIÓN PARA ACTUALIZAR UBICACIÓN
   * 
   * Solicita una nueva ubicación al navegador. Se puede llamar manualmente
   * para refrescar la ubicación o automáticamente al cargar el componente.
   * 
   * PROCESO:
   * 1. Verifica que el navegador soporte geolocalización
   * 2. Solicita permisos y ubicación al usuario
   * 3. Actualiza el estado con la nueva ubicación o error
   * 
   * CONFIGURACIÓN GPS:
   * - enableHighAccuracy: true = usar GPS de alta precisión
   * - timeout: 10000ms = máximo 10 segundos para obtener ubicación  
   * - maximumAge: 300000ms = usar ubicación cached de máximo 5 minutos
   */
  const updateLocation = useCallback(() => {
    // Verificar soporte del navegador
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalización no soportada por este navegador',
        loading: false,
      }));
      return;
    }

    // Iniciar proceso de obtención de ubicación
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Solicitar ubicación al navegador
    navigator.geolocation.getCurrentPosition(
      // ÉXITO: Se obtuvo la ubicación
      (position) => {
        const newLocation: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(), // Timestamp actual en milisegundos
        };
        
        setState({
          location: newLocation,
          error: null,
          loading: false,
        });
      },
      // ERROR: Falló la geolocalización
      (error) => {
        let errorMessage = 'Error desconocido';
        
        // Traducir códigos de error nativos a mensajes legibles
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Acceso a la ubicación denegado por el usuario';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación';
            break;
        }
        
        setState({
          location: null,
          error: errorMessage,
          loading: false,
        });
      },
      // OPCIONES DE CONFIGURACIÓN
      {
        enableHighAccuracy: true,    // Usar GPS de alta precisión
        timeout: 10000,              // Timeout de 10 segundos
        maximumAge: 300000,          // Ubicación cached válida por 5 minutos
      }
    );
  }, []);

  /**
   * CÁLCULO DE DISTANCIA USANDO FÓRMULA HAVERSINE
   * 
   * Calcula la distancia en metros entre dos puntos en la Tierra
   * teniendo en cuenta la curvatura del planeta.
   * 
   * PARÁMETROS:
   * @param lat1 - Latitud del primer punto
   * @param lng1 - Longitud del primer punto  
   * @param lat2 - Latitud del segundo punto
   * @param lng2 - Longitud del segundo punto
   * @returns Distancia en metros
   * 
   * FÓRMULA HAVERSINE:
   * Más precisa que Pitágoras para distancias geográficas.
   * Tiene en cuenta que la Tierra es una esfera.
   * 
   * EJEMPLO:
   * const distance = calculateDistance(40.4168, -3.7038, 40.4152, -3.6844);
   * // Retorna: 1542.8 (metros entre Puerta del Sol y Retiro)
   */
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371000; // Radio de la Tierra en metros
    
    // Convertir diferencias de coordenadas a radianes
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    // Aplicar fórmula Haversine
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    // Distancia final en metros
    return R * c;
  }, []);

  /**
   * VERIFICAR SI USUARIO ESTÁ DENTRO DE UNA ZONA
   * 
   * Determina si la ubicación del usuario está dentro del radio
   * de una zona de airdrop específica.
   * 
   * PARÁMETROS:
   * @param userLocation - Ubicación actual del usuario
   * @param zoneCenter - Centro de la zona de airdrop
   * @param zoneRadius - Radio de la zona en metros
   * @returns true si está dentro, false si está fuera
   * 
   * LÓGICA:
   * 1. Calcula distancia entre usuario y centro de zona
   * 2. Compara distancia con el radio de la zona
   * 3. Si distancia <= radio, está dentro
   * 
   * EJEMPLO:
   * const inZone = isUserInZone(
   *   { lat: 40.4168, lng: -3.7038, timestamp: Date.now() },
   *   { lat: 40.4170, lng: -3.7040 },
   *   100  // Radio de 100 metros
   * );
   * // Retorna: true (usuario está a ~22 metros del centro)
   */
  const isUserInZone = useCallback((
    userLocation: UserLocation,
    zoneCenter: { lat: number; lng: number },
    zoneRadius: number
  ): boolean => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      zoneCenter.lat,
      zoneCenter.lng
    );
    return distance <= zoneRadius;
  }, [calculateDistance]);

  /**
   * EFECTO PARA OBTENER UBICACIÓN AL MONTAR COMPONENTE
   * 
   * Automáticamente solicita la ubicación cuando se usa el hook
   * por primera vez. Esto mejora la UX ya que el usuario no tiene
   * que hacer click en "obtener ubicación".
   */
  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  // Retornar todas las funciones y estado para uso en componentes
  return {
    ...state,                // location, error, loading
    updateLocation,          // Función para refrescar ubicación
    calculateDistance,       // Función para calcular distancias
    isUserInZone,           // Función para verificar si está en zona
  };
};

export default useGeolocation;