// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";

// 🔹 Importamos constantes de demo
import { API_BASE_URL, BRAND_ID, DEMO_MODE } from "../lib/config";

type User = {
  id: string;
  username?: string;
  email?: string;
  created_at?: string;
  role?: string;
  is_active?: boolean;
  wallet_id?: number;
  achievements?: any[];
};

type Brand = {
  id: string;
  name?: string;
  logo_url?: string;
  description?: string;
  website?: string;
  user_id?: string | null;
};

type AuthContextValue = {
  user: User | null;
  brand: Brand | null;
  loading: boolean;
  setToken: (token: string | null) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // -------------------------------------------------
  // FLUJO REAL (comentado para no perder nada mientras probamos demo) aqui trabajamos con token real
  // -------------------------------------------------
  /*
  const fetchUserAndBrand = async (token: string | null) => {
    console.log("fetchUserAndBrand ejecutado, token:", token);
    if (!token) return;

    setLoading(true);
    setUser(null);
    setBrand(null);

    try {
      const resMe = await fetch(`${API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!resMe.ok) throw new Error("No se pudo obtener el usuario");
      const me: User = await resMe.json();
      setUser(me);

      const resBrands = await fetch(`${API_BASE}/brands`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!resBrands.ok) throw new Error("No se pudieron obtener marcas");
      const brands: Brand[] = await resBrands.json();
      let myBrand: Brand | undefined = brands.find((b) => b.user_id === me.id);
      if (!myBrand) {
        myBrand = brands.find((b) => String(b.user_id) === String(me.id));
      }
      if (myBrand) setBrand(myBrand);
    } catch (err) {
      console.error("fetchUserAndBrand error:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login fallido");
    const data = await res.json();
    await setToken(data.token);
  };

  const setToken = async (token: string | null) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    await fetchUserAndBrand(token);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchUserAndBrand(token);
    else setLoading(false);
  }, []);
  */

  // -------------------------------------------------
  // NUEVO BLOQUE DEMO (usando IDs fijos de MOE)
  // -------------------------------------------------
  useEffect(() => {
    if (DEMO_MODE) {
      // Usuario y brand falsos para demo
      const demoUser: User = {
        id: "demo-user",
        username: "Demo",
        email: "demo@bigtrail.local",
        role: "brand_admin",
        is_active: true,
      };
      const demoBrand: Brand = {
        id: BRAND_ID,
        name: "Demo Brand",
        description: "Marca demo para pruebas",
        user_id: demoUser.id,
      };
      setUser(demoUser);
      setBrand(demoBrand);
      setLoading(false);
    }
  }, []);

  // setToken en demo solo resuelve vacío (para no romper llamadas)
  const setToken = async (_token: string | null) => {
    console.log("setToken llamado en DEMO, ignorado");
  };

  return (
    <AuthContext.Provider value={{ user, brand, loading, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
