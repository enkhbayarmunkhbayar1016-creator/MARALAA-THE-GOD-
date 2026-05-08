import { studentGet, studentPost, studentDelete } from "./studentCourseApi";

export const getCourseTimetables = (courseId) =>
  studentGet(`/courses/${courseId}/timetables`);

export const getMyCourseTimetable = (courseId) =>
  studentGet(`/courses/${courseId}/timetables/my`);

export const selectCourseTimetable = (courseId, timetableId) =>
  studentPost(`/courses/${courseId}/timetables/my`, { timetable_id: timetableId });

export const cancelCourseTimetable = (courseId, timetableId) =>
  studentDelete(`/courses/${courseId}/timetables/my/${timetableId}`);

export const getLessonTimetables = (lessonId) =>
  studentGet(`/lessons/${lessonId}/timetables`);

export const getLessonTypes = () =>
  studentGet("/lesson-types");
