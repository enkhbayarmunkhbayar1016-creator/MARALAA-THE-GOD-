import { STORAGE_KEYS, SESSION_EXPIRED_EVENT } from "./constants";

const BASE_URL = "https://todu.mn/bs/lms/v1";


export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
  } catch {
    return null;
  }
}

export function getStoredUserId() {
  const user = getStoredUser();

  return (
    user?.id ??
    user?.user_id ??
    user?.USER_ID ??
    user?.userId ??
    user?.data?.id ??
    user?.data?.user_id ??
    user?.item?.id ??
    user?.item?.user_id ??
    null
  );
}

function clearSession() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function parseField(obj, key) {
  const raw = obj?.[`{}${key}`] ?? obj?.[key];
  if (raw == null) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return raw;
  }
}

let _refreshing = null; 

async function refreshToken() {
  const rt = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!rt) return false;

  try {
    const res = await fetch(`${BASE_URL}/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (!data.access_token) return false;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    }
    return true;
  } catch {
    return false;
  }
}


async function request(method, path, body, isRetry = false) {
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Token expired — attempt one silent refresh then retry
  if (res.status === 401 && !isRetry) {
    if (!_refreshing) _refreshing = refreshToken();
    const ok = await _refreshing;
    _refreshing = null;

    if (ok) return request(method, path, body, true);

    // Refresh also failed — end the session
    clearSession();
    throw new Error("Сесс дууссан. Дахин нэвтэрнэ үү.");
  }

  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

if (!res.ok) {
  console.error("API ERROR:", {
    method,
    path,
    status: res.status,
    requestBody: body,
    response: data || text,
  });

  throw new Error(
    data?.message ||
    data?.error ||
    data?.detail ||
    data?.title ||
    text ||
    `HTTP ${res.status}`
  );
}

  return data;
}

// Public API helpers

export const apiGet    = (path)        => request("GET",    path);
export const apiPost   = (path, body)  => request("POST",   path, body);
export const apiPut    = (path, body)  => request("PUT",    path, body);
export const apiDelete = (path, body)  => request("DELETE", path, body);

export function withCurrentUser(body = {}) {
  const currentUser = getStoredUserId();

  return {
    ...body,
    current_user: String(currentUser),
  };
}


async function _processAuth(data, email) {
  const token = data.token ?? data.access_token ?? data.access ?? null;
  if (!token) throw new Error("Token олдсонгүй");

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  if (data.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
  }

  let me;
  try {
    me = await apiGet("/users/me");
  } catch {
    me = { email };
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(me));
  return me;
}

export async function login(email, password) {
  const data = await apiPost("/token/email", { email, password, push_token: "" });
  if (!data) throw new Error("Хоосон хариу ирлээ");
  if (data.error || data.message) {
    throw new Error(data.message || data.error || "Нэвтрэлт амжилтгүй.");
  }
  return _processAuth(data, email);
}

export async function otpLogin(email, code) {
  const data = await apiPost("/otp/email/login", { email, code, push_token: "" });
  if (!data) throw new Error("Хоосон хариу ирлээ");
  if (data.error || data.message) {
    throw new Error(data.message || data.error || "Баталгаажуулалт амжилтгүй.");
  }
  return _processAuth(data, email);
}

export async function logout() {
  const userId = getStoredUserId();
  try {
    await apiDelete("/token", { current_user: userId });
  } catch {
  }
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
