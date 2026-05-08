import { fullName, toId, toItems, toNumber } from "./utils";

const BASE_URL = "https://todu.mn/bs/lms/v1";
const ACCESS_TOKEN_KEY = "team5_admin_access_token";
const REFRESH_TOKEN_KEY = "team5_admin_refresh_token";

const safeJson = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const toErrorMessage = (payload, fallback) => {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  return payload.message || payload.error || payload.title || fallback;
};

const buildError = (response, payload) => {
  const fallback = `HTTP ${response.status}`;
  return new Error(toErrorMessage(payload, fallback));
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const hasAdminSession = () => Boolean(getAccessToken());

export const saveAdminTokens = (payload) => {
  if (payload?.access_token) localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);
  if (payload?.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token);
};

export const clearAdminSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const refreshAccessToken = async () => {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error("refresh token олдсонгүй");

  const response = await fetch(`${BASE_URL}/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  const payload = await safeJson(response);
  if (!response.ok) throw buildError(response, payload);

  saveAdminTokens(payload);
  return payload;
};

export const apiRequest = async (
  path,
  { method = "GET", data, auth = false, retry = true } = {}
) => {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getAccessToken();
    if (!token) throw new Error("Нэвтрэх токен олдсонгүй");
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  const payload = await safeJson(response);
  if (response.ok) return payload;

  if (auth && retry && [401, 403].includes(response.status) && getRefreshToken()) {
    await refreshAccessToken();
    return apiRequest(path, { method, data, auth, retry: false });
  }

  throw buildError(response, payload);
};

const normalizeProfile = (raw = {}) => ({
  id: toId(raw.id),
  username: raw.username || "",
  email: raw.email || "",
  firstName: raw.first_name || "",
  lastName: raw.last_name || raw.family_name || "",
  phone: raw.phone || "",
  schools: raw["{}schools"] || "",
  picture: raw.picture || "",
  displayName: fullName(raw),
  raw,
});

const normalizeRole = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || "-",
  priority: toNumber(raw.priority, 0),
  createdOn: raw.created_on || "",
  raw,
});

const normalizeSchool = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || "Сургууль",
  picture: raw.picture || "",
  priority: toNumber(raw.priority, 0),
  createdOn: raw.created_on || "",
  approvedOn: raw.approved_on || "",
  raw,
});

const normalizeUser = (raw = {}) => ({
  id: toId(raw.id),
  username: raw.username || "",
  email: raw.email || "",
  firstName: raw.first_name || "",
  lastName: raw.last_name || raw.family_name || "",
  phone: raw.phone || "",
  isActive: toNumber(raw.is_active, 0) === 1,
  schools: raw["{}schools"] || "",
  picture: raw.picture || "",
  displayName: fullName(raw),
  raw,
});

const normalizeCourse = (raw = {}) => ({
  id: toId(raw.id),
  schoolId: toId(raw.school_id),
  categoryId: toId(raw.category_id),
  name: raw.name || "Хичээл",
  description: raw.description || "",
  credits: toNumber(raw.credits, 0),
  price: toNumber(raw.price, 0),
  startOn: raw.start_on || "",
  endOn: raw.end_on || "",
  createdOn: raw.created_on || "",
  raw,
});

const normalizeTeacher = (raw = {}) => ({
  id: toId(raw.id ?? raw.user_id),
  userId: toId(raw.user_id ?? raw.id),
  email: raw.email || "",
  firstName: raw.first_name || "",
  lastName: raw.last_name || raw.family_name || "",
  picture: raw.picture || "",
  displayName: fullName(raw),
  raw,
});

const normalizeCourseUser = (raw = {}) => ({
  id: toId(raw.user_id ?? raw.id),
  userId: toId(raw.user_id ?? raw.id),
  email: raw.email || "",
  firstName: raw.first_name || "",
  lastName: raw.last_name || raw.family_name || "",
  picture: raw.picture || "",
  displayName: raw["{}user"] || fullName(raw) || raw.email || String(raw.user_id || raw.id || ""),
  raw,
});

const normalizeStudent = (raw = {}) => ({
  id: toId(raw.id ?? raw.user_id),
  userId: toId(raw.user_id ?? raw.id),
  email: raw.email || "",
  firstName: raw.first_name || "",
  lastName: raw.last_name || raw.family_name || "",
  picture: raw.picture || "",
  displayName: fullName(raw),
  raw,
});

const normalizeExam = (raw = {}) => ({
  id: toId(raw.id),
  courseId: toId(raw.course_id),
  name: raw.name || "Шалгалт",
  openOn: raw.open_on || "",
  closeOn: raw.close_on || "",
  totalPoint: toNumber(raw.total_point, 0),
  gradePoint: toNumber(raw.grade_point, 0),
  raw,
});

export const loginAdmin = async ({ email, password }) => {
  const payload = await apiRequest("/token/email", {
    method: "POST",
    data: {
      email: String(email || "").trim(),
      password: String(password || ""),
      push_token: "",
    },
  });

  saveAdminTokens(payload);
  return payload;
};

export const logoutAdmin = async () => {
  try {
    await apiRequest("/token", {
      method: "DELETE",
      auth: true,
      data: {},
    });
  } finally {
    clearAdminSession();
  }
};

export const fetchMyProfile = async () => {
  const payload = await apiRequest("/users/me", { auth: true });
  return normalizeProfile(payload || {});
};

export const updateMyProfile = async ({ firstName, lastName, phone, picture }) => {
  await apiRequest("/users/me", {
    method: "PUT",
    auth: true,
    data: {
      first_name: firstName || "",
      last_name: lastName || "",
      family_name: lastName || "",
      phone: phone || "",
      picture: picture || "",
    },
  });
};

export const updateMyPassword = async ({ currentPassword, newPassword }) => {
  await apiRequest("/users/me/password", {
    method: "PUT",
    auth: true,
    data: {
      password: currentPassword || "",
      new_password: newPassword || "",
    },
  });
};

export const fetchRoles = async () => {
  const payload = await apiRequest("/roles", { auth: true });
  return toItems(payload).map(normalizeRole);
};

export const createRole = async ({ name, priority = 0 }) => {
  await apiRequest("/roles", {
    method: "POST",
    auth: true,
    data: {
      name: name || "",
      priority: String(priority || 0),
    },
  });
};

export const updateRole = async (roleId, { name, priority = 0 }) => {
  await apiRequest(`/roles/${roleId}`, {
    method: "PUT",
    auth: true,
    data: {
      name: name || "",
      priority: String(priority || 0),
    },
  });
};

export const deleteRole = async (roleId) => {
  await apiRequest(`/roles/${roleId}`, {
    method: "DELETE",
    auth: true,
    data: {},
  });
};

export const fetchSchools = async () => {
  const payload = await apiRequest("/schools", { auth: true });
  return toItems(payload).map(normalizeSchool);
};

export const fetchUsers = async (schoolId = "") => {
  const query = schoolId ? `?school_id=${encodeURIComponent(schoolId)}` : "";
  const payload = await apiRequest(`/users${query}`, { auth: true });
  return toItems(payload).map(normalizeUser);
};

export const fetchSchoolUsers = async (schoolId) => {
  const payload = await apiRequest(`/schools/${schoolId}/users`, { auth: true });
  return toItems(payload).map(normalizeUser);
};

export const searchSchoolUsersByEmail = async (schoolId, email) => {
  const keyword = String(email || "").trim().toLowerCase();
  if (!keyword) return [];

  const users = schoolId ? await fetchSchoolUsers(schoolId) : await fetchUsers();

  return users.filter((user) => {
    const value = String(user.email || user.username || "").toLowerCase();
    return value.includes(keyword);
  });
};

export const createUser = async ({ email, firstName, lastName, phone, password }) => {
  await apiRequest("/users", {
    method: "POST",
    auth: true,
    data: {
      email: email || "",
      first_name: firstName || "",
      last_name: lastName || "",
      family_name: lastName || "",
      phone: phone || "",
      password: password || "",
    },
  });
};

export const updateUser = async (userId, { email, firstName, lastName, phone, picture }) => {
  await apiRequest(`/users/${userId}`, {
    method: "PUT",
    auth: true,
    data: {
      email: email || "",
      first_name: firstName || "",
      last_name: lastName || "",
      family_name: lastName || "",
      phone: phone || "",
      picture: picture || "",
    },
  });
};

export const deleteUser = async (userId) => {
  await apiRequest(`/users/${userId}`, {
    method: "DELETE",
    auth: true,
    data: {},
  });
};

export const fetchSchoolCourses = async (schoolId) => {
  const payload = await apiRequest(`/schools/${schoolId}/courses`, { auth: true });
  return toItems(payload).map(normalizeCourse);
};

export const createSchoolCourse = async (schoolId, payload) => {
  await apiRequest(`/schools/${schoolId}/courses`, {
    method: "POST",
    auth: true,
    data: {
      name: payload.name || "",
      description: payload.description || "",
      category_id: payload.categoryId || "",
      cloned_course_id: payload.clonedCourseId || "",
      picture: payload.picture || "",
      start_on: payload.startOn || "",
      end_on: payload.endOn || "",
      priority: String(payload.priority || 0),
    },
  });
};

export const updateCourse = async (courseId, payload) => {
  await apiRequest(`/courses/${courseId}`, {
    method: "PUT",
    auth: true,
    data: {
      name: payload.name || "",
      description: payload.description || "",
      category_id: payload.categoryId || "",
      cloned_course_id: payload.clonedCourseId || "",
      picture: payload.picture || "",
      school_id: payload.schoolId || "",
      start_on: payload.startOn || "",
      end_on: payload.endOn || "",
    },
  });
};

export const deleteCourse = async (courseId) => {
  await apiRequest(`/courses/${courseId}`, {
    method: "DELETE",
    auth: true,
    data: {},
  });
};

export const fetchCourseTeachers = async (courseId) => {
  try {
    const payload = await apiRequest(`/courses/${courseId}/teachers`, { auth: true });
    return toItems(payload).map(normalizeTeacher);
  } catch {
    const payload = await apiRequest(`/courses/${courseId}/users`, { auth: true });
    return toItems(payload).map(normalizeCourseUser);
  }
};

export const fetchCourseStudents = async (courseId) => {
  if (!courseId) throw new Error("courseId байхгүй байна");
  const payload = await apiRequest(`/courses/${courseId}/students`, { auth: true });
  return toItems(payload).map(normalizeStudent);
};

export const addCourseTeacher = async (courseId, userId) => {
  const normalizedCourseId = String(courseId || "").trim();
  const normalizedUserId = String(userId || "").trim();

  if (!normalizedCourseId) throw new Error("courseId байхгүй байна");
  if (!normalizedUserId) throw new Error("userId байхгүй байна");

  try {
    await apiRequest(`/courses/${normalizedCourseId}/teachers`, {
      method: "POST",
      auth: true,
      data: {
        user_id: normalizedUserId,
        teacher_id: normalizedUserId,
        teacher_user_id: normalizedUserId,
      },
    });
  } catch (primaryErr) {
    console.warn("Primary teacher endpoint failed, trying fallback:", primaryErr);
    try {
      await apiRequest(`/courses/${normalizedCourseId}/users`, {
        method: "POST",
        auth: true,
        data: {
          user_id: normalizedUserId,
          group_id: "",
        },
      });
    } catch (fallbackErr) {
      throw new Error(
        fallbackErr?.message || primaryErr?.message || "Багш нэмэх үед алдаа гарлаа"
      );
    }
  }
};

export const addCourseStudent = async (courseId, userId, groupId = "") => {
  const normalizedCourseId = String(courseId || "").trim();
  const normalizedUserId = String(userId || "").trim();
  const normalizedGroupId = String(groupId || "").trim();

  if (!normalizedCourseId) throw new Error("courseId байхгүй байна");
  if (!normalizedUserId) throw new Error("userId байхгүй байна");

  await apiRequest(`/courses/${normalizedCourseId}/users`, {
    method: "POST",
    auth: true,
    data: {
      user_id: normalizedUserId,
      ...(normalizedGroupId ? { group_id: normalizedGroupId } : {}),
    },
  });
};

export const removeCourseTeacher = async (courseId, teacherId) => {
  const normalizedCourseId = String(courseId || "").trim();
  const normalizedTeacherId = String(teacherId || "").trim();

  if (!normalizedCourseId) throw new Error("courseId байхгүй байна");
  if (!normalizedTeacherId) throw new Error("teacherId байхгүй байна");

  try {
    await apiRequest(`/courses/${normalizedCourseId}/teachers/${normalizedTeacherId}`, {
      method: "DELETE",
      auth: true,
      data: {},
    });
  } catch (primaryErr) {
    console.warn("Primary teacher delete endpoint failed, trying fallback:", primaryErr);
    try {
      await apiRequest(`/courses/${normalizedCourseId}/users/${normalizedTeacherId}`, {
        method: "DELETE",
        auth: true,
        data: {},
      });
    } catch (fallbackErr) {
      throw new Error(
        fallbackErr?.message || primaryErr?.message || "Багш хасах үед алдаа гарлаа"
      );
    }
  }
};

export const removeCourseStudent = async (courseId, userId) => {
  const normalizedCourseId = String(courseId || "").trim();
  const normalizedUserId = String(userId || "").trim();

  if (!normalizedCourseId) throw new Error("courseId байхгүй байна");
  if (!normalizedUserId) throw new Error("userId байхгүй байна");

  await apiRequest(`/courses/${normalizedCourseId}/users/${normalizedUserId}`, {
    method: "DELETE",
    auth: true,
    data: {},
  });
};

export const fetchSchoolExams = async (schoolId) => {
  const payload = await apiRequest(`/schools/${schoolId}/exams`, { auth: true });
  return toItems(payload).map(normalizeExam);
};

export const fetchSchoolRequests = async (schoolId) => {
  const payload = await apiRequest(`/schools/${schoolId}/requests`, { auth: true });
  return toItems(payload);
};
