/**
 * ============================================================================
 * COMPONENTE AIRDROP ZONES - LISTA PRINCIPAL DE ZONAS
 * ============================================================================
 * 
 * Componente React que muestra todas las zonas de airdrop disponibles en
 * formato de cards. Incluye funcionalidad completa de claim, filtrado
 * por estado, cálculo de distancias y validaciones.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * ✅ Lista todas las zonas ordenadas por distancia del usuario
 * ✅ Cards interactivos con información completa de cada zona
 * ✅ Proceso completo de claim con validaciones
 * ✅ Estados visuales (activo, completado, expirado, próximo)
 * ✅ Indicadores de distancia y ubicación
 * ✅ Progress bars para participantes
 * ✅ Botones de acción contextuales
 * ✅ Manejo de errores y loading states
 * ✅ Estadísticas rápidas en la parte superior
 * 
 * CASOS DE USO:
 * - Usuario ve todas las zonas disponibles
 * - Usuario reclama airdrops en zonas cercanas
 * - Usuario ve su progreso y historial
 * - Dashboard principal de la aplicación
 * 
 * DEPENDENCIAS:
 * - useAirdropZones: Hook principal con lógica de negocio
 * - useGeolocation: Hook para ubicación del usuario
 * - shadcn/ui: Componentes de UI (Card, Button, Badge, etc.)
 * - lucide-react: Iconos
 * 
 * EJEMPLO DE USO:
 * <AirdropZones />  // Se renderiza en Dashboard como tab "Zonas"
 */

import React, { useState } from 'react';

// ==================== IMPORTS DE UI COMPONENTS ====================
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

// ==================== IMPORTS DE ICONOS ====================
import { 
  MapPin,         // Icono de ubicación
  Clock,          // Icono de tiempo
  Coins,          // Icono de monedas/rewards
  Users,          // Icono de usuarios/participantes
  Target,         // Icono de objetivos/requisitos
  Calendar,       // Icono de calendario
  Navigation,     // Icono de navegación
  Trophy,         // Icono de logros/dificultad
  Loader2,        // Icono de loading animado
  CheckCircle,    // Icono de completado
  AlertCircle     // Icono de alerta/error
} from 'lucide-react';

// ==================== IMPORTS DE HOOKS Y TIPOS ====================
import { useAirdropZones } from '@/hooks/useAirdropZones';
import  useGeolocation  from '@/hooks/useGeolocation';
import { ZoneStatus, ZoneDifficulty } from '@/types/airdrop-types';

/**
 * ============================================================================
 * COMPONENTE PRINCIPAL - AirdropZones
 * ============================================================================
 */
const AirdropZones = () => {
  // ==================== HOOKS Y ESTADO ====================
  
  /**
   * HOOK PRINCIPAL DE ZONAS DE AIRDROP
   * 
   * Proporciona toda la lógica relacionada con las zonas:
   * - zones: Lista completa con distancias calculadas
   * - activeZones: Solo zonas activas ahora
   * - nearbyZones: Zonas cercanas (< 5km)
   * - loading: Estado de operaciones async
   * - claimAirdrop: Función para reclamar rewards
   * - getUserStatusForZone: Verificar si ya reclamó
   * - refreshZones: Actualizar datos desde API
   */
  const { 
    zones, 
    activeZones, 
    nearbyZones, 
    loading, 
    claimAirdrop, 
    getUserStatusForZone, 
    refreshZones 
  } = useAirdropZones();
  
  /**
   * HOOK DE GEOLOCALIZACIÓN
   * 
   * Maneja la ubicación GPS del usuario:
   * - location: Coordenadas actuales del usuario
   * - updateLocation: Función para refrescar ubicación
   * - loading: Si está obteniendo ubicación
   * - error: Errores de geolocalización (permisos, etc.)
   */
  const { 
    location, 
    updateLocation, 
    loading: locationLoading, 
    error: locationError 
  } = useGeolocation();
  
  /**
   * ESTADO LOCAL DEL COMPONENTE
   * 
   * - claimingZoneId: ID de la zona que se está reclamando actualmente
   *   Se usa para mostrar loading state en el botón específico
   */
  const [claimingZoneId, setClaimingZoneId] = useState<string | null>(null);
  
  /**
   * DIRECCIÓN DE WALLET MOCK
   * 
   * En producción, esto vendría del contexto de wallet connection
   * (MetaMask, WalletConnect, etc.). Por ahora usamos una dirección mock.
   */
  const mockWalletAddress = '0x742d35Cc8C4c2f5a5f9e2a2bA4f3b0123456789a';

  // ==================== FUNCIONES AUXILIARES ====================

  /**
   * OBTENER COLOR PARA BADGE DE ESTADO
   * 
   * Retorna clases CSS para colorear los badges según el estado de la zona.
   * Usa el sistema de colores de Tailwind CSS.
   * 
   * @param status - Estado de la zona
   * @returns String con clases CSS para el badge
   */
  const getStatusColor = (status: ZoneStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';      // Verde para activo
      case 'completed':
        return 'bg-gray-500 text-white';       // Gris para completado
      case 'expired':
        return 'bg-red-500 text-white';        // Rojo para expirado
      case 'upcoming':
        return 'bg-blue-500 text-white';       // Azul para próximo
      default:
        return 'bg-gray-400 text-white';       // Gris por defecto
    }
  };

  /**
   * OBTENER COLOR PARA ICONO DE DIFICULTAD
   * 
   * Retorna clases CSS para colorear el icono de trophy según la dificultad.
   * 
   * @param difficulty - Nivel de dificultad
   * @returns String con clases CSS para el color del icono
   */
  const getDifficultyColor = (difficulty: ZoneDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';    // Verde para fácil
      case 'medium':
        return 'text-yellow-600';   // Amarillo para medio
      case 'hard':
        return 'text-red-600';      // Rojo para difícil
      default:
        return 'text-gray-600';     // Gris por defecto
    }
  };

  /**
   * CALCULAR TIEMPO RESTANTE PARA UNA ZONA
   * 
   * Calcula y formatea el tiempo que queda antes de que expire una zona.
   * Retorna string legible para mostrar al usuario.
   * 
   * AHORA CON LÓGICA CONSISTENTE:
   * - Si no está activa, muestra el estado
   * - Si está activa, calcula tiempo real
   * 
   * @param endTime - Timestamp de finalización de la zona
   * @param status - Estado actual de la zona
   * @returns String formateado (ej: "2h 30m restantes", "Expirado", "Próximamente")
   */
  const getTimeRemaining = (endTime: string, status: string) => {
    // Si no está activo, mostrar el estado en lugar del tiempo
    if (status !== 'active') {
      switch (status) {
        case 'upcoming': return 'Próximamente';
        case 'expired': return 'Expirado';
        case 'completed': return 'Completado';
        default: return 'No disponible';
      }
    }

    // Solo calcular tiempo si está activo
    const now = new Date();
    const expiry = new Date(endTime);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h restantes`;
    }
    
    return `${hours}h ${minutes}m restantes`;
  };

  // ==================== FUNCIONES DE LÓGICA DE NEGOCIO ====================

  /**
   * MANEJAR CLAIM DE AIRDROP
   * 
   * Función principal que ejecuta todo el proceso de reclamación de un airdrop.
   * Incluye todas las validaciones necesarias y manejo de errores.
   * 
   * @param zoneId - ID de la zona donde reclamar
   * 
   * PROCESO COMPLETO:
   * 1. Verificar que el usuario tenga ubicación habilitada
   * 2. Verificar que esté dentro del radio de la zona
   * 3. Mostrar loading state en el botón
   * 4. Ejecutar claim a través del hook
   * 5. Mostrar resultado al usuario (toast)
   * 6. Limpiar loading state
   * 
   * VALIDACIONES:
   * - Usuario tiene geolocalización activa
   * - Usuario está dentro del radio de la zona
   * - Zona está activa y disponible
   * - Usuario no ha reclamado antes (se valida en el hook)
   */
  const handleClaimAirdrop = async (zoneId: string) => {
    // VALIDACIÓN 1: Verificar geolocalización
    if (!location) {
      toast({
        title: "Ubicación requerida",
        description: "Necesitas habilitar la geolocalización para reclamar airdrops",
        variant: "destructive"
      });
      return;
    }

    // VALIDACIÓN 2: Encontrar la zona
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    // VALIDACIÓN 3: Verificar proximidad física
    // Convertir distancia de km a metros para comparar con radius
    if ((zone.distance || 0) * 1000 > zone.radius) {
      toast({
        title: "Fuera de zona",
        description: `Debes estar dentro de ${zone.radius}m de ${zone.name} para reclamar el airdrop`,
        variant: "destructive"
      });
      return;
    }

    // INICIAR PROCESO DE CLAIM
    setClaimingZoneId(zoneId);  // Mostrar loading en botón específico
    
    // Ejecutar claim a través del hook
    const result = await claimAirdrop(zoneId, mockWalletAddress);
    
    // MOSTRAR RESULTADO AL USUARIO
    if (result.success) {
      toast({
        title: "¡Airdrop reclamado!",
        description: `Has ganado ${zone.reward} ${zone.currency} en ${zone.name}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive"
      });
    }
    
    // LIMPIAR ESTADO
    setClaimingZoneId(null);
  };

  /**
   * VERIFICAR SI EL USUARIO PUEDE RECLAMAR UNA ZONA
   * 
   * Función que determina si mostrar el botón de "Reclamar" habilitado
   * para una zona específica.
   * 
   * @param zone - Zona a verificar
   * @returns true si puede reclamar, false si no
   * 
   * CONDICIONES PARA PODER RECLAMAR:
   * - Usuario tiene ubicación GPS disponible
   * - Zona está en estado 'active'
   * - Usuario no ha reclamado antes en esta zona
   * - Usuario está físicamente dentro del radio de la zona
   */
  const canClaimAirdrop = (zone: any) => {
    if (!location || zone.status !== 'active') return false;
    
    const userStatus = getUserStatusForZone(zone.id, mockWalletAddress);
    if (userStatus?.hasClaimed) return false;
    
    // Verificar si está en la zona (convertir km a metros)
    return (zone.distance || 0) * 1000 <= zone.radius;
  };

  /**
   * VERIFICAR SI EL USUARIO ESTÁ EN UNA ZONA
   * 
   * Función auxiliar para saber si el usuario está físicamente
   * dentro del radio de una zona (para highlighting visual).
   * 
   * @param zone - Zona a verificar
   * @returns true si está dentro, false si no
   */
  const isUserInZone = (zone: any) => {
    return location && (zone.distance || 0) * 1000 <= zone.radius;
  };

  // ==================== RENDER DEL COMPONENTE ====================

  return (
    <div className="space-y-6">
      {/* ==================== HEADER CON INFORMACIÓN Y ACCIONES ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Zonas de Airdrop</h2>
          <p className="text-muted-foreground">
            Descubre y participa en airdrops cerca de tu ubicación
          </p>
          
          {/* INDICADOR DE ESTADO DE UBICACIÓN */}
          {location && (
            <p className="text-sm text-green-600 mt-1">
              📍 Ubicación actualizada - {nearbyZones.length} zonas cercanas
            </p>
          )}
          {locationError && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {locationError}
            </p>
          )}
        </div>
        
        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2">
          {/* Botón para actualizar ubicación GPS */}
          <Button 
            onClick={updateLocation}
            disabled={locationLoading}
            variant="outline"
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 mr-2" />
            )}
            Actualizar Ubicación
          </Button>
          
          {/* Botón para refrescar zonas desde API */}
          <Button 
            onClick={refreshZones}
            disabled={loading}
            className="btn-adventure"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            Actualizar Zonas
          </Button>
        </div>
      </div>

      {/* ==================== ESTADÍSTICAS RÁPIDAS ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card: Zonas Activas */}
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{activeZones.length}</div>
          <div className="text-sm text-muted-foreground">Zonas Activas</div>
        </Card>
        
        {/* Card: Zonas Cercanas */}
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{nearbyZones.length}</div>
          <div className="text-sm text-muted-foreground">Zonas Cercanas</div>
        </Card>
        
        {/* Card: Total BTT Disponible */}
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {zones.reduce((sum, zone) => sum + zone.reward, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total BTT Disponible</div>
        </Card>
        
        {/* Card: Participantes Total */}
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {zones.reduce((sum, zone) => sum + zone.participants, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Participantes Total</div>
        </Card>
      </div>

      {/* ==================== GRID DE ZONAS ==================== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => {
          // CÁLCULOS PARA CADA ZONA
          const progressPercentage = (zone.participants / zone.maxParticipants) * 100;
          const userStatus = getUserStatusForZone(zone.id, mockWalletAddress);
          const inZone = isUserInZone(zone);
          const canClaim = canClaimAirdrop(zone);
          
          return (
            <Card 
              key={zone.id} 
              className={`card-adventure transition-all duration-300 hover:shadow-lg ${
                inZone ? 'ring-2 ring-green-500 bg-green-50/50' : ''
              }`}
            >
              {/* ==================== HEADER DEL CARD ==================== */}
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">
                    {zone.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    {/* Badge de estado de la zona */}
                    <Badge className={getStatusColor(zone.status)}>
                      {zone.status}
                    </Badge>
                    {/* Badge adicional si está en zona */}
                    {inZone && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        En zona
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Descripción con ubicación y distancia */}
                <CardDescription className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{zone.location}</span>
                  {zone.distance !== undefined && (
                    <span className="text-xs">• {zone.distance.toFixed(1)}km</span>
                  )}
                </CardDescription>
              </CardHeader>

              {/* ==================== CONTENIDO DEL CARD ==================== */}
              <CardContent className="space-y-4">
                {/* Sección de Reward y Marca */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-bold text-lg">
                        {zone.reward} {zone.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        por {zone.brand}
                      </div>
                    </div>
                  </div>
                  {/* Icono de dificultad */}
                  <Trophy className={`h-6 w-6 ${getDifficultyColor(zone.difficulty)}`} />
                </div>

                {/* Progress Bar de Participantes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Participantes</span>
                    </span>
                    <span className="font-medium">
                      {zone.participants}/{zone.maxParticipants}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Tiempo Restante */}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Tiempo restante</span>
                  </span>
                  <span className={`font-medium ${
                    zone.status === 'active' ? 'text-primary' : 
                    zone.status === 'expired' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {getTimeRemaining(zone.endTime, zone.status)}
                  </span>
                </div>

                {/* Lista de Requisitos */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1 text-sm">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Requisitos:</span>
                  </div>
                  <div className="space-y-1">
                    {zone.requirements.map((req, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicador de Estado del Usuario */}
                {userStatus?.hasClaimed && (
                  <div className="flex items-center justify-center p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-600 font-medium">
                      ¡Airdrop reclamado!
                    </span>
                  </div>
                )}

                {/* ==================== BOTÓN DE ACCIÓN ==================== */}
                <Button 
                  className="w-full"
                  variant={canClaim ? 'default' : 'secondary'}
                  disabled={!canClaim || claimingZoneId === zone.id || userStatus?.hasClaimed}
                  onClick={() => handleClaimAirdrop(zone.id)}
                >
                  {/* DIFERENTES ESTADOS DEL BOTÓN */}
                  {claimingZoneId === zone.id ? (
                    // Estado: Reclamando (loading)
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reclamando...
                    </>
                  ) : userStatus?.hasClaimed ? (
                    // Estado: Ya reclamado
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completado
                    </>
                  ) : zone.status === 'active' && canClaim ? (
                    // Estado: Puede reclamar
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      Reclamar Airdrop
                    </>
                  ) : zone.status === 'active' ? (
                    // Estado: Ir a ubicación
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Ir a Ubicación
                    </>
                  ) : zone.status === 'completed' ? (
                    // Estado: Zona completada
                    'Completado'
                  ) : zone.status === 'expired' ? (
                    // Estado: Zona expirada
                    'Expirado'
                  ) : (
                    // Estado: Zona próxima
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Próximamente
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AirdropZones;