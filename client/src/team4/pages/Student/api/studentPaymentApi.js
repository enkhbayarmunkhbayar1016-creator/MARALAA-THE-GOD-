import { studentGet, studentPost } from "./studentCourseApi";

export const getStudentDebt = (schoolId, userId) =>
  studentGet(`/schools/${schoolId}/users/${userId}/debt`);

export const getPaymentHistory = (schoolId, userId) =>
  studentGet(`/schools/${schoolId}/users/${userId}/payments`);

export const submitPayment = (schoolId, userId, body) =>
  studentPost(`/schools/${schoolId}/users/${userId}/payments`, body);

export const getSchoolBankInfo = (schoolId) =>
  studentGet(`/schools/${schoolId}/bank-info`);

export const getPaymentPolicy = (schoolId) =>
  studentGet(`/schools/${schoolId}/payment-policy`);
