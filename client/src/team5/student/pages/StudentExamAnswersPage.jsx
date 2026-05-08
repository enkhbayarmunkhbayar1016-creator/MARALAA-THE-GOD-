import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { fetchMyExamQuestions, fetchStudentExamCatalog } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { normalizeAnswer } from "../utils";

const getAnswerStoreKey = (examId) => `team5_student_exam_answers_${examId}`;

const readStoredAnswers = (examId) => {
  try {
    const raw = sessionStorage.getItem(getAnswerStoreKey(examId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const optionLabel = (value, index) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value.label || value.text || value.name || String(value.value || `Сонголт ${index + 1}`);
  }
  return `Сонголт ${index + 1}`;
};

const optionValue = (value, index) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return String(value.value || value.label || value.text || index + 1);
  }
  return String(index + 1);
};

const StudentExamAnswersPage = () => {
  const { examId } = useParams();
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [examRows, questionRows] = await Promise.all([
          fetchStudentExamCatalog(user.id),
          fetchMyExamQuestions(examId),
        ]);

        if (!active) return;

        setExam(examRows.find((row) => String(row.id) === String(examId)) || null);
        setQuestions(questionRows);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Зөв хариултын мэдээлэл дуудах үед алдаа гарлаа");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [examId, user?.id]);

  const rows = useMemo(() => {
    const stored = readStoredAnswers(examId);

    return questions.map((question) => {
      const selected =
        stored[question.id] ??
        question.raw?.user_answer ??
        question.raw?.my_answer ??
        question.raw?.selected_answer ??
        "";

      const selectedNormalized = normalizeAnswer(selected);
      const correctNormalized = normalizeAnswer(question.answer);
      const isCorrect = selectedNormalized && selectedNormalized === correctNormalized;

      return {
        ...question,
        selected,
        isCorrect,
      };
    });
  }, [examId, questions]);

  if (loading) {
    return <div className="t5s-loading">Зөв хариултууд ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page t5s-page-narrow">
      <div className="t5s-page-head">
        <div>
          <h2>Зөв хариултууд</h2>
          <p>
            {exam?.courseName} - {exam?.name}
          </p>
        </div>

        <Link to={`/team6/student/exams/${examId}/result`} className="t5s-btn t5s-btn-outline">
          <FiArrowLeft /> Үр дүн рүү буцах
        </Link>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <div className="t5s-list-stack">
        {rows.map((question, index) => {
          const options = Array.isArray(question.options) ? question.options : [];

          return (
            <article
              key={question.id}
              className={`t5s-answer-card ${question.isCorrect ? "correct" : "wrong"}`}
            >
              <div className="t5s-answer-header">
                <strong>Асуулт {index + 1}</strong>
                <span>{question.isCorrect ? "Зөв" : "Буруу"}</span>
              </div>

              <p className="t5s-question-text">{question.question}</p>

              <div className="t5s-note danger">
                <h4>
                  <FiXCircle /> Таны хариулт:
                </h4>
                <p>{String(question.selected || "-")}</p>
              </div>

              <div className="t5s-note success">
                <h4>
                  <FiCheckCircle /> Зөв хариулт:
                </h4>
                <p>{String(question.answer || "-")}</p>
              </div>

              {options.length > 0 && (
                <div className="t5s-option-list read-only">
                  {options.map((option, optionIndex) => {
                    const label = optionLabel(option, optionIndex);
                    const value = optionValue(option, optionIndex);

                    const selected = normalizeAnswer(question.selected) === normalizeAnswer(value);
                    const correct = normalizeAnswer(question.answer) === normalizeAnswer(value);

                    return (
                      <div
                        key={`${question.id}-${value}`}
                        className={`t5s-option-item ${selected ? "selected" : ""} ${
                          correct ? "correct" : ""
                        }`}
                      >
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}

        {rows.length === 0 && <div className="t5s-empty">Хариултын мэдээлэл олдсонгүй.</div>}
      </div>

      <div className="t5s-row-actions center">
        <Link to="/team6/student/exams" className="t5s-btn t5s-btn-outline">
          Жагсаалт руу буцах
        </Link>
        <Link to={`/team6/student/exams/${examId}/result`} className="t5s-btn t5s-btn-primary">
          Үр дүн харах
        </Link>
      </div>
    </section>
  );
};

export default StudentExamAnswersPage;
