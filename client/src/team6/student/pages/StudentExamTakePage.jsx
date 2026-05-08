import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiClock, FiSave, FiSend } from "react-icons/fi";
import {
  fetchMyExamAttempt,
  fetchMyExamQuestions,
  fetchStudentExamCatalog,
  finishMyExam,
  saveMyExamAnswer,
  startMyExam,
} from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { clamp, minutesToClock, toAnswerPayload } from "../utils";

const getAnswerStoreKey = (examId) => `team5_student_exam_answers_${examId}`;

const parseStoredAnswers = (examId) => {
  try {
    const raw = sessionStorage.getItem(getAnswerStoreKey(examId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const extractExistingAnswer = (question) => {
  const raw = question?.raw || {};
  return (
    raw.user_answer ??
    raw.my_answer ??
    raw.selected_answer ??
    raw.current_answer ??
    ""
  );
};

const normalizeOption = (option, index) => {
  if (typeof option === "string") return { value: option, label: option };

  if (option && typeof option === "object") {
    const label =
      option.label || option.text || option.name || option.title || String(option.value ?? "");
    const value = String(option.value ?? label ?? index + 1);
    return { value, label: label || `Сонголт ${index + 1}` };
  }

  const fallback = `Сонголт ${index + 1}`;
  return { value: fallback, label: fallback };
};

const StudentExamTakePage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useStudentAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [examRows] = await Promise.all([
          fetchStudentExamCatalog(user.id),
          startMyExam(examId).catch(() => null),
        ]);
        const selectedExam = examRows.find((row) => String(row.id) === String(examId)) || null;

        const [attempt, questionRows] = await Promise.all([
          fetchMyExamAttempt(examId).catch(() => null),
          fetchMyExamQuestions(examId),
        ]);

        const savedAnswers = parseStoredAnswers(examId);
        const initialAnswers = {};

        questionRows.forEach((question) => {
          const persisted = savedAnswers[question.id];
          const existing = extractExistingAnswer(question);
          initialAnswers[question.id] = persisted ?? existing ?? "";
        });

        if (!active) return;

        setExam(selectedExam);
        setQuestions(questionRows);
        setAnswers(initialAnswers);

        const minutes = Number(selectedExam?.duration || attempt?.duration || 0);
        setRemainingSeconds(Math.max(0, Math.floor(minutes * 60)));
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Шалгалтын мэдээлэл дуудах үед алдаа гарлаа");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [examId, user?.id]);

  useEffect(() => {
    sessionStorage.setItem(getAnswerStoreKey(examId), JSON.stringify(answers));
  }, [answers, examId]);

  useEffect(() => {
    if (loading || submitting) return undefined;
    if (remainingSeconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loading, submitting, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds !== 0 || loading) return;

    const autoSubmit = async () => {
      try {
        await finishMyExam(examId);
        navigate(`/team6/student/exams/${examId}/result`, { replace: true });
      } catch (err) {
        setError(err?.message || "Хугацаа дууссан тул шалгалт илгээхэд алдаа гарлаа");
      }
    };

    autoSubmit();
  }, [remainingSeconds, loading, examId, navigate]);

  const currentQuestion = questions[currentIndex] || null;

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter((value) => {
        if (Array.isArray(value)) return value.length > 0;
        return String(value ?? "").trim() !== "";
      }).length,
    [answers]
  );

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((answeredCount / questions.length) * 100);
  }, [answeredCount, questions.length]);

  const handleSave = async (index = currentIndex) => {
    const question = questions[index];
    if (!question) return;

    setSaving(true);
    setError("");

    try {
      await saveMyExamAnswer(examId, {
        id: question.id,
        answer: toAnswerPayload(answers[question.id]),
      });
    } catch (err) {
      setError(err?.message || "Хариулт хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const moveToQuestion = async (nextIndex) => {
    await handleSave(currentIndex);
    setCurrentIndex(clamp(nextIndex, 0, Math.max(questions.length - 1, 0)));
  };

  const submitExam = async () => {
    setSubmitting(true);
    setError("");

    try {
      const answerRequests = questions.map((question) => {
        const value = toAnswerPayload(answers[question.id]);
        if (String(value ?? "").trim() === "") return Promise.resolve();

        return saveMyExamAnswer(examId, {
          id: question.id,
          answer: value,
        });
      });

      const results = await Promise.allSettled(answerRequests);
      const failed = results.find((result) => result.status === "rejected");
      if (failed) {
        setError(failed.reason?.message || "Хариулт хадгалахад алдаа гарлаа");
        return;
      }

      await finishMyExam(examId);
      navigate(`/team6/student/exams/${examId}/result`, { replace: true });
    } catch (err) {
      setError(err?.message || "Шалгалт илгээхэд алдаа гарлаа");
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading) {
    return <div className="t5s-loading">Шалгалтын асуултууд ачаалж байна...</div>;
  }

  if (!questions.length) {
    return <div className="t5s-empty">Асуулт олдсонгүй.</div>;
  }

  const options = (currentQuestion?.options || []).map(normalizeOption);
  const currentAnswer = answers[currentQuestion?.id] ?? "";

  return (
    <section className="t5s-page t5s-page-narrow">
      <article className="t5s-card">
        <div className="t5s-page-head compact">
          <div>
            <h2>{exam?.name || "Шалгалт"}</h2>
            <p>{exam?.courseName || "Курс"}</p>
            <p>
              Progress: {answeredCount}/{questions.length} хариулсан
            </p>
          </div>

          <strong className="t5s-timer">
            <FiClock /> {minutesToClock(remainingSeconds)}
          </strong>
        </div>

        <div className="t5s-progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
      </article>

      <article className="t5s-card">
        <h4>Асуултын навигац:</h4>
        <div className="t5s-question-nav">
          {questions.map((question, index) => {
            const hasAnswer = String(answers[question.id] ?? "").trim() !== "";
            return (
              <button
                key={question.id}
                type="button"
                className={`t5s-q-index ${index === currentIndex ? "active" : ""} ${
                  hasAnswer ? "done" : ""
                }`}
                onClick={() => moveToQuestion(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </article>

      <article className="t5s-card">
        <div className="t5s-question-head">
          <h3>
            Асуулт {currentIndex + 1} / {questions.length}
          </h3>
          <strong>{currentQuestion?.point || 0} оноо</strong>
        </div>

        <p className="t5s-question-text">{currentQuestion?.question || "-"}</p>

        {options.length > 0 ? (
          <div className="t5s-option-list">
            {options.map((option) => (
              <label key={option.value} className="t5s-option-item">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={String(currentAnswer) === String(option.value)}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: option.value,
                    }))
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            className="t5s-answer-textarea"
            placeholder="Хариултаа энд бичнэ үү..."
            value={String(currentAnswer || "")}
            onChange={(event) =>
              setAnswers((prev) => ({
                ...prev,
                [currentQuestion.id]: event.target.value,
              }))
            }
            rows={4}
          />
        )}

        {error && <div className="t5s-error">{error}</div>}

        <div className="t5s-row-actions split">
          <button
            type="button"
            className="t5s-btn t5s-btn-outline"
            onClick={() => moveToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0 || saving || submitting}
          >
            <FiChevronLeft /> Өмнөх
          </button>

          <button
            type="button"
            className="t5s-btn t5s-btn-outline"
            onClick={() => handleSave(currentIndex)}
            disabled={saving || submitting}
          >
            <FiSave /> {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              className="t5s-btn t5s-btn-primary"
              onClick={() => moveToQuestion(currentIndex + 1)}
              disabled={saving || submitting}
            >
              Дараах <FiChevronRight />
            </button>
          ) : (
            <button
              type="button"
              className="t5s-btn t5s-btn-success"
              onClick={() => setShowSubmitModal(true)}
              disabled={saving || submitting}
            >
              <FiSend /> Илгээх
            </button>
          )}
        </div>
      </article>

      <div className="t5s-row-actions end">
        <Link to={`/team6/student/exams/${examId}`} className="t5s-btn t5s-btn-outline">
          Шалгалтаас гарах
        </Link>
      </div>

      {showSubmitModal && (
        <div className="t5s-modal-backdrop">
          <div className="t5s-modal">
            <h4>Шалгалт илгээх</h4>
            <p>Та шалгалтаа илгээхдээ итгэлтэй байна уу? Дараа нь засварлах боломжгүй.</p>

            <div className="t5s-note">
              <p>Нийт асуулт: {questions.length}</p>
              <p>Хариулсан: {answeredCount}</p>
              <p>Хариулаагүй: {Math.max(0, questions.length - answeredCount)}</p>
            </div>

            <div className="t5s-row-actions end">
              <button
                type="button"
                className="t5s-btn t5s-btn-outline"
                onClick={() => setShowSubmitModal(false)}
              >
                Буцах
              </button>

              <button
                type="button"
                className="t5s-btn t5s-btn-success"
                onClick={submitExam}
                disabled={submitting}
              >
                {submitting ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentExamTakePage;
