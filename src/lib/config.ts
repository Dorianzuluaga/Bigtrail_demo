// // src/lib/config.ts
// // export const API_BASE =
// //   import.meta.env.VITE_API_URL || "http://bigtrailmagazine.es:8008/api";
// // export default API_BASE;

// // src/lib/config.ts
// export const API_BASE =
//   import.meta.env.VITE_API_URL || "http://localhost:4000/api";
// export const API_BASE_URL = "https://bigtrailmagazine.es/api";
// export const BRAND_ID = "aedfeb8c-8a54-4b99-96b3-ac388a8156ac";
// export const CAMPAIGN_ID = "558fb0f4-a253-4184-a131-74f007a0e8944";

// // Opcional: toggle para activar / desactivar demo
// export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true" || true; // ponlo true ahora para demo
// src/lib/config.ts

// Modo demo siempre activo en esta versión
export const DEMO_MODE = true;

// URL fake para evitar llamadas reales
export const API_BASE = DEMO_MODE
  ? "https://fake-api-demo.com/api"
  : import.meta.env.VITE_API_URL;

// Fake data (id ficticios)
export const BRAND_ID = DEMO_MODE
  ? "demo-brand-123"
  : "aedfeb8c-8a54-4b99-96b3-ac388a8156ac";

export const CAMPAIGN_ID = DEMO_MODE
  ? "demo-campaign-456"
  : "558fb0f4-a253-4184-a131-74f007a0e8944";

export const API_BASE_URL = DEMO_MODE
  ? "https://fake-api-demo.com"
  : "https://bigtrailmagazine.es/api";
