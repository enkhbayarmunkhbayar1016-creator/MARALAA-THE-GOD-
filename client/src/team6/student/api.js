import { fullName, parseJsonField, toId, toItems, toNumber } from "./utils";

const BASE_URL = "https://todu.mn/bs/lms/v1";
const ACCESS_TOKEN_KEY = "team5_student_access_token";
const REFRESH_TOKEN_KEY = "team5_student_refresh_token";

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

export const hasStudentSession = () => Boolean(getAccessToken());

export const saveStudentTokens = (payload) => {
  if (payload?.access_token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);
  }

  if (payload?.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token);
  }
};

export const clearStudentSession = () => {
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

  if (!response.ok) {
    throw buildError(response, payload);
  }

  saveStudentTokens(payload);
  return payload;
};

export const apiRequest = async (
  path,
  { method = "GET", data, auth = false, retry = true, isText = false } = {}
) => {
  const headers = {
    "Content-Type": "application/json",
  };

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

  const payload = isText ? await response.text() : await safeJson(response);

  if (response.ok) {
    return payload;
  }

  if (auth && retry && [401, 403].includes(response.status) && getRefreshToken()) {
    await refreshAccessToken();

    return apiRequest(path, {
      method,
      data,
      auth,
      retry: false,
      isText,
    });
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
  picture: raw.picture || "",
  schools: raw["{}schools"] || "",
  displayName: fullName(raw),
  raw,
});

const normalizeSchool = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || "Сургууль",
  picture: raw.picture || "",
  priority: toNumber(raw.priority, 0),
  raw,
});

const normalizeExam = (raw = {}) => ({
  id: toId(raw.id ?? raw.exam_id),
  courseId: toId(raw.course_id ?? raw.courseId ?? raw.COURSE_ID),
  courseName: raw["{}course"] || raw.course_name || "",
  name: raw.name || "Шалгалт",
  description: raw.description || "",
  duration: toNumber(raw.duration, 0),
  maxAttempt: toNumber(raw.max_attempt, 1),
  totalPoint: toNumber(raw.total_point, 0),
  gradePoint: toNumber(raw.grade_point, 0),
  openOn: raw.open_on || "",
  closeOn: raw.close_on || "",
  endOn: raw.end_on || "",
  raw,
});

const normalizeAttempt = (raw = {}) => ({
  id: toId(raw.id),
  examId: toId(raw.exam_id),
  attemptNo: toNumber(raw.attempt_no, 0),
  duration: toNumber(raw.duration, 0),
  totalPoint: toNumber(raw.total_point, 0),
  gradePoint: toNumber(raw.grade_point, 0),
  startOn: raw.start_on || "",
  variantId: toId(raw.variant_id),
  raw,
});

const normalizeQuestion = (raw = {}) => {
  const parsedOptions = parseJsonField(raw.option, []);
  const parsedAnswer = parseJsonField(raw.answer, raw.answer ?? "");

  return {
    id: toId(raw.id),
    question: raw.question || "",
    description: raw.description || "",
    point: toNumber(raw.point, 0),
    typeId: toId(raw.type_id),
    options: Array.isArray(parsedOptions) ? parsedOptions : [],
    answer: parsedAnswer,
    children: parseJsonField(raw["{}children"], []),
    raw,
  };
};

const normalizeCourse = (raw = {}) => ({
  id: toId(raw.course_id ?? raw.id),
  courseId: toId(raw.course_id ?? raw.id),
  name: raw["{}course"] || raw.name || "Хичээл",
  groupId: toId(raw.group_id),
  groupName: raw["{}group"] || "",
  paymentAmount: toNumber(raw.payment_amount, 0),
  paymentStatusId: toId(raw.payment_status_id),
  raw,
});

const normalizeLesson = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || "Хичээлийн агуулга",
  content: raw.content || "",
  typeId: toId(raw.type_id),
  typeName: raw["{}type"] || "",
  hasSubmission: toNumber(raw.has_submission, 0) === 1,
  point: toNumber(raw.point, 0),
  openOn: raw.open_on || "",
  closeOn: raw.close_on || "",
  endOn: raw.end_on || "",
  courseId: toId(raw.course_id),
  raw,
});

const normalizeSubmission = (raw = {}) => ({
  id: toId(raw.id),
  lessonId: toId(raw.lesson_id),
  userId: toId(raw.user_id),
  gradePoint:
    raw.grade_point === null || raw.grade_point === undefined
      ? null
      : toNumber(raw.grade_point, 0),
  content: raw.content || "",
  createdOn: raw.created_on || "",
  userName: raw["{}user"] || "",
  raw,
});

