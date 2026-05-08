import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEye, FiSearch } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchCourseExams,
  fetchCourseGradebookExamRows,
  fetchCourseStudents,
  fetchExamById,
  fetchTeachingCourses,
} from "../api";
import { useTeacherAuth } from "../TeacherAuthContext";
import { average, scorePercent } from "../utils";

const TeacherStudentsPage = () => {
  const { user } = useTeacherAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);

  const [students, setStudents] = useState([]);
  const [scoresByUser, setScoresByUser] = useState({});
  const [searchText, setSearchText] = useState("");

  const loadStudents = useCallback(async (exam) => {
    if (!exam?.courseId) {
      setStudents([]);
      setScoresByUser({});
      return;
    }

    const [courseStudents, gradeRows] = await Promise.all([
      fetchCourseStudents(exam.courseId),
      fetchCourseGradebookExamRows(exam.courseId),
    ]);

    const examRows = gradeRows.filter((row) => row.examId === exam.id);
    const byUser = examRows.reduce((acc, row) => {
      acc[row.userId] = row.gradePoint;
      return acc;
    }, {});

    setStudents(courseStudents);
    setScoresByUser(byUser);
  }, []);

  const loadMeta = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const courses = await fetchTeachingCourses(user.id);
      const examLists = await Promise.all(courses.map((course) => fetchCourseExams(course.id)));
      setExams(examLists.flat());
    } catch (err) {
      setError(err?.message || "Оюутны мэдээлэл унших үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (!exams.length) return;

    const fromQuery = searchParams.get("examId");
    const available = fromQuery && exams.some((exam) => exam.id === fromQuery);
    const target = available ? fromQuery : exams[0].id;

    setSelectedExamId(target);
    if (!available) {
      setSearchParams({ examId: target }, { replace: true });
    }
  }, [exams, searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedExamId) return;

    const loadExamContext = async () => {
      try {
        const exam = exams.find((item) => item.id === selectedExamId) || (await fetchExamById(selectedExamId));
        setSelectedExam(exam);
        await loadStudents(exam);
      } catch (err) {
        setError(err?.message || "Шалгалтын оюутнууд ачаалж чадсангүй.");
      }
    };

    loadExamContext();
  }, [selectedExamId, exams, loadStudents]);

  const rows = useMemo(() => {
    return students
      .map((student) => {
        const score = scoresByUser[student.id];
        const percent = scorePercent(score, selectedExam?.totalPoint || 0);
        return {
          ...student,
          score: score ?? null,
          percent,
          passed: percent >= 60,
        };
      })
      .filter((item) => {
        if (!searchText.trim()) return true;
        const value = searchText.toLowerCase();
        return (
          item.displayName.toLowerCase().includes(value) ||
          item.email.toLowerCase().includes(value) ||
          item.id.toLowerCase().includes(value)
        );
      });
  }, [searchText, selectedExam?.totalPoint, scoresByUser, students]);

  const summary = useMemo(() => {
    const scored = rows.filter((row) => row.score !== null);
    const avg = average(scored.map((row) => row.percent));

    return {
      totalStudents: rows.length,
      completed: scored.length,
      avg,
      totalExams: rows.reduce((acc) => acc + 1, 0),
    };
  }, [rows]);

  if (loading) {
    return <div className="team5-page-loading">Оюутны мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <h2>Оюутнууд</h2>
          <p>{selectedExam?.name || "Шалгалт сонгоно уу"}</p>
        </div>

        <select
          className="team5-select"
          value={selectedExamId}
          onChange={(event) => {
            const value = event.target.value;
            setSelectedExamId(value);
            setSearchParams({ examId: value }, { replace: true });
          }}
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name}
            </option>
          ))}
        </select>
      </header>

      {error ? <p className="team5-error-box">{error}</p> : null}

      <div className="team5-stats-grid">
        <article className="team5-stat-card purple">
          <h3>Нийт оюутан</h3>
          <strong>{summary.totalStudents}</strong>
        </article>
        <article className="team5-stat-card green">
          <h3>Идэвхтэй</h3>
          <strong>{summary.completed}</strong>
        </article>
        <article className="team5-stat-card blue">
          <h3>Дундаж оноо</h3>
          <strong>{summary.avg.toFixed(1)}%</strong>
        </article>
        <article className="team5-stat-card orange">
          <h3>Нийт шалгалт</h3>
          <strong>{summary.totalExams}</strong>
        </article>
      </div>

      <div className="team5-toolbar">
        <div className="team5-search-box grow">
          <FiSearch />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Нэр, код, имэйлээр хайх..."
          />
        </div>
      </div>

      <div className="team5-list-stack">
        {rows.length === 0 ? (
          <p className="team5-empty-state">Оюутан олдсонгүй</p>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="team5-student-card">
              <div className="team5-student-main">
                <div>
                  <h4>{row.displayName}</h4>
                  <p>{row.email || row.id}</p>
                </div>

                <div className="team5-student-score">
                  <span>Дундаж оноо</span>
                  <strong className={row.passed ? "green" : "red"}>
                    {row.score === null ? "-" : `${row.percent.toFixed(1)}%`}
                  </strong>
                </div>

                <Link
                  to={`/team6/teacher/students/${row.id}?examId=${selectedExamId}`}
                  className="team5-action-btn"
                  title="Дэлгэрэнгүй"
                >
                  <FiEye />
                  Дэлгэрэнгүй
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default TeacherStudentsPage;
