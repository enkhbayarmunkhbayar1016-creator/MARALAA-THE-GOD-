export const BASE_URL = "https://todu.mn/bs/lms/v1";

// 1. ТОКЕН УНШИХ
function getToken() {
  const rawToken = localStorage.getItem("access_token");
  if (!rawToken) return "";
  const trimmed = String(rawToken).trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

// 2. ХЭРЭГЦЭЭГҮЙ ӨГӨГДӨЛ ЦЭВЭРЛЭХ (API-д current_user явуулахгүй байх)
function stripCurrentUser(value) {
  if (Array.isArray(value)) return value.map(stripCurrentUser);
  if (value && typeof value === "object") {
    return Object.entries(value).reduce((result, [key, entryValue]) => {
      if (key === "current_user") return result;
      result[key] = stripCurrentUser(entryValue);
      return result;
    }, {});
  }
  return value;
}

// 3. HEADER ҮҮСГЭХ
function createHeaders(hasBody, token = getToken()) {
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (hasBody) headers.set("Content-Type", "application/json");
  return headers;
}

async function parsePayload(response) {
  try { return await response.json(); } catch (e) { return null; }
}

export function extractItems(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items || payload.data || payload.results || [];
}

export function extractItem(payload) {
  if (!payload) return null;
  if (payload.data && !Array.isArray(payload.data)) return payload.data;
  return payload.item || payload.result || payload;
}

// 4. ҮНДСЭН FETCH ЛОГИК
export async function authFetch(path, init = {}) {
  const method = init.method || "GET";
  const body = init.body;
  const token = getToken();

  const headers = createHeaders(body !== undefined, token);
  const response = await fetch(`${BASE_URL}${path}`, { ...init, method, headers });

  if (response.status === 401 || response.status === 403) {
    console.warn("⚠️ Нэвтрэх эрхгүй эсвэл токен дууссан.");
  }
  return response;
}

// 5. УХААЛАГ REQUEST
async function request(method, path, data) {
  const sanitizedBody = data !== undefined ? JSON.stringify(stripCurrentUser(data)) : undefined;
  
  try {
    const response = await authFetch(path, { method, body: sanitizedBody });
    const payload = await parsePayload(response);

    if (path.includes("/token/email") && response.ok && payload) {
      const token = payload.access_token || payload.token;
      if (token) {
        localStorage.setItem("access_token", token);
        if (payload.refresh_token) localStorage.setItem("refresh_token", payload.refresh_token);
      }
    }

    if (!response.ok) {
      if (path.includes("/users/me")) return { id: 0, name: "Guest", role: "guest" };
      throw new Error(payload?.message || `Request failed: ${response.status}`);
    }

    return payload || (path.includes("/users/me") ? { id: 0 } : null);
  } catch (error) {
    if (path.includes("/users/me")) return { id: 0, name: "Guest" };
    throw error;
  }
}

const api = {
  get: (path) => request("GET", path),
  post: (path, data) => request("POST", path, data),
  put: (path, data) => request("PUT", path, data),
  delete: (path, data) => request("DELETE", path, data),
};

// -----------------------------------------------------------
// API ОБЪЕКТУУД
// -----------------------------------------------------------

export const userAPI = {
  login: (credentials) => api.post("/token/email", credentials),
  getMe: () => api.get("/users/me"), 
  getAll: () => api.get("/users"),
  getOne: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post("/users", userData),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getBySchool: (schoolId) => api.get(`/users?school_id=${schoolId}`),
};

export const schoolAPI = {
  getAll: () => api.get("/schools"),
  create: (schoolData) => api.post("/schools", schoolData),
  getOne: (id) => api.get(`/schools/${id}`),
  update: (id, data) => api.put(`/schools/${id}`, data),
  delete: (id) => api.delete(`/schools/${id}`),
};

export const categoryAPI = {
  getBySchool: (schoolId) => api.get(`/schools/${schoolId}/categories`),
  getOne: (id) => api.get(`/categories/${id}`),
};

export const courseAPI = {
  getAll: () => api.get("/courses"),
  getOne: (id) => api.get(`/courses/${id}`),
  getBySchool: (id) => api.get(`/schools/${id}/courses`),
  create: (schoolId, data) => api.post(`/schools/${schoolId}/courses`, data),
  // ЭНД PUT БОЛОН UPDATE-ИЙГ ИЖИЛ БОЛГОЛОО
  update: (id, data) => api.put(`/courses/${id}`, data),
  put: (id, data) => api.put(`/courses/${id}`, data), 
  delete: (id) => api.delete(`/courses/${id}`),
};

export const lessonAPI = {
  getAll: (courseId) => api.get(`/courses/${courseId}/lessons`),
  // ЭНЭ ФУНКЦ ТАНД ДУТУУ БАЙСАН:
  create: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
};

export const requestAPI = {
  getBySchool: (schoolId) => api.get(`/schools/${schoolId}/requests`),
  createBySchool: (schoolId, data) => api.post(`/schools/${schoolId}/requests`, data),
  approveSchoolRequest: (id) => api.post(`/school-requests/${id}/approve`, {}),
  rejectSchoolRequest: (id, data) => api.post(`/school-requests/${id}/reject`, data || {}),
};

export default api;