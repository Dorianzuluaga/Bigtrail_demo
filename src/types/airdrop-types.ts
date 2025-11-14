/** 
 * ===================================================================================
 * Estructura de una Zona de AiRdROP
 * ===================================================================================
 * 
 * Representa una ubicacion geo donde los usuarios pueden reclamar 
 * tokens/rewards al estar presentes fisicamente en el lugar.
 * 
 * Casos de USO :
 * 
 * Crear zonas en distintos puntos de intereses elegidos por las marcas
 * Definir áreas de marketing geolozalizado
 * Establecer puntos de distribucion de tokens 
 * 
 * 
 * Ejemplo de ZONA DE AIRDROP:
 * 
 * {
 *  id : "zone-puerta-sol-001"
 * name: "Puerta del Sol"
 * description: "Centro Historico con una gran afluencia de personas de Madrid"
 * tokenAddress: "0x1234.........dadadoqeqdap"
 * center :{lat:40.4168, lng: -3.7038}
 * radius: 100,  // la longitud en metros desde la que se puede obtener la recompensa
 * amount. "150" // 150 tokens por usuario. 
 * startTime: "2024-07-29T09:00:00Z",  //hora de inicio 
 * endTime: "2024-07-30T18:00:00Z",    //hora en la que finaliza la entrega 
 * isActive: true, // estado de la zona de airdrop
 * brandId: "nike-001" 
 * } 
 * 
*/

export type AirdropZone = {

     id: string;
  
  /** Nombre descriptivo de la zona (ej: "Puerta del Sol") */
  name: string;
  
  /** Descripción detallada para mostrar a los usuarios */
  description: string;
  
  /** Dirección del contrato del token que se distribuye (formato Ethereum: 0x...) */
  tokenAddress: string;
  

  center: {
    /** Latitud en formato decimal (ej: 40.4168 para Madrid) */
    lat: number;
    /** Longitud en formato decimal (ej: -3.7038 para Madrid) */
    lng: number;
  };
  
  /** Radio de la zona en metros (ej: 100 = zona de 100m de radio) */
  radius: number;
  
  /** tokens que recibe cada usuario (string para manejar decimales grandes) */
  amount: string;
  
  /**  formato ISO 8601 */
  startTime: string;
  
  /** formato ISO 8601 */
  endTime: string;
  
  /** Si la zona está actualmente habilitada (puede ser desactivada manualmente) */
  isActive: boolean;
  
  /** ID de la marca que creó esta zona (opcional para zonas independientes) */
  brandId?: string;

}

/**
 * ============================================================================
 * UBICACIÓN ACTUAL DEL USUARIO
 * ============================================================================
 * 
 * Representa la posición GPS del usuario obtenida del navegador/dispositivo.
 * Se usa para verificar si está dentro de una zona de airdrop.
 * 
 * CASOS DE USO:
 * - Verificar proximidad a zonas de airdrop
 * - Calcular distancias para ordenar zonas por cercanía
 * - Validar que el usuario esté físicamente presente para reclamar
 * - Almacenar histórico de ubicaciones para analytics(venderlas jeje Moe yo tambien quiero plata)
 * 
 * EJEMPLO:
 * {
 *   lat: 40.4168,     
 *   lng: -3.7038,      
 *   timestamp: 1690628400000  // Unix timestamp cuando se obtuvo la ubicación
 * }
 * 
 * NOTA: timestamp es crucial para validar que la ubicación es reciente 
 * y que el usuario no paso por alli hace un mes, habria que buscar alguna manera de asegurar
 * que el usuario no esta spoofeando su GPS, por ejemplo en el POKEMON GO ,la gente 
 * simulaba mediante programas externos estar en Australia para conseguir recompensas
 * unicas.(Consejo de Cyberseguridad, gratis de momento.)
 * 
 */


export type UserLocation = {
  /** Latitud en formato decimal (-90 a +90) */
  lat: number;
  
  /** Longitud en formato decimal (-180 a +180) */
  lng: number;
  
  /** Timestamp Unix (milisegundos) de cuando se obtuvo la ubicación */
  timestamp: number;
};

/**
 * ============================================================================
 * ESTADO DEL USUARIO RESPECTO A UNA ZONA
 * ============================================================================
 * 
 * Rastrea la interacción de un usuario específico con una zona específica.
 * Evita que un usuario reclame múltiples veces en la misma zona.
 * 
 * CASOS DE USO:
 * - Prevenir doble-reclamación de airdrops
 * - Mostrar al usuario qué zonas ya ha completado
 * - Analytics de tiempo que tardan los usuarios en reclamar
 * - Mostrar histórico personal del usuario
 * 
 * ESTADOS POSIBLES:
 * - Usuario nunca entró: registro no existe
 * - Usuario entró pero no reclamó: enteredAt existe, hasClaimed=false
 * - Usuario entró y reclamó: ambos campos existen, hasClaimed=true
 * 
 * EJEMPLO:
 * {
 *   wallet: "0x742d35Cc8C4c2f5a5f9e2a2bA4f3b0123456789a",
 *   zoneId: "zone-puerta-sol-001", 
 *   hasClaimed: true,
 *   enteredAt: "2024-07-29T10:30:00Z",    // Cuándo entró a la zona
 *   claimedAt: "2024-07-29T10:35:00Z"     // Cuándo reclamó el airdrop
 * }
 */
