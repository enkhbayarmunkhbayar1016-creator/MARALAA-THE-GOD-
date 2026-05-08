import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import { FiArrowLeft, FiEye, FiTrash2, FiX } from "react-icons/fi";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  deleteExamAttempt,
  fetchCourseStudents,
  fetchExamAttemptEvaluation,
  fetchExamAttemptQuestions,
  fetchExamById,
  fetchExamUserAttempts,
  fetchUserExams,
} from "../api";
import { average, formatDateTime, scorePercent } from "../utils";

const answerText = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value || "-");
};

const TeacherStudentDetailPage = () => {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("examId") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [student, setStudent] = useState(null);
  const [studentExams, setStudentExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [attemptError, setAttemptError] = useState("");
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [attemptDetailLoading, setAttemptDetailLoading] = useState(false);
  const [attemptDetailError, setAttemptDetailError] = useState("");

  useEffect(() => {
    if (!studentId || !examId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const selectedExam = await fetchExamById(examId);
        setExam(selectedExam);

        const [students, exams] = await Promise.all([
          fetchCourseStudents(selectedExam.courseId),
          fetchUserExams(studentId),
        ]);

        const examAttempts = await fetchExamUserAttempts(examId, studentId);

        const foundStudent = students.find((item) => item.id === studentId) || null;
        setStudent(foundStudent);

        const relatedExams = exams.filter(
          (item) => item.courseId === selectedExam.courseId || !item.courseId
        );
        setStudentExams(relatedExams);
        setAttempts(examAttempts);
      } catch (err) {
        setError(err?.message || "Оюутны дэлгэрэнгүй мэдээлэл ачаалж чадсангүй.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId, studentId]);

  const chartRows = useMemo(() => {
    return studentExams.map((item) => ({
      exam: item.name,
      score: scorePercent(item.gradePoint, item.totalPoint),
    }));
  }, [studentExams]);

  const stats = useMemo(() => {
    const values = chartRows.map((row) => row.score);
    return {
      total: values.length,
      avg: average(values),
      best: values.length ? Math.max(...values) : 0,
      worst: values.length ? Math.min(...values) : 0,
    };
  }, [chartRows]);

  const loadAttempts = async () => {
    if (!examId || !studentId) return;

    try {
      setAttemptLoading(true);
      setAttemptError("");
      const rows = await fetchExamUserAttempts(examId, studentId);
      setAttempts(rows);
    } catch (err) {
      setAttemptError(err?.message || "Оролдлогууд ачаалж чадсангүй.");
    } finally {
      setAttemptLoading(false);
    }
  };

  const handleDeleteAttempt = async (attemptNo) => {
    if (!window.confirm(`${attemptNo}-р оролдлогыг устгах уу?`)) return;

    try {
      setAttemptLoading(true);
      setAttemptError("");
      await deleteExamAttempt(examId, studentId, attemptNo);
      await loadAttempts();
    } catch (err) {
      setAttemptError(err?.message || "Оролдлого устгах үед алдаа гарлаа.");
    } finally {
      setAttemptLoading(false);
    }
  };

  const openAttemptDetail = async (attemptNo) => {
    try {
      setAttemptDetailLoading(true);
      setAttemptDetailError("");

      const [evaluation, questions] = await Promise.all([
        fetchExamAttemptEvaluation(examId, studentId, attemptNo),
        fetchExamAttemptQuestions(examId, studentId, attemptNo),
      ]);

      setAttemptDetail({
        attemptNo,
        evaluation,
        questions,
      });
    } catch (err) {
      setAttemptDetailError(err?.message || "Оролдлогын дэлгэрэнгүй ачаалж чадсангүй.");
      setAttemptDetail({
        attemptNo,
        evaluation: [],
        questions: [],
      });
    } finally {
      setAttemptDetailLoading(false);
    }
  };

  const sortedAttempts = useMemo(() => {
    return [...attempts].sort((a, b) => b.attemptNo - a.attemptNo);
  }, [attempts]);

  if (!examId) {
    return <p className="team5-empty-state">Энэ хуудсанд орохын тулд шалгалт сонгоно уу.</p>;
  }

  if (loading) {
    return <div className="team5-page-loading">Дэлгэрэнгүй мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <Link to={`/team6/teacher/students?examId=${examId}`} className="team5-back-link">
            <FiArrowLeft /> Буцах
          </Link>
          <h2>Оюутны дэлгэрэнгүй</h2>
          <p>{exam?.name || "Шалгалт"}</p>
        </div>
      </header>

      {error ? <p className="team5-error-box">{error}</p> : null}

      <article className="team5-form-card">
        <h3>{student?.displayName || "Оюутны нэр"}</h3>
        <p>{student?.email || studentId}</p>
      </article>

      <div className="team5-stats-grid">
        <article className="team5-stat-card purple">
          <h3>Нийт шалгалт</h3>
          <strong>{stats.total}</strong>
        </article>
        <article className="team5-stat-card blue">
          <h3>Дундаж оноо</h3>
          <strong>{stats.avg.toFixed(1)}%</strong>
        </article>
        <article className="team5-stat-card green">
          <h3>Хамгийн өндөр</h3>
          <strong>{stats.best.toFixed(1)}%</strong>
        </article>
        <article className="team5-stat-card red">
          <h3>Хамгийн бага</h3>
          <strong>{stats.worst.toFixed(1)}%</strong>
        </article>
      </div>

      <div className="team5-chart-grid">
        <article className="team5-chart-card">
          <h3>Гүйцэтгэлийн чиг хандлага</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="exam" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" name="Оноо" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="team5-chart-card">
          <h3>Хичээл тус бүрийн оноо</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="exam" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" name="Оноо" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <article className="team5-form-card">
        <h3>Шалгалтын түүх</h3>
        <div className="team5-list-stack">
          {studentExams.length === 0 ? (
            <p className="team5-empty-state">Өгөгдөл олдсонгүй</p>
          ) : (
            studentExams.map((item) => {
              const percent = scorePercent(item.gradePoint, item.totalPoint);
              const passed = percent >= 60;
              return (
                <div className="team5-history-row" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.courseName || "-"}</p>
                  </div>
                  <div className={passed ? "green" : "red"}>{percent.toFixed(1)}%</div>
                </div>
              );
            })
          )}
        </div>
      </article>

      <article className="team5-form-card">
        <h3>Сонгосон шалгалтын оролдлогууд</h3>

        {attemptError ? <p className="team5-error-box">{attemptError}</p> : null}

        <div className="team5-table-wrap">
          <table className="team5-table">
            <thead>
              <tr>
                <th>Оролдлого</th>
                <th>Эхэлсэн</th>
                <th>Дууссан</th>
                <th>Оноо</th>
                <th>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {sortedAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="team5-empty-row">
                    {attemptLoading ? "Оролдлого уншиж байна..." : "Оролдлого олдсонгүй"}
                  </td>
                </tr>
              ) : (
                sortedAttempts.map((item) => {
                  const percent = scorePercent(item.gradePoint, item.totalPoint || exam?.totalPoint || 0);

                  return (
                    <tr key={`${item.id}_${item.attemptNo}`}>
                      <td>{item.attemptNo}</td>
                      <td>{formatDateTime(item.startOn)}</td>
                      <td>{formatDateTime(item.endOn)}</td>
                      <td>{percent.toFixed(1)}%</td>
                      <td>
                        <div className="team5-action-links">
                          <button
                            type="button"
                            className="team5-action-btn"
                            title="Дэлгэрэнгүй"
                            onClick={() => openAttemptDetail(item.attemptNo)}
                          >
                            <FiEye />
                          </button>
                          <button
                            type="button"
                            className="team5-action-btn danger"
                            title="Устгах"
                            onClick={() => handleDeleteAttempt(item.attemptNo)}
                            disabled={attemptLoading}
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
      </article>

      {attemptDetail ? (
        <div className="team5-modal-backdrop">
          <div className="team5-modal">
            <div className="team5-modal-header">
              <h3>{attemptDetail.attemptNo}-р оролдлогын дэлгэрэнгүй</h3>
              <button
                type="button"
                className="team5-action-btn"
                onClick={() => {
                  setAttemptDetail(null);
                  setAttemptDetailError("");
                }}
              >
                <FiX />
              </button>
            </div>

            {attemptDetailError ? <p className="team5-error-box">{attemptDetailError}</p> : null}

            {attemptDetailLoading ? (
              <p className="team5-empty-state">Дэлгэрэнгүй мэдээлэл уншиж байна...</p>
            ) : (
              <>
                <article className="team5-form-card">
                  <h3>Үнэлгээ</h3>
                  <div className="team5-list-stack">
                    {attemptDetail.evaluation.length === 0 ? (
                      <p className="team5-empty-state">Үнэлгээний мэдээлэл олдсонгүй</p>
                    ) : (
                      attemptDetail.evaluation.map((row) => (
                        <div className="team5-history-row" key={`${row.id}_${row.name}`}>
                          <strong>{row.name}</strong>
                          <span>
                            {row.gradePoint} / {row.totalPoint}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </article>

                <article className="team5-form-card">
                  <h3>Асуултын үнэлгээ</h3>
                  <div className="team5-list-stack">
                    {attemptDetail.questions.length === 0 ? (
                      <p className="team5-empty-state">Асуултын мэдээлэл олдсонгүй</p>
                    ) : (
                      attemptDetail.questions.map((question) => (
                        <div className="team5-history-row" key={question.id}>
                          <div>
                            <strong>{question.text || "Асуулт"}</strong>
                            <p>Хариулт: {answerText(question.answer)}</p>
                          </div>
                          <span>
                            {question.gradePoint} / {question.totalPoint}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default TeacherStudentDetailPage;
