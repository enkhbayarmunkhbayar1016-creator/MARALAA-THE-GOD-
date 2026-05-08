import { STORAGE_KEYS } from "../../../utils/constants";

const BASE_URL = "https://todu.mn/bs/lms/v1";

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
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

async function request(method, path, body) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }

  return data;
}

export const studentGet    = (path)        => request("GET",    path);
export const studentPost   = (path, body)  => request("POST",   path, body);
export const studentPut    = (path, body)  => request("PUT",    path, body);
export const studentDelete = (path, body)  => request("DELETE", path, body);


export const getStudentProfile = () =>
  studentGet("/users/me");

export const updateStudentProfile = (body) =>
  studentPut("/users/me", body);

export const getStudentCourses = (userId) =>
  studentGet(`/users/${userId}/courses/enrolled`);

export const getCourseDetail = (courseId) =>
  studentGet(`/courses/${courseId}`);

export const getCourseLessons = (courseId, query = "") =>
  studentGet(`/courses/${courseId}/lessons${query}`);

export const getCourseTeachers = (courseId) =>
  studentGet(`/courses/${courseId}/teachers`);

export const getCourseExams = (courseId) =>
  studentGet(`/courses/${courseId}/exams`);

export const getMyExams = () =>
  studentGet("/users/me/exams");

export const getMyExamSheet = (examId) =>
  studentGet(`/users/me/exams/${examId}`);

export const startMyExam = (examId) =>
  studentPost(`/users/me/exams/${examId}`, {});

export const getMyExamQuestions = (examId) =>
  studentGet(`/users/me/exams/${examId}/questions`);

export const answerMyExamQuestion = (examId, body) =>
  studentPut(`/users/me/exams/${examId}/questions`, body);

export const finishMyExam = (examId) =>
  studentPut(`/users/me/exams/${examId}`, { body_text: "finish" });

export const getCourseAttendances = (courseId) =>
  studentGet(`/courses/${courseId}/attendances`);

export const getCourseAttendancePoints = (courseId) =>
  studentGet(`/courses/${courseId}/attendance-points`);

export const getGradebookExams = (courseId) =>
  studentGet(`/courses/${courseId}/gradebook/exams`);

export const getGradebookSubmissions = (courseId) =>
  studentGet(`/courses/${courseId}/gradebook/submissions`);

export const getGradebookAttendances = (courseId) =>
  studentGet(`/courses/${courseId}/gradebook/attendances`);

export const getGradebook = (courseId) =>
  studentGet(`/courses/${courseId}/gradebook`);

export const getSubmissionDetail = (submissionId) =>
  studentGet(`/submissions/${submissionId}`);

export const getLessonDetail = (lessonId) =>
  studentGet(`/lessons/${lessonId}`);

export const getLessonSubmissions = (lessonId) =>
  studentGet(`/lessons/${lessonId}/submissions`);

export const submitLessonAssignment = (lessonId, userId, content) =>
  studentPost(`/lessons/${lessonId}/submissions`, { content, user_id: userId });

export const updateLessonSubmission = (submissionId, lessonId, userId, content) =>
  studentPut(`/submissions/${submissionId}`, { content, lesson_id: lessonId, user_id: userId });

export const getLessonAttendances = (lessonId) =>
  studentGet(`/lessons/${lessonId}/attendances`);

export async function getAllCourseLessons(courseId, pageSize = 50) {
  let offset = 0;
  let hasMore = true;
  let pageGuard = 0;
  const all = [];
  const seen = new Set();

  while (hasMore && pageGuard < 100) {
    const query = `?offset=${offset}&limit=${pageSize}`;
    const data = await getCourseLessons(courseId, query);
    const items = Array.isArray(data?.items) ? data.items : [];

    for (const item of items) {
      const key = item?.id ?? `${item?.course_id}-${item?.name}-${item?.priority}`;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(item);
    }

    hasMore = Boolean(data?.hasMore);
    if (!hasMore || items.length === 0) break;

    const nextOffset = Number(data?.offset);
    const nextLimit = Number(data?.limit);
    if (Number.isFinite(nextOffset) && Number.isFinite(nextLimit) && nextLimit > 0) {
      offset = nextOffset + nextLimit;
    } else {
      offset += pageSize;
    }

    pageGuard += 1;
  }

  return all;
}