export type AirdropUserStatus = {
  /** Dirección de wallet del usuario (formato Ethereum: 0x...) */
  wallet: string;
  
  /** ID de la zona específica */
  zoneId: string;
  
  /** Si el usuario ya reclamó el airdrop de esta zona */
  hasClaimed: boolean;
  
  /** Timestamp ISO cuando el usuario entró por primera vez a la zona (opcional) */
  enteredAt?: string;
  
  /** Timestamp ISO cuando el usuario reclamó el airdrop (opcional) */
  claimedAt?: string;
};

/**
 * ============================================================================
 * CAMPAÑAS DE MARCAS
 * ============================================================================
 * 
 * Una campaña agrupa múltiples zonas de airdrop bajo una misma estrategia
 * de marketing. Permite a las marcas crear experiencias coordinadas.
 * 
 * CASOS DE USO:
 * - "Campaña Verano 2024": 10 zonas en diferentes playas
 * - "Lanzamiento Producto X": zonas en tiendas de la marca
 * - "Festival de Música": zonas en diferentes escenarios
 * - Campañas publicitarias con múltiples ubicaciones
 * 
 * RELACIONES:
 * - Una campaña pertenece a UNA marca
 * - Una campaña puede tener MÚLTIPLES zonas
 * - Todas las zonas de una campaña usan el mismo token
 * 
 * EJEMPLO:
 * {
 *   id: "camp-nike-verano-2024",
 *   brandId: "nike-001",
 *   name: "Nike Verano Urbano 2024",
 *   tokenAddress: "0x1234...abcd",
 *   totalTokens: "10000",  // Total disponible para toda la campaña
 *   zones: [zona1, zona2, zona3], // Array de zonas incluidas
 *   startDate: "2024-07-01T00:00:00Z",
 *   endDate: "2024-08-31T23:59:59Z"
 * }
 */
export type Campaign = {
  /** Identificador único de la campaña */
  id: string;
  
  /** ID de la marca que creó esta campaña */
  brandId: string;
  
  /** Nombre de la campaña para mostrar en dashboards */
  name: string;
  
  /** Dirección del contrato del token usado en toda la campaña */
  tokenAddress: string;
  
  /** Total de tokens asignados a esta campaña (string para decimales grandes) */
  totalTokens: string;
  
  /** Array de zonas incluidas en esta campaña */
  zones: AirdropZone[];
  
  /** Fecha de inicio de la campaña (todas las zonas se activan después de esta fecha) */
  startDate: string;
  
  /** Fecha de finalización de la campaña (todas las zonas se desactivan después) */
  endDate: string;
};

/**
 * ============================================================================
 * MARCA O ANUNCIANTE
 * ============================================================================
 * 
 * Representa una empresa/marca que crea campañas y zonas de airdrop.
 * Es el cliente al que debemos hacer objetivo
 * ya que paga por la plataforma de marketing geolocalizado.
 * 
 * CASOS DE USO:
 * - Nike crea campañas en centros deportivos
 * - McDonald's crea zonas cerca de sus restaurantes  
 * - Ayuntamiento de Madrid promociona eventos culturales
 * - Startups promocionan lanzamientos de productos
 * 
 * RELACIONES:
 * - Una marca puede tener MÚLTIPLES campañas
 * - Una marca puede crear zonas independientes (sin campaña)
 * - Se usa para mostrar branding en la app
 * 
 * EJEMPLO:
 * {
 *   id: "nike-001",
 *   name: "Nike",
 *   logoUrl: "https://cdn.bigtrail.com/logos/nike.png",
 *   description: "Just Do It - Marca deportiva líder mundial",
 *   website: "https://nike.com"
 * }
 */

export type Brand = {
  /** Identificador único de la marca */
  id: string;
  
  /** Nombre comercial de la marca */
  name: string;
  
  /** URL del logo de la marca (para mostrar en la app) */
  logoUrl: string;
  
  /** Descripción de la marca para contexto en campañas */
  description: string;
  
  /** Sitio web oficial de la marca (opcional) */
  website?: string;
};