const normalizeAttendance = (raw = {}) => ({
  id: toId(raw.id),
  lessonId: toId(raw.lesson_id),
  userId: toId(raw.user_id),
  typeId: toId(raw.type_id),
  createdOn: raw.created_on || "",
  raw,
});

const normalizeAttendancePoint = (raw = {}) => ({
  id: toId(raw.id),
  lessonId: toId(raw.lesson_id),
  userId: toId(raw.user_id),
  typeId: toId(raw.type_id),
  lessonTypeId: toId(raw.lesson_type_id),
  point: toNumber(raw.point, 0),
  raw,
});

const normalizeAttendanceType = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || "Төрөл",
  priority: toNumber(raw.priority, 0),
  raw,
});

const normalizeTimetable = (raw = {}) => ({
  id: toId(raw.id),
  courseId: toId(raw.course_id),
  timetableId: toId(raw.timetable_id),
  userId: toId(raw.user_id),
  timetable: raw["{}timetable"] || "",
  raw,
});

const normalizeTeacher = (raw = {}) => ({
  id: toId(raw.id),
  email: raw.email || "",
  firstName: raw.first_name || "",
  lastName: raw.last_name || raw.family_name || "",
  displayName: fullName(raw),
  picture: raw.picture || "",
  raw,
});

const normalizeSchoolRequest = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || "",
  statusId: toId(raw.status_id),
  statusName: raw["{}status"] || "",
  rejectionReason: raw.rejection_reason || "",
  createdOn: raw.created_on || "",
  schoolId: toId(raw.school_id),
  raw,
});

const normalizeLoginIdentity = (value) => String(value || "").trim();

