import { studentGet } from "./studentCourseApi";
import { isDateInRange } from "../utils";

const toArray = (v) => (Array.isArray(v) ? v : []);

export async function getStudentDashboardData({ userId, schoolId }) {
  if (!userId) return null;

  const [coursesRes, examsRes, schoolsRes, catalogRes, categoriesRes] = await Promise.all([
    studentGet(`/users/${userId}/courses/enrolled`).catch(() => ({ items: [] })),
    studentGet("/users/me/exams").catch(() => ({ items: [] })),
    studentGet(`/users/${userId}/schools`).catch(() => ({ items: [] })),
    schoolId
      ? studentGet(`/schools/${schoolId}/courses`).catch(() => ({ items: [] }))
      : Promise.resolve({ items: [] }),
    schoolId
      ? studentGet(`/schools/${schoolId}/categories`).catch(() => ({ items: [] }))
      : Promise.resolve({ items: [] }),
  ]);

  const courses = toArray(coursesRes?.items);
  const exams = toArray(examsRes?.items);
  const schools = toArray(schoolsRes?.items);
  const catalog = toArray(catalogRes?.items);
  const categories = toArray(categoriesRes?.items);

  const nowTs = Date.now();
  const openExams = exams.filter((e) =>
    isDateInRange(e?.open_on, e?.close_on || e?.end_on, nowTs)
  ).length;

  return {
    courses,
    exams,
    schools,
    catalog,
    categories,
    stats: {
      enrolledCourses: courses.length,
      openExams,
      totalExams: exams.length,
      schoolCount: schools.length,
    },
  };
}
