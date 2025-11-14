import React, { useState, useEffect } from 'react';
import GoogleMap, { MarkerData } from '@/components/GoogleMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MapPin, ArrowLeft } from 'lucide-react';
import { createZone, getCampaign } from '@/services/zonesApi';
import { useNavigate } from 'react-router-dom';

const MapExample: React.FC = () => {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar markers desde el endpoint de la campaña
  useEffect(() => {
    const loadCampaignZones = async () => {
      try {
        setLoading(true);
        console.log('Cargando zonas de la campaña...');
        const campaignData = await getCampaign('558fb0f4-a253-4184-a131-74f007a0e894', 'aedfeb8c-8a54-4b99-96b3-ac388a8156ac');
        console.log('Campaña obtenida:', campaignData);
        
        // Verificar si campaignData tiene un array de zones
        if (campaignData && (campaignData as any).zones && Array.isArray((campaignData as any).zones)) {
          const zones = (campaignData as any).zones;
          const loadedMarkers: MarkerData[] = zones.map((zone: any, index: number) => ({
            id: zone.id || `zone-${index}`,
            position: zone.center || { lat: 40.4168, lng: -3.7038 },
            title: zone.name || `Zona ${index + 1}`,
            description: zone.description || 'Zona sin descripción',
            type: 'airdrop' as const,
            active: zone.is_active ?? true,
            token_address: zone.token_address,
            radius: zone.radius,
            amount: zone.amount,
            start_time: zone.start_time,
            end_time: zone.end_time,
            metadata: {
              reward: zone.amount ? `${zone.amount} TOKENS` : undefined,
              participants: Math.floor(Math.random() * 100),
              budget: zone.amount ? parseInt(zone.amount) * 50 : undefined
            }
          }));
          
          console.log('Markers cargados desde la campaña:', loadedMarkers);
          setMarkers(loadedMarkers);
        } else {
          console.log('No se encontraron zonas en la campaña, usando datos de ejemplo');
          // Si no hay zones en la respuesta, usar datos de ejemplo
          const exampleMarkers: MarkerData[] = [
            {
              id: '1',
              position: { lat: 40.4168, lng: -3.7038 },
              title: 'Airdrop Centro Madrid',
              description: 'Zona activa de airdrop con 50 TOKENS de recompensa',
              type: 'airdrop',
              active: true,
              metadata: {
                reward: '50 TOKENS',
                participants: 124,
                budget: 2500
              }
            },
            {
              id: '2',
              position: { lat: 40.4200, lng: -3.7100 },
              title: 'Campaña Retiro',
              description: 'Campaña publicitaria activa en El Retiro',
              type: 'campaign',
              active: true,
              metadata: {
                participants: 89,
                budget: 1800
              }
            },
            {
              id: '3',
              position: { lat: 40.4150, lng: -3.7000 },
              title: 'Evento BigTrail',
              description: 'Evento especial de trail running',
              type: 'event',
              active: false,
              metadata: {
                participants: 45,
                startDate: '2025-09-01',
                endDate: '2025-09-03'
              }
            }
          ];
          setMarkers(exampleMarkers);
        }
      } catch (error) {
        console.error('Error cargando zonas de la campaña:', error);
        // En caso de error, usar datos de ejemplo
        const exampleMarkers: MarkerData[] = [
          {
            id: '1',
            position: { lat: 40.4168, lng: -3.7038 },
            title: 'Airdrop Centro Madrid (Ejemplo)',
            description: 'Zona de ejemplo - Error al cargar desde API',
            type: 'airdrop',
            active: true,
            metadata: {
              reward: '50 TOKENS',
              participants: 124,
              budget: 2500
            }
          }
        ];
        setMarkers(exampleMarkers);
      } finally {
        setLoading(false);
      }
    };

    loadCampaignZones();
  }, []);

  const handleMarkerAdd = async (marker: MarkerData) => {
    console.log('Agregando marker desde MapExample:', marker);
    
    // Si el marker no tiene ID de servidor, intentar crearlo en la API
    if (marker.id.startsWith('sample-') || marker.id.startsWith('marker-')) {
      try {
        // Solo llamar a createZone si tiene todos los campos requeridos
        if (marker.token_address && marker.radius && marker.amount !== undefined) {
          const newZone = await createZone(
            "aedfeb8c-8a54-4b99-96b3-ac388a8156ac", // brandId hardcoded for test, use variable if available
            "558fb0f4-a253-4184-a131-74f007a0e894", // campaignId hardcoded for test, use variable if available
            {
              name: marker.title,
              description: marker.description,
              token_address: marker.token_address,
              center: marker.position,
              radius: marker.radius,
              amount: marker.amount,
              start_time: marker.start_time || new Date().toISOString(),
              end_time: marker.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              is_active: marker.active,
            }
          );
          
          // Actualizar con el ID del servidor
          const updatedMarker = { ...marker, id: newZone.id };
          setMarkers(prev => [...prev, updatedMarker]);
          return;
        }
      } catch (error) {
        console.error('Error creando zona en API:', error);
        // Continuar y agregar localmente aunque falle la API
      }
    }
    
    setMarkers(prev => [...prev, marker]);
  };

  const handleMarkerEdit = (marker: MarkerData) => {
    setMarkers(prev => prev.map(m => m.id === marker.id ? marker : m));
  };

  const handleMarkerDelete = (markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId));
  };

  const addSampleMarkers = async () => {
    const sampleMarkers: MarkerData[] = [
      {
        id: `sample-${Date.now()}-1`,
        position: { lat: 40.4300, lng: -3.6900 },
        title: 'Nuevo Airdrop',
        description: 'Zona de airdrop generada automáticamente',
        type: 'airdrop',
        active: true,
        token_address: '0xF34d162fcDbBFdFC150CEA9D21b6696728c7d8aB',
        radius: 1,
        amount: '0',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          reward: '25 TOKENS',
          participants: 0
        }
      },
      {
        id: `sample-${Date.now()}-2`,
        position: { lat: 40.4050, lng: -3.7200 },
        title: 'Ubicación Especial',
        description: 'Punto de interés para riders',
        type: 'location',
        active: true,
        token_address: '0xF34d162fcDbBFdFC150CEA9D21b6696728c7d8aB',
        radius: 1,
        amount: '0',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    // Agregar cada marker usando la función handleMarkerAdd que llama a la API
    for (const marker of sampleMarkers) {
      handleMarkerAdd(marker);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Regresar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Google Maps - Ejemplo Completo</h1>
              <p className="text-muted-foreground">
                Componente reutilizable con markers, riders en tiempo real y controles completos
              </p>
            </div>
          </div>
          <Button onClick={addSampleMarkers}>
            <MapPin className="h-4 w-4 mr-2" />
            Agregar Markers de Ejemplo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Markers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{markers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Airdrops Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {markers.filter(m => m.type === 'airdrop' && m.active).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Campañas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {markers.filter(m => m.type === 'campaign').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {markers.filter(m => m.type === 'event').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa Interactivo
            </CardTitle>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>• Click para agregar markers</span>
              <span>• Toggle riders en tiempo real</span>
              <span>• Click en markers para ver detalles</span>
              <span>• Editar/eliminar desde la lista</span>
            </div>
          </CardHeader>
          <CardContent>
            <GoogleMap
              center={{ lat: 40.4168, lng: -3.7038 }}
              zoom={12}
              height="600px"
              markers={markers}
              onMarkerAdd={handleMarkerAdd}
              onMarkerEdit={handleMarkerEdit}
              onMarkerDelete={handleMarkerDelete}
              showRealTimeRiders={true}
              riderSearchRadius={10}
              enableMarkerCreation={true}
              className="rounded-lg overflow-hidden"
              brandId="aedfeb8c-8a54-4b99-96b3-ac388a8156ac"  // hardcodeado para pruebas
              campaignId="558fb0f4-a253-4184-a131-74f007a0e894" // hardcodeado para pruebas
            />
          </CardContent>
        </Card>

        {/* Lista de markers */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Markers ({loading ? 'Cargando...' : markers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="text-muted-foreground">Cargando markers desde la campaña...</div>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {markers.map(marker => (
                <AccordionItem key={marker.id} value={marker.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full mr-4">
                      <h3 className="font-medium">{marker.title}</h3>
                      <div className="flex gap-2">
                        <Badge variant={marker.active ? "default" : "secondary"}>
                          {marker.type}
                        </Badge>
                        <Badge variant={marker.active ? "default" : "outline"}>
                          {marker.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      <p className="text-sm text-muted-foreground">{marker.description}</p>
                      {marker.metadata && (
                        <div className="text-xs space-y-1">
                          {marker.metadata.reward && (
                            <div>Recompensa: {marker.metadata.reward}</div>
                          )}
                          {marker.metadata.participants && (
                            <div>Participantes: {marker.metadata.participants}</div>
                          )}
                          {marker.metadata.budget && (
                            <div>Presupuesto: €{marker.metadata.budget}</div>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Lat: {marker.position.lat.toFixed(4)}, Lng: {marker.position.lng.toFixed(4)}
                      </div>
                      {marker.token_address && (
                        <div className="text-xs text-muted-foreground">
                          Token: {marker.token_address.slice(0, 10)}...{marker.token_address.slice(-8)}
                        </div>
                      )}
                      {marker.radius && (
                        <div className="text-xs text-muted-foreground">
                          Radio: {marker.radius} km
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapExample;