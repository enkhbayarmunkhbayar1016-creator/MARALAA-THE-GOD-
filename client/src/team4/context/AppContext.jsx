import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { login as apiLogin, logout as apiLogout, apiGet, parseField } from "../utils/api";
import { STORAGE_KEYS, ROLES, SESSION_EXPIRED_EVENT } from "../utils/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    } catch {
      return null;
    }
  });

  const [school, setSchool] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOL));
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ROLE);
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    if (!user) return;

    apiGet("/users/me").catch(() => {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      setUser(null);
      setSchool(null);
      setRole(null);
      navigate("/team4/login", { replace: true });
    });
  }, []);

  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setSchool(null);
      setRole(null);
      navigate("/team4/login", { replace: true });
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    let timer = setTimeout(onIdle, IDLE_TIMEOUT_MS);

    function onIdle() {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      setUser(null);
      setSchool(null);
      setRole(null);
      navigate("/team4/login", { replace: true });
    }

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(onIdle, IDLE_TIMEOUT_MS);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user, navigate]);

  async function login(email, password) {
    localStorage.removeItem(STORAGE_KEYS.SCHOOL);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    setSchool(null);
    setRole(null);

    const me = await apiLogin(email, password);
    setUser(me);
    return me;
  }

  async function logout() {
    await apiLogout();
    setUser(null);
    setSchool(null);
    setRole(null);
  }

  async function refreshUser() {
    try {
      const me = await apiGet("/users/me");
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(me));
      setUser(me);
    } catch { /* ignore */ }
  }

  function selectSchool(schoolObj) {
    const parsedRole = parseField(schoolObj, "role");
    const roleId = parsedRole?.id ?? null;           // e.g. 10, 20, or 30
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(schoolObj));
    if (roleId != null) localStorage.setItem(STORAGE_KEYS.ROLE, roleId);
    setSchool(schoolObj);
    setRole(roleId);
  }

  const isAdmin   = role === ROLES.ADMIN;
  const isTeacher = role === ROLES.TEACHER;
  const isStudent = role === ROLES.STUDENT;

  return (
    <AuthContext.Provider
      value={{ user, school, role, isAdmin, isTeacher, isStudent, login, logout, selectSchool, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function ProtectedRoute({ children, role: requiredRole, skipSchoolCheck = false }) {
  const { user, role, school } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/team4/login" state={{ from: location }} replace />;
  }

  if (!skipSchoolCheck && !school) {
    return <Navigate to="/team4/schools/current" replace />;
  }

  if (requiredRole != null) {
    const allowed = Array.isArray(requiredRole)
      ? requiredRole.includes(role)
      : role === requiredRole;

    if (!allowed) {
      return <Navigate to="/team4/" replace />;
    }
  }

  return children;
}
