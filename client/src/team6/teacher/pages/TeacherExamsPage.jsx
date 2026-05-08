import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiBarChart2, FiCalendar, FiClock, FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { deleteExam, fetchCourseExams, fetchTeachingCourses } from "../api";
import { useTeacherAuth } from "../TeacherAuthContext";
import { formatDateTime, getExamStatus, labelFromStatus } from "../utils";

const statusClassName = {
  active: "team5-tag active",
  completed: "team5-tag completed",
  draft: "team5-tag draft",
};

const TeacherExamsPage = () => {
  const { user } = useTeacherAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [deletingId, setDeletingId] = useState("");

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const teacherCourses = await fetchTeachingCourses(user.id);
      const examLists = await Promise.all(
        teacherCourses.map(async (course) => {
          try {
            const list = await fetchCourseExams(course.id);
            return list.map((exam) => ({
              ...exam,
              courseName: exam.courseName || course.name,
            }));
          } catch {
            return [];
          }
        })
      );

      setCourses(teacherCourses);
      setExams(examLists.flat());
    } catch (err) {
      setError(err?.message || "Шалгалтын мэдээлэл ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleExams = useMemo(() => {
    if (selectedCourse === "all") return exams;
    return exams.filter((exam) => exam.courseId === selectedCourse);
  }, [exams, selectedCourse]);

  const summary = useMemo(() => {
    const base = {
      total: visibleExams.length,
      active: 0,
      completed: 0,
      draft: 0,
    };

    visibleExams.forEach((exam) => {
      const status = getExamStatus(exam);
      base[status] += 1;
    });

    return base;
  }, [visibleExams]);

  const handleDelete = async (examId) => {
    if (!window.confirm("Энэ шалгалтыг устгах уу?")) return;

    try {
      setDeletingId(examId);
      setError("");
      await deleteExam(examId);
      await loadData();
    } catch (err) {
      setError(err?.message || "Шалгалт устгах үед алдаа гарлаа.");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return <div className="team5-page-loading">Шалгалтын мэдээлэл уншиж байна...</div>;
  }

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <h2>Миний шалгалтууд</h2>
          <p>Шалгалтуудаа удирдаж, үр дүнгээ нэг дороос харах</p>
        </div>

        <Link to="/team6/teacher/exams/new" className="team5-primary-btn">
          <FiPlus />
          Шинэ шалгалт үүсгэх
        </Link>
      </header>

      {error ? <p className="team5-error-box">{error}</p> : null}

      <div className="team5-stats-grid">
        <article className="team5-stat-card purple">
          <h3>Нийт шалгалт</h3>
          <strong>{summary.total}</strong>
        </article>
        <article className="team5-stat-card green">
          <h3>Идэвхтэй</h3>
          <strong>{summary.active}</strong>
        </article>
        <article className="team5-stat-card blue">
          <h3>Дууссан</h3>
          <strong>{summary.completed}</strong>
        </article>
        <article className="team5-stat-card gray">
          <h3>Ноорог</h3>
          <strong>{summary.draft}</strong>
        </article>
      </div>

      <div className="team5-toolbar">
        <select
          value={selectedCourse}
          onChange={(event) => setSelectedCourse(event.target.value)}
          className="team5-select"
        >
          <option value="all">Бүх хичээл</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <button type="button" className="team5-ghost-btn" onClick={loadData}>
          Дахин унших
        </button>
      </div>

      <div className="team5-table-wrap">
        <table className="team5-table">
          <thead>
            <tr>
              <th>Шалгалтын нэр</th>
              <th>Хичээл</th>
              <th>Хугацаа</th>
              <th>Оноо</th>
              <th>Төлөв</th>
              <th>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {visibleExams.length === 0 ? (
              <tr>
                <td colSpan={6} className="team5-empty-row">
                  Шалгалт олдсонгүй
                </td>
              </tr>
            ) : (
              visibleExams.map((exam) => {
                const status = getExamStatus(exam);
                return (
                  <tr key={exam.id}>
                    <td>
                      <div className="team5-cell-title">{exam.name}</div>
                      <div className="team5-cell-sub">{exam.description || "Тайлбар оруулаагүй"}</div>
                    </td>
                    <td>{exam.courseName || "-"}</td>
                    <td>
                      <div className="team5-icon-line">
                        <FiClock /> {exam.duration || 0} мин
                      </div>
                      <div className="team5-icon-line">
                        <FiCalendar /> {formatDateTime(exam.openOn)}
                      </div>
                    </td>
                    <td>{exam.totalPoint}</td>
                    <td>
                      <span className={statusClassName[status]}>{labelFromStatus(status)}</span>
                    </td>
                    <td>
                      <div className="team5-action-links">
                        <Link to={`/team6/teacher/exams/${exam.id}`} className="team5-action-btn" title="Дэлгэрэнгүй">
                          <FiEye />
                        </Link>
                        <Link
                          to={`/team6/teacher/exams/${exam.id}/edit`}
                          className="team5-action-btn"
                          title="Засах"
                        >
                          <FiEdit2 />
                        </Link>
                        <Link
                          to={`/team6/teacher/reports?examId=${exam.id}`}
                          className="team5-action-btn"
                          title="Тайлан"
                        >
                          <FiBarChart2 />
                        </Link>
                        <button
                          type="button"
                          className="team5-action-btn danger"
                          title="Устгах"
                          onClick={() => handleDelete(exam.id)}
                          disabled={deletingId === exam.id}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TeacherExamsPage;
