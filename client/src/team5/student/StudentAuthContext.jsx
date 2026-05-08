import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStudentSession,
  fetchMyProfile,
  hasStudentSession,
  loginStudent,
  logoutStudent,
} from "./api";

const StudentAuthContext = createContext(null);

export const StudentAuthProvider = ({ children }) => {
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
      if (!hasStudentSession()) {
        if (active) setReady(true);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        clearStudentSession();
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
    async (identity, password) => {
      setError("");
      await loginStudent({ identity, password });

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
    await logoutStudent();
    setUser(null);
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      ready,
      user,
      error,
      isAuthenticated: Boolean(user && hasStudentSession()),
      login,
      logout,
      refreshProfile,
    }),
    [ready, user, error, login, logout, refreshProfile]
  );

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>;
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error("useStudentAuth must be used inside StudentAuthProvider");
  }
  return context;
};
