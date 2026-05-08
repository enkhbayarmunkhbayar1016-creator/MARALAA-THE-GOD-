import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiClock, FiSend } from "react-icons/fi";
import {
  createLessonSubmission,
  fetchCourseLessons,
  fetchEnrolledCourses,
  fetchLessonSubmissions,
} from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { formatDate, toNumber } from "../utils";

const getStatus = (row) => {
  if (row.submission && row.submission.gradePoint !== null) return "graded";
  if (row.submission) return "submitted";

  const closeOn = row.lesson.closeOn ? new Date(row.lesson.closeOn).getTime() : 0;
  if (closeOn && closeOn < Date.now()) return "overdue";

  return "pending";
};

const statusLabel = {
  pending: "Хүлээгдэж буй",
  submitted: "Илгээсэн",
  graded: "Үнэлгээ авсан",
  overdue: "Хугацаа хэтэрсэн",
};

const remainingLabel = (closeOn) => {
  if (!closeOn) return "Тогтсон хугацаагүй";

  const diff = new Date(closeOn).getTime() - Date.now();
  const day = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (day < 0) return `${Math.abs(day)} өдөр хоцорсон`;
  if (day === 0) return "Өнөөдөр";
  return `${day} өдөр үлдсэн`;
};

const StudentAssignmentsPage = () => {
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [drafts, setDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState("");

  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const courses = await fetchEnrolledCourses(user.id);

      const lessonRows = await Promise.all(
        courses.map((course) =>
          fetchCourseLessons(course.courseId)
            .then((lessons) =>
              lessons
                .filter((lesson) => lesson.hasSubmission)
                .map((lesson) => ({ lesson, courseName: course.name }))
            )
            .catch(() => [])
        )
      );

      const flattened = lessonRows.flat();

      const submissionsByLesson = await Promise.all(
        flattened.map((item) => fetchLessonSubmissions(item.lesson.id).catch(() => []))
      );

      const normalized = flattened
        .map((item, index) => {
          const submissions = submissionsByLesson[index] || [];

          const mySubmission = submissions
            .filter((entry) => String(entry.userId) === String(user.id))
            .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())[0];

          return {
            id: item.lesson.id,
            lesson: item.lesson,
            courseName: item.courseName,
            submission: mySubmission || null,
          };
        })
        .sort((a, b) => {
          const first = a.lesson.closeOn ? new Date(a.lesson.closeOn).getTime() : Number.MAX_SAFE_INTEGER;
          const second = b.lesson.closeOn ? new Date(b.lesson.closeOn).getTime() : Number.MAX_SAFE_INTEGER;
          return first - second;
        });

      setRows(normalized);
    } catch (err) {
      setError(err?.message || "Даалгаврын мэдээлэл дуудахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const summary = useMemo(() => {
    const statusRows = rows.map((row) => getStatus(row));
    return {
      pending: statusRows.filter((status) => status === "pending").length,
      submitted: statusRows.filter((status) => status === "submitted").length,
      graded: statusRows.filter((status) => status === "graded").length,
      overdue: statusRows.filter((status) => status === "overdue").length,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (activeTab === "all") return rows;
    return rows.filter((row) => getStatus(row) === activeTab);
  }, [activeTab, rows]);

  const handleSubmit = async (row) => {
    const content = String(drafts[row.id] || "").trim();
    if (!content) {
      setError("Илгээх текстээ оруулна уу.");
      return;
    }

    setSubmittingId(row.id);
    setError("");

    try {
      await createLessonSubmission(row.lesson.id, {
        content,
        userId: user?.id,
      });

      setDrafts((prev) => ({ ...prev, [row.id]: "" }));
      await loadData();
    } catch (err) {
      setError(err?.message || "Даалгавар илгээх үед алдаа гарлаа");
    } finally {
      setSubmittingId("");
    }
  };

  if (loading) {
    return <div className="t5s-loading">Даалгаврын мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Даалгавар</h2>
          <p>Таны хичээлийн даалгаврууд</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <div className="t5s-stats-grid">
        <article className="t5s-stat blue">
          <h4>Хүлээгдэж буй</h4>
          <strong>{summary.pending}</strong>
        </article>
        <article className="t5s-stat purple">
          <h4>Илгээсэн</h4>
          <strong>{summary.submitted}</strong>
        </article>
        <article className="t5s-stat green">
          <h4>Үнэлгээ авсан</h4>
          <strong>{summary.graded}</strong>
        </article>
        <article className="t5s-stat red">
          <h4>Хугацаа хэтэрсэн</h4>
          <strong>{summary.overdue}</strong>
        </article>
      </div>

      <div className="t5s-tab-switch">
        <button
          type="button"
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("pending")}
        >
          Хүлээгдэж буй
        </button>
        <button
          type="button"
          className={activeTab === "submitted" ? "active" : ""}
          onClick={() => setActiveTab("submitted")}
        >
          Илгээсэн
        </button>
        <button
          type="button"
          className={activeTab === "graded" ? "active" : ""}
          onClick={() => setActiveTab("graded")}
        >
          Үнэлгээ авсан
        </button>
        <button
          type="button"
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          Бүгд
        </button>
      </div>

      <div className="t5s-list-stack">
        {filteredRows.map((row) => {
          const status = getStatus(row);

          return (
            <article key={row.id} className="t5s-assignment-row">
              <div className="t5s-inline-tags between">
                <div className="t5s-inline-tags">
                  <strong>{row.lesson.name}</strong>
                  <span className="t5s-pill">{statusLabel[status]}</span>
                </div>
                <strong>{toNumber(row.lesson.point, 0)} оноо</strong>
              </div>

              <p>{row.courseName}</p>

              <div className="t5s-list-meta">
                <span>
                  <FiCalendar /> Хугацаа: {formatDate(row.lesson.closeOn)}
                </span>
                <span>
                  <FiClock /> {remainingLabel(row.lesson.closeOn)}
                </span>
              </div>

              {row.submission ? (
                <div className="t5s-note success">
                  <p>Сүүлд илгээсэн: {row.submission.content || "(контент хоосон)"}</p>
                  <p>
                    Үнэлгээ: {row.submission.gradePoint === null ? "Хүлээгдэж байна" : row.submission.gradePoint}
                  </p>
                </div>
              ) : (
                <div className="t5s-submit-box">
                  <textarea
                    value={drafts[row.id] || ""}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: event.target.value,
                      }))
                    }
                    placeholder="Даалгаврынхаа тайлбар, линк, эсвэл хариулт оруулна уу..."
                    rows={3}
                  />

                  <button
                    type="button"
                    className="t5s-btn t5s-btn-primary"
                    onClick={() => handleSubmit(row)}
                    disabled={submittingId === row.id}
                  >
                    <FiSend />
                    {submittingId === row.id ? "Илгээж байна..." : "Илгээх"}
                  </button>
                </div>
              )}
            </article>
          );
        })}

        {filteredRows.length === 0 && <div className="t5s-empty">Даалгавар олдсонгүй.</div>}
      </div>
    </section>
  );
};

export default StudentAssignmentsPage;
