import { studentGet, studentPost } from "./studentCourseApi";

export const getSchoolDetail = (schoolId) =>
  studentGet(`/schools/${schoolId}`);

export const getStudentSchools = (userId) =>
  studentGet(`/users/${userId}/schools`);

export const getSchoolTeachers = (schoolId) =>
  studentGet(`/schools/${schoolId}/teachers`);

export const getSchoolCategories = (schoolId) =>
  studentGet(`/schools/${schoolId}/categories`);

export const getSchoolCourses = (schoolId) =>
  studentGet(`/schools/${schoolId}/courses`);

export const requestSchoolMembership = (schoolId, body) =>
  studentPost(`/schools/${schoolId}/requests`, body);

export const getMySchoolRequests = (schoolId) =>
  studentGet(`/schools/${schoolId}/requests`);
