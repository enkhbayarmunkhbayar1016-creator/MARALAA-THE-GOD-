import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiAlertTriangle, FiClock, FiFileText, FiPlay } from "react-icons/fi";
import { fetchMyExamAttempt, fetchStudentExamCatalog, startMyExam } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { formatDate, formatDateTime, getExamStatus } from "../utils";

const warnings = [
  "Шалгалтыг эхлүүлсний дараа таны цаг автоматаар эхэлнэ",
  "Хугацаа дуусмагц шалгалт автоматаар хаагдана",
  "Хариулт илгээсний дараа дахин засварлах боломжгүй",
  "Шалгалтын үеэр хуудсаа солихгүй байхыг зөвлөж байна",
];

const StudentExamDetailPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useStudentAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [exams, attemptRow] = await Promise.all([
          fetchStudentExamCatalog(user.id),
          fetchMyExamAttempt(examId).catch(() => null),
        ]);

        const current = exams.find((item) => String(item.id) === String(examId)) || null;

        if (!active) return;
        setExam(current);
        setAttempt(attemptRow);
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

  const status = useMemo(() => getExamStatus(exam || {}), [exam]);

  const handleStart = async () => {
    if (!exam?.id) return;
    setStarting(true);
    setError("");

    try {
      await startMyExam(exam.id);
      navigate(`/team6/student/exams/${exam.id}/take`, { replace: true });
    } catch (err) {
      setError(err?.message || "Шалгалт эхлүүлэхэд алдаа гарлаа");
    } finally {
      setStarting(false);
      setShowStartModal(false);
    }
  };

  if (loading) {
    return <div className="t5s-loading">Шалгалтын мэдээлэл ачаалж байна...</div>;
  }

  if (!exam) {
    return <div className="t5s-empty">Шалгалтын мэдээлэл олдсонгүй.</div>;
  }

  return (
    <section className="t5s-page t5s-page-narrow">
      <div className="t5s-page-head">
        <div>
          <h2>{exam.name}</h2>
          <p>{exam.courseName || "Курс"}</p>
        </div>

        <span className={`t5s-status ${status}`}>
          {status === "open" ? "Хаврын улирал" : status === "upcoming" ? "Хүлээгдэж буй" : "Хаагдсан"}
        </span>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <article className="t5s-card">
        <h3>Шалгалтын мэдээлэл</h3>
        <p>{exam.description || "Тайлбар мэдээлэл байхгүй."}</p>

        <div className="t5s-detail-grid">
          <div>
            <label>
              <FiFileText /> Асуултын тоо
            </label>
            <strong>{attempt?.totalPoint ? `${attempt.totalPoint} оноо` : `${exam.totalPoint} оноо`}</strong>
          </div>

          <div>
            <label>
              <FiClock /> Эхлэх огноо
            </label>
            <strong>{formatDate(exam.openOn)}</strong>
          </div>

          <div>
            <label>
              <FiClock /> Үргэлжлэх хугацаа
            </label>
            <strong>{exam.duration} минут</strong>
          </div>

          <div>
            <label>
              <FiClock /> Дуусах огноо
            </label>
            <strong>{formatDate(exam.closeOn || exam.endOn)}</strong>
          </div>

          <div>
            <label>
              <FiFileText /> Оролдлого</label>
            <strong>{attempt?.attemptNo || 0}/{exam.maxAttempt}</strong>
          </div>

          <div>
            <label>
              <FiFileText /> Сүүлд эхэлсэн
            </label>
            <strong>{attempt?.startOn ? formatDateTime(attempt.startOn) : "-"}</strong>
          </div>
        </div>
      </article>

      <article className="t5s-warning-card">
        <h4>
          <FiAlertTriangle /> Анхааруулга
        </h4>

        <ul>
          {warnings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <div className="t5s-row-actions end">
        <Link to="/team6/student/exams" className="t5s-btn t5s-btn-outline">
          Буцах
        </Link>

        <button
          type="button"
          className="t5s-btn t5s-btn-primary"
          onClick={() => setShowStartModal(true)}
          disabled={status === "closed"}
        >
          <FiPlay /> Шалгалт эхлүүлэх
        </button>
      </div>

      {showStartModal && (
        <div className="t5s-modal-backdrop">
          <div className="t5s-modal">
            <h4>Шалгалт эхлүүлэх</h4>
            <p>Та шалгалтыг эхлүүлэхдээ итгэлтэй байна уу?</p>

            <div className="t5s-note">
              <p>Цаг шууд тоолж эхэлнэ.</p>
              <p>Хугацаа: {exam.duration} минут</p>
              <p>Нийт оноо: {exam.totalPoint}</p>
            </div>

            <div className="t5s-row-actions end">
              <button
                type="button"
                className="t5s-btn t5s-btn-outline"
                onClick={() => setShowStartModal(false)}
              >
                Цуцлах
              </button>

              <button
                type="button"
                className="t5s-btn t5s-btn-primary"
                onClick={handleStart}
                disabled={starting}
              >
                {starting ? "Эхлүүлж байна..." : "Эхлүүлэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentExamDetailPage;
