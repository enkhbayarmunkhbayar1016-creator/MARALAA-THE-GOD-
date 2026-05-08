import { fullName, parseJsonField, toId, toItems, toNumber } from "./utils";

const BASE_URL = "https://todu.mn/bs/lms/v1";
const ACCESS_TOKEN_KEY = "team5_teacher_access_token";
const REFRESH_TOKEN_KEY = "team5_teacher_refresh_token";

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

export const hasTeacherSession = () => Boolean(getAccessToken());

export const saveTeacherTokens = (data) => {
  if (data?.access_token) localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  if (data?.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
};

export const clearTeacherSession = () => {
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
  saveTeacherTokens(payload);
  return payload;
};

export const apiRequest = async (
  path,
  { method = "GET", data, auth = false, retry = true, isText = false } = {}
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

  const payload = isText ? await response.text() : await safeJson(response);
  if (response.ok) return payload;

  if (auth && retry && [401, 403].includes(response.status) && getRefreshToken()) {
    await refreshAccessToken();
    return apiRequest(path, { method, data, auth, retry: false, isText });
  }

  throw buildError(response, payload);
};

const normalizeProfile = (raw = {}) => ({
  id: toId(raw.id),
  email: raw.email || raw.username || "",
  firstName: raw.first_name || "",
  lastName: raw.last_name || raw.family_name || "",
  phone: raw.phone || "",
  picture: raw.picture || "",
  schoolNames: raw["{}schools"] || "",
  displayName: fullName(raw),
  raw,
});

const normalizeCourse = (raw = {}) => ({
  id: toId(raw.id ?? raw.course_id),
  name: raw.name || raw.title || raw["{}course"] || "Хичээл",
  description: raw.description || "",
  startOn: raw.start_on || "",
  endOn: raw.end_on || "",
  raw,
});

const normalizeExam = (raw = {}) => ({
  id: toId(raw.id ?? raw.exam_id),
  name: raw.name || "Шалгалт",
  description: raw.description || "",
  courseId: toId(raw.course_id ?? raw.courseId ?? raw.COURSE_ID),
  courseName: raw["{}course"] || raw.course_name || "",
  duration: toNumber(raw.duration, 0),
  maxAttempt: toNumber(raw.max_attempt, 1),
  totalPoint: toNumber(raw.total_point, 0),
  gradePoint: toNumber(raw.grade_point, 0),
  openOn: raw.open_on || "",
  closeOn: raw.close_on || "",
  endOn: raw.end_on || "",
  raw,
});

const normalizeQuestionType = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || `Төрөл ${raw.id || ""}`,
  priority: toNumber(raw.priority, 0),
  raw,
});

const normalizeQuestionLevel = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || `Түвшин ${raw.id || ""}`,
  priority: toNumber(raw.priority, 0),
  raw,
});

const normalizeQuestion = (raw = {}) => {
  const options = parseJsonField(raw.option, []);
  const answer = parseJsonField(raw.answer, raw.answer ?? "");

  return {
    id: toId(raw.id),
    courseId: toId(raw.course_id),
    lessonId: toId(raw.lesson_id),
    levelId: toId(raw.level_id),
    typeId: toId(raw.type_id),
    levelName: raw["{}level"] || "",
    typeName: raw["{}type"] || "",
    text: raw.question || "",
    options: Array.isArray(options) ? options : [],
    answer,
    raw,
  };
};

const normalizeStudent = (raw = {}) => ({
  id: toId(raw.id ?? raw.user_id),
  email: raw.email || "",
  firstName: raw.first_name || "",
  lastName: raw.last_name || raw.family_name || "",
  picture: raw.picture || "",
  createdOn: raw.created_on || "",
  displayName: fullName(raw),
  raw,
});

const normalizeGradeRow = (raw = {}) => ({
  id: toId(raw.id),
  examId: toId(raw.exam_id),
  userId: toId(raw.user_id),
  gradePoint: toNumber(raw.grade_point, 0),
  maxPoint: toNumber(raw.max_point, 0),
  raw,
});

const normalizeExamUser = (raw = {}) => ({
  id: toId(raw.id ?? raw.user_id),
  userId: toId(raw.user_id ?? raw.id),
  name: raw["{}user"] || fullName(raw),
  email: raw.email || "",
  raw,
});

const normalizeAttempt = (raw = {}) => ({
  id: toId(raw.id),
  attemptNo: toNumber(raw.attempt_no, 0),
  userId: toId(raw.user_id),
  examId: toId(raw.exam_id),
  gradePoint: toNumber(raw.grade_point, 0),
  totalPoint: toNumber(raw.total_point, 0),
  duration: toNumber(raw.duration, 0),
  startOn: raw.start_on || "",
  endOn: raw.end_on || "",
  raw,
});

