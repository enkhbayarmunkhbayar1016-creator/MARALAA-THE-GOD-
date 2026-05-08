import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearAdminSession,
  fetchMyProfile,
  hasAdminSession,
  loginAdmin,
  logoutAdmin,
} from "./api";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const refreshProfile = useCallback(async () => {
    const profile = await fetchMyProfile();
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!hasAdminSession()) {
        if (active) setReady(true);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        clearAdminSession();
        if (active) setUser(null);
      } finally {
        if (active) setReady(true);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [refreshProfile]);

  const login = useCallback(
    async (email, password) => {
      setError("");
      await loginAdmin({ email, password });

      try {
        await refreshProfile();
      } catch (err) {
        const message = err?.message || "Профайл дуудах үед алдаа гарлаа";
        setError(message);
        throw err;
      }
    },
    [refreshProfile]
  );

  const logout = useCallback(async () => {
    await logoutAdmin();
    setUser(null);
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      ready,
      user,
      error,
      isAuthenticated: Boolean(user && hasAdminSession()),
      login,
      logout,
      refreshProfile,
    }),
    [ready, user, error, login, logout, refreshProfile]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return context;
};
