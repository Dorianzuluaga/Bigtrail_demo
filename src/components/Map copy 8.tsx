
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, MapPin, Navigation, Coins, Users, Clock,
  Zap, Star, Gift, Trophy, Target, Flame, 
  Mountain, Car, Bike, Compass, Diamond, Flag,
  CheckCircle, AlertTriangle, Calendar, Timer
} from 'lucide-react';
import { useAirdropZones } from '@/hooks/useAirdropZones';
import useGeolocation from '@/hooks/useGeolocation';
import { AirdropZoneExtended } from '@/types/airdrop-types';

declare global {
  interface Window {
    google: unknown;
  }
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBsRFAZiAMXSQ3pS509GLioSwC3TGvD6zE';

// ==================== ESTILOS ÉPICOS PARA EL MAPA ====================
const EPIC_BIKER_STYLES = [
  {
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [
      {"color": "#1a1a2e"}
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {"color": "#16213e"}
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {"color": "#ff6b35"},
      {"lightness": -20}
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {"color": "#e74c3c"},
      {"lightness": -10}
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      {"color": "#34495e"}
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
      {"color": "#2c3e50"}
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
      {"color": "#ecf0f1"}
    ]
  }
];

const FixedBikerMap = () => {
  // ==================== TU ESTADO ORIGINAL (SIN CAMBIOS) ====================
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedZone, setSelectedZone] = useState<AirdropZoneExtended | null>(null);
  const [error, setError] = useState<string | null>(null);

  // TUS HOOKS ORIGINALES (SIN CAMBIOS)
  const { zones } = useAirdropZones();
  const { location, updateLocation, loading: locationLoading } = useGeolocation();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  // ==================== TU LÓGICA ORIGINAL (SIN CAMBIOS) ====================
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) {
      setTimeout(initializeMap, 100);
      return;
    }

    const defaultCenter = { lat: 40.4168, lng: -3.7038 };
    const center = location || defaultCenter;
    
    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 14,
        center: center,
        mapTypeId: mapType,
        styles: EPIC_BIKER_STYLES, // ← SOLO CAMBIÉ ESTO: estilos épicos
        // TUS CONTROLES ORIGINALES
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });

      mapInstanceRef.current.addListener('click', () => {
        setSelectedZone(null);
      });

      updateMarkersAndCircles();
    } catch (error) {
      console.error('Error creando mapa:', error);
      setError('Error inicializando el mapa');
    }
  }, [location]);

  const updateMarkersAndCircles = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // TU LÓGICA ORIGINAL DE LIMPIAR
    markersRef.current.forEach(marker => marker.setMap(null));
    circlesRef.current.forEach(circle => circle.setMap(null));
    markersRef.current = [];
    circlesRef.current = [];

    // TU MARCADOR DE USUARIO ORIGINAL (mejorado con estilo épico)
    if (location) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstanceRef.current,
        icon: {
          path: `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`,
          fillColor: '#ff6b35',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
          scale: 2,
          anchor: new window.google.maps.Point(12, 24)
        },
        title: 'Tu ubicación - BigTrail',
        zIndex: 1000
      });
      markersRef.current.push(userMarker);
    }

    // TUS ZONAS ORIGINALES (con marcadores épicos mejorados)
    zones.forEach(zone => {
      const markerColor = zone.status === 'active' ? '#10b981' : 
                         zone.status === 'upcoming' ? '#3b82f6' : '#6b7280';

      // Diferentes iconos según el tipo de zona
      let iconPath = '';
      switch (zone.difficulty) {
        case 'easy':
          iconPath = `M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l5.5-5.5m0 0L17 3m0 0v4m0-4h-4`; // Flag
          break;
        case 'medium':
          iconPath = `M8 21h8V8l-8 8V21zm0-13h8V3H8v5zm0 13h8V8l-8 8V21z`; // Car-like
          break;
        case 'hard':
          iconPath = `M8.5 14.5L12 11l3.5 3.5L12 18l-3.5-3.5zM12 2L8 8h8l-4-6zm0 20l4-6H8l4 6z`; // Mountain
          break;
        default:
          iconPath = `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`;
      }

      const marker = new window.google.maps.Marker({
        position: { lat: zone.center.lat, lng: zone.center.lng },
        map: mapInstanceRef.current,
        icon: {
          path: iconPath,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 24)
        },
        title: `${zone.name} - ${zone.reward} BTM`,
        zIndex: 100
      });

      const circle = new window.google.maps.Circle({
        strokeColor: markerColor,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: markerColor,
        fillOpacity: 0.15,
        map: mapInstanceRef.current,
        center: { lat: zone.center.lat, lng: zone.center.lng },
        radius: zone.radius
      });

      marker.addListener('click', () => {
        setSelectedZone(zone);
        mapInstanceRef.current.panTo({ lat: zone.center.lat, lng: zone.center.lng });
      });

      markersRef.current.push(marker);
      circlesRef.current.push(circle);
    });
  }, [zones, location]);

  // ==================== TUS EFECTOS ORIGINALES (SIN CAMBIOS) ====================
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
        setTimeout(initializeMap, 100);
      };
      
      script.onerror = () => {
        setError('Error cargando Google Maps');
      };
      
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
      setTimeout(initializeMap, 50);
    }
  }, [initializeMap]);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      updateMarkersAndCircles();
    }
  }, [zones, location, isLoaded, updateMarkersAndCircles]);

  useEffect(() => {
    if (location && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  useEffect(() => {
  if (mapInstanceRef.current) {
    mapInstanceRef.current.setMapTypeId(mapType);
  }
}, [mapType]);

  // ==================== TUS FUNCIONES AUXILIARES ORIGINALES ====================
  const getBikerZoneType = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return (
        <div className="flex items-center space-x-1">
          <Flag className="h-4 w-4" />
          <span>Urbano</span>
        </div>
      );
      case 'medium': return (
        <div className="flex items-center space-x-1">
          <Car className="h-4 w-4" />
          <span>Carretera</span>
        </div>
      );
      case 'hard': return (
        <div className="flex items-center space-x-1">
          <Mountain className="h-4 w-4" />
          <span>Extremo</span>
        </div>
      );
      default: return (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4" />
          <span>Zona</span>
        </div>
      );
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'expired': return 'destructive';
      case 'upcoming': return 'outline';
      default: return 'secondary';
    }
  };

  const formatTime = (endTime: string, status: string) => {
    if (status !== 'active') {
      switch (status) {
        case 'upcoming': return 'Próximamente';
        case 'expired': return 'Expirado';
        case 'completed': return 'Completado';
        default: return 'No disponible';
      }
    }

    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h restantes`;
    }
    
    return `${hours}h ${minutes}m restantes`;
  };

  const navigateToZone = (zone: AirdropZoneExtended) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${zone.center.lat},${zone.center.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // TUS STATS ORIGINALES (SIN CAMBIOS)
  const stats = {
    totalZones: zones.length,
    activeZones: zones.filter(z => z.status === 'active').length,
    nearbyZones: zones.filter(z => z.distance && z.distance <= 5).length,
    totalReward: zones.reduce((sum, z) => sum + z.reward, 0)
  };

  // ==================== FUNCIONES ÉPICAS NUEVAS ====================
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Target className="h-5 w-5" />;
      case 'medium': return <Flame className="h-5 w-5" />;
      case 'hard': return <Mountain className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { 
        label: (
          <div className="flex items-center space-x-1">
            <Flag className="h-4 w-4" />
            <span>Urbano</span>
          </div>
        ), 
        color: 'from-green-500 to-emerald-600' 
      };
      case 'medium': return { 
        label: (
          <div className="flex items-center space-x-1">
            <Car className="h-4 w-4" />
            <span>Carretera</span>
          </div>
        ), 
        color: 'from-orange-500 to-red-600' 
      };
      case 'hard': return { 
        label: (
          <div className="flex items-center space-x-1">
            <Mountain className="h-4 w-4" />
            <span>Extremo</span>
          </div>
        ), 
        color: 'from-purple-500 to-pink-600' 
      };
      default: return { 
        label: (
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>Zona</span>
          </div>
        ), 
        color: 'from-gray-500 to-gray-600' 
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Zap className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'completed': return <Trophy className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  // ==================== RENDER ÉPICO MANTENIENDO TU LÓGICA ====================
  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-red-900 via-red-800 to-black flex items-center justify-center">
        <Card className="bg-black/80 border-red-500/50 text-white p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Error del Mapa</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Recargar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-orange-500/30 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            <Target className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center space-x-2">
            <Bike className="h-6 w-6" />
            <span>BigTrail Map</span>
          </h2>
          <p className="text-gray-400">Cargando el universo de trails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black relative overflow-hidden">
      {/* Patrón de fondo animado */}
      <div 
        className="absolute inset-0 opacity-10 animate-pulse"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,107,53,0.3) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* ==================== STATS ÉPICOS CON TUS DATOS REALES ==================== */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-gradient-to-r from-orange-600 to-red-600 border-0 shadow-lg">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Trophy className="h-4 w-4 text-white" />
                <span className="text-lg font-bold text-white">{stats.totalZones}</span>
              </div>
              <div className="text-xs text-orange-100">Trails</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 shadow-lg">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Zap className="h-4 w-4 text-white" />
                <span className="text-lg font-bold text-white">{stats.activeZones}</span>
              </div>
              <div className="text-xs text-green-100">Activos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0 shadow-lg">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <MapPin className="h-4 w-4 text-white" />
                <span className="text-lg font-bold text-white">{stats.nearbyZones}</span>
              </div>
              <div className="text-xs text-blue-100">Cerca</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-0 shadow-lg">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Coins className="h-4 w-4 text-white" />
                <span className="text-lg font-bold text-white">{stats.totalReward}</span>
              </div>
              <div className="text-xs text-yellow-100">BTM</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================== TU MAPA ORIGINAL (SIN CAMBIOS DE LÓGICA) ==================== */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />

      {/* ==================== CONTROLES ÉPICOS ==================== */}
      <div className="absolute top-20 right-4 space-y-2 z-10">
        <Button
          onClick={() => {
            console.log('GPS button clicked');
            updateLocation();
          }}
          disabled={locationLoading}
          size="sm"
          className="bg-black/70 hover:bg-black/90 border border-orange-500/50 text-white shadow-lg backdrop-blur-sm"
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Target className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          onClick={() => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() + 1)}
          size="sm"
          className="bg-black/70 hover:bg-black/90 border border-orange-500/50 text-white shadow-lg backdrop-blur-sm"
        >
          +
        </Button>
        
        <Button
          onClick={() => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() - 1)}
          size="sm"
          className="bg-black/70 hover:bg-black/90 border border-orange-500/50 text-white shadow-lg backdrop-blur-sm"
        >
          -
        </Button>
        <Button
          onClick={() => setMapType('roadmap')}
          size="sm"
          className="bg-black/70 hover:bg-black/90 border border-orange-500/50 text-white shadow-lg backdrop-blur-sm"
        >
          🛣️
        </Button>
        <Button
          onClick={() => setMapType('satellite')}
          size="sm"
          className="bg-black/70 hover:bg-black/90 border border-orange-500/50 text-white shadow-lg backdrop-blur-sm"
        >
          🛰️
        </Button>
        <Button
          onClick={() => setMapType('terrain')}
          size="sm"
          className="bg-black/70 hover:bg-black/90 border border-orange-500/50 text-white shadow-lg backdrop-blur-sm"
        >
          ⛰️
        </Button>
      </div>

      {/* ==================== LEYENDA ÉPICA ==================== */}
      <div className="absolute top-20 left-4 z-10">
        <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
          <CardContent className="p-3">
            <h4 className="font-bold text-sm mb-3 text-white flex items-center">
              <Target className="h-4 w-4 mr-2 text-orange-400" />
              BigTrail Zones
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                <span className="text-gray-300">Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg"></div>
                <span className="text-gray-300">Próximo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-500 shadow-lg"></div>
                <span className="text-gray-300">Completado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg animate-pulse"></div>
                <div className="flex items-center space-x-1">
                  <Bike className="h-3 w-3 text-gray-300" />
                  <span className="text-gray-300">Tu posición</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== PANEL DE ZONA ÉPICO CON TUS DATOS REALES ==================== */}
      {selectedZone && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-gradient-to-br from-slate-900 to-black border border-orange-500/50 max-w-md w-full shadow-2xl">
            <CardHeader className={`bg-gradient-to-r ${getDifficultyInfo(selectedZone.difficulty).color} text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getDifficultyIcon(selectedZone.difficulty)}
                    <Badge className="bg-black/30 text-white border-white/20">
                      {getDifficultyInfo(selectedZone.difficulty).label}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="bg-black/30 text-white border-white/30">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedZone.status)}
                      <span>{selectedZone.status}</span>
                    </div>
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">{selectedZone.name}</CardTitle>
                <p className="text-white/80 text-sm">{selectedZone.location}</p>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              {/* Stats grid con TUS datos reales */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Coins className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-bold text-white text-lg">{selectedZone.reward}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{selectedZone.currency}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-5 w-5 text-blue-500 mr-1" />
                    <span className="font-bold text-white text-lg">{selectedZone.participants}/{selectedZone.maxParticipants}</span>
                  </div>
                  <p className="text-gray-400 text-xs">Pilotos</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-5 w-5 text-purple-500 mr-1" />
                    <span className="font-bold text-white text-sm">{formatTime(selectedZone.endTime, selectedZone.status)}</span>
                  </div>
                  <p className="text-gray-400 text-xs">Tiempo</p>
                </div>
              </div>
              
              {/* Distancia con TUS datos */}
              {selectedZone.distance && (
                <div className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    <span className="text-white font-semibold">
                      A {selectedZone.distance.toFixed(1)}km de distancia
                    </span>
                  </div>
                </div>
              )}
              
              {/* TU descripción original */}
              <p className="text-gray-300 text-sm leading-relaxed">{selectedZone.description}</p>
              
              {/* TUS botones originales con estilos épicos */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => navigateToZone(selectedZone)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg"
                >
                  <Compass className="h-4 w-4 mr-2" />
                  Ruta en Google Maps
                </Button>
                <Button
                  onClick={() => setSelectedZone(null)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FixedBikerMap;