const normalizeExamQuestionConfig = (raw = {}) => ({
  id: toId(raw.id),
  examId: toId(raw.exam_id),
  lessonId: toId(raw.lesson_id),
  levelId: toId(raw.level_id),
  typeId: toId(raw.type_id),
  quantity: toNumber(raw.quantity, 0),
  lessonName: raw["{}lesson"] || "",
  levelName: raw["{}level"] || "",
  typeName: raw["{}type"] || "",
  raw,
});

const normalizeAttemptEvaluation = (raw = {}) => ({
  id: toId(raw.id),
  name: raw.name || raw["{}type"] || raw["{}level"] || raw["{}lesson"] || "Үнэлгээ",
  gradePoint: toNumber(raw.grade_point, 0),
  totalPoint: toNumber(raw.total_point ?? raw.max_point, 0),
  raw,
});

const normalizeAttemptQuestion = (raw = {}) => ({
  id: toId(raw.id ?? raw.question_id),
  questionId: toId(raw.question_id ?? raw.id),
  text: raw.question || raw["{}question"] || "",
  answer: parseJsonField(raw.answer, raw.answer ?? ""),
  correctAnswer: parseJsonField(raw.correct_answer, raw.correct_answer ?? ""),
  gradePoint: toNumber(raw.grade_point, 0),
  totalPoint: toNumber(raw.total_point ?? raw.point, 0),
  raw,
});

const normalizeVariant = (raw = {}) => ({
  id: toId(raw.id ?? raw.variant_id),
  examId: toId(raw.exam_id),
  name: raw.name || "Вариант",
  priority: toNumber(raw.priority, 0),
  raw,
});

export const loginTeacher = async ({ email, password }) => {
  const payload = await apiRequest("/token/email", {
    method: "POST",
    data: {
      email: String(email || "").trim(),
      password: String(password || ""),
      push_token: "",
    },
  });

  saveTeacherTokens(payload);
  return payload;
};

export const logoutTeacher = async () => {
  try {
    await apiRequest("/token", {
      method: "DELETE",
      data: {},
      auth: true,
    });
  } finally {
    clearTeacherSession();
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
      password: currentPassword,
      new_password: newPassword,
    },
  });
};

export const fetchTeachingCourses = async (userId) => {
  const payload = await apiRequest(`/users/${userId}/courses/teaching`, { auth: true });
  return toItems(payload).map(normalizeCourse);
};

export const fetchMyExams = async () => {
  const payload = await apiRequest("/users/me/exams", { auth: true });
  return toItems(payload).map(normalizeExam);
};

export const fetchExams = async () => {
  const payload = await apiRequest("/exams", { auth: true });
  return toItems(payload).map(normalizeExam);
};

export const fetchCourseExams = async (courseId) => {
  const payload = await apiRequest(`/courses/${courseId}/exams`, { auth: true });
  return toItems(payload).map(normalizeExam);
};

export const createCourseExam = async (courseId, payload) => {
  await apiRequest(`/courses/${courseId}/exams`, {
    method: "POST",
    auth: true,
    data: {
      name: payload.name,
      description: payload.description || "",
      duration: String(payload.duration || 0),
      max_attempt: String(payload.maxAttempt || 1),
      total_point: String(payload.totalPoint || 0),
      grade_point: String(payload.gradePoint || payload.totalPoint || 0),
      point_expression: payload.pointExpression || "",
      open_on: payload.openOn || "",
      close_on: payload.closeOn || "",
      end_on: payload.endOn || payload.closeOn || "",
    },
  });
};

export const updateExam = async (examId, payload) => {
  const data = {
    name: payload.name || "",
    description: payload.description || "",
    duration: String(payload.duration || 0),
    max_attempt: String(payload.maxAttempt || 1),
    total_point: String(payload.totalPoint || 0),
    grade_point: String(payload.gradePoint || payload.totalPoint || 0),
    point_expression: payload.pointExpression || "",
    open_on: payload.openOn || "",
    close_on: payload.closeOn || "",
    end_on: payload.endOn || payload.closeOn || "",
  };

  if (payload.courseId) {
    data.course_id = String(payload.courseId);
  }

  await apiRequest(`/exams/${examId}`, {
    method: "PUT",
    auth: true,
    data,
  });
};

export const deleteExam = async (examId) => {
  await apiRequest(`/exams/${examId}`, {
    method: "DELETE",
    auth: true,
    data: {},
  });
};

