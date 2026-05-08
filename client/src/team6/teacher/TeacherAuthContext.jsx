import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearTeacherSession,
  fetchMyProfile,
  hasTeacherSession,
  loginTeacher,
  logoutTeacher,
} from "./api";

const TeacherAuthContext = createContext(null);

export const TeacherAuthProvider = ({ children }) => {
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
      if (!hasTeacherSession()) {
        if (active) setReady(true);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        clearTeacherSession();
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
      await loginTeacher({ email, password });
      try {
        await refreshProfile();
      } catch (err) {
        const message = err?.message || "Профайл уншихад алдаа гарлаа";
        setError(message);
        throw err;
      }
    },
    [refreshProfile]
  );

  const logout = useCallback(async () => {
    await logoutTeacher();
    setUser(null);
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      ready,
      user,
      error,
      isAuthenticated: Boolean(user && hasTeacherSession()),
      login,
      logout,
      refreshProfile,
    }),
    [ready, user, error, login, logout, refreshProfile]
  );

  return <TeacherAuthContext.Provider value={value}>{children}</TeacherAuthContext.Provider>;
};

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext);
  if (!context) {
    throw new Error("useTeacherAuth must be used inside TeacherAuthProvider");
  }
  return context;
};
