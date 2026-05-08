import { useEffect, useState } from "react";
import { apiGet, parseField } from "../../utils/api";

const COURSE_USERS_LIMIT = 10000;

export default function useTeacherCoursesSummary({ userId, schoolId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        setCourses([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await apiGet(`/users/${userId}/courses/teaching`);
        const items = data?.items ?? [];
        const filtered = schoolId == null
          ? items
          : items.filter((item) => {
              const course = parseField(item, "course") ?? item;
              return String(course?.school_id ?? item?.school_id ?? "") === String(schoolId);
            });

        const enriched = await Promise.all(
          filtered.map(async (item) => {
            const parsedCourse = parseField(item, "course");
            const course = item?.name ? item : (parsedCourse ?? item);
            const courseId = course.id ?? item.course_id ?? item.id;
            let userCount = 0;

            try {
              const usersData = await apiGet(`/courses/${courseId}/users?limit=${COURSE_USERS_LIMIT}`);
              userCount = usersData?.count ?? usersData?.items?.length ?? 0;
            } catch {
              userCount = 0;
            }

            return {
              courseId,
              name: item.name ?? course.name ?? course.title ?? `Хичээл #${courseId}`,
              userCount,
            };
          })
        );

        if (!cancelled) {
          setCourses(enriched);
        }
      } catch {
        if (!cancelled) {
          setCourses([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, schoolId]);

  return { courses, loading };
}
