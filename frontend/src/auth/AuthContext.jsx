import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, onAuthChange, setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((payload) => {
      setUser(payload ? payload.user : null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .refresh()
      .then((token) => {
        if (cancelled || !token) return;
        return api.get("/auth/me").then((data) => setUser(data.user));
      })
      .catch(() => {
        /* no existing session — stay logged out */
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const data = await api.post("/auth/register", { name, email, password, role });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* cookie may already be gone — clear local state regardless */
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };
