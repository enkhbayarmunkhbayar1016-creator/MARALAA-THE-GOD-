import { studentGet } from "./studentCourseApi";

export const getGroupsByCourse = (courseId) =>
  studentGet(`/courses/${courseId}/groups`);

export const getGroupDetail = (groupId) =>
  studentGet(`/groups/${groupId}`);

export const getCourseMembers = (courseId) =>
  studentGet(`/courses/${courseId}/users`);
