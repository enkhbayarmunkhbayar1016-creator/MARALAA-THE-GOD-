import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiBookOpen, FiUsers } from "react-icons/fi";
import { fetchCourseGradebook, fetchEnrolledCourses } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { scorePercent, toNumber } from "../utils";

const gradeColor = (value) => {
  if (value >= 90) return "green";
  if (value >= 80) return "blue";
  if (value >= 70) return "purple";
  if (value >= 60) return "orange";
  return "red";
};

const gradeLetter = (value) => {
  if (value >= 90) return "A";
  if (value >= 80) return "B";
  if (value >= 70) return "C";
  if (value >= 60) return "D";
  return "F";
};

const StudentCoursesPage = () => {
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const enrolled = await fetchEnrolledCourses(user.id);

        const gradebookRows = await Promise.all(
          enrolled.map((course) => fetchCourseGradebook(course.courseId).catch(() => []))
        );

        const normalized = enrolled.map((course, index) => {
          const gradebook = gradebookRows[index] || [];
          const myRow = gradebook.find((item) => String(item.user_id) === String(user.id));
          const progress = scorePercent(myRow?.grade_point || 0, 100);

          return {
            ...course,
            progress,
            gradePoint: toNumber(myRow?.grade_point, 0),
            studentCount: gradebook.length,
            credit: 3,
          };
        });

        if (!active) return;
        setRows(normalized);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Курсын мэдээлэл ачаалж чадсангүй");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const stats = useMemo(() => {
    if (!rows.length) {
      return { total: 0, credit: 0, average: 0 };
    }

    const totalCredit = rows.reduce((acc, cur) => acc + toNumber(cur.credit, 0), 0);
    const avg = rows.reduce((acc, cur) => acc + toNumber(cur.progress, 0), 0) / rows.length;

    return {
      total: rows.length,
      credit: totalCredit,
      average: Math.round(avg),
    };
  }, [rows]);

  if (loading) {
    return <div className="t5s-loading">Курсын мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Миний курсууд</h2>
          <p>Хаврын улирал</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <div className="t5s-stats-grid">
        <article className="t5s-stat purple">
          <h4>Бүртгэлтэй курс</h4>
          <strong>{stats.total}</strong>
        </article>
        <article className="t5s-stat blue">
          <h4>Нийт кредит</h4>
          <strong>{stats.credit}</strong>
        </article>
        <article className="t5s-stat green">
          <h4>Дундаж явц</h4>
          <strong>{stats.average}%</strong>
        </article>
      </div>

      <div className="t5s-course-grid">
        {rows.map((course) => {
          const color = gradeColor(course.progress);

          return (
            <article key={course.id} className={`t5s-course-card ${color}`}>
              <div className="t5s-inline-tags between">
                <strong>{course.name}</strong>
                <span className="t5s-grade-pill">{gradeLetter(course.progress)}</span>
              </div>

              <p>{course.groupName || "Бүлэг мэдээлэлгүй"}</p>

              <div className="t5s-progress-wrap">
                <label>Явцын оноо</label>
                <strong>{Math.round(course.progress)}%</strong>
              </div>

              <div className="t5s-progress-track">
                <span style={{ width: `${Math.round(course.progress)}%` }} />
              </div>

              <div className="t5s-list-meta">
                <span>
                  <FiBookOpen /> {course.credit} кредит
                </span>
                <span>
                  <FiUsers /> {course.studentCount} оюутан
                </span>
              </div>

              <div className="t5s-row-actions split">
                <Link className="t5s-btn t5s-btn-outline" to={`/team6/student/exams?course=${course.courseId}`}>
                  Дэлгэрэнгүй
                </Link>
                <Link className="t5s-btn t5s-btn-primary" to={`/team6/student/library?course=${course.courseId}`}>
                  Материал
                </Link>
              </div>
            </article>
          );
        })}

        {rows.length === 0 && <div className="t5s-empty">Курс олдсонгүй.</div>}
      </div>
    </section>
  );
};

export default StudentCoursesPage;
