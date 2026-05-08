import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiAward, FiCheckCircle, FiClock, FiHelpCircle, FiXCircle } from "react-icons/fi";
import { fetchMyExamAttempt, fetchMyExamQuestions, fetchStudentExamCatalog } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import {
  formatDateTime,
  minutesToClock,
  normalizeAnswer,
  scorePercent,
  toNumber,
} from "../utils";

const getAnswerStoreKey = (examId) => `team5_student_exam_answers_${examId}`;

const readStoredAnswers = (examId) => {
  try {
    const raw = sessionStorage.getItem(getAnswerStoreKey(examId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const getSelectedAnswer = (question, storedAnswers) => {
  const raw = question?.raw || {};
  return (
    storedAnswers[question.id] ??
    raw.user_answer ??
    raw.my_answer ??
    raw.selected_answer ??
    raw.current_answer ??
    ""
  );
};

const StudentExamResultPage = () => {
  const { examId } = useParams();
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [examRows, attemptRow, questionRows] = await Promise.all([
          fetchStudentExamCatalog(user.id),
          fetchMyExamAttempt(examId).catch(() => null),
          fetchMyExamQuestions(examId).catch(() => []),
        ]);

        if (!active) return;

        setExam(examRows.find((row) => String(row.id) === String(examId)) || null);
        setAttempt(attemptRow);
        setQuestions(questionRows);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Үр дүнгийн мэдээлэл дуудах үед алдаа гарлаа");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [examId, user?.id]);

  const metrics = useMemo(() => {
    const storedAnswers = readStoredAnswers(examId);

    const resultRows = questions.map((question) => {
      const selected = getSelectedAnswer(question, storedAnswers);
      const normalizedSelected = normalizeAnswer(selected);
      const normalizedCorrect = normalizeAnswer(question.answer);
      const answered = String(normalizedSelected).trim() !== "";
      const correct = answered && normalizedSelected === normalizedCorrect;

      return {
        question,
        selected,
        answered,
        correct,
      };
    });

    const correctCount = resultRows.filter((row) => row.correct).length;
    const wrongCount = resultRows.filter((row) => row.answered && !row.correct).length;
    const total = resultRows.length;
    const percentage = scorePercent(attempt?.gradePoint || exam?.gradePoint, attempt?.totalPoint || exam?.totalPoint);

    return {
      rows: resultRows,
      correctCount,
      wrongCount,
      total,
      percentage,
    };
  }, [attempt?.gradePoint, attempt?.totalPoint, exam?.gradePoint, exam?.totalPoint, examId, questions]);

  if (loading) {
    return <div className="t5s-loading">Үр дүн ачаалж байна...</div>;
  }

  if (!exam) {
    return <div className="t5s-empty">Үр дүн олдсонгүй.</div>;
  }

  const score = toNumber(attempt?.gradePoint ?? exam.gradePoint, 0);
  const totalPoint = toNumber(attempt?.totalPoint ?? exam.totalPoint, 0);

  return (
    <section className="t5s-page t5s-page-narrow">
      <div className="t5s-page-head center">
        <h2>Шалгалтын үр дүн</h2>
        <p>{exam.courseName}</p>
        <small>{exam.name}</small>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <article className="t5s-card result-hero">
        <div className="t5s-result-header">
          <h3>Таны үнэлгээ</h3>
          <strong>{metrics.percentage >= 90 ? "A" : metrics.percentage >= 80 ? "B" : metrics.percentage >= 70 ? "C" : "D"}</strong>
        </div>

        <div className="t5s-score-circle">
          <span>{score}</span>
          <small>/ {totalPoint}</small>
        </div>

        <p className="t5s-result-percent">{Math.round(metrics.percentage)}%</p>

        <div className="t5s-progress-track">
          <span style={{ width: `${Math.round(metrics.percentage)}%` }} />
        </div>

        <div className="t5s-stats-grid compact">
          <article className="t5s-mini-stat green">
            <h4>
              <FiCheckCircle /> Зөв
            </h4>
            <strong>{metrics.correctCount}</strong>
          </article>

          <article className="t5s-mini-stat red">
            <h4>
              <FiXCircle /> Буруу
            </h4>
            <strong>{metrics.wrongCount}</strong>
          </article>

          <article className="t5s-mini-stat blue">
            <h4>
              <FiClock /> Зарцуулсан цаг
            </h4>
            <strong>{minutesToClock((attempt?.duration || exam.duration || 0) * 60)}</strong>
          </article>

          <article className="t5s-mini-stat purple">
            <h4>
              <FiHelpCircle /> Нийт асуулт
            </h4>
            <strong>{metrics.total}</strong>
          </article>
        </div>
      </article>

      <article className="t5s-card">
        <h3>Дэлгэрэнгүй мэдээлэл</h3>

        <div className="t5s-detail-grid">
          <div>
            <label>Илгээсэн огноо:</label>
            <strong>{formatDateTime(attempt?.startOn)}</strong>
          </div>
          <div>
            <label>Амжилтын хувь:</label>
            <strong>{Math.round(metrics.percentage)}%</strong>
          </div>
          <div>
            <label>Хичээл:</label>
            <strong>{exam.courseName || "-"}</strong>
          </div>
          <div>
            <label>Улирал:</label>
            <strong>Хаврын улирал</strong>
          </div>
        </div>

        <div className="t5s-note success">
          <h4>
            <FiAward /> Санал сэтгэгдэл
          </h4>
          <p>Таны үр дүн API дээр хадгалагдсан. Зөв хариултууд хэсэгт дэлгэрэнгүйг харна уу.</p>
        </div>
      </article>

      <div className="t5s-row-actions center">
        <Link to="/team6/student/exams" className="t5s-btn t5s-btn-outline">
          Жагсаалт руу буцах
        </Link>
        <Link to={`/team6/student/exams/${examId}/answers`} className="t5s-btn t5s-btn-primary">
          Зөв хариулт харах
        </Link>
      </div>
    </section>
  );
};

export default StudentExamResultPage;
