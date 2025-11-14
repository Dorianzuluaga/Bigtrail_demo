// src/hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Importamos config para fallback demo
import { BRAND_ID, DEMO_MODE } from "../lib/config";

// -------------------------------------------------
// HOOK REAL (comentado para no perder nada)
// -------------------------------------------------
/*
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
*/

// -------------------------------------------------
// HOOK DEMO (extiende el real con fallback brandId)
// -------------------------------------------------
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");

  const brandId = ctx.brand?.id ?? (DEMO_MODE ? BRAND_ID : null);

  return {
    ...ctx,
    brandId,
  };
};
