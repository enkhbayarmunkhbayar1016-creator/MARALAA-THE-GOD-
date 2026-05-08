import { studentGet } from "./studentCourseApi";

export const getExamAttempts = (examId, userId) =>
  studentGet(`/exams/${examId}/users/${userId}/attempts`);

export const getExamAttemptDetail = (examId, userId, attempt) =>
  studentGet(`/exams/${examId}/users/${userId}/attempts/${attempt}`);

export const getExamAttemptEvaluation = (examId, userId, attempt) =>
  studentGet(`/exams/${examId}/users/${userId}/attempts/${attempt}/evaluation`);

export const getExamAttemptQuestions = (examId, userId, attempt) =>
  studentGet(`/exams/${examId}/users/${userId}/attempts/${attempt}/questions`);
