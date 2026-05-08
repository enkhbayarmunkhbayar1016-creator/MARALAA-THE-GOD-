import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  addCourseStudent,
  fetchAllUsers,
  fetchCourseGradebookExamRows,
  fetchCourseStudents,
  fetchExamById,
  fetchExamUsers,
  fetchTeachingCourses,
} from "../api";
import { useTeacherAuth } from "../TeacherAuthContext";
import { formatDateTime, scorePercent, toNumber } from "../utils";

const TeacherExamDetailPage = () => {
  const { examId } = useParams();
  const { user } = useTeacherAuth();

  const [exam, setExam] = useState(null);
  const [resolvedCourseId, setResolvedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [scoreRows, setScoreRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  useEffect(() => {
    if (!examId) return;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const examDetail = await fetchExamById(examId);
        setExam(examDetail);

        // Resolve courseId: use exam.courseId directly, or match by courseName from teacher's courses
        let courseId = examDetail.courseId || "";
        if (!courseId && user?.id) {
          try {
            const teachingCourses = await fetchTeachingCourses(user.id);
            const courseName = (examDetail.courseName || "").toLowerCase().trim();
            const matched = teachingCourses.find(
              (c) => c.name.toLowerCase().trim() === courseName || c.id === examDetail.raw?.course_id
            );
            if (matched) courseId = matched.id;
            // fallback: if still empty and teacher has courses, load students from first matching course
            if (!courseId && teachingCourses.length > 0 && courseName) {
              const partial = teachingCourses.find((c) =>
                c.name.toLowerCase().includes(courseName) || courseName.includes(c.name.toLowerCase())
              );
              if (partial) courseId = partial.id;
            }
          } catch {
            // silently ignore, students will be empty
          }
        }
        setResolvedCourseId(courseId);

        const results = await Promise.allSettled([
          courseId ? fetchCourseStudents(courseId) : Promise.resolve([]),
          fetchExamUsers(examId),
          courseId ? fetchCourseGradebookExamRows(courseId) : Promise.resolve([]),
        ]);

        const [studentsResult, usersResult, gradeResult] = results;

        setStudents(studentsResult.status === "fulfilled" ? studentsResult.value : []);
        setParticipants(usersResult.status === "fulfilled" ? usersResult.value : []);
        if (gradeResult.status === "fulfilled") {
          setScoreRows(gradeResult.value.filter((row) => row.examId === examId));
        } else {
          setScoreRows([]);
        }
      } catch (err) {
        setError(err?.message || "Шалгалтын дэлгэрэнгүй ачаалж чадсангүй.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId, user?.id]);

  const metrics = useMemo(() => {
    const scores = scoreRows.map((row) => row.gradePoint);
    const totalPoint = exam?.totalPoint || 0;

    const avg =
      scores.length > 0
        ? scores.reduce((acc, cur) => acc + toNumber(cur, 0), 0) / scores.length
        : 0;

    const finishedCount = scoreRows.length;
    const participantCount = Math.max(participants.length, finishedCount);

    return {
      participantCount,
      finishedCount,
      avg,
      passRate:
        finishedCount > 0
          ?
              (scoreRows.filter((row) => scorePercent(row.gradePoint, totalPoint) >= 60).length /
                finishedCount) *
              100
          : 0,
      best: scores.length ? Math.max(...scores) : 0,
      worst: scores.length ? Math.min(...scores) : 0,
    };
  }, [exam?.totalPoint, participants.length, scoreRows]);

  const participantUserIds = useMemo(() => {
    return new Set(participants.map((item) => item.userId || item.id).filter(Boolean));
  }, [participants]);

  const enrolledStudentIds = useMemo(
    () => new Set(students.map((s) => s.id).filter(Boolean)),
    [students]
  );

  const assignableStudents = useMemo(() => {
    const keyword = studentSearch.trim().toLowerCase();
    const source = allUsers.length > 0 ? allUsers : students;

    return source
      .filter((student) => !enrolledStudentIds.has(student.id))
      .filter((student) => {
        if (!keyword) return true;
        return (
          student.displayName.toLowerCase().includes(keyword) ||
          student.email.toLowerCase().includes(keyword) ||
          student.id.toLowerCase().includes(keyword)
        );
      });
  }, [allUsers, students, enrolledStudentIds, studentSearch]);

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const openAssignModal = async () => {
    setAssignError("");
    setAssignSuccess("");
    setStudentSearch("");
    setSelectedStudentIds([]);
    setShowAssignModal(true);
    if (allUsers.length === 0) {
      try {
        const users = await fetchAllUsers(500);
        setAllUsers(users);
      } catch {
        setAssignError("Хэрэглэгчийн жагсаалт ачаалж чадсангүй.");
      }
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssignError("");
    setAssignSuccess("");
    setStudentSearch("");
    setSelectedStudentIds([]);
  };

  const handleAssignStudents = async (event) => {
    event.preventDefault();

    if (!exam?.id) return;
    if (selectedStudentIds.length === 0) {
      setAssignError("Нэмэх оюутнаа сонгоно уу.");
      return;
    }

    setAssignSubmitting(true);
    setAssignError("");
    setAssignSuccess("");

    if (!resolvedCourseId) {
      setAssignError("Хичээлийн ID олдсонгүй. Хуудсыг дахин ачаална уу.");
      setAssignSubmitting(false);
      return;
    }

    try {
      const results = await Promise.allSettled(
        selectedStudentIds.map((studentId) => addCourseStudent(resolvedCourseId, studentId))
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        const errorMsg = failed[0].reason?.message || "Оюутан нэмэхэд алдаа гарлаа";
        setAssignError(`Алдаа: ${errorMsg}`);
        return;
      }

      const latestStudents = await fetchCourseStudents(resolvedCourseId);
      setStudents(latestStudents);
      setAssignSuccess(`${selectedStudentIds.length} оюутан хичээлд нэмэгдлээ.`);
      setSelectedStudentIds([]);
    } catch (err) {
      setAssignError(err?.message || "Оюутан нэмэх үед алдаа гарлаа.");
    } finally {
      setAssignSubmitting(false);
    }
  };

  if (loading) {
    return <div className="team5-page-loading">Шалгалтын дэлгэрэнгүй ачаалж байна...</div>;
  }

  if (!exam) {
    return <p className="team5-empty-state">Шалгалт олдсонгүй.</p>;
  }

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <Link to="/team6/teacher/exams" className="team5-back-link">
            <FiArrowLeft /> Буцах
          </Link>
          <h2>{exam.name}</h2>
          <p>{exam.courseName || "Хичээл тодорхойгүй"}</p>
        </div>

        <div className="team5-toolbar">
          <button type="button" className="team5-primary-btn" onClick={openAssignModal}>
            <FiPlus /> Оюутан нэмэх
          </button>

          <Link to={`/team6/teacher/exams/${exam.id}/edit`} className="team5-ghost-btn">
            <FiEdit2 /> Засах
          </Link>
        </div>
      </header>

      {error ? <p className="team5-error-box">{error}</p> : null}

      <article className="team5-form-card">
        <h3>Шалгалтын мэдээлэл</h3>

        <div className="team5-inline-stats">
          <div>
            <span>
              <FiClock /> Үргэлжлэх хугацаа
            </span>
            <strong>{exam.duration} мин</strong>
          </div>
          <div>
            <span>Нийт асуулт</span>
            <strong>{participants.length || 0}</strong>
          </div>
          <div>
            <span>Нийт оноо</span>
            <strong>{exam.totalPoint}</strong>
          </div>
          <div>
            <span>Оролдлогын тоо</span>
            <strong>{exam.maxAttempt}</strong>
          </div>
        </div>

        <div className="team5-inline-dates">
          <p>
            <FiCalendar /> Нээгдэх: {formatDateTime(exam.openOn)}
          </p>
          <p>
            <FiCalendar /> Хаагдах: {formatDateTime(exam.closeOn)}
          </p>
        </div>
      </article>

      <div className="team5-action-card-grid">
        <Link to={`/team6/teacher/questions?examId=${exam.id}`} className="team5-action-card purple">
          <FiBookOpen />
          <h4>Асуулт нэмэх</h4>
          <p>Асуултын сангаас асуулт удирдах</p>
        </Link>

        <Link to={`/team6/teacher/students?examId=${exam.id}`} className="team5-action-card blue">
          <FiUsers />
          <h4>Оюутны явц</h4>
          <p>Шалгалт өгч байгаа оюутнууд</p>
        </Link>

        <Link to={`/team6/teacher/reports?examId=${exam.id}`} className="team5-action-card green">
          <FiBarChart2 />
          <h4>Тайлан, статистик</h4>
          <p>Шалгалтын үр дүнгийн дэлгэрэнгүй тайлан</p>
        </Link>
      </div>

      <div className="team5-stats-grid">
        <article className="team5-stat-card purple">
          <h3>Нийт оюутан</h3>
          <strong>{students.length}</strong>
        </article>
        <article className="team5-stat-card green">
          <h3>Дуусгасан</h3>
          <strong>{metrics.finishedCount}</strong>
        </article>
        <article className="team5-stat-card blue">
          <h3>Дундаж оноо</h3>
          <strong>{metrics.avg.toFixed(1)}</strong>
        </article>
        <article className="team5-stat-card orange">
          <h3>Тэнцсэн хувь</h3>
          <strong>{metrics.passRate.toFixed(0)}%</strong>
        </article>
      </div>

      {showAssignModal ? (
        <div className="team5-modal-backdrop">
          <form className="team5-modal" onSubmit={handleAssignStudents}>
            <div className="team5-modal-header">
              <h3>Шалгалтад оюутан нэмэх</h3>
              <button type="button" className="team5-action-btn" onClick={closeAssignModal}>
                <FiX />
              </button>
            </div>

            <p className="team5-cell-sub">Курсийн оюутнуудаас сонгож шалгалтад нэмнэ.</p>

            <div className="team5-search-box grow">
              <FiSearch />
              <input
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Нэр, код, имэйлээр хайх..."
              />
            </div>

            {assignError ? <p className="team5-error-box">{assignError}</p> : null}
            {assignSuccess ? <p className="team5-success-box">{assignSuccess}</p> : null}

            <div className="team5-pick-list">
              {assignableStudents.length === 0 ? (
                <p className="team5-empty-state">Нэмэх боломжтой оюутан олдсонгүй.</p>
              ) : (
                assignableStudents.map((student) => (
                  <label className="team5-pick-item" key={student.id}>
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                    />
                    <span>
                      <strong>{student.displayName}</strong>
                      <small>{student.email || student.id}</small>
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="team5-form-actions">
              <button type="submit" className="team5-primary-btn" disabled={assignSubmitting}>
                {assignSubmitting ? "Нэмж байна..." : `Нэмэх (${selectedStudentIds.length})`}
              </button>
              <button type="button" className="team5-ghost-btn" onClick={closeAssignModal}>
                Цуцлах
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
};

export default TeacherExamDetailPage;
