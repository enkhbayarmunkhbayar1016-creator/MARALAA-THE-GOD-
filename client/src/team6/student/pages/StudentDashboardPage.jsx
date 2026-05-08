import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
} from "react-icons/fi";
import { fetchCourseLessons, fetchEnrolledCourses, fetchStudentExamCatalog } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { formatDate, formatDateTime } from "../utils";

const StudentDashboardPage = () => {
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignmentCount, setAssignmentCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [courseRows, examRows] = await Promise.all([
          fetchEnrolledCourses(user.id),
          fetchStudentExamCatalog(user.id),
        ]);

        const lessonRows = await Promise.all(
          courseRows.map((course) =>
            fetchCourseLessons(course.courseId).catch(() => [])
          )
        );

        const assignmentTotal = lessonRows
          .flat()
          .filter((lesson) => lesson.hasSubmission).length;

        if (!active) return;

        setCourses(courseRows);
        setExams(examRows);
        setAssignmentCount(assignmentTotal);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Хяналтын самбарын өгөгдөл дуудах үед алдаа гарлаа");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const completedExams = useMemo(
    () => exams.filter((item) => Number(item.gradePoint) > 0),
    [exams]
  );

  const upcomingExams = useMemo(() => {
    const now = Date.now();
    return exams
      .filter((item) => {
        const closeAt = item.closeOn ? new Date(item.closeOn).getTime() : Number.MAX_SAFE_INTEGER;
        return closeAt > now;
      })
      .sort((a, b) => {
        const first = a.openOn ? new Date(a.openOn).getTime() : Number.MAX_SAFE_INTEGER;
        const second = b.openOn ? new Date(b.openOn).getTime() : Number.MAX_SAFE_INTEGER;
        return first - second;
      })
      .slice(0, 3);
  }, [exams]);

  if (loading) {
    return <div className="t5s-loading">Хяналтын самбар ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-hero">
        <h2>Сайн байна уу, {user?.displayName || "Оюутан"}!</h2>
        <p>Өнөөдөр сайхан өдөр болоосой.</p>
        <strong>Оюутны дугаар: {user?.username || user?.email || "-"}</strong>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <div className="t5s-stats-grid">
        <article className="t5s-stat purple">
          <h4>
            <FiClipboard /> Нийт шалгалт
          </h4>
          <strong>{exams.length}</strong>
          <p>Энэ улиралд</p>
        </article>

        <article className="t5s-stat green">
          <h4>
            <FiCheckCircle /> Дууссан
          </h4>
          <strong>{completedExams.length}</strong>
          <p>Амжилттай</p>
        </article>

        <article className="t5s-stat blue">
          <h4>
            <FiBookOpen /> Курсууд
          </h4>
          <strong>{courses.length}</strong>
          <p>Бүртгэлтэй</p>
        </article>

        <article className="t5s-stat orange">
          <h4>
            <FiClock /> Даалгавар
          </h4>
          <strong>{assignmentCount}</strong>
          <p>Хүлээгдэж буй</p>
        </article>
      </div>

      <div className="t5s-two-col">
        <article className="t5s-card">
          <div className="t5s-card-head">
            <h3>Удахгүй болох шалгалтууд</h3>
            <Link to="/team6/student/exams">
              Бүгдийг харах <FiArrowRight />
            </Link>
          </div>

          <div className="t5s-list-stack">
            {upcomingExams.length === 0 && <p className="t5s-muted">Идэвхтэй шалгалт алга.</p>}

            {upcomingExams.map((exam) => (
              <div key={exam.id} className="t5s-list-item">
                <div>
                  <strong>{exam.courseName || exam.name}</strong>
                  <p>{exam.name}</p>
                </div>

                <div className="t5s-list-meta">
                  <span>
                    <FiCalendar /> {formatDate(exam.closeOn || exam.endOn)}
                  </span>
                  <span>
                    <FiClock /> {exam.duration} минут
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="t5s-card">
          <div className="t5s-card-head">
            <h3>Түргэн холбоос</h3>
          </div>

          <div className="t5s-quick-links">
            <Link className="t5s-quick-link primary" to="/team6/student/exams">
              <FiClipboard /> Шалгалт өгөх
            </Link>
            <Link className="t5s-quick-link" to="/team6/student/reports">
              <FiBarChart2 /> Үр дүн харах
            </Link>
            <Link className="t5s-quick-link" to="/team6/student/courses">
              <FiAward /> Курсууд
            </Link>
            <Link className="t5s-quick-link" to="/team6/student/assignments">
              <FiClock /> Даалгавар
            </Link>
          </div>
        </article>
      </div>

      <article className="t5s-card">
        <div className="t5s-card-head">
          <h3>Сүүлийн үйл ажиллагаа</h3>
        </div>

        <div className="t5s-list-stack">
          {exams.slice(0, 5).map((exam) => (
            <div key={exam.id} className="t5s-activity-row">
              <div>
                <strong>{exam.name}</strong>
                <p>{exam.courseName || "Курс"}</p>
              </div>
              <span>{formatDateTime(exam.closeOn || exam.openOn)}</span>
            </div>
          ))}

          {exams.length === 0 && <p className="t5s-muted">Үйл ажиллагааны түүх олдсонгүй.</p>}
        </div>
      </article>
    </section>
  );
};

export default StudentDashboardPage;