export const loginStudent = async ({ identity, password }) => {
  const normalizedIdentity = normalizeLoginIdentity(identity);

  const candidates = [normalizedIdentity];

  if (normalizedIdentity && !normalizedIdentity.includes("@")) {
    candidates.push(`${normalizedIdentity}@student.edu.mn`);
  }

  let lastError;

  for (const email of candidates) {
    try {
      const payload = await apiRequest("/token/email", {
        method: "POST",
        data: {
          email,
          password: String(password || ""),
          push_token: "",
        },
      });

      saveStudentTokens(payload);
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Нэвтрэхэд алдаа гарлаа");
};

export const logoutStudent = async () => {
  try {
    await apiRequest("/token", {
      method: "DELETE",
      auth: true,
      data: {},
    });
  } finally {
    clearStudentSession();
  }
};

export const fetchMyProfile = async () => {
  const payload = await apiRequest("/users/me", {
    method: "GET",
    auth: true,
  });

  return normalizeProfile(payload || {});
};

export const updateMyProfile = async ({ firstName, lastName, phone, picture }) => {
  return apiRequest("/users/me", {
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
  return apiRequest("/users/me/password", {
    method: "PUT",
    auth: true,
    data: {
      password: currentPassword || "",
      new_password: newPassword || "",
    },
  });
};

/* ===================== EXAMS ===================== */

export const fetchMyExams = async () => {
  const payload = await apiRequest("/users/me/exams", {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeExam);
};

export const fetchExams = async () => {
  const payload = await apiRequest("/exams", {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeExam);
};

export const fetchCourseExams = async (courseId) => {
  if (!courseId) throw new Error("courseId байхгүй байна");

  const payload = await apiRequest(`/courses/${courseId}/exams`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeExam);
};

export const fetchExamDetail = async (examId) => {
  if (!examId) throw new Error("examId байхгүй байна");

  const payload = await apiRequest(`/exams/${examId}`, {
    method: "GET",
    auth: true,
  });

  return normalizeExam(payload || {});
};

export const fetchStudentExamCatalog = async () => {
  return fetchMyExams();
};

export const fetchMyExamAttempt = async (examId) => {
  if (!examId) throw new Error("examId байхгүй байна");

  const payload = await apiRequest(`/users/me/exams/${examId}`, {
    method: "GET",
    auth: true,
  });

  return normalizeAttempt(payload || {});
};

export const startMyExam = async (examId) => {
  if (!examId) throw new Error("examId байхгүй байна");

  return apiRequest(`/users/me/exams/${examId}`, {
    method: "POST",
    auth: true,
    data: {},
  });
};

export const finishMyExam = async (examId) => {
  if (!examId) throw new Error("examId байхгүй байна");

  return apiRequest(`/users/me/exams/${examId}`, {
    method: "PUT",
    auth: true,
    data: {
      body_text: "finish",
    },
  });
};

export const fetchMyExamQuestions = async (examId) => {
  if (!examId) throw new Error("examId байхгүй байна");

  const payload = await apiRequest(`/users/me/exams/${examId}/questions`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeQuestion);
};

export const saveMyExamAnswer = async (examId, { id, answer }) => {
  if (!examId) throw new Error("examId байхгүй байна");
  if (!id) throw new Error("question id байхгүй байна");

  return apiRequest(`/users/me/exams/${examId}/questions`, {
    method: "PUT",
    auth: true,
    data: {
      id: String(id),
      answer: typeof answer === "string" ? answer : JSON.stringify(answer),
    },
  });
};

/* ===================== COURSES ===================== */

export const fetchEnrolledCourses = async (userId) => {
  if (!userId) throw new Error("userId байхгүй байна");

  const payload = await apiRequest(`/users/${userId}/courses/enrolled`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeCourse);
};

export const fetchUserExams = async (userId) => {
  if (!userId) throw new Error("userId байхгүй байна");

  const payload = await apiRequest(`/users/${userId}/exams`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeExam);
};

export const fetchMySchools = async (userId) => {
  if (!userId) throw new Error("userId байхгүй байна");

  const payload = await apiRequest(`/users/${userId}/schools`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeSchool);
};

export const fetchCourseLessons = async (courseId) => {
  if (!courseId) throw new Error("courseId байхгүй байна");

  const payload = await apiRequest(`/courses/${courseId}/lessons`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeLesson);
};

export const fetchLessonSubmissions = async (lessonId) => {
  if (!lessonId) throw new Error("lessonId байхгүй байна");

  const payload = await apiRequest(`/lessons/${lessonId}/submissions`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeSubmission);
};

export const createLessonSubmission = async (
  lessonId,
  { content, userId = "", parentId = "", siblingId = "" }
) => {
  if (!lessonId) throw new Error("lessonId байхгүй байна");

  return apiRequest(`/lessons/${lessonId}/submissions`, {
    method: "POST",
    auth: true,
    data: {
      content: content || "",
      user_id: userId ? String(userId) : "",
      parent_id: parentId ? String(parentId) : "",
      sibling_id: siblingId ? String(siblingId) : "",
    },
  });
};

/* ===================== ATTENDANCE / GRADEBOOK ===================== */

export const fetchCourseAttendances = async (courseId) => {
  if (!courseId) throw new Error("courseId байхгүй байна");

  const payload = await apiRequest(`/courses/${courseId}/attendances`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeAttendance);
};

export const fetchCourseGradebookAttendances = async (courseId) => {
  if (!courseId) throw new Error("courseId байхгүй байна");

  const payload = await apiRequest(`/courses/${courseId}/gradebook/attendances`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeAttendancePoint);
};

export const fetchCourseGradebook = async (courseId) => {
  if (!courseId) throw new Error("courseId байхгүй байна");

  const payload = await apiRequest(`/courses/${courseId}/gradebook`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload);
};

export const fetchAttendanceTypes = async () => {
  const payload = await apiRequest("/attendance-types", {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeAttendanceType);
};

/* ===================== TIMETABLE / TEACHERS ===================== */

export const fetchCourseTimetablesMy = async (courseId) => {
  if (!courseId) throw new Error("courseId байхгүй байна");

  const payload = await apiRequest(`/courses/${courseId}/timetables/my`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeTimetable);
};

export const fetchCourseTeachers = async (courseId) => {
  if (!courseId) throw new Error("courseId байхгүй байна");

  const payload = await apiRequest(`/courses/${courseId}/teachers`, {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeTeacher);
};

/* ===================== SCHOOL REQUESTS ===================== */

export const fetchSchoolRequests = async () => {
  const payload = await apiRequest("/school-requests", {
    method: "GET",
    auth: true,
  });

  return toItems(payload).map(normalizeSchoolRequest);
};

export const createSchoolRequest = async ({ name, picture = "", parentId = "" }) => {
  return apiRequest("/school-requests", {
    method: "POST",
    auth: true,
    data: {
      name: name || "",
      picture,
      parent_id: parentId ? String(parentId) : "",
    },
  });
};