export const fetchExamById = async (examId) => {
  const payload = await apiRequest(`/exams/${examId}`, { auth: true });
  return normalizeExam(payload || {});
};

export const fetchExamUsers = async (examId) => {
  const payload = await apiRequest(`/exams/${examId}/users`, { auth: true });
  return toItems(payload).map(normalizeExamUser);
};

export const addExamUser = async (examId, userId) => {
  const normalizedExamId = String(examId || "").trim();
  const normalizedUserId = String(userId || "").trim();

  if (!normalizedExamId) throw new Error("examId байхгүй байна");
  if (!normalizedUserId) throw new Error("userId байхгүй байна");

  await apiRequest(`/exams/${normalizedExamId}/users/${normalizedUserId}`, {
    method: "POST",
    auth: true,
    data: {
      user_id: normalizedUserId,
    },
  });
};

export const fetchExamUserPages = async (examId, userId) => {
  const payload = await apiRequest(`/exams/${examId}/users/${userId}`, { auth: true });
  return toItems(payload);
};

export const startExamForUser = async (examId, userId) => {
  await apiRequest(`/exams/${examId}/users/${userId}`, {
    method: "POST",
    auth: true,
    data: {},
  });
};

export const fetchExamUserAttempts = async (examId, userId) => {
  const payload = await apiRequest(`/exams/${examId}/users/${userId}/attempts`, { auth: true });
  return toItems(payload).map(normalizeAttempt);
};

export const fetchExamAttemptByNo = async (examId, userId, attemptNo) => {
  const payload = await apiRequest(`/exams/${examId}/users/${userId}/attempts/${attemptNo}`, {
    auth: true,
  });
  return toItems(payload).map(normalizeAttempt);
};

export const deleteExamAttempt = async (examId, userId, attemptNo) => {
  await apiRequest(`/exams/${examId}/users/${userId}/attempts/${attemptNo}`, {
    method: "DELETE",
    auth: true,
    data: {},
  });
};

export const fetchExamAttemptEvaluation = async (examId, userId, attemptNo) => {
  const payload = await apiRequest(
    `/exams/${examId}/users/${userId}/attempts/${attemptNo}/evaluation`,
    { auth: true }
  );
  return toItems(payload).map(normalizeAttemptEvaluation);
};

export const fetchExamAttemptQuestions = async (examId, userId, attemptNo) => {
  const payload = await apiRequest(
    `/exams/${examId}/users/${userId}/attempts/${attemptNo}/questions`,
    { auth: true }
  );
  return toItems(payload).map(normalizeAttemptQuestion);
};

export const uploadExamProctorAudio = async (examId, userId, body) => {
  await apiRequest(`/exams/${examId}/users/${userId}/proctor/audio`, {
    method: "POST",
    auth: true,
    data: {
      body: body || "",
    },
  });
};

export const uploadExamProctorImage = async (examId, userId, body) => {
  await apiRequest(`/exams/${examId}/users/${userId}/proctor/image`, {
    method: "POST",
    auth: true,
    data: {
      body: body || "",
    },
  });
};

export const fetchExamProctorMedia = async (examId, userId) => {
  const payload = await apiRequest(`/exams/${examId}/users/${userId}/proctor/media`, { auth: true });
  return toItems(payload);
};

export const fetchExamProctorMediaById = async (examId, userId, mediaId) => {
  const payload = await apiRequest(`/exams/${examId}/users/${userId}/proctor/media/${mediaId}`, {
    auth: true,
  });
  return payload || {};
};

export const createExamViolation = async (examId, userId, reason) => {
  await apiRequest(`/exams/${examId}/users/${userId}/proctor/violation`, {
    method: "POST",
    auth: true,
    data: {
      reason: reason || "",
    },
  });
};

export const fetchExamViolations = async (examId, userId) => {
  const payload = await apiRequest(`/exams/${examId}/users/${userId}/proctor/violations`, {
    auth: true,
  });
  return toItems(payload);
};

const normalizeExamQuestionPayload = (payload = {}) => ({
  lesson_id: String(payload.lessonId || ""),
  level_id: String(payload.levelId || ""),
  type_id: String(payload.typeId || ""),
  quantity: String(payload.quantity || 0),
});

export const fetchExamQuestionConfigs = async (examId) => {
  const payload = await apiRequest(`/exams/${examId}/questions`, { auth: true });
  return toItems(payload).map(normalizeExamQuestionConfig);
};

export const createExamQuestionConfig = async (examId, payload) => {
  await apiRequest(`/exams/${examId}/questions`, {
    method: "POST",
    auth: true,
    data: normalizeExamQuestionPayload(payload),
  });
};

