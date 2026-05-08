import { useCallback, useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import {
  createCourseQuestion,
  deleteQuestion,
  fetchCourseExams,
  fetchCourseQuestions,
  fetchQuestionLevels,
  fetchQuestionTypes,
  fetchTeachingCourses,
} from "../api";
import { useTeacherAuth } from "../TeacherAuthContext";

const initialForm = {
  question: "",
  typeId: "",
  levelId: "",
  optionsText: "",
  answerText: "",
};

const TeacherQuestionBankPage = () => {
  const { user } = useTeacherAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exams, setExams] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [questionLevels, setQuestionLevels] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.id === selectedExamId) || null,
    [exams, selectedExamId]
  );

  const loadQuestions = useCallback(async (courseId) => {
    if (!courseId) {
      setQuestions([]);
      return;
    }

    try {
      const items = await fetchCourseQuestions(courseId);
      setQuestions(items);
    } catch (err) {
      setError(err?.message || "Асуултын жагсаалт уншихад алдаа гарлаа.");
    }
  }, []);

  const loadMeta = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const [courses, types, levels] = await Promise.all([
        fetchTeachingCourses(user.id),
        fetchQuestionTypes(),
        fetchQuestionLevels(),
      ]);

      const examLists = await Promise.all(courses.map((course) => fetchCourseExams(course.id)));
      const allExams = examLists.flat();

      setExams(allExams);
      setQuestionTypes(types);
      setQuestionLevels(levels);
    } catch (err) {
      setError(err?.message || "Өгөгдөл уншиж чадсангүй.");
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
    if (!selectedExam?.courseId) return;
    loadQuestions(selectedExam.courseId);
  }, [selectedExam?.courseId, loadQuestions]);

  const visibleQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch = question.text.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = typeFilter === "all" || question.typeId === typeFilter;
      const matchesLevel = levelFilter === "all" || question.levelId === levelFilter;
      return matchesSearch && matchesType && matchesLevel;
    });
  }, [questions, searchText, typeFilter, levelFilter]);

  const summary = useMemo(() => {
    const base = { total: questions.length, easy: 0, mid: 0, hard: 0 };

    questions.forEach((question) => {
      const levelName = String(question.levelName || "").toLowerCase();
      if (levelName.includes("хялбар")) base.easy += 1;
      else if (levelName.includes("дунд")) base.mid += 1;
      else if (levelName.includes("хүнд")) base.hard += 1;
    });

    return base;
  }, [questions]);

  const openCreateModal = () => {
    setForm({
      ...initialForm,
      typeId: questionTypes[0]?.id || "",
      levelId: questionLevels[0]?.id || "",
    });
    setShowModal(true);
    setError("");
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Энэ асуултыг устгах уу?")) return;

    try {
      await deleteQuestion(questionId);
      await loadQuestions(selectedExam?.courseId);
    } catch (err) {
      setError(err?.message || "Устгах үед алдаа гарлаа.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedExam?.courseId) return;

    setSubmitting(true);
    setError("");

    const options = form.optionsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const rawAnswers = form.answerText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const answer = rawAnswers.length <= 1 ? rawAnswers[0] || "" : rawAnswers;

    try {
      await createCourseQuestion(selectedExam.courseId, {
        question: form.question.trim(),
        typeId: form.typeId,
        levelId: form.levelId,
        options,
        answer,
      });

      setShowModal(false);
      await loadQuestions(selectedExam.courseId);
    } catch (err) {
      setError(err?.message || "Асуулт үүсгэх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="team5-page-loading">Асуултын сан ачаалж байна...</div>;
  }

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <h2>Асуултын сан</h2>
          <p>Шалгалтын асуултуудыг удирдах</p>
        </div>

        <button type="button" className="team5-primary-btn" onClick={openCreateModal}>
          <FiPlus />
          Асуулт нэмэх
        </button>
      </header>

      {error ? <p className="team5-error-box">{error}</p> : null}

      <div className="team5-stats-grid">
        <article className="team5-stat-card purple">
          <h3>Нийт асуулт</h3>
          <strong>{summary.total}</strong>
        </article>
        <article className="team5-stat-card green">
          <h3>Хялбар</h3>
          <strong>{summary.easy}</strong>
        </article>
        <article className="team5-stat-card orange">
          <h3>Дунд</h3>
          <strong>{summary.mid}</strong>
        </article>
        <article className="team5-stat-card red">
          <h3>Хүнд</h3>
          <strong>{summary.hard}</strong>
        </article>
      </div>

      <div className="team5-toolbar">
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
              {exam.name} ({exam.courseName || "Хичээл"})
            </option>
          ))}
        </select>

        <div className="team5-search-box">
          <FiSearch />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Асуулт сэдвээр хайх..."
          />
        </div>

        <select className="team5-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value="all">Бүх төрөл</option>
          {questionTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        <select className="team5-select" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
          <option value="all">Бүх түвшин</option>
          {questionLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      <div className="team5-list-stack">
        {visibleQuestions.length === 0 ? (
          <p className="team5-empty-state">Асуулт олдсонгүй</p>
        ) : (
          visibleQuestions.map((question) => (
            <article className="team5-question-card" key={question.id}>
              <div className="team5-question-head">
                <div>
                  <div className="team5-chip-row">
                    <span className="team5-chip yellow">{question.levelName || "Түвшин"}</span>
                    <span className="team5-chip">{question.typeName || "Төрөл"}</span>
                  </div>
                  <h4>{question.text}</h4>
                </div>

                <button
                  type="button"
                  className="team5-action-btn danger"
                  onClick={() => handleDelete(question.id)}
                  title="Устгах"
                >
                  <FiTrash2 />
                </button>
              </div>

              {question.options.length ? (
                <ul className="team5-options-list">
                  {question.options.map((option) => (
                    <li key={`${question.id}_${option}`}>{option}</li>
                  ))}
                </ul>
              ) : null}

              <p className="team5-answer">Зөв хариулт: {Array.isArray(question.answer) ? question.answer.join(", ") : String(question.answer || "-")}</p>
            </article>
          ))
        )}
      </div>

      {showModal ? (
        <div className="team5-modal-backdrop">
          <form className="team5-modal" onSubmit={handleSubmit}>
            <div className="team5-modal-header">
              <h3>Шинэ асуулт үүсгэх</h3>
              <button type="button" className="team5-action-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <label>
              Асуултын текст
              <textarea
                rows={4}
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                required
              />
            </label>

            <div className="team5-form-grid two">
              <label>
                Асуултын төрөл
                <select
                  value={form.typeId}
                  onChange={(event) => setForm((prev) => ({ ...prev, typeId: event.target.value }))}
                  required
                >
                  {questionTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Түвшин
                <select
                  value={form.levelId}
                  onChange={(event) => setForm((prev) => ({ ...prev, levelId: event.target.value }))}
                  required
                >
                  {questionLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Сонголтууд (нэг мөр = нэг сонголт)
              <textarea
                rows={4}
                value={form.optionsText}
                onChange={(event) => setForm((prev) => ({ ...prev, optionsText: event.target.value }))}
                placeholder="Option A&#10;Option B"
              />
            </label>

            <label>
              Зөв хариулт (олон бол таслалаар)
              <input
                value={form.answerText}
                onChange={(event) => setForm((prev) => ({ ...prev, answerText: event.target.value }))}
                placeholder="Option A"
                required
              />
            </label>

            <div className="team5-form-actions">
              <button type="submit" className="team5-primary-btn" disabled={submitting}>
                {submitting ? "Хадгалж байна..." : "Хадгалах"}
              </button>
              <button type="button" className="team5-ghost-btn" onClick={() => setShowModal(false)}>
                Цуцлах
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
};

export default TeacherQuestionBankPage;