/**
 * ============================================================================
 * HISTORIAL DE INTERACCIONES
 * ============================================================================
 * 
 * Registro permanente de cada airdrop reclamado exitosamente.
 * Sirve para analytics, auditoría y mostrar histórico a usuarios/marcas.
 * 
 * CASOS DE USO:
 * - Mostrar histórico personal del usuario en la app
 * - Analytics para marcas: cuánto gastaron, dónde, cuándo
 * - Auditoría de transacciones blockchain
 * - Detectar patrones de uso y fraud
 * - Generar reportes financieros
 * 
 * FLUJO TÍPICO:
 * 1. Usuario reclama airdrop en zona
 * 2. Se ejecuta transacción blockchain  
 * 3. Se crea registro en AirdropHistory con txHash
 * 4. Se puede mostrar en dashboard y histórico
 * 
 * EJEMPLO:
 * {
 *   user: "0x742d35Cc8C4c2f5a5f9e2a2bA4f3b0123456789a",
 *   zoneId: "zone-puerta-sol-001",
 *   campaignId: "camp-nike-verano-2024", 
 *   amountClaimed: "150",
 *   timestamp: "2024-07-29T10:35:00Z",
 *   txHash: "0xabc123...def789"  // Hash de la transacción en blockchain
 * }
 */
export type AirdropHistory = {
  /** Dirección de wallet del usuario que reclamó */
  user: string;
  
  /** ID de la zona donde se reclamó el airdrop */
  zoneId: string;
  
  /** ID de la campaña asociada (si la zona pertenece a una campaña) */
  campaignId: string;
  
  /** Cantidad exacta de tokens reclamados (string para decimales grandes) */
  amountClaimed: string;
  
  /** Timestamp ISO de cuándo se completó la transacción */
  timestamp: string;
  
  /** Hash de la transacción blockchain (para verificación y auditoria) */
  txHash: string;
};

/**
 * ============================================================================
 * TIPOS ADICIONALES PARA EL DASHBOARD
 * ============================================================================
 */

/**
 * ESTADOS POSIBLES DE UNA ZONA
 * 
 * Calculado dinámicamente basado en:
 * - Tiempo actual vs startTime/endTime
 * - Número de participantes vs límite máximo
 * - Estado isActive de la zona
 * 
 * ESTADOS:
 * - 'active': Zona disponible para reclamar ahora mismo
 * - 'completed': Zona alcanzó el máximo de participantes
 * - 'expired': Zona pasó su fecha de finalización
 * - 'upcoming': Zona aún no ha comenzado (antes de startTime)
 */

export type ZoneStatus = 'active' | 'completed' | 'expired' | 'upcoming';



/**
 * NIVELES DE DIFICULTAD DE UNA ZONA
 * 
 * Indica qué tan difícil es completar los requisitos de la zona.
 * Afecta la cantidad de reward y el tipo de requisitos.
 * 
 * NIVELES:
 * - 'easy': Requisitos simples (ej: solo estar presente 5 min)
 * - 'medium': Requieren acción (ej: foto + compartir en redes)
 * - 'hard': Requieren esfuerzo (ej: completar ruta de 5km)
 */
export type ZoneDifficulty = 'easy' | 'medium' | 'hard';


/**
 * ============================================================================
 * EXTENSIÓN DEL TIPO AIRDROPZONE PARA UI
 * ============================================================================
 * 
 * Extiende AirdropZone con campos adicionales necesarios para la interfaz.
 * Se usa en componentes de frontend para mostrar información completa.
 * 
 * PROPÓSITO:
 * - Separar lógica de backend (AirdropZone) de presentación (AirdropZoneExtended)
 * - Incluir datos calculados como distancia del usuario
 * - Agregar información de display como nombre de marca
 * - Incluir configuración de UI como dificultad y requisitos
 * 
 * CUÁNDO USAR:
 * - En componentes React que muestran listas de zonas
 * - En el mapa para mostrar información detallada
 * - En dashboards con métricas calculadas
 * 
 * EJEMPLO DE USO:
 * const zone: AirdropZoneExtended = {
 *   // Todos los campos de AirdropZone +
 *   location: "Centro Histórico, Madrid",
 *   brand: "Nike", 
 *   reward: 150,
 *   currency: "BTM",
 *   status: "active",
 *   participants: 89,
 *   maxParticipants: 100,
 *   distance: 0.5, // km desde usuario
 *   requirements: ["Permanecer 10 min", "Foto del lugar"],
 *   difficulty: "easy"
 * }
 */
export interface AirdropZoneExtended extends AirdropZone {
  /** Nombre legible de la ubicación (ej: "Centro Histórico, Madrid") */
  location: string;
  
  /** Nombre de la marca (resuelto desde brandId) */
  brand: string;
  
  /** Cantidad de reward como número para cálculos (parseado desde amount) */
  reward: number;
  
  /** Símbolo de la moneda/token (ej: "BTM", "ETH", "USDC") */
  currency: string;
  
  /** Estado actual calculado de la zona */
  status: ZoneStatus;
  
  /** Número actual de participantes que han reclamado */
  participants: number;
  
  /** Límite máximo de participantes (0 = sin límite) */
  maxParticipants: number;
  
  /** Distancia desde la ubicación del usuario en kilómetros (opcional) */
  distance?: number;
  
  /** Lista de requisitos que debe cumplir el usuario */
  requirements: string[];
  
  /** Nivel de dificultad de los requisitos */
  difficulty: ZoneDifficulty;
}