export const fetchExamQuestionConfigById = async (examId, examQuestionId) => {
  const payload = await apiRequest(`/exams/${examId}/questions/${examQuestionId}`, {
    auth: true,
  });
  return normalizeExamQuestionConfig(payload || {});
};

export const updateExamQuestionConfig = async (examId, examQuestionId, payload) => {
  await apiRequest(`/exams/${examId}/questions/${examQuestionId}`, {
    method: "PUT",
    auth: true,
    data: normalizeExamQuestionPayload(payload),
  });
};

export const deleteExamQuestionConfig = async (examId, examQuestionId) => {
  await apiRequest(`/exams/${examId}/questions/${examQuestionId}`, {
    method: "DELETE",
    auth: true,
  });
};

export const fetchExamVariants = async (examId) => {
  const payload = await apiRequest(`/exams/${examId}/variants`, { auth: true });
  return toItems(payload).map(normalizeVariant);
};

export const createExamVariant = async (examId, { name, priority = 0 }) => {
  await apiRequest(`/exams/${examId}/variants`, {
    method: "POST",
    auth: true,
    data: {
      name: name || "",
      priority: String(priority || 0),
    },
  });
};

export const fetchVariantById = async (variantId) => {
  const payload = await apiRequest(`/variants/${variantId}`, { auth: true });
  return normalizeVariant(payload || {});
};

export const updateVariant = async (variantId, { examId, name, priority = 0 }) => {
  await apiRequest(`/variants/${variantId}`, {
    method: "PUT",
    auth: true,
    data: {
      exam_id: String(examId || ""),
      name: name || "",
      priority: String(priority || 0),
    },
  });
};

export const cloneVariant = async (variantId) => {
  await apiRequest(`/variants/${variantId}`, {
    method: "POST",
    auth: true,
    data: {},
  });
};

export const fetchVariantQuestions = async (variantId) => {
  const payload = await apiRequest(`/variants/${variantId}/questions`, { auth: true });
  return toItems(payload);
};

export const createVariantQuestion = async (variantId, questionId) => {
  await apiRequest(`/variants/${variantId}/questions`, {
    method: "POST",
    auth: true,
    data: {
      question_id: String(questionId || ""),
    },
  });
};

export const deleteVariantQuestion = async (variantId, questionId) => {
  await apiRequest(`/variants/${variantId}/questions/${questionId}`, {
    method: "DELETE",
    auth: true,
  });
};

export const fetchCourseStudents = async (courseId) => {
  const payload = await apiRequest(`/courses/${courseId}/students`, { auth: true });
  return toItems(payload).map(normalizeStudent);
};

export const fetchCourseGradebookExamRows = async (courseId) => {
  const payload = await apiRequest(`/courses/${courseId}/gradebook/exams`, { auth: true });
  return toItems(payload).map(normalizeGradeRow);
};

export const fetchUserExams = async (userId) => {
  const payload = await apiRequest(`/users/${userId}/exams`, { auth: true });
  return toItems(payload).map(normalizeExam);
};

export const fetchQuestionTypes = async () => {
  const payload = await apiRequest("/question-types", { auth: true });
  return toItems(payload).map(normalizeQuestionType);
};

export const fetchQuestionLevels = async () => {
  const payload = await apiRequest("/question-levels", { auth: true });
  return toItems(payload).map(normalizeQuestionLevel);
};

export const fetchCourseQuestions = async (courseId) => {
  const payload = await apiRequest(`/courses/${courseId}/questions`, { auth: true });
  return toItems(payload).map(normalizeQuestion);
};

const normalizeQuestionPayload = (payload = {}) => ({
  question: payload.question || "",
  type_id: String(payload.typeId || ""),
  level_id: String(payload.levelId || ""),
  lesson_id: payload.lessonId ? String(payload.lessonId) : "",
  parent_id: payload.parentId ? String(payload.parentId) : "",
  option: JSON.stringify(payload.options || []),
  answer: JSON.stringify(payload.answer),
});

export const createCourseQuestion = async (courseId, payload) => {
  await apiRequest(`/courses/${courseId}/questions`, {
    method: "POST",
    auth: true,
    data: normalizeQuestionPayload(payload),
  });
};

export const updateQuestion = async (questionId, payload) => {
  await apiRequest(`/questions/${questionId}`, {
    method: "PUT",
    auth: true,
    data: {
      ...normalizeQuestionPayload(payload),
      course_id: String(payload.courseId || ""),
    },
  });
};

export const deleteQuestion = async (questionId) => {
  await apiRequest(`/questions/${questionId}`, {
    method: "DELETE",
    auth: true,
    data: {},
  });